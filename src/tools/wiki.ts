import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedmineClient } from "../client.js";

export function registerWikiTools(server: McpServer, client: RedmineClient) {
  // --- List wiki pages ---
  server.tool(
    "list_wiki_pages",
    "List all wiki pages in a project.",
    {
      project_id: z.string().describe("Project ID or identifier"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/wiki/index.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get wiki page ---
  server.tool(
    "get_wiki_page",
    "Get a wiki page content. Returns the page in Textile/Markdown format.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      title: z.string().describe("Wiki page title"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated: attachments"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}.json`,
        { include: args.include }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Get wiki page by version ---
  server.tool(
    "get_wiki_page_version",
    "Get a specific version of a wiki page.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      title: z.string().describe("Wiki page title"),
      version: z.number().describe("Version number"),
    },
    async (args) => {
      const res = await client.get(
        `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}/${args.version}.json`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
      };
    }
  );

  // --- Create or update wiki page ---
  server.tool(
    "update_wiki_page",
    "Create a new wiki page or update an existing one.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      title: z.string().describe("Wiki page title"),
      text: z.string().describe("Page content (Textile or Markdown depending on Redmine settings)"),
      comments: z
        .string()
        .optional()
        .describe("Comment for this edit (shown in page history)"),
      parent_title: z
        .string()
        .optional()
        .describe("Parent wiki page title (for hierarchy)"),
    },
    async (args) => {
      const body: Record<string, unknown> = {
        text: args.text,
      };
      if (args.comments !== undefined) body.comments = args.comments;
      if (args.parent_title !== undefined) body.parent_title = args.parent_title;

      await client.put(
        `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}.json`,
        { wiki_page: body }
      );
      return {
        content: [
          {
            type: "text",
            text: `Wiki page "${args.title}" saved successfully.`,
          },
        ],
      };
    }
  );

  // --- Delete wiki page ---
  server.tool(
    "delete_wiki_page",
    "Delete a wiki page. This action cannot be undone.",
    {
      project_id: z.string().describe("Project ID or identifier"),
      title: z.string().describe("Wiki page title to delete"),
    },
    async (args) => {
      await client.del(
        `/projects/${args.project_id}/wiki/${encodeURIComponent(args.title)}.json`
      );
      return {
        content: [
          {
            type: "text",
            text: `Wiki page "${args.title}" deleted successfully.`,
          },
        ],
      };
    }
  );
}
