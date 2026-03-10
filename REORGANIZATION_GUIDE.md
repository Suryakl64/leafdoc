# Step-by-Step Guide to Reorganize Your LeafDoc Project

## 🎯 What This Guide Does

This guide will help you:
1. Reorganize your current project structure to match GitHub best practices
2. Set up Git properly
3. Push your organized code to GitHub
4. Understand basic Git commands

## 📋 Prerequisites

Before starting:
- [ ] You have your current leafdoc folder (seen in your screenshot)
- [ ] You have Git installed (if not, download from https://git-scm.com/)
- [ ] You have a GitHub account
- [ ] You have VS Code installed (recommended)

## 🚀 Method 1: Start Fresh (Recommended)

This is the easiest method - we'll create a new organized folder and copy files properly.

### Step 1: Download the Reorganized Project

1. Download the `leafdoc-reorganized` folder I created for you
2. Save it to your Desktop
3. Rename it to just `leafdoc` (delete your old one or rename it to `leafdoc-old`)

### Step 2: Initialize Git

Open Command Prompt or PowerShell in your new leafdoc folder:

```bash
# Navigate to your project
cd C:\Users\YourUsername\Desktop\leafdoc

# Initialize Git
git init

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"
```

### Step 3: Create Initial Commit

```bash
# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Organized project structure"
```

### Step 4: Connect to GitHub

```bash
# Add your GitHub repository
git remote add origin https://github.com/Suryakl64/leafdoc.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

Done! Your organized project is now on GitHub! 🎉

## 🔧 Method 2: Reorganize Existing Project

If you want to reorganize your current project instead:

### Step 1: Backup Your Current Project

```bash
# Copy your entire leafdoc folder
# Right-click → Copy → Paste → Rename to "leafdoc-backup"
```

### Step 2: Run Reorganization Script

**For Windows:**
1. Download `scripts/reorganize.bat` from the reorganized folder
2. Copy it to your leafdoc root directory
3. Double-click to run it

**For Linux/Mac:**
```bash
# Make script executable
chmod +x scripts/reorganize.sh

# Run it
./scripts/reorganize.sh
```

### Step 3: Verify the Structure

Your folder should now look like:

```
leafdoc/
├── .github/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── ml/
│   ├── models/
│   ├── notebooks/
│   └── scripts/
│       └── train_model.py
├── database/
│   └── schema.md
├── docs/
├── scripts/
├── tests/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── README.md
└── QUICKSTART.md
```

### Step 4: Update Import Paths

You'll need to update some import statements in your code:

**In `backend/app/main.py`:**
```python
# Old:
# from models import ...

# New:
from app.models import ...
from app.routes import predict, training, stats
from app.services.db_service import init_database
```

**In `frontend/src/App.jsx`:**
```javascript
// Old:
// import api from './api.js'

// New:
import api from './services/api.js'
```

### Step 5: Commit Changes

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Reorganize project structure"

# Push to GitHub
git push
```

## 📝 Daily Git Workflow (After Setup)

### Every Time You Start Working:

```bash
# 1. Open terminal in your project folder
cd C:\Users\YourUsername\Desktop\leafdoc

# 2. Get latest changes
git pull
```

### After Making Changes:

```bash
# 1. Check what you changed
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "What you changed (e.g., 'Add login feature')"

# 4. Push to GitHub
git push
```

That's it! Just these 4 commands for daily work!

## 🎨 Using VS Code (Easier Method)

### Initial Setup in VS Code:

1. **Open VS Code**
   - File → Open Folder → Select `leafdoc`

2. **Initialize Git** (if not done):
   - View → Terminal (or Ctrl+`)
   - Type: `git init`

3. **Source Control**:
   - Click Source Control icon (left sidebar)
   - You'll see all files

4. **Stage All Files**:
   - Click "+" next to "Changes" header

5. **Commit**:
   - Type message in box: "Initial commit"
   - Click ✓ checkmark

6. **Add Remote**:
   - Terminal: `git remote add origin https://github.com/Suryakl64/leafdoc.git`
   - Terminal: `git push -u origin main`

### Daily Workflow in VS Code:

1. **See Changes**:
   - Click Source Control icon
   - All changed files appear

2. **Commit Changes**:
   - Click "+" next to files you want
   - Type commit message
   - Click ✓ checkmark

3. **Push to GitHub**:
   - Click "..." menu → Push
   - Or click sync icon (bottom left)

## 🆘 Troubleshooting

### Problem: "git is not recognized"

**Solution**: Install Git from https://git-scm.com/

### Problem: Can't push to GitHub

**Solution**: Make sure you're logged in
```bash
# Use this URL format
git remote set-url origin https://github.com/Suryakl64/leafdoc.git
```

### Problem: "Permission denied"

**Solution**: Use HTTPS instead of SSH (see above)

### Problem: Files are too large

**Solution**: Add them to .gitignore
```bash
# Edit .gitignore and add:
*.h5
ml/models/*.h5

# Then remove from git
git rm --cached ml/models/large_file.h5
git commit -m "Remove large files"
```

### Problem: Made a mistake in commit

**Solution**: Undo last commit
```bash
# Keep changes but undo commit
git reset --soft HEAD~1

# Make your fix, then commit again
git add .
git commit -m "Fixed commit"
```

## ✅ Checklist Before Pushing to GitHub

- [ ] .gitignore includes .env, *.h5, node_modules
- [ ] No .env file in Git (use .env.example instead)
- [ ] README.md is present and updated
- [ ] Large files (>100MB) are in .gitignore
- [ ] Code is tested and works
- [ ] Commit messages are clear

## 📞 Quick Commands Reference

| What You Want | Command |
|---------------|---------|
| See changes | `git status` |
| Save all changes | `git add . && git commit -m "message" && git push` |
| Get latest code | `git pull` |
| Undo changes | `git checkout -- filename` |
| See history | `git log --oneline` |

## 🎯 What Each Folder Does

```
leafdoc/
├── backend/          → Python FastAPI server
│   └── app/          → Main application code
│       ├── models/   → Data models (Pydantic)
│       ├── routes/   → API endpoints
│       ├── services/ → Business logic
│       └── utils/    → Helper functions
├── frontend/         → React web interface
│   ├── src/          → Source code
│   │   ├── components/ → React components
│   │   └── services/   → API calls
│   └── public/       → Static files
├── ml/               → Machine Learning
│   ├── models/       → Trained models (.h5 files)
│   ├── scripts/      → Training scripts
│   └── notebooks/    → Jupyter notebooks
├── database/         → Database schemas
├── docs/             → Documentation
└── scripts/          → Utility scripts
```

## 💡 Pro Tips

1. **Commit Often**: Save small changes frequently
2. **Use Branches**: Create branches for new features
3. **Write Good Messages**: Describe what you changed
4. **Pull Before Push**: Always get latest code first
5. **Test Before Commit**: Make sure code works

## 🎓 Next Steps

After organizing your project:

1. ✅ Push to GitHub (completed above)
2. 📝 Write documentation in docs/
3. 🧪 Add tests in tests/
4. 🚀 Set up CI/CD in .github/workflows/
5. 📦 Deploy to production

## 📚 Additional Resources

- Git Guide: See `GIT_COMMANDS.md`
- Project Structure: See `PROJECT_STRUCTURE_GUIDE.md`
- Quick Start: See `QUICKSTART.md`
- GitHub Docs: https://docs.github.com/

---

**You've got this! 🚀**

Any questions? Just ask!
