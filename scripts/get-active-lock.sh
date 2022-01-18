#!/bin/bash

LIST=$(git rev-list --abbrev HEAD)

for COMMIT in $LIST; do

    COMMIT_SUBJECT=$(git show -s --format=%s "$COMMIT")

    echo "* $COMMIT - $COMMIT_SUBJECT"

    # if the first commit message prefix is "claim" -> we have an active lock
    if [[ "$COMMIT_SUBJECT" =~ ^(CLAIM LOCK: JOB: Library Update \[library-aaa\]).* ]]; then
        # it returns the info of the active lock
        echo "Active lock found in commit $COMMIT"

        COMMIT_BODY=$(git show -s --format=%b "$COMMIT")

        echo "Commit body:"
        echo "$COMMIT_BODY"

        IFS=$'\n' read -ra ADDR -d $'\0' <<< "$COMMIT_BODY"

        for LINE in "${ADDR[@]}"
        do
            echo "COMMIT LINE: $LINE"
            if [[ "$LINE" =~ ^(PREVIOUS_REF=).* ]]; then
                PREVIOUS_REF=${LINE##*=}
            fi
            if [[ "$LINE" =~ ^(CURRENT_REF=).* ]]; then
                CURRENT_REF=${LINE##*=}
            fi
        done

        echo "::set-output name=previous_ref::$PREVIOUS_REF"
        echo "::set-output name=current_ref::$CURRENT_REF"
        echo "::set-output name=active_lock::true"
        exit 0
    fi
    # if the first commit message prefix is "release" -> we do not have any active lock
    if [[ "$COMMIT_SUBJECT" =~ ^(RELEASE LOCK: JOB DONE: Library Update \[library-aaa\]).* ]]; then
        echo "No active lock"
        echo "::set-output name=previous_ref::"
        echo "::set-output name=current_ref::"
        echo "::set-output name=active_lock::"
        exit 0
    fi
done
