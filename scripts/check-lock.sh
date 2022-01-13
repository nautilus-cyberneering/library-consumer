#!/bin/bash

LIST=$(git rev-list --abbrev HEAD)

for COMMIT in $LIST; do
    COMMIT_MSG=$(git show -s --format=%s "$COMMIT")
    # if the commit message prefix is "claim"
    if [[ "$COMMIT_MSG" =~ ^claim.* ]]; then
        # it returns and error if the first message we found it's a claim message
        exit 1
    fi
done
