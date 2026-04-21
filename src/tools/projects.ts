import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerProjectTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List projects ---
  server.tool(
    "list_projects",
    "List all accessible projects in Redmine.",
    {
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated: trackers, issue_categories, time_entry_activities, enabled_modules"
        ),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const res = await client.get("/projects.json", {
        include: args.include,
        offset: args.offset,
        limit: args.limit,
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Get project ---
  server.tool(
    "get_project",
    "Get details of a specific project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated: trackers, issue_categories, time_entry_activities, enabled_modules, issue_custom_fields"
        ),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}.json`,
        { include: args.include }
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );
}
