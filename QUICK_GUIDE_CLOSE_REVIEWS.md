# How to Close Review Requests - Quick Guide

This guide provides step-by-step instructions for closing (removing) pending review requests from pull requests.

## Current Status

**Pull Request #4** has 1 pending review request that needs to be closed:
- Reviewer: @adaryusrgillum

All other open PRs (PR #2, #5, #6) have no pending review requests.

## ⚡ Quick Method (Recommended)

### Using GitHub Web Interface

1. **Navigate to PR #4**: https://github.com/adaryusrgillum/Adaryus/pull/4

2. **Locate the Reviewers Section**:
   - Look at the right sidebar
   - Find the "Reviewers" section
   - You'll see "@adaryusrgillum" listed

3. **Remove the Review Request**:
   - Hover over the reviewer name
   - Click the ❌ (X) icon that appears
   - The review request will be immediately removed

**Time required**: ~10 seconds

## 🤖 Automated Method

### Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Write access to the repository

### Steps

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Windows
   winget install --id GitHub.cli
   ```

2. **Authenticate**:
   ```bash
   gh auth login
   ```

3. **Run the automation script**:
   ```bash
   cd /path/to/Adaryus
   bash scripts/close_review_requests.sh
   ```

The script will:
- ✓ Scan all open PRs
- ✓ Identify pending review requests
- ✓ Remove all review requests automatically
- ✓ Display a summary of actions taken

## 📋 Manual API Method

If you prefer using curl or direct API calls:

```bash
# Set your GitHub token
export GITHUB_TOKEN="your_github_token_here"

# Remove review request from PR #4
curl -X DELETE \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/adaryusrgillum/Adaryus/pulls/4/requested_reviewers \
  -d '{"reviewers":["adaryusrgillum"]}'
```

## ❓ FAQ

**Q: Will this affect the PR itself?**
A: No, removing a review request only removes the notification/request. The PR remains open and unchanged.

**Q: Can removed reviewers still review the PR?**
A: Yes, anyone with access can still review even if the review request is removed.

**Q: Can I undo this action?**
A: Yes, you can re-request a review from the same person at any time.

**Q: Do I need special permissions?**
A: Yes, you need write access to the repository to manage review requests.

## 📚 Additional Resources

- [GitHub Docs: Managing Review Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/managing-a-branch-policy)
- Full documentation: `REVIEW_REQUESTS.md`
- Automation script: `scripts/close_review_requests.sh`
