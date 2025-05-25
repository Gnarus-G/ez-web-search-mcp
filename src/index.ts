// Note the .js extension in imports, crucial for ES Modules
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import axios from "axios";
import * as cheerio from "cheerio";

// Define the structure for a search result (used by performWebSearch)
interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

async function performWebSearch(
  query: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  const searchResults: SearchResult[] = [];
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const { data: htmlContent } = await axios.get<string>(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(htmlContent);

    $(".result").each((index, element) => {
      if (searchResults.length >= limit) {
        return false;
      }
      const titleElement = $(element).find(".result__title a");
      const snippetElement = $(element).find(".result__snippet");
      let url = titleElement.attr("href");
      const title = titleElement.text().trim();
      const description = snippetElement.text().trim();

      if (url && url.startsWith("/l/")) {
        const urlParams = new URLSearchParams(
          url.substring(url.indexOf("?") + 1),
        );
        const actualUrl = urlParams.get("uddg");
        if (actualUrl) {
          url = actualUrl;
        }
      } else if (url && !url.startsWith("http")) {
        url = `https://duckduckgo.com${url}`;
      }

      if (title && url) {
        searchResults.push({ title, url, description });
      }
    });
  } catch (error) {
    console.error("Error performing web search:", error);
    throw error;
  }
  return searchResults;
}

// Server Definition
const server = new McpServer({
  name: "ez-web-search-mcp",
  description: "A custom web search server using DuckDuckGo.",
  version: "0.1.0",
});

const SearchInputSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  limit: z.number().int().positive().optional().default(10),
});
type SearchInputType = z.infer<typeof SearchInputSchema>;

server.tool(
  "search",
  "Performs a web search using DuckDuckGo and returns a list of results.",
  SearchInputSchema.shape,
  async (
    input: SearchInputType,
  ): Promise<{ content: { type: "text"; text: string }[] }> => {
    const results = await performWebSearch(input.query, input.limit);
    const mcpContent = results.map((res) => ({
      type: "text" as const,
      text: `Title: ${res.title}\nURL: ${res.url}\nDescription: ${res.description || "N/A"}\n---`, // Added separator
    }));
    if (mcpContent.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No results found." }],
      };
    }
    return { content: mcpContent };
  },
);

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Custom Web Search MCP Server is connected via stdio...");
}

main().catch((err: Error) => {
  console.error("Failed to start server or critical error:", err);
  process.exit(1); // Exit if server fails to start
});
