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
        uses: ./.github/actions/git-job
        with:
          queue: "Library Update [library-aaa]"
          action: "create-job"
          job-payload: "job-payload"

      - name: Mutual exclusion code
        if: ${{ steps.create-job.outputs.job-created == 'true' }}
        run: echo "Running the job that requires mutual exclusion"

      - name: Get next job
        id: get-next-job
        if: ${{ steps.create-job.outputs.job-created == 'true' }}
        uses: ./.github/actions/git-job
        with:
          queue: "Library Update [library-aaa]"
          action: "next-job"

      - name: Mark job as done
        id: mark-job-as-done
        if: ${{ steps.create-job.outputs.job-created == 'true' }}              
        uses: ./.github/actions/git-job
        with:
          queue: "Library Update [library-aaa]"
          action: "mark-job-as-done"
          job-payload: "job-payload-done"
```

## Customizing

### inputs

Following inputs are available

| Name          | Type    | Description                           |
|---------------|---------|---------------------------------------|
| `queue` | String | Queue name |
| `action` | String | Queue action: [ `next-job`, `create-job`, `mark-job-as-done` ] |
| `job-payload` | String | The job payload |

### outputs

Following outputs are available

| Name          | Type   | Description                           |
|---------------|--------|---------------------------------------|
| `job-created` | String | Boolean. true if the job was successfully created |
| `job-commit`  | String | The commit hash when a new commit is created |
| `job-payload` | String | The job payload |

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
INPUT_QUEUE="queue-name" \
INPUT_ACTION="create-job" \
  node dist/index.js
```

Run the test workflow locally with `act`:

```shell
act -w ./.github/workflows/test-git-job-action.yml -j build
```

> NOTE: act is not working because [they have not released yet](https://github.com/nektos/act/issues/910#issuecomment-1017536955) the new version supporting `node16`.

## License

MIT. See `LICENSE` for more details.
