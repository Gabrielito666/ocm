/**
 * @file
 * @source ./src/commands/remove.js
 * @description Remove command - removes an existing config
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
class RemoveCommand extends Command
{
	constructor()
	{
		super(
			'remove',
			'Remove an existing config',
			'ocm remove <name>'
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

		await fs.access(configDir);

		const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || '', '.config/opencode');

		const stat = await fs.lstat(opencodeDir).catch(() => null);
		if (stat && stat.isSymbolicLink())
		{
			const target = await fs.readlink(opencodeDir);
			if (target === configDir)
			{
				return new Command.Message.Error(`Cannot remove active config. Use 'ocm use <other-config>' first`);
			}
		}

		await fs.rm(configDir, { recursive: true, force: true });

		return new Command.Message.Success(`Removed ${name}`);
	}
}

module.exports = RemoveCommand;
