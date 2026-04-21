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

  // --- Create project ---
  server.tool(
    "create_project",
    "Create a new project.",
    {
      name: z.string().describe("Project name"),
      identifier: z
        .string()
        .describe("Unique identifier (lowercase, hyphens, 1-100 chars)"),
      description: z.string().optional().describe("Project description"),
      homepage: z.string().optional().describe("Project homepage URL"),
      is_public: z.boolean().optional().describe("Whether the project is public"),
      parent_id: z
        .number()
        .optional()
        .describe("Parent project ID (for subprojects)"),
      inherit_members: z
        .boolean()
        .optional()
        .describe("Inherit members from parent project"),
      tracker_ids: z
        .array(z.number())
        .optional()
        .describe("Array of tracker IDs to enable"),
      enabled_module_names: z
        .array(z.string())
        .optional()
        .describe(
          "Array of module names to enable (e.g. issue_tracking, time_tracking, wiki, news, files, documents, gantt, calendar)"
        ),
    },
    async (args) => {
      const res = await client.post("/projects.json", { project: args });
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Update project ---
  server.tool(
    "update_project",
    "Update an existing project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      name: z.string().optional().describe("New project name"),
      description: z.string().optional().describe("New description"),
      homepage: z.string().optional().describe("New homepage URL"),
      is_public: z.boolean().optional().describe("Whether the project is public"),
      parent_id: z
        .number()
        .optional()
        .describe("New parent project ID"),
      inherit_members: z.boolean().optional().describe("Inherit members from parent"),
      tracker_ids: z
        .array(z.number())
        .optional()
        .describe("New array of tracker IDs"),
      enabled_module_names: z
        .array(z.string())
        .optional()
        .describe("New array of enabled module names"),
    },
    async (args) => {
      const { project_id, ...fields } = args;
      await client.put(`/projects/${project_id}.json`, { project: fields });
      return {
        content: [
          {
            type: "text",
            text: `Project "${project_id}" updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete project ---
  server.tool(
    "delete_project",
    "Delete a project and all its data. This action cannot be undone.",
    {
      project_id: z.string().describe("Project ID or identifier to delete"),
    },
    async (args) => {
      await client.del(`/projects/${args.project_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Project "${args.project_id}" deleted successfully.`,
          },
        ],
      };
    }
  );

  // --- Archive project ---
  server.tool(
    "archive_project",
    "Archive a project (Redmine 5.0+). Archived projects are hidden but not deleted.",
    {
      project_id: z.string().describe("Project ID or identifier to archive"),
    },
    async (args) => {
      await client.put(`/projects/${args.project_id}/archive.json`, {});
      return {
        content: [
          {
            type: "text",
            text: `Project "${args.project_id}" archived successfully.`,
          },
        ],
      };
    }
  );

  // --- Unarchive project ---
  server.tool(
    "unarchive_project",
    "Unarchive a project (Redmine 5.0+). Restores an archived project.",
    {
      project_id: z
        .string()
        .describe("Project ID or identifier to unarchive"),
    },
    async (args) => {
      await client.put(`/projects/${args.project_id}/unarchive.json`, {});
      return {
        content: [
          {
            type: "text",
            text: `Project "${args.project_id}" unarchived successfully.`,
          },
        ],
      };
    }
  );
}
