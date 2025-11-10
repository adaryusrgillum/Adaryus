# Review Requests Status

## Summary
This document tracks all pending review requests across open pull requests in the repository.

**Last Updated**: 2025-11-10

## Current Review Requests

### PR #4: Fix deployment failure from deprecated artifact actions
- **Status**: Open (Draft)
- **Pending Reviewers**: 
  - @adaryusrgillum
- **Action Required**: Remove review request or complete the review

### Other Open PRs
- **PR #2**: No pending review requests
- **PR #5**: No pending review requests  
- **PR #6**: No pending review requests (current PR)

## How to Close/Remove Review Requests

### Method 1: GitHub Web Interface (Manual)
1. Navigate to the pull request (e.g., https://github.com/adaryusrgillum/Adaryus/pull/4)
2. In the right sidebar under "Reviewers", locate the reviewer name
3. Click the ❌ (X) icon next to the reviewer's name to remove the review request

### Method 2: GitHub CLI (Automated)
If you have the GitHub CLI (`gh`) installed and authenticated:

```bash
# Remove review request from PR #4
gh api -X DELETE /repos/adaryusrgillum/Adaryus/pulls/4/requested_reviewers \
  -f reviewers='["adaryusrgillum"]'
```

### Method 3: Using the Script
Run the provided script to automatically remove all pending review requests:

```bash
# Requires GH_TOKEN environment variable or gh CLI authenticated
bash scripts/close_review_requests.sh
```

## Notes
- Review requests can only be removed by repository collaborators with write access
- Removing a review request does not affect the PR itself, only the notification to the reviewer
- Completed reviews cannot be "closed" but review requests for pending reviews can be removed
