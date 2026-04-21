import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerGroupTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List groups ---
  server.tool(
    "list_groups",
    "List all groups.",
    {},
    async () => {
      const res = await client.get("/groups.json");
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get group ---
  server.tool(
    "get_group",
    "Get details of a specific group, including members and memberships.",
    {
      group_id: z.number().describe("Group ID"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated: users, memberships"),
    },
    async (args) => {
      const res = await client.get(`/groups/${args.group_id}.json`, {
        include: args.include,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create group ---
  server.tool(
    "create_group",
    "Create a new group.",
    {
      name: z.string().describe("Group name"),
      user_ids: z
        .array(z.number())
        .optional()
        .describe("Array of user IDs to add to the group"),
    },
    async (args) => {
      const res = await client.post("/groups.json", { group: args });
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Update group ---
  server.tool(
    "update_group",
    "Update a group name or members.",
    {
      group_id: z.number().describe("Group ID"),
      name: z.string().optional().describe("New group name"),
      user_ids: z
        .array(z.number())
        .optional()
        .describe("New array of user IDs (replaces existing members)"),
    },
    async (args) => {
      const { group_id, ...fields } = args;
      await client.put(`/groups/${group_id}.json`, { group: fields });
      return {
        content: [
          {
            type: "text",
            text: `Group #${group_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete group ---
  server.tool(
    "delete_group",
    "Delete a group. This action cannot be undone.",
    {
      group_id: z.number().describe("Group ID to delete"),
    },
    async (args) => {
      await client.del(`/groups/${args.group_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Group #${args.group_id} deleted successfully.`,
          },
        ],
      };
    }
  );

  // --- Add user to group ---
  server.tool(
    "add_user_to_group",
    "Add a user to a group.",
    {
      group_id: z.number().describe("Group ID"),
      user_id: z.number().describe("User ID to add"),
    },
    async (args) => {
      await client.post(`/groups/${args.group_id}/users.json`, {
        user_id: args.user_id,
      });
      return {
        content: [
          {
            type: "text",
            text: `User #${args.user_id} added to group #${args.group_id}.`,
          },
        ],
      };
    }
  );

  // --- Remove user from group ---
  server.tool(
    "remove_user_from_group",
    "Remove a user from a group.",
    {
      group_id: z.number().describe("Group ID"),
      user_id: z.number().describe("User ID to remove"),
    },
    async (args) => {
      await client.del(
        `/groups/${args.group_id}/users/${args.user_id}.json`
      );
      return {
        content: [
          {
            type: "text",
            text: `User #${args.user_id} removed from group #${args.group_id}.`,
          },
        ],
      };
    }
  );
}
