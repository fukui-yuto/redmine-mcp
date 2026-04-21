import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerTimeEntryTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List time entries ---
  server.tool(
    "list_time_entries",
    "List time entries. Can filter by project, user, or date range.",
    {
      project_id: z.string().optional().describe("Project ID or identifier"),
      user_id: z.number().optional().describe("User ID"),
      from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      to: z.string().optional().describe("End date (YYYY-MM-DD)"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const res = await client.get("/time_entries.json", {
        project_id: args.project_id,
        user_id: args.user_id,
        from: args.from,
        to: args.to,
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

  // --- Create time entry ---
  server.tool(
    "create_time_entry",
    "Log time spent on an issue or project.",
    {
      issue_id: z.number().optional().describe("Issue ID (required if no project_id)"),
      project_id: z
        .string()
        .optional()
        .describe("Project ID or identifier (required if no issue_id)"),
      hours: z.number().describe("Hours spent"),
      activity_id: z.number().describe("Activity ID (use get_time_entry_activities to find IDs)"),
      comments: z.string().optional().describe("Comment for the time entry"),
      spent_on: z
        .string()
        .optional()
        .describe("Date (YYYY-MM-DD, defaults to today)"),
    },
    async (args) => {
      const res = await client.post("/time_entries.json", {
        time_entry: args,
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Get time entry ---
  server.tool(
    "get_time_entry",
    "Get details of a specific time entry.",
    {
      time_entry_id: z.number().describe("Time entry ID"),
    },
    async (args) => {
      const res = await client.get(
        `/time_entries/${args.time_entry_id}.json`
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Update time entry ---
  server.tool(
    "update_time_entry",
    "Update an existing time entry.",
    {
      time_entry_id: z.number().describe("Time entry ID"),
      issue_id: z.number().optional().describe("New issue ID"),
      project_id: z.string().optional().describe("New project ID"),
      hours: z.number().optional().describe("New hours"),
      activity_id: z.number().optional().describe("New activity ID"),
      comments: z.string().optional().describe("New comment"),
      spent_on: z.string().optional().describe("New date (YYYY-MM-DD)"),
    },
    async (args) => {
      const { time_entry_id, ...fields } = args;
      await client.put(`/time_entries/${time_entry_id}.json`, {
        time_entry: fields,
      });
      return {
        content: [
          {
            type: "text",
            text: `Time entry #${time_entry_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete time entry ---
  server.tool(
    "delete_time_entry",
    "Delete a time entry. This action cannot be undone.",
    {
      time_entry_id: z.number().describe("Time entry ID to delete"),
    },
    async (args) => {
      await client.del(`/time_entries/${args.time_entry_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Time entry #${args.time_entry_id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
