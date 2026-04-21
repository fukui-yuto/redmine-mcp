import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerQueryTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List queries ---
  server.tool(
    "list_queries",
    "List all saved issue queries (custom filters) available to the current user.",
    {},
    async () => {
      const res = await client.get("/queries.json");
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );
}
