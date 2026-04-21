import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerMetadataTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- Get issue statuses ---
  server.tool(
    "get_issue_statuses",
    "Get all available issue statuses (e.g. New, In Progress, Closed). Use to find status IDs for filtering or updating issues.",
    {},
    async () => {
      const res = await client.get("/issue_statuses.json");
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Get trackers ---
  server.tool(
    "get_trackers",
    "Get all available trackers (e.g. Bug, Feature, Support). Use to find tracker IDs.",
    {},
    async () => {
      const res = await client.get("/trackers.json");
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Get issue priorities ---
  server.tool(
    "get_issue_priorities",
    "Get all available issue priorities (e.g. Low, Normal, High, Urgent). Use to find priority IDs.",
    {},
    async () => {
      const res = await client.get("/enumerations/issue_priorities.json");
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );

  // --- Get time entry activities ---
  server.tool(
    "get_time_entry_activities",
    "Get all available time entry activities (e.g. Development, Design). Use to find activity IDs for logging time.",
    {},
    async () => {
      const res = await client.get(
        "/enumerations/time_entry_activities.json"
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(res.data, null, 2) },
        ],
      };
    }
  );
}
