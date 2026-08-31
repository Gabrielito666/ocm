/**
 * @file
 * @source ./src/commands/current.js
 * @description Current command - shows the currently active config
 * @input @typedef {{}} I
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
class CurrentCommand extends Command
{
	constructor()
	{
		super(
			'current',
			'Show the currently active config',
			'ocm current'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs()
	{
		return {};
	}

	/**@type {ICommand<I>["run"]}*/
	async run()
	{
		const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || '', '.config/opencode');

		const stat = await fs.lstat(opencodeDir).catch(() => null);
		if (stat && stat.isSymbolicLink())
		{
			const target = await fs.readlink(opencodeDir);
			const name = path.basename(target);
			return new Command.Message(name);
		}

		return new Command.Message('No active config');
	}
}

module.exports = CurrentCommand;
