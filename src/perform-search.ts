import axios from "axios";
import * as cheerio from "cheerio";

// Define the structure for a search result (used by performWebSearch)
interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

export async function performWebSearch(
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

    $(".result").each((_, element) => {
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
