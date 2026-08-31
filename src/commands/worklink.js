/**
 * @file
 * @source ./src/commands/worklink.js
 * @description Worklink command - creates a symlink to a config for editing
 * @input @typedef {{ name: string, output: string }} I
 * @import {ICommand} from "lapiz-cli/command"
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const Command = require('lapiz-cli/command');

/**
 * @class
 * @implements ICommand<I>
 * @extends Command<I>
 */
class WorklinkCommand extends Command
{
	constructor()
	{
		super(
			'worklink',
			'Create a symlink to a config for editing',
			'ocm worklink <name> <output>'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs(rawArgs)
	{
		if (rawArgs.length < 2)
		{
			return new Command.Message.Error('Name and output path are required');
		}

		return { name: rawArgs[0], output: rawArgs[1] };
	}

	/**@type {ICommand<I>["run"]}*/
	async run({ name, output })
	{
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		const configDir = path.join(configsDir, name);

		await fs.access(configDir);
		await fs.access(path.dirname(output));

		const outputExists = await fs.access(output).then(() => true).catch(() => false);
		if (outputExists)
		{
			return new Command.Message.Error(`Output path already exists: ${output}`);
		}

		await fs.symlink(configDir, output);

		return new Command.Message.Success(`Created worklink at ${output}`);
	}
}

module.exports = WorklinkCommand;
