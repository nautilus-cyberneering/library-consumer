# GitHub Action - GitQueue

A job queue implementing using empty commit in the `main` branch.
___

* [Features](#features)
* [Usage](#usage)
  * [Workflow](#workflow)
* [Customizing](#customizing)
  * [inputs](#inputs)
  * [outputs](#outputs)
* [Development](#development)
* [License](#license)

## Features

* Works on Linux, macOS and Windows [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources)

## Usage

### Workflow

```yaml
name: your workflow

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Create job
        id: create-job
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "create-job"
          job_payload: "job_payload"

      - name: Create job debug
        run: |
          echo -e "job_created: ${{ steps.create-job.outputs.job_created }}"
          echo -e "job_commit: ${{ steps.create-job.outputs.job_commit }}"

      - name: Mutual exclusion code
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        run: echo "Running the job that requires mutual exclusion"

      - name: Get next job
        id: get-next-job
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "next-job"

      - name: Get next job debug
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        run: |
          echo -e "job_payload: ${{ steps.get-next-job.outputs.job_payload }}"
          echo -e "job_commit: ${{ steps.get-next-job.outputs.job_commit }}"

      - name: Mark job as done
        id: mark-job-as-done
        if: ${{ steps.create-job.outputs.job_created == 'true' }}
        uses: ./.github/actions/git-queue
        with:
          queue_name: "Library Update [library-aaa]"
          action: "mark-job-as-done"
          job_payload: "job_payload-done"

      - name: Mark job as done debug
        if: ${{ steps.mark-job-as-done.outputs.job_created == 'true' }}
        run: |
          echo -e "job_commit: ${{ steps.get-next-job.outputs.job_commit }}"
```

## Customizing

### inputs

Following inputs are available

| Name          | Type    | Description                           |
|---------------|---------|---------------------------------------|
| `queue_name` | String | Queue name |
| `action` | String | Queue action: [ `next-job`, `create-job`, `mark-job-as-done` ] |
| `job_payload` | String | The job payload |
| `git_Repo_dir` | String | The git repository directory. Default value is the current working dir |

### outputs

Following outputs are available

| Name          | Type   | Description                           |
|---------------|--------|---------------------------------------|
| `job_created` | String | Boolean. true if the job was successfully created |
| `job_commit`  | String | The commit hash when a new commit is created |
| `job_payload` | String | The job payload |

## Development

Install:

```shell
yarn install
```

Build:

```shell
yarn run build
```

Run tests:

```shell
yarn run test
```

Run the app locally:

```shell
yarn run build && \
INPUT_QUEUE_NAME="Library Update [library-aaa]" \
INPUT_ACTION="next-job" \
  node dist/index.js
```

Run the test workflow locally with `act`:

```shell
act -w ./.github/workflows/test-git-job-action.yml -j build
```

> NOTE: act is not working because [they have not released yet](https://github.com/nektos/act/issues/910#issuecomment-1017536955) the new version supporting `node16`.

## License

MIT. See `LICENSE` for more details.
