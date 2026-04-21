import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerUserTools(server: McpServer, client: RedmineClient) {
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
