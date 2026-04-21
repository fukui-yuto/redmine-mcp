import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerMembershipTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List memberships ---
  server.tool(
    "list_memberships",
    "List all members of a project with their roles.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      offset: z.number().optional().describe("Pagination offset"),
      limit: z
        .number()
        .optional()
        .describe("Number of results (max 100, default 25)"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/memberships.json`,
        { offset: args.offset, limit: args.limit }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get membership ---
  server.tool(
    "get_membership",
    "Get details of a specific project membership.",
    {
      membership_id: z.number().describe("Membership ID"),
    },
    async (args) => {
      const res = await client.get(
        `/memberships/${args.membership_id}.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create membership ---
  server.tool(
    "create_membership",
    "Add a user or group as a member to a project with specified roles.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      user_id: z.number().describe("User or group ID to add"),
      role_ids: z.array(z.number()).describe("Array of role IDs to assign"),
    },
    async (args) => {
      const res = await client.post(
        `/projects/${args.project_id}/memberships.json`,
        {
          membership: {
            user_id: args.user_id,
            role_ids: args.role_ids,
          },
        }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Update membership ---
  server.tool(
    "update_membership",
    "Update roles for a project membership.",
    {
      membership_id: z.number().describe("Membership ID"),
      role_ids: z.array(z.number()).describe("New array of role IDs"),
    },
    async (args) => {
      await client.put(`/memberships/${args.membership_id}.json`, {
        membership: { role_ids: args.role_ids },
      });
      return {
        content: [
          {
            type: "text",
            text: `Membership #${args.membership_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete membership ---
  server.tool(
    "delete_membership",
    "Remove a member from a project.",
    {
      membership_id: z.number().describe("Membership ID to remove"),
    },
    async (args) => {
      await client.del(`/memberships/${args.membership_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Membership #${args.membership_id} removed successfully.`,
          },
        ],
      };
    }
  );
}
