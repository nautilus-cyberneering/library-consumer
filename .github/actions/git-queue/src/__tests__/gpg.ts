import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as openpgp from './openpgp';
import {getGnupgHome} from '../gpg-env';

export const agentConfig = `default-cache-ttl 7200
max-cache-ttl 31536000
allow-preset-passphrase`;

export interface Version {
  gnupg: string;
  libgcrypt: string;
}

export interface Dirs {
  libdir: string;
  libexecdir: string;
  datadir: string;
  homedir: string;
}

const gpgConnectAgent = async (command: string, homedir: string = ''): Promise<string> => {
  let homeDirArg = '';
  let cmd = '';

  if (homedir != '') {
    homeDirArg = `--homedir ${homedir}`;
  }

  cmd = `gpg-connect-agent ${homeDirArg} "${command}" /bye`;

  return await exec
    .getExecOutput(cmd, [], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }
      for (let line of res.stdout.replace(/\r/g, '').trim().split(/\n/g)) {
        if (line.startsWith('ERR')) {
          throw new Error(line);
        }
      }
      return res.stdout.trim();
    });
};

export const getVersion = async (): Promise<Version> => {
  return await exec
    .getExecOutput('gpg', ['--version'], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }

      let gnupgVersion: string = '';
      let libgcryptVersion: string = '';

      for (let line of res.stdout.replace(/\r/g, '').trim().split(/\n/g)) {
        if (line.startsWith('gpg (GnuPG) ')) {
          gnupgVersion = line.substr('gpg (GnuPG) '.length).trim();
        } else if (line.startsWith('gpg (GnuPG/MacGPG2) ')) {
          gnupgVersion = line.substr('gpg (GnuPG/MacGPG2) '.length).trim();
        } else if (line.startsWith('libgcrypt ')) {
          libgcryptVersion = line.substr('libgcrypt '.length).trim();
        }
      }

      return {
        gnupg: gnupgVersion,
        libgcrypt: libgcryptVersion
      };
    });
};

export const getDirs = async (): Promise<Dirs> => {
  return await exec
    .getExecOutput('gpgconf', ['--list-dirs'], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }

      let libdir: string = '';
      let libexecdir: string = '';
      let datadir: string = '';
      let homedir: string = '';

      for (let line of res.stdout.replace(/\r/g, '').trim().split(/\n/g)) {
        if (line.startsWith('libdir:')) {
          libdir = line.substr('libdir:'.length).replace('%3a', ':').trim();
        } else if (line.startsWith('libexecdir:')) {
          libexecdir = line.substr('libexecdir:'.length).replace('%3a', ':').trim();
        } else if (line.startsWith('datadir:')) {
          datadir = line.substr('datadir:'.length).replace('%3a', ':').trim();
        } else if (line.startsWith('homedir:')) {
          homedir = line.substr('homedir:'.length).replace('%3a', ':').trim();
        }
      }

      return {
        libdir: libdir,
        libexecdir: libexecdir,
        datadir: datadir,
        homedir: homedir
      };
    });
};

export const importKey = async (key: string, homedir: string = ''): Promise<string> => {
  const keyFolder: string = fs.mkdtempSync(path.join(os.tmpdir(), 'ghaction-import-gpg-'));
  const keyPath: string = `${keyFolder}/key.pgp`;
  fs.writeFileSync(keyPath, (await openpgp.isArmored(key)) ? key : Buffer.from(key, 'base64').toString(), {mode: 0o600});

  let args: string[] = [];
  if (homedir != '') {
    args.push('--homedir', `${homedir}`);
  }
  args.push('--import', '--batch', '--yes', keyPath);

  return await exec
    .getExecOutput('gpg', args, {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }
      if (res.stderr != '') {
        return res.stderr.trim();
      }
      return res.stdout.trim();
    })
    .finally(() => {
      fs.unlinkSync(keyPath);
    });
};

export const getKeygrips = async (fingerprint: string, homedir: string = ''): Promise<Array<string>> => {
  let args: string[] = [];
  if (homedir != '') {
    args.push('--homedir', `${homedir}`);
  }
  args.push('--batch', '--with-colons', '--with-keygrip', '--list-secret-keys', fingerprint);

  return await exec
    .getExecOutput('gpg', args, {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      let keygrips: Array<string> = [];
      for (let line of res.stdout.replace(/\r/g, '').trim().split(/\n/g)) {
        if (line.startsWith('grp')) {
          keygrips.push(line.replace(/(grp|:)/g, '').trim());
        }
      }
      return keygrips;
    });
};

export const overwriteAgentConfiguration = async (config: string, homedir: string = ''): Promise<void> => {
  if (homedir == '') {
    homedir = await getGnupgHome();
  }

  const gpgAgentConfPath: string = path.join(homedir, 'gpg-agent.conf');

  await fs.writeFile(gpgAgentConfPath, config, function (err) {
    if (err) throw err;
  });

  await gpgConnectAgent('RELOADAGENT', homedir);
};

export const presetPassphrase = async (keygrip: string, passphrase: string, homedir: string = ''): Promise<string> => {
  const hexPassphrase: string = Buffer.from(passphrase, 'utf8').toString('hex').toUpperCase();
  await gpgConnectAgent(`PRESET_PASSPHRASE ${keygrip} -1 ${hexPassphrase}`, homedir);
  return await gpgConnectAgent(`KEYINFO ${keygrip}`);
};

export const deleteKey = async (fingerprint: string): Promise<void> => {
  await exec
    .getExecOutput('gpg', ['--batch', '--yes', '--delete-secret-keys', fingerprint], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }
    });
  await exec
    .getExecOutput('gpg', ['--batch', '--yes', '--delete-keys', fingerprint], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr);
      }
    });
};

export const killAgent = async (): Promise<void> => {
  await gpgConnectAgent('KILLAGENT');
};
