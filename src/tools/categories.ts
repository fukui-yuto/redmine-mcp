import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerCategoryTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List issue categories ---
  server.tool(
    "list_issue_categories",
    "List all issue categories for a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/issue_categories.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get issue category ---
  server.tool(
    "get_issue_category",
    "Get details of a specific issue category.",
    {
      category_id: z.number().describe("Category ID"),
    },
    async (args) => {
      const res = await client.get(
        `/issue_categories/${args.category_id}.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create issue category ---
  server.tool(
    "create_issue_category",
    "Create a new issue category in a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      name: z.string().describe("Category name"),
      assigned_to_id: z
        .number()
        .optional()
        .describe("Default assignee user ID for this category"),
    },
    async (args) => {
      const { project_id, ...rest } = args;
      const res = await client.post(
        `/projects/${project_id}/issue_categories.json`,
        { issue_category: rest }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Update issue category ---
  server.tool(
    "update_issue_category",
    "Update an existing issue category.",
    {
      category_id: z.number().describe("Category ID"),
      name: z.string().optional().describe("New category name"),
      assigned_to_id: z
        .number()
        .optional()
        .describe("New default assignee user ID"),
    },
    async (args) => {
      const { category_id, ...fields } = args;
      await client.put(`/issue_categories/${category_id}.json`, {
        issue_category: fields,
      });
      return {
        content: [
          {
            type: "text",
            text: `Category #${category_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete issue category ---
  server.tool(
    "delete_issue_category",
    "Delete an issue category. Optionally reassign issues to another category.",
    {
      category_id: z.number().describe("Category ID to delete"),
      reassign_to_id: z
        .number()
        .optional()
        .describe("Category ID to reassign issues to"),
    },
    async (args) => {
      const params: Record<string, string | number | undefined> = {};
      if (args.reassign_to_id !== undefined) {
        params.reassign_to_id = args.reassign_to_id;
      }
      await client.del(
        `/issue_categories/${args.category_id}.json`
      );
      return {
        content: [
          {
            type: "text",
            text: `Category #${args.category_id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
