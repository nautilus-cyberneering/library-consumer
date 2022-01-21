import * as core from '@actions/core';
import {issueCommand} from '@actions/core/lib/command';

export interface Inputs {
  queueName: string;
  action: string;
  jobPayload: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    queueName: core.getInput('queue_name', { required: true }),
    action: core.getInput('action', { required: true }),
    jobPayload: core.getInput('job_payload', {required: false}),
  };
}

// FIXME: Temp fix https://github.com/actions/toolkit/issues/777
export function setOutput(name: string, value: any): void {
  issueCommand('set-output', {name}, value);
}

