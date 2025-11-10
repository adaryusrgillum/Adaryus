#!/bin/bash

# Script to close/remove all pending review requests from pull requests
# Requires: gh CLI installed and authenticated, or GH_TOKEN environment variable

set -e

OWNER="adaryusrgillum"
REPO="Adaryus"

echo "================================"
echo "Close Review Requests Automation"
echo "================================"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "Alternative: Set GH_TOKEN environment variable and use curl"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "Error: GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    exit 1
fi

echo "Fetching open pull requests..."
echo ""

# Get all open PRs
PRS=$(gh pr list --repo "$OWNER/$REPO" --json number,title,reviewRequests --limit 100)

# Count of PRs with review requests
COUNT=0

# Parse and process each PR
echo "$PRS" | jq -c '.[]' | while read -r pr; do
    PR_NUMBER=$(echo "$pr" | jq -r '.number')
    PR_TITLE=$(echo "$pr" | jq -r '.title')
    REVIEW_REQUESTS=$(echo "$pr" | jq -r '.reviewRequests')
    
    # Check if there are any review requests
    NUM_REQUESTS=$(echo "$REVIEW_REQUESTS" | jq 'length')
    
    if [ "$NUM_REQUESTS" -gt 0 ]; then
        echo "PR #$PR_NUMBER: $PR_TITLE"
        echo "  Pending reviewers:"
        
        # Get list of reviewer logins
        REVIEWERS=$(echo "$REVIEW_REQUESTS" | jq -r '.[].login' | jq -R -s -c 'split("\n") | map(select(length > 0))')
        
        echo "$REVIEW_REQUESTS" | jq -r '.[] | "    - @\(.login)"'
        
        # Remove review requests
        echo "  Removing review requests..."
        gh api -X DELETE "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/requested_reviewers" \
            -f "reviewers=$REVIEWERS" || echo "  Warning: Failed to remove review requests from PR #$PR_NUMBER"
        
        echo "  ✓ Done"
        echo ""
        COUNT=$((COUNT + 1))
    fi
done

if [ $COUNT -eq 0 ]; then
    echo "No pending review requests found!"
else
    echo "================================"
    echo "Processed $COUNT PR(s) with review requests"
    echo "================================"
fi
