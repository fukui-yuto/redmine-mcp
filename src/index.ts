#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { RedmineClient } from "./client.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerTimeEntryTools } from "./tools/time-entries.js";
import { registerUserTools } from "./tools/users.js";
import { registerSearchTools } from "./tools/search.js";
import { registerMetadataTools } from "./tools/metadata.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerVersionTools } from "./tools/versions.js";
import { registerMembershipTools } from "./tools/memberships.js";
import { registerRelationTools } from "./tools/relations.js";
import { registerCategoryTools } from "./tools/categories.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerRoleTools } from "./tools/roles.js";
import { registerNewsTools } from "./tools/news.js";
import { registerAttachmentTools } from "./tools/attachments.js";
import { registerFileTools } from "./tools/files.js";
import { registerQueryTools } from "./tools/queries.js";

const config = loadConfig();
const client = new RedmineClient(config);

const server = new McpServer({
  name: "redmine-mcp",
  version: "1.0.0",
});

// Register all tools
registerIssueTools(server, client);
registerProjectTools(server, client);
registerTimeEntryTools(server, client);
registerUserTools(server, client);
registerSearchTools(server, client);
registerMetadataTools(server, client);
registerWikiTools(server, client);
registerVersionTools(server, client);
registerMembershipTools(server, client);
registerRelationTools(server, client);
registerCategoryTools(server, client);
registerGroupTools(server, client);
registerRoleTools(server, client);
registerNewsTools(server, client);
registerAttachmentTools(server, client);
registerFileTools(server, client);
registerQueryTools(server, client);

// Start server
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("[redmine-mcp] Server started on stdio");
}).catch((err) => {
  console.error("[redmine-mcp] Failed to start:", err);
  process.exit(1);
});
