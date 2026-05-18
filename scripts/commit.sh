#!/bin/bash

# Get all modified and untracked files
git_status=$(git status --short)

# Count total files
total_files=$(echo "$git_status" | wc -l)

echo "Found $total_files files to commit"
echo "---"

counter=0

# Process each file
while IFS= read -r line; do
    if [ -z "$line" ]; then
        continue
    fi

    counter=$((counter + 1))
    status="${line:0:2}"
    file="${line:3}"

    echo "[$counter/$total_files] Processing: $file (Status: $status)"

    # Add the file
    git add "$file"

    # Determine commit message based on status
    if [[ "$status" == "??" ]]; then
        commit_msg="feat: add $file"
    elif [[ "$status" == " M" ]] || [[ "$status" == "M " ]]; then
        commit_msg="refactor: update $file"
    else
        commit_msg="chore: modify $file"
    fi

    # Commit with message
    git commit -m "$commit_msg"

    echo "✓ Committed: $file"
    echo "---"

    # Wait for user confirmation before next commit (optional)
    # Uncomment the line below if you want to pause between commits
    # read -p "Press Enter for next commit..."

done <<< "$git_status"

echo "✓ All $counter files committed!"
echo "Next: Review commits with 'git log' before pushing"
