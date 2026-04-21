import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerNewsTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List news (all) ---
  server.tool(
    "list_news",
    "List news entries. Optionally filter by project.",
    {
      project_id: z
        .string()
        .optional()
        .describe("Project ID or identifier (omit for all news)"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const path = args.project_id
        ? `/projects/${args.project_id}/news.json`
        : "/news.json";
      const res = await client.get(path, {
        offset: args.offset,
        limit: args.limit,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create news ---
  server.tool(
    "create_news",
    "Create a news entry in a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      title: z.string().describe("News title"),
      description: z.string().optional().describe("News body content"),
      summary: z.string().optional().describe("Short summary"),
    },
    async (args) => {
      const { project_id, ...rest } = args;
      const res = await client.post(
        `/projects/${project_id}/news.json`,
        { news: rest }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );
}
