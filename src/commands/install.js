/**
 * @file
 * @source ./src/commands/install.js
 * @description Install command - installs a config from repo or local path
 * @input @typedef {{ source: string, name?: string }} I
 * @import {ICommand} from "lapiz-cli/command"
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const Command = require('lapiz-cli/command');

const execFileAsync = promisify(execFile);

const getOcmJsonName = async (dir) =>
{
	try
	{
		const content = await fs.readFile(path.join(dir, 'ocm.json'), 'utf8');
		const json = JSON.parse(content);
		return json.name;
	}
	catch
	{
		return null;
	}
};

const cloneRepo = async (url, dest, ref) =>
{
	await execFileAsync('git', ['clone', url, dest]);
	if (ref)
	{
		await execFileAsync('git', ['checkout', ref], { cwd: dest });
	}
};

const copyDir = async (src, dest) =>
{
	await fs.cp(src, dest, { recursive: true });
};

const parseSource = (source) =>
{
	const hashIndex = source.indexOf('#');
	if (hashIndex === -1)
	{
		return { url: source, ref: null };
	}
	return {
		url: source.slice(0, hashIndex),
		ref: source.slice(hashIndex + 1)
	};
};

const getRepoName = (url) =>
{
	const parts = url.split('/');
	const last = parts[parts.length - 1];
	return last.replace(/\.git$/, '');
};

/**
 * @class
 * @implements ICommand<I>
 * @extends Command<I>
 */
class InstallCommand extends Command
{
	constructor()
	{
		super(
			'install',
			'Install a config from repo or local path',
			'ocm install <source> [-n <name>]'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs(rawArgs)
	{
		if (rawArgs.length === 0)
		{
			return new Command.Message.Error('Source is required');
		}

		const source = rawArgs[0];
		let name = null;

		const nameIdx = rawArgs.indexOf('-n');
		const nameIdxLong = rawArgs.indexOf('--name');
		const idx = nameIdx !== -1 ? nameIdx : nameIdxLong;

		if (idx !== -1 && rawArgs[idx + 1])
		{
			name = rawArgs[idx + 1];
		}

		return { source, name: name || undefined };
	}

	/**@type {ICommand<I>["run"]}*/
	async run({ source, name })
	{
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		await fs.mkdir(configsDir, { recursive: true });

		let resolvedName = name;
		const isRepo = source.startsWith('http://') || source.startsWith('https://') || source.includes('@');
		const { url, ref } = parseSource(source);

		if (!resolvedName)
		{
			if (isRepo)
			{
				const tmpDir = `/tmp/ocm-install-${Date.now()}`;
				await cloneRepo(url, tmpDir, ref);
				const jsonName = await getOcmJsonName(tmpDir);
				resolvedName = jsonName || getRepoName(url);
				const destDir = path.join(configsDir, resolvedName);
				
				const destExists = await fs.access(destDir).then(() => true).catch(() => false);
				if (destExists)
				{
					await fs.rm(tmpDir, { recursive: true, force: true });
					return new Command.Message.Error(`Config ${resolvedName} already exists`);
				}
				
				await fs.mkdir(destDir, { recursive: true });
				await copyDir(tmpDir, destDir);
				await fs.rm(tmpDir, { recursive: true, force: true });
			}
			else
			{
				const jsonName = await getOcmJsonName(source);
				resolvedName = jsonName || path.basename(source);
				const destDir = path.join(configsDir, resolvedName);
				
				const destExists = await fs.access(destDir).then(() => true).catch(() => false);
				if (destExists)
				{
					return new Command.Message.Error(`Config ${resolvedName} already exists`);
				}
				
				await copyDir(source, destDir);
			}
		}
		else
		{
			const destDir = path.join(configsDir, resolvedName);
			
			const destExists = await fs.access(destDir).then(() => true).catch(() => false);
			if (destExists)
			{
				return new Command.Message.Error(`Config ${resolvedName} already exists`);
			}
			
			if (isRepo)
			{
				await cloneRepo(url, destDir, ref);
			}
			else
			{
				await copyDir(source, destDir);
			}
		}

		return new Command.Message.Success(`Installed ${resolvedName}`);
	}
}

module.exports = InstallCommand;
