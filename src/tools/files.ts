import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerFileTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List files ---
  server.tool(
    "list_files",
    "List all files uploaded to a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/files.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );
}
