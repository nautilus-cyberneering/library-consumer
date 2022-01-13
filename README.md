# Library Consumer

Proof of Concept based on this issue: <https://github.com/Nautilus-Cyberneering/chinese-ideographs-website/issues/19>

Requirements:

- We have a git repo containing only text files. We call it [library-aaa](https://github.com/josecelano/library-aaa).
- We want to mirror the content of that library into this repo in the folder `libraries_mirror/aaa`.
- We want to create a workflow as a cronjob that pulls the latest version of the library every 10 minutes and sync the changes.
- We can create only one commit to apply all changes.
- Source folder: <https://github.com/josecelano/library-aaa>
- Folder mirror: <libraries_mirror/aaa>

This solution has some potential concurrency problems. They can be solved by using the workflow attribute [concurrency](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#concurrency)

Alternative solution:

We want to implement a different solution using a locking a git commit as a lock for the update. The rules are:

- Only one workflow can update the library. We need to enforce mutual exclusion for workflows updating the library.
- We want to use a [lock](https://en.wikipedia.org/wiki/Lock_(computer_science)) mechanism.
- When a thread (workflow) wants to update the library it has to claim the lock first and release it at the end of the process.
- "Claim the lock" means create an empty commit and push it into the `main` branch. If a second workflows tries to do the same it going to get a merge conflict because we only allow fast forward merge. The first workflow pushing to main will get the lock.
- Regardless of whether the workflows succeed or fail we have to release the lock at the end of the execution.

Pros:

- We do not need to rely on external service.

Cons:

- We force fast forward merges for all PRs.
- If we want to avoid to many merge conflict we have to pause other manual PR merges when the workflow is being executed.
- I can generate a lot of empty commits. Every time a workflow is executed there are two commits: claiming the lock and releasing the lock.

## Error cases

### Example 1: overwrite a newer version of the file

Note: a new workflow is executed every 10 minutes.

- `T1`. Add new file to the library (`1.txt`)
- `T2`. We run `W1` to update the library. For some reason this process takes more than 10 minutes.
- `T3`. We modify the file `1.txt` in the library.
- `T4`. (T2+10") We run a second workflow `W2` to update the library.
- `T5`. The workflow `W2` finishes and creates a commit with the second version of file `1.txt`.
- `T6`. The workflow `W1` finishes and overwrites the first version of the file `1.txt`.

## Install

```shell
poetry install
```

## Run

```shell
poetry run library-consumer test
```
