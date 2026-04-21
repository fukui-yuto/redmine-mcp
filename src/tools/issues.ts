import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerIssueTools(server: McpServer, client: RedmineClient) {
  // --- List issues ---
  server.tool(
    "list_issues",
    "List issues from Redmine. Supports filtering by project, status, assignee, tracker, and pagination.",
    {
      project_id: z.string().optional().describe("Project ID or identifier"),
      status_id: z
        .string()
        .optional()
        .describe("Status: 'open', 'closed', '*', or a status ID"),
      assigned_to_id: z
        .string()
        .optional()
        .describe("Assignee user ID, or 'me'"),
      tracker_id: z.number().optional().describe("Tracker ID"),
      sort: z
        .string()
        .optional()
        .describe("Sort field (e.g. 'updated_on:desc', 'priority:asc')"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const params: Record<string, string | number | undefined> = {
        project_id: args.project_id,
        status_id: args.status_id,
        assigned_to_id: args.assigned_to_id,
        tracker_id: args.tracker_id,
        sort: args.sort,
        offset: args.offset,
        limit: args.limit,
      };
      const res = await client.get("/issues.json", params);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  // --- Get single issue ---
  server.tool(
    "get_issue",
    "Get a single issue by ID with full details including journals (comments) and related data.",
    {
      issue_id: z.number().describe("Issue ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated: children, attachments, relations, changesets, journals, watchers, allowed_statuses"
        ),
    },
    async (args) => {
      const params: Record<string, string | number | undefined> = {
        include: args.include,
      };
      const res = await client.get(`/issues/${args.issue_id}.json`, params);
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  // --- Create issue ---
  server.tool(
    "create_issue",
    "Create a new issue in Redmine.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      subject: z.string().describe("Issue subject/title"),
      description: z.string().optional().describe("Issue description (supports Textile/Markdown)"),
      tracker_id: z.number().optional().describe("Tracker ID"),
      status_id: z.number().optional().describe("Status ID"),
      priority_id: z.number().optional().describe("Priority ID"),
      assigned_to_id: z.number().optional().describe("Assignee user ID"),
      parent_issue_id: z.number().optional().describe("Parent issue ID"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
      estimated_hours: z.number().optional().describe("Estimated hours"),
    },
    async (args) => {
      const { project_id, ...rest } = args;
      const res = await client.post("/issues.json", {
        issue: { project_id, ...rest },
      });
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  // --- Update issue ---
  server.tool(
    "update_issue",
    "Update an existing issue. Only provided fields will be changed. Use notes to add a comment.",
    {
      issue_id: z.number().describe("Issue ID to update"),
      subject: z.string().optional().describe("New subject"),
      description: z.string().optional().describe("New description"),
      status_id: z.number().optional().describe("New status ID"),
      priority_id: z.number().optional().describe("New priority ID"),
      assigned_to_id: z.number().optional().describe("New assignee user ID"),
      start_date: z.string().optional().describe("New start date (YYYY-MM-DD)"),
      due_date: z.string().optional().describe("New due date (YYYY-MM-DD)"),
      estimated_hours: z.number().optional().describe("New estimated hours"),
      done_ratio: z
        .number()
        .optional()
        .describe("Progress percentage (0-100)"),
      notes: z.string().optional().describe("Comment to add to the issue"),
    },
    async (args) => {
      const { issue_id, ...fields } = args;
      const res = await client.put(`/issues/${issue_id}.json`, {
        issue: fields,
      });
      return {
        content: [
          { type: "text", text: `Issue #${issue_id} updated successfully.` },
        ],
      };
    }
  );

  // --- Delete issue ---
  server.tool(
    "delete_issue",
    "Delete an issue permanently. This action cannot be undone.",
    {
      issue_id: z.number().describe("Issue ID to delete"),
    },
    async (args) => {
      await client.del(`/issues/${args.issue_id}.json`);
      return {
        content: [
          { type: "text", text: `Issue #${args.issue_id} deleted successfully.` },
        ],
      };
    }
  );
}
