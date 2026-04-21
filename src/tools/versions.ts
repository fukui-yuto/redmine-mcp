import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerVersionTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List versions ---
  server.tool(
    "list_versions",
    "List all versions (milestones) for a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/versions.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get version ---
  server.tool(
    "get_version",
    "Get details of a specific version/milestone.",
    {
      version_id: z.number().describe("Version ID"),
    },
    async (args) => {
      const res = await client.get(`/versions/${args.version_id}.json`);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create version ---
  server.tool(
    "create_version",
    "Create a new version/milestone in a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      name: z.string().describe("Version name"),
      status: z
        .enum(["open", "locked", "closed"])
        .optional()
        .describe("Version status"),
      sharing: z
        .enum(["none", "descendants", "hierarchy", "tree", "system"])
        .optional()
        .describe("Version sharing scope"),
      due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      description: z.string().optional().describe("Version description"),
      wiki_page_title: z
        .string()
        .optional()
        .describe("Associated wiki page title"),
    },
    async (args) => {
      const { project_id, ...rest } = args;
      const res = await client.post(
        `/projects/${project_id}/versions.json`,
        { version: rest }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Update version ---
  server.tool(
    "update_version",
    "Update an existing version/milestone.",
    {
      version_id: z.number().describe("Version ID"),
      name: z.string().optional().describe("New name"),
      status: z
        .enum(["open", "locked", "closed"])
        .optional()
        .describe("New status"),
      sharing: z
        .enum(["none", "descendants", "hierarchy", "tree", "system"])
        .optional()
        .describe("New sharing scope"),
      due_date: z.string().optional().describe("New due date (YYYY-MM-DD)"),
      description: z.string().optional().describe("New description"),
      wiki_page_title: z
        .string()
        .optional()
        .describe("New associated wiki page title"),
    },
    async (args) => {
      const { version_id, ...fields } = args;
      await client.put(`/versions/${version_id}.json`, { version: fields });
      return {
        content: [
          {
            type: "text",
            text: `Version #${version_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete version ---
  server.tool(
    "delete_version",
    "Delete a version/milestone. This action cannot be undone.",
    {
      version_id: z.number().describe("Version ID to delete"),
    },
    async (args) => {
      await client.del(`/versions/${args.version_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Version #${args.version_id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
