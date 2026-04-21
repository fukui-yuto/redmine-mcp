import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerSearchTools(server: McpServer, client: RedmineClient) {
  // --- Search ---
  server.tool(
    "search",
    "Full-text search across Redmine (issues, projects, wiki pages, etc.).",
    {
      q: z.string().describe("Search query string"),
      scope: z
        .string()
        .optional()
        .describe("Limit search to a project identifier"),
      titles_only: z
        .boolean()
        .optional()
        .describe("Search only in titles (default: false)"),
      open_issues: z
        .boolean()
        .optional()
        .describe("Search only open issues (default: false)"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const params: Record<string, string | number | undefined> = {
        q: args.q,
        scope: args.scope,
        offset: args.offset,
        limit: args.limit,
      };
      if (args.titles_only) params.titles_only = 1;
      if (args.open_issues) params.open_issues = 1;

      const res = await client.get("/search.json", params);
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );
}
