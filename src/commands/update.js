/**
 * @file
 * @source ./src/commands/update.js
 * @description Update command - updates an existing config from repo or local path
 * @input @typedef {{ name: string, source: string }} I
 * @import {ICommand} from "lapiz-cli/command"
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const Command = require('lapiz-cli/command');

const execFileAsync = promisify(execFile);

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

/**
 * @class
 * @implements ICommand<I>
 * @extends Command<I>
 */
class UpdateCommand extends Command
{
	constructor()
	{
		super(
			'update',
			'Update an existing config from repo or local path',
			'ocm update <name> <source>'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs(rawArgs)
	{
		if (rawArgs.length < 2)
		{
			return new Command.Message.Error('Name and source are required');
		}

		return { name: rawArgs[0], source: rawArgs[1] };
	}

	/**@type {ICommand<I>["run"]}*/
	async run({ name, source })
	{
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		const configDir = path.join(configsDir, name);

		await fs.access(configDir);

		const isRepo = source.startsWith('http://') || source.startsWith('https://') || source.includes('@');
		const { url, ref } = parseSource(source);

		const tmpDir = `${configDir}-tmp-${Date.now()}`;

		if (isRepo)
		{
			await cloneRepo(url, tmpDir, ref);
		}
		else
		{
			await copyDir(source, tmpDir);
		}

		await fs.rm(configDir, { recursive: true, force: true });
		await fs.rename(tmpDir, configDir);

		return new Command.Message.Success(`Updated ${name}`);
	}
}

module.exports = UpdateCommand;
