#!/bin/bash
# Test MCP server by sending JSON-RPC requests via stdio
# Usage: bash scripts/test-mcp.sh

export REDMINE_URL="http://localhost:8080"
export REDMINE_API_KEY="6f28b537e7a578b0b9c9ec0b57af48bc3d4b4af8"

SERVER="node build/index.js"
PASS=0
FAIL=0

run_test() {
  local name="$1"
  local request="$2"

  # Send initialize + request + exit
  local init='{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
  local initialized='{"jsonrpc":"2.0","method":"notifications/initialized"}'

  result=$(echo -e "${init}\n${initialized}\n${request}" | $SERVER 2>/dev/null)

  # Extract the response for our request (id=1)
  response=$(echo "$result" | grep '"id":1' | head -1)

  if echo "$response" | grep -q '"result"'; then
    echo "  PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $name"
    echo "    Response: $(echo "$response" | head -c 200)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== MCP Server Integration Tests ==="
echo ""

# 1. list_projects
run_test "list_projects" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}'

# 2. get_project
run_test "get_project" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_project","arguments":{"project_id":"test-proj"}}}'

# 3. list_issues
run_test "list_issues" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_issues","arguments":{"project_id":"test-proj"}}}'

# 4. get_issue
run_test "get_issue" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_issue","arguments":{"issue_id":1}}}'

# 5. create_issue
run_test "create_issue" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_issue","arguments":{"project_id":"test-proj","subject":"Created by MCP test","tracker_id":1,"priority_id":2}}}'

# 6. update_issue
run_test "update_issue" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"update_issue","arguments":{"issue_id":1,"notes":"Updated by MCP test"}}}'

# 7. get_current_user
run_test "get_current_user" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_current_user","arguments":{}}}'

# 8. get_issue_statuses
run_test "get_issue_statuses" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_issue_statuses","arguments":{}}}'

# 9. get_trackers
run_test "get_trackers" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_trackers","arguments":{}}}'

# 10. get_issue_priorities
run_test "get_issue_priorities" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_issue_priorities","arguments":{}}}'

# 11. get_time_entry_activities
run_test "get_time_entry_activities" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_time_entry_activities","arguments":{}}}'

# 12. list_time_entries
run_test "list_time_entries" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_time_entries","arguments":{}}}'

# 13. search
run_test "search" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"q":"Test"}}}'

# 14. delete_issue (delete the one we created in test 5)
run_test "delete_issue" \
  '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"delete_issue","arguments":{"issue_id":4}}}'

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
