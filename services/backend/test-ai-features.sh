#!/bin/bash

echo "🧪 TeamPulse AI Features - Quick Test Script"
echo "============================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4000"

echo -e "\n${YELLOW}Step 1: Checking if backend is running...${NC}"
if curl -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Please start backend: cd services/backend && npm run dev"
    exit 1
fi

echo -e "\n${YELLOW}Step 2: Checking AI status...${NC}"
AI_STATUS=$(curl -s "$BACKEND_URL/api/v1/ai/status")
AI_AVAILABLE=$(echo $AI_STATUS | jq -r '.data.aiAvailable')

if [ "$AI_AVAILABLE" = "true" ]; then
    echo -e "${GREEN}✓ AI features are available${NC}"
    echo $AI_STATUS | jq '.data.features'
else
    echo -e "${RED}✗ AI features are NOT available${NC}"
    echo "Please check:"
    echo "  1. GEMINI_API_KEY is set in .env"
    echo "  2. Backend server was restarted after adding key"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Testing AI endpoints...${NC}"

# Test with sample data (you'll need to replace with actual IDs)
echo -e "\n${YELLOW}To test PR analysis, you need:${NC}"
echo "  1. Login to get JWT token"
echo "  2. Get orgId, repoId, and prId from your database"
echo ""
echo "Example cURL command:"
echo ""
echo 'curl -X POST http://localhost:4000/api/v1/ai/analyze-pr \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Cookie: teampulse_token=YOUR_JWT_TOKEN" \'
echo '  -d '"'"'{'
echo '    "orgId": "your_org_id",'
echo '    "repoId": "your_repo_id",'
echo '    "prId": "your_pr_id"'
echo '  }'"'"

echo -e "\n${GREEN}✅ Basic checks passed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Login to your app and get JWT token"
echo "  2. Find a PR in your database"
echo "  3. Run the analyze-pr endpoint"
echo "  4. Check backend logs for AI analysis output"
