import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerAttachmentTools(
  server: McpServer,
  client: RedmineClient
) {
  // --- Get attachment ---
  server.tool(
    "get_attachment",
    "Get details of a specific attachment (filename, size, URL, author, etc.).",
    {
      attachment_id: z.number().describe("Attachment ID"),
    },
    async (args) => {
      const res = await client.get(
        `/attachments/${args.attachment_id}.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Update attachment ---
  server.tool(
    "update_attachment",
    "Update attachment metadata (filename, description).",
    {
      attachment_id: z.number().describe("Attachment ID"),
      filename: z.string().optional().describe("New filename"),
      description: z.string().optional().describe("New description"),
    },
    async (args) => {
      const { attachment_id, ...fields } = args;
      await client.put(`/attachments/${attachment_id}.json`, {
        attachment: fields,
      });
      return {
        content: [
          {
            type: "text",
            text: `Attachment #${attachment_id} updated successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete attachment ---
  server.tool(
    "delete_attachment",
    "Delete an attachment. This action cannot be undone.",
    {
      attachment_id: z.number().describe("Attachment ID to delete"),
    },
    async (args) => {
      await client.del(`/attachments/${args.attachment_id}.json`);
      return {
        content: [
          {
            type: "text",
            text: `Attachment #${args.attachment_id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
