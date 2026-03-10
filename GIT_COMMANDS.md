# Git Commands Cheat Sheet for LeafDoc

## 🚀 Initial Setup (First Time Only)

### Step 1: Navigate to Your Project
```bash
# Windows
cd C:\Users\YourUsername\Desktop\leafdoc

# Or wherever your project is located
```

### Step 2: Initialize Git (if not already done)
```bash
git init
```

### Step 3: Configure Git (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"
```

### Step 4: Add Remote Repository
```bash
# Add your GitHub repository
git remote add origin https://github.com/Suryakl64/leafdoc.git

# Verify it was added
git remote -v
```

### Step 5: Initial Commit and Push
```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Project setup"

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 📝 Daily Workflow

### Check What Changed
```bash
# See which files have been modified
git status

# See detailed changes
git diff
```

### Save Your Changes

#### Option A: Add All Changes
```bash
# Stage all changed files
git add .

# Commit with message
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

#### Option B: Add Specific Files
```bash
# Stage specific files
git add filename.py
git add frontend/src/App.jsx

# Commit
git commit -m "Update specific files"

# Push
git push
```

### Pull Latest Changes (Before Starting Work)
```bash
# Get latest changes from GitHub
git pull

# Or with rebase (cleaner history)
git pull --rebase
```

## 🔧 Common Tasks

### Create a New Feature Branch
```bash
# Create and switch to new branch
git checkout -b feature/new-feature-name

# Make your changes, then:
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature-name

# Switch back to main
git checkout main
```

### Merge Feature Branch into Main
```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/new-feature-name

# Push to GitHub
git push
```

### Delete a Branch
```bash
# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name
```

### View Commit History
```bash
# See all commits
git log

# See last 5 commits (one line each)
git log --oneline -5

# See graphical commit history
git log --graph --oneline --all
```

## 🆘 Fix Common Mistakes

### Undo Uncommitted Changes
```bash
# Undo changes to specific file
git checkout -- filename.py

# Undo ALL uncommitted changes (careful!)
git reset --hard
```

### Change Last Commit Message
```bash
# Change the message of your last commit
git commit --amend -m "New better commit message"

# If already pushed, force push (careful!)
git push --force
```

### Undo Last Commit (Keep Changes)
```bash
# Undo last commit but keep the changes
git reset --soft HEAD~1

# Now you can modify and commit again
```

### Undo Last Commit (Discard Changes)
```bash
# Undo last commit and discard changes (careful!)
git reset --hard HEAD~1
```

### Remove File from Git (Keep Locally)
```bash
# Stop tracking file but keep it locally
git rm --cached filename.py

# Common use: remove accidentally committed .env file
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

### Stash Changes Temporarily
```bash
# Save changes temporarily
git stash

# Do other work, then restore
git stash pop

# List all stashes
git stash list
```

## 📦 Working with Large Files

### Remove Large Files
```bash
# Add to .gitignore first
echo "*.h5" >> .gitignore
echo "ml/models/*.h5" >> .gitignore

# Remove from git but keep locally
git rm --cached ml/models/large_model.h5

# Commit the removal
git commit -m "Remove large model file from tracking"
git push
```

### Use Git LFS (Large File Storage)
```bash
# Install Git LFS first
git lfs install

# Track large files
git lfs track "*.h5"
git lfs track "*.pkl"

# Add .gitattributes
git add .gitattributes

# Now add your large files
git add ml/models/model.h5
git commit -m "Add model with LFS"
git push
```

## 🌐 Pushing to GitHub

### First Time Push
```bash
git push -u origin main
```

### Subsequent Pushes
```bash
git push
```

### Force Push (Use with Caution!)
```bash
# Only if you know what you're doing
git push --force
```

## 🔍 Checking Status

### See Current Branch
```bash
git branch
# The branch with * is your current branch
```

### See Remote URL
```bash
git remote -v
```

### See Staged Files
```bash
git status
```

## 🎯 Complete Workflow Example

```bash
# Morning: Start work
cd C:\Users\YourUsername\Desktop\leafdoc
git pull                          # Get latest changes

# Make changes to files...

# Check what changed
git status                        # See modified files
git diff                          # See exact changes

# Save changes
git add .                         # Stage all changes
git commit -m "Add disease detection feature"  # Commit
git push                          # Push to GitHub

# Evening: End of day
git status                        # Make sure everything is committed
git push                          # Final push
```

## 📱 VS Code Git Integration

### Using VS Code Instead of Command Line

1. **See Changes**
   - Click Source Control icon (left sidebar)
   - All changed files appear

2. **Stage Files**
   - Hover over file → Click "+"
   - Or click "+" next to "Changes" to stage all

3. **Commit**
   - Type message in text box at top
   - Click ✓ checkmark or Ctrl+Enter

4. **Push**
   - Click "..." menu → Push
   - Or click sync icon at bottom status bar

5. **Pull**
   - Click "..." menu → Pull

## 🚨 Emergency: Undo Everything

If you completely mess up and want to reset to GitHub version:

```bash
# WARNING: This deletes all local changes!
git fetch origin
git reset --hard origin/main
```

## 📋 Quick Reference

| Command | What it does |
|---------|-------------|
| `git status` | Show what changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with message |
| `git push` | Upload to GitHub |
| `git pull` | Download from GitHub |
| `git log` | Show commit history |
| `git diff` | Show detailed changes |
| `git branch` | Show all branches |
| `git checkout -b name` | Create new branch |
| `git checkout main` | Switch to main branch |

## 💡 Best Practices

1. **Commit Often**: Small, frequent commits are better than large ones
2. **Good Commit Messages**: Be descriptive ("Add login feature" not "Update")
3. **Pull Before Push**: Always `git pull` before `git push`
4. **Don't Commit Secrets**: Never commit `.env`, passwords, or API keys
5. **Use .gitignore**: Add files you don't want to track
6. **Test Before Push**: Make sure code works before pushing

## 🆘 Need Help?

### Check if git is working:
```bash
git --version
```

### See full command help:
```bash
git help
git help <command>  # e.g., git help commit
```

### Common Error Solutions:

**"fatal: not a git repository"**
```bash
git init
```

**"Permission denied (publickey)"**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/Suryakl64/leafdoc.git
```

**"Your branch is behind"**
```bash
git pull
# Then push
git push
```

**"Merge conflict"**
```bash
# Edit conflicting files manually
# Then:
git add .
git commit -m "Resolve merge conflict"
git push
```

## 📞 Still Stuck?

1. Copy the error message
2. Google it (most Git errors are common)
3. Or ask for help with the exact error message

---

Remember: Git saves your work history. Even if you make mistakes, you can usually undo them!
