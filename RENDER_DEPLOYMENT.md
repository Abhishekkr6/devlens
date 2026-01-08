# Render Deployment Guide (Without Shell Access)

## Step-by-Step Process

### Step 1: Add Migration Secret to Render

1. Render Dashboard पर जाएं
2. अपनी backend service select करें
3. **Environment** tab पर जाएं
4. नया environment variable add करें:
   - Key: `MIGRATION_SECRET`
   - Value: `your-secure-random-string-here-12345` (कोई भी random secure string)
5. **Save Changes** करें

### Step 2: Code Deploy करें

```bash
# Local machine पर:
git add .
git commit -m "Add API-based migration endpoint for Render deployment"
git push origin main
```

Render automatically deploy शुरू कर देगा।

### Step 3: Wait for Deployment

Render Dashboard → **Logs** tab पर जाएं और wait करें:
- ✅ "Build succeeded"
- ✅ "Deploy live"

### Step 4: Run Migration via API

Deploy complete होने के बाद, अपने browser या Postman से migration endpoint call करें:

**Method:** POST

**URL:** 
```
https://YOUR-RENDER-SERVICE-NAME.onrender.com/api/v1/migration/multi-org?secret=your-secure-random-string-here-12345
```

**या curl से:**
```bash
curl -X POST "https://YOUR-RENDER-SERVICE-NAME.onrender.com/api/v1/migration/multi-org?secret=your-secure-random-string-here-12345"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Migration completed successfully",
  "changes": {
    "commits": {
      "droppedOldIndex": true,
      "createdNewIndex": true
    },
    "pullRequests": {
      "droppedOldIndex": true,
      "createdNewIndex": true
    }
  }
}
```

### Step 5: Verify Migration

एक बार migration successful हो जाए, फिर test webhook trigger करें:
1. Shared repository में test commit push करें
2. Render Logs check करें (webhook processing logs)
3. दोनों organizations के dashboards में commits verify करें

---

## Important Notes

⚠️ **Security:** Migration endpoint को sirf एक बार call करें, फिर environment variable delete कर दें (optional)

✅ **Idempotent:** Migration script multiple times run कर सकते हैं, कोई harm नहीं होगा

🔒 **Protected:** Bina secret के endpoint accessible नहीं है

---

## Troubleshooting

**अगर migration fail हो:**
1. Render Logs में error message देखें
2. MongoDB connection verify करें
3. फिर से try करें

**अगर 403 Unauthorized error आए:**
- `MIGRATION_SECRET` environment variable सही है check करें
- URL में `?secret=...` parameter सही है verify करें
