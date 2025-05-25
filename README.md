# EZ Web Search MCP Server

A simple Model Context Protocol (MCP) server that provides web search functionality using DuckDuckGo.

## Features

- Performs web searches via DuckDuckGo's HTML interface.
- Returns a list of search results including title, URL, and description.
- Configurable limit for the number of results.

## Setup and Installation

This server is built with TypeScript and runs on Node.js.

1.  **Prerequisites:**

    - Node.js (v16 or newer recommended)
    - npm (comes with Node.js)
    - TypeScript (will be installed as a project dependency)

2.  **Clone/Download:**

    - Ensure this server's code is in its directory (e.g., `~/.mcphub/servers/ez-web-search-mcp/`).

3.  **Install Dependencies:**

    - Navigate to the server's directory:
      ```bash
      cd /path/to/ez-web-search-mcp
      # Example: cd ~/.mcphub/servers/ez-web-search-mcp
      ```
    - Install dependencies:
      ```bash
      npm install
      ```

4.  **Build the Server:**
    - Compile the TypeScript code:
      ```bash
      npm run build
      ```
    - This will create a `build` directory with the compiled JavaScript (`build/index.js`).

## Running the Server

This server is designed to be launched by an MCP client like `mcphub.nvim` via its stdio. The `mcphub.nvim` configuration in `servers.json` should point to the compiled `build/index.js` file.

Example entry for your MCP client's `servers.json` (e.g., `~/.config/mcphub/servers.json`):

```json
{
  "mcpServers": {
    // ... other servers ...
    "ez-web-search-mcp": {
      "command": "node",
      "args": [
        "/full/path/to/your/home/.mcphub/servers/ez-web-search-mcp/build/index.js"
        // It's generally best to use an absolute path here.
      ],
      "disabled": false
    }
  }
  // ... other configurations ...
}
```

_(Remember to replace `/full/path/to/your/home/` with the actual absolute path to your home directory.)_

## Usage

Once the server is configured and running via an MCP client, it provides one tool:

- **Tool Name:** `search`
- **Description:** Performs a web search using DuckDuckGo and returns a list of results.
- **Input Schema:**
  - `query` (string, required): The search term.
  - `limit` (number, optional, default: 10): Maximum number of results to return.
- **Output:**
  - The tool returns an MCP content block, typically a series of text items, each representing a search result with its title, URL, and description.

Example MCP client call:

```
use_mcp_tool
  server_name: "ez-web-search-mcp"
  tool_name: "search"
  tool_input:
    query: "latest AI advancements"
    limit: 5
```

## Development

- Source code is in the `src` directory.
- After making changes to `*.ts` files, rebuild with `npm run build`.
