# DevLens VS Code Extension - Quick Start

## 🚀 Test the Extension Now

### Step 1: Open Extension in VS Code

```bash
cd extensions/DevLens-vscode
code .
```

### Step 2: Launch Extension Development Host

Press **F5** in VS Code

This opens a new window with the extension loaded.

### Step 3: Open DevLens Sidebar

In the Extension Development Host window:
1. Click the **DevLens icon** in the Activity Bar (left sidebar)
2. You should see the DevLens sidebar panel

### Step 4: Login

1. Click **"Login with GitHub"** button
2. Enter your DevLens authentication token
   - Get token from: https://DevLens18.vercel.app (Settings → API Tokens)
3. Click OK

### Step 5: Open a Repository

1. Open a workspace containing a GitHub repository
   - File → Open Folder
   - Choose a folder with a Git repository
2. The extension will automatically detect the repository
3. PRs will appear in the sidebar

## 📝 What to Test

- [ ] Extension activates without errors
- [ ] Login flow works
- [ ] Repository is detected
- [ ] PRs are displayed
- [ ] High-risk PRs appear in alerts section
- [ ] Clicking a PR opens it in browser
- [ ] Refresh button updates data
- [ ] "Open Dashboard" button works
- [ ] Logout clears data

## 🐛 Troubleshooting

**Extension doesn't activate:**
- Check Output panel (View → Output → DevLens)
- Look for error messages

**No PRs showing:**
- Verify repository is connected in DevLens dashboard
- Check that you're in the correct organization
- Click refresh button

**Repository not detected:**
- Ensure workspace has a Git repository
- Verify remote URL is GitHub (not GitLab, Bitbucket, etc.)
- Check Git extension is enabled

## 📦 Package for Distribution

Once testing is complete:

```bash
npm run package
```

This creates `DevLens-vscode-0.1.0.vsix`

## 🎯 Next Steps

1. Test all features thoroughly
2. Create PNG icon (128x128) from SVG
3. Set up publisher account
4. Publish to VS Code Marketplace

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed instructions.
