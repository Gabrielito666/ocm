/**
 * @file
 * @source ./src/commands/create-empty.js
 * @description Create-empty command - creates an empty config with template
 * @input @typedef {{ name: string }} I
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
class CreateEmptyCommand extends Command
{
	constructor()
	{
		super(
			'create-empty',
			'Create an empty config with template',
			'ocm create-empty <name>'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs(rawArgs)
	{
		if (rawArgs.length === 0)
		{
			return new Command.Message.Error('Name is required');
		}

		return { name: rawArgs[0] };
	}

	/**@type {ICommand<I>["run"]}*/
	async run({ name })
	{
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		const configDir = path.join(configsDir, name);

		const configExists = await fs.access(configDir).then(() => true).catch(() => false);
		if (configExists)
		{
			return new Command.Message.Error(`Config ${name} already exists`);
		}

		await fs.mkdir(configDir, { recursive: true });
		await fs.writeFile(path.join(configDir, 'AGENTS.md'), '');

		return new Command.Message.Success(`Created empty config ${name}`);
	}
}

module.exports = CreateEmptyCommand;
