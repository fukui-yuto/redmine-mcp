import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerUserTools(server: McpServer, client: RedmineClient) {
  // --- List users ---
  server.tool(
    "list_users",
    "List users (requires admin privileges). Can filter by status, name, or group.",
    {
      status: z
        .enum(["active", "registered", "locked"])
        .optional()
        .describe("Filter by user status"),
      name: z
        .string()
        .optional()
        .describe("Filter by name or login (partial match)"),
      group_id: z.number().optional().describe("Filter by group ID"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const statusMap: Record<string, number> = {
        active: 1,
        registered: 2,
        locked: 3,
      };
      const params: Record<string, string | number | undefined> = {
        name: args.name,
        group_id: args.group_id,
        offset: args.offset,
        limit: args.limit,
      };
      if (args.status) params.status = statusMap[args.status];
      const res = await client.get("/users.json", params);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get user ---
  server.tool(
    "get_user",
    "Get details of a specific user by ID.",
    {
      user_id: z.number().describe("User ID"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated: memberships, groups"),
    },
    async (args) => {
      const res = await client.get(`/users/${args.user_id}.json`, {
        include: args.include,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get current user ---
  server.tool(
    "get_current_user",
    "Get information about the currently authenticated user, including API key and group memberships.",
    {},
    async () => {
      const res = await client.get("/users/current.json", {
        include: "memberships,groups",
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );
}
