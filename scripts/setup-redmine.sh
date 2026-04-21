#!/bin/bash
# Setup script: Enable REST API and create test data in Redmine
# Usage: bash scripts/setup-redmine.sh

REDMINE_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASS="admin"

echo "=== Redmine Setup Script ==="
echo ""

# Wait for Redmine to be ready
echo "[1/5] Waiting for Redmine to start..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null -w "%{http_code}" "$REDMINE_URL" | grep -q "200\|302"; then
    echo "  Redmine is up!"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "  ERROR: Redmine did not start within 60 seconds"
    exit 1
  fi
  sleep 2
done

# Enable REST API via settings
echo "[2/5] Enabling REST API..."
# Get the API key for admin user
API_KEY=$(curl -s -u "$ADMIN_USER:$ADMIN_PASS" \
  -H "Content-Type: application/json" \
  "$REDMINE_URL/users/current.json" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data['user']['api_key'])
except:
    print('')
" 2>/dev/null)

if [ -z "$API_KEY" ]; then
  echo "  WARNING: Could not retrieve API key automatically."
  echo "  Please enable REST API manually:"
  echo "    1. Go to $REDMINE_URL"
  echo "    2. Login as admin/admin"
  echo "    3. Administration > Settings > API tab"
  echo "    4. Check 'Enable REST web service'"
  echo "    5. Save"
  echo ""
  echo "  Then get your API key from: $REDMINE_URL/my/account"
  echo "  (Click 'Show' under API access key on the right sidebar)"
  exit 0
fi

echo "  API Key: $API_KEY"

# Create test project
echo "[3/5] Creating test project..."
curl -s -o /dev/null -w "  HTTP %{http_code}\n" \
  -H "Content-Type: application/json" \
  -H "X-Redmine-API-Key: $API_KEY" \
  -X POST \
  -d '{
    "project": {
      "name": "Test Project",
      "identifier": "test-project",
      "description": "MCP integration test project",
      "is_public": true,
      "enabled_module_names": ["issue_tracking", "time_tracking", "wiki", "news", "files"]
    }
  }' \
  "$REDMINE_URL/projects.json"

# Create test issues
echo "[4/5] Creating test issues..."
for i in 1 2 3; do
  curl -s -o /dev/null -w "  Issue $i: HTTP %{http_code}\n" \
    -H "Content-Type: application/json" \
    -H "X-Redmine-API-Key: $API_KEY" \
    -X POST \
    -d "{
      \"issue\": {
        \"project_id\": \"test-project\",
        \"subject\": \"Test Issue #$i\",
        \"description\": \"This is test issue number $i for MCP integration testing.\",
        \"priority_id\": 2,
        \"tracker_id\": 1
      }
    }" \
    "$REDMINE_URL/issues.json"
done

# Verify
echo "[5/5] Verifying setup..."
ISSUE_COUNT=$(curl -s \
  -H "X-Redmine-API-Key: $API_KEY" \
  "$REDMINE_URL/issues.json?project_id=test-project" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data['total_count'])
except:
    print('?')
" 2>/dev/null)

echo ""
echo "=== Setup Complete ==="
echo "  Redmine URL:  $REDMINE_URL"
echo "  Admin login:  admin / admin"
echo "  API Key:      $API_KEY"
echo "  Project:      test-project"
echo "  Issues:       $ISSUE_COUNT"
echo ""
echo "  Next step: Configure MCP server with this API key"
