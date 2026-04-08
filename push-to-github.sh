#!/bin/bash
# Push medme-doctor-crm to GitHub
# Run this script from Terminal: bash ~/Desktop/medme-doctor-crm/push-to-github.sh

set -e

cd ~/Desktop/medme-doctor-crm

# Clean up any stale lock files
rm -f .git/index.lock 2>/dev/null

# Initialize git if not already done
if [ ! -d ".git" ]; then
  git init -b main
else
  # Ensure we're on main branch
  git branch -M main 2>/dev/null || true
fi

# Stage all files (respects .gitignore)
git add .

# Commit if there are changes
if git diff --cached --quiet 2>/dev/null; then
  echo "No changes to commit (already committed)"
else
  git commit -m "Initial commit: MedMe Doctor CRM

Next.js app with doctor management, visit tracking, dashboard, and admin features.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
fi

# Add remote if not exists
if ! git remote | grep -q origin; then
  git remote add origin https://github.com/drpqwu/medme-doctor-crm.git
fi

# Push to GitHub
git push -u origin main

echo ""
echo "Done! Your repo is live at: https://github.com/drpqwu/medme-doctor-crm"
