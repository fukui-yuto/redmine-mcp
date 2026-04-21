import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerRelationTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- List relations ---
  server.tool(
    "list_relations",
    "List all relations for an issue (relates, duplicates, blocks, etc.).",
    {
      issue_id: z.number().describe("Issue ID"),
    },
    async (args) => {
      const res = await client.get(
        `/issues/${args.issue_id}/relations.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get relation ---
  server.tool(
    "get_relation",
    "Get details of a specific issue relation.",
    {
      relation_id: z.number().describe("Relation ID"),
    },
    async (args) => {
      const res = await client.get(`/relations/${args.relation_id}.json`);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create relation ---
  server.tool(
    "create_relation",
    "Create a relation between two issues.",
    {
      issue_id: z.number().describe("Source issue ID"),
      issue_to_id: z.number().describe("Target issue ID"),
      relation_type: z
        .enum([
          "relates",
          "duplicates",
          "duplicated",
          "blocks",
          "blocked",
          "precedes",
          "follows",
          "copied_to",
          "copied_from",
        ])
        .describe("Type of relation"),
      delay: z
        .number()
        .optional()
        .describe("Delay in days (only for precedes/follows)"),
    },
    async (args) => {
      const { issue_id, ...rest } = args;
      const res = await client.post(
        `/issues/${issue_id}/relations.json`,
        { relation: rest }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Delete relation ---
  server.tool(
    "delete_relation",
    "Delete an issue relation.",
    {
      relation_id: z.number().describe("Relation ID to delete"),
    },
    async (args) => {
      await client.del(`/relations/${args.relation_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Relation #${args.relation_id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
