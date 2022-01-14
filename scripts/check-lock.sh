#!/bin/bash

LIST=$(git rev-list --abbrev HEAD)

for COMMIT in $LIST; do
    COMMIT_MSG=$(git show -s --format=%s "$COMMIT")
    # if the commit message prefix is "claim"
    if [[ "$COMMIT_MSG" =~ ^(lock: claim).* ]]; then
        # it returns and error if the first message we found it's a claim message
        exit 1
    fi
    # if the commit message prefix is "release"
    if [[ "$COMMIT_MSG" =~ ^(lock: release).* ]]; then
        exit 0
    fi    
done
