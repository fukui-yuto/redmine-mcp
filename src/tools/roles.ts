import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerRoleTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List roles ---
  server.tool(
    "list_roles",
    "List all roles defined in Redmine.",
    {},
    async () => {
      const res = await client.get("/roles.json");
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get role ---
  server.tool(
    "get_role",
    "Get details of a specific role including its permissions.",
    {
      role_id: z.number().describe("Role ID"),
    },
    async (args) => {
      const res = await client.get(`/roles/${args.role_id}.json`);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );
}
