// Note the .js extension in imports, crucial for ES Modules
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { performWebSearch } from "./perform-search.js";

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
