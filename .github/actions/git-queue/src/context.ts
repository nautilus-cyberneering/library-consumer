import * as core from '@actions/core';
import {issueCommand} from '@actions/core/lib/command';

export interface Inputs {
  queue: string;
  action: string;
  jobPayload: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    queue: core.getInput('queue', { required: true }),
    action: core.getInput('action', { required: true }),
    jobPayload: core.getInput('job-payload', {required: false}),
  };
}

// FIXME: Temp fix https://github.com/actions/toolkit/issues/777
export function setOutput(name: string, value: any): void {
  issueCommand('set-output', {name}, value);
}

