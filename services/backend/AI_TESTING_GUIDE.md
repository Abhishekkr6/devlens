# 🧪 AI Features Testing Guide

## Pre-Deployment Checklist

### 1. Get Free Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 2. Configure Environment Variables

**Local (.env):**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Production (Render/Railway):**
- Go to your backend deployment dashboard
- Add environment variable: `GEMINI_API_KEY=your_key`
- Redeploy the service

## Local Testing (Before Deployment)

### Step 1: Start Backend Locally
```bash
cd services/backend
npm run dev
```

Server should start on `http://localhost:4000`

### Step 2: Check AI Status
```bash
curl http://localhost:4000/api/v1/ai/status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "aiAvailable": true,
    "provider": "gemini",
    "features": {
      "codeReview": true,
      "qualityMetrics": true,
      "securityScan": true,
      "bugPrediction": true
    }
  }
}
```

If `aiAvailable: false`, check:
- ✅ GEMINI_API_KEY is set in .env
- ✅ Backend server restarted after adding key
- ✅ No typos in API key

### Step 3: Test AI Analysis (Manual)

**Option A: Using cURL**
```bash
# First, login and get JWT token
curl -X POST http://localhost:4000/api/v1/auth/github/login

# Then analyze a PR (replace with actual IDs and token)
curl -X POST http://localhost:4000/api/v1/ai/analyze-pr \
  -H "Content-Type: application/json" \
  -H "Cookie: teampulse_token=YOUR_JWT_TOKEN" \
  -d '{
    "orgId": "your_org_id",
    "repoId": "your_repo_id",
    "prId": "your_pr_id"
  }'
```

**Option B: Using Postman/Thunder Client**
1. Import collection
2. Login to get token
3. Call `POST /api/v1/ai/analyze-pr`
4. Check response

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "aiReview": {
      "score": 90,
      "issues": [
        {
          "file": "src/utils/helper.ts",
          "line": 42,
          "severity": "medium",
          "category": "performance",
          "message": "Inefficient loop detected",
          "suggestion": "Use Array.map() instead"
        }
      ],
      "summary": "Code quality is good with minor improvements needed",
      "recommendations": ["Add error handling", "Extract complex logic"]
    },
    "qualityMetrics": {
      "maintainabilityIndex": 78,
      "cyclomaticComplexity": 12,
      "codeSmells": 3,
      "technicalDebtMinutes": 45,
      "grade": "B"
    },
    "bugProbability": {
      "probability": 25,
      "riskLevel": "low"
    },
    "processingTimeMs": 3542
  }
}
```

### Step 4: Check Backend Logs

Terminal me ye logs dikhne chahiye:
```
[INFO] Sending code analysis request to Gemini API
[INFO] Code analysis completed successfully { score: 90, issuesFound: 2 }
[INFO] PR analysis completed { overallScore: 85, issuesFound: 2 }
```

## Deployment Testing

### Step 1: Deploy Backend

**For Render:**
```bash
git add .
git commit -m "feat: Add AI-powered code analysis"
git push origin main
```

Render automatically deploys. Check logs for:
```
✓ Build successful
✓ Deploy live
```

**For Railway:**
```bash
railway up
```

### Step 2: Add Environment Variable

**Render Dashboard:**
1. Go to your backend service
2. Environment → Add Variable
3. Key: `GEMINI_API_KEY`
4. Value: `your_gemini_api_key`
5. Save → Redeploy

**Railway Dashboard:**
```bash
railway variables set GEMINI_API_KEY=your_gemini_api_key
```

### Step 3: Verify Deployment

**Check AI Status:**
```bash
curl https://your-backend-url.com/api/v1/ai/status
```

Should return `aiAvailable: true`

### Step 4: Test with Real PR

1. Login to your deployed frontend
2. Navigate to a repository
3. Open a Pull Request
4. Click "Analyze with AI" (if you've added the button)
5. Check the response

## Testing Checklist

### ✅ Basic Tests
- [ ] AI status endpoint returns `aiAvailable: true`
- [ ] Can fetch PR insights without errors
- [ ] Quality metrics calculated correctly
- [ ] No console errors in backend logs

### ✅ AI Analysis Tests
- [ ] Gemini API responds (check logs)
- [ ] Code review suggestions generated
- [ ] Quality score calculated (0-100)
- [ ] Bug probability predicted
- [ ] Recommendations provided

### ✅ Error Handling Tests
- [ ] Invalid PR ID returns proper error
- [ ] Missing auth token returns 401
- [ ] Rate limit works (11th request in hour fails)
- [ ] Quota exceeded shows proper message

### ✅ Performance Tests
- [ ] Analysis completes in <10 seconds
- [ ] Results cached for 24 hours
- [ ] No memory leaks

## Common Issues & Solutions

### Issue 1: `aiAvailable: false`
**Solution:**
```bash
# Check if API key is set
echo $GEMINI_API_KEY  # Should show your key

# Restart server
npm run dev
```

### Issue 2: "AI analysis quota exceeded"
**Solution:**
- Wait 1 hour (rate limit: 10/hour)
- Or check cached results
- Or upgrade Gemini API tier (optional)

### Issue 3: "Failed to fetch PR diff"
**Solution:**
- Check GitHub token permissions
- Verify repository access
- Check PR exists

### Issue 4: Analysis takes too long
**Solution:**
- PR might be too large (>1000 lines)
- Reduce files analyzed (currently limited to 10)
- Check network connection to Gemini API

## Monitoring in Production

### Check Logs
```bash
# Render
render logs -t backend

# Railway
railway logs
```

Look for:
```
✓ [INFO] Code analysis completed successfully
✗ [ERROR] Gemini API error
✗ [WARN] AI analysis quota exceeded
```

### Monitor API Usage

**Gemini API Dashboard:**
- Visit: https://makersuite.google.com/app/apikey
- Check usage stats
- Free tier: 1500 requests/day

**Your Usage:**
- ~10 analyses/hour = ~240/day
- Well within free tier! 🎉

## Testing Workflow

### Complete Test Flow:
1. ✅ Start backend locally
2. ✅ Check AI status endpoint
3. ✅ Create/select a test PR
4. ✅ Call analyze-pr endpoint
5. ✅ Verify response structure
6. ✅ Check backend logs
7. ✅ Deploy to production
8. ✅ Add GEMINI_API_KEY
9. ✅ Test on production URL
10. ✅ Monitor logs for 24 hours

## Sample Test Data

### Test PR IDs (from your repos):
```json
{
  "orgId": "67890abc",
  "repoId": "12345xyz",
  "prId": "pr_test_001"
}
```

### Expected Metrics:
- **Score Range:** 0-100 (70+ is good)
- **Processing Time:** 2-8 seconds
- **Issues Found:** 0-20 (depends on code quality)
- **Grade:** A, B, C, D, or F

## Quick Test Script

Create `test-ai.sh`:
```bash
#!/bin/bash

echo "🧪 Testing AI Features..."

# 1. Check status
echo "\n1️⃣ Checking AI status..."
curl -s http://localhost:4000/api/v1/ai/status | jq .

# 2. Login (manual - copy token)
echo "\n2️⃣ Login and copy your JWT token"
echo "Visit: http://localhost:3000/auth/github/login"
read -p "Enter JWT token: " TOKEN

# 3. Test analysis
echo "\n3️⃣ Testing PR analysis..."
curl -s -X POST http://localhost:4000/api/v1/ai/analyze-pr \
  -H "Content-Type: application/json" \
  -H "Cookie: teampulse_token=$TOKEN" \
  -d '{
    "orgId": "YOUR_ORG_ID",
    "repoId": "YOUR_REPO_ID",
    "prId": "YOUR_PR_ID"
  }' | jq .

echo "\n✅ Test complete!"
```

Run:
```bash
chmod +x test-ai.sh
./test-ai.sh
```

## Success Criteria

### ✅ AI Feature is Working if:
1. Status endpoint shows `aiAvailable: true`
2. Analysis returns valid JSON with scores
3. Processing time < 10 seconds
4. No errors in backend logs
5. Results are cached (2nd call faster)
6. Rate limiting works (11th request fails)

### 🎉 Ready for Production if:
1. All local tests pass
2. Deployed backend shows AI available
3. Real PR analysis works
4. Logs show no errors
5. Frontend can display results

---

**Need Help?**
- Check logs first
- Verify GEMINI_API_KEY is set
- Test with small PRs first
- Monitor Gemini API quota

**Happy Testing! 🚀**
