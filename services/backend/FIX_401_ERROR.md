# 🔧 Quick Fix: 401 Unauthorized Error

## Problem
Console se fetch karte waqt cookies automatically send nahi hoti.

## Solution
Cookie ki jagah **Authorization header** use karo:

### ❌ Wrong (Doesn't work in console):
```javascript
fetch(url, {
  headers: {
    'Cookie': `teampulse_token=${TOKEN}`
  },
  credentials: 'include'
})
```

### ✅ Correct (Works in console):
```javascript
fetch(url, {
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
})
```

## Updated Test Script

```javascript
const API = 'https://teampulse-w2s8.onrender.com';
const TOKEN = 'your_jwt_token_here'; // From DevTools → Application → Cookies

// Analyze PR
fetch(`${API}/api/v1/ai/analyze-pr`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}` // ✅ Use this
  },
  body: JSON.stringify({
    orgId: '6967657fdb5155429fc77f8e',
    repoId: '696780f8118ef2394aca369c',
    prId: '69688f55b98f1dab327c8eb8'
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Success!');
    console.log('Score:', data.data.overallScore);
    console.log(data.data);
  } else {
    console.log('❌ Error:', data.error);
  }
});
```

## How to Get Fresh Token

1. Open your app: https://teampulse18.vercel.app
2. Login if not already
3. Press `F12` (DevTools)
4. Go to **Application** tab
5. Left sidebar → **Cookies** → Select your domain
6. Find `teampulse_token`
7. Copy the **Value**
8. Paste in script

## Why This Happens

Browser automatically sends cookies when:
- Same domain request
- User clicks a link
- Form submission

Browser does NOT send cookies when:
- Console fetch (security)
- Cross-origin (unless CORS configured)
- Manual API calls

**Solution:** Use `Authorization: Bearer TOKEN` header instead!

---

**Updated script:** `production-test.js` ✅
