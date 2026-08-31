/**
 * @file
 * @source ./src/commands/list.js
 * @description List command - lists all installed configs
 * @input @typedef {{}} I
 * @import {ICommand} from "lapiz-cli/command"
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const Command = require('lapiz-cli/command');

const GREEN = '\x1b[92m';
const RESET = '\x1b[0m';

/**
 * @class
 * @implements ICommand<I>
 * @extends Command<I>
 */
class ListCommand extends Command
{
	constructor()
	{
		super(
			'list',
			'List all installed configs',
			'ocm list'
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
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || '', '.config/opencode');

		let activeConfig = null;

		const stat = await fs.lstat(opencodeDir).catch(() => null);
		if (stat && stat.isSymbolicLink())
		{
			const target = await fs.readlink(opencodeDir);
			activeConfig = path.basename(target);
		}

		const configs = await fs.readdir(configsDir).catch(() => []);
		const filtered = configs.filter(name => !name.startsWith('backup-'));

		if (filtered.length === 0)
		{
			return new Command.Message('No configs installed');
		}

		const lines = filtered.map(name =>
		{
			if (name === activeConfig)
			{
				return `${GREEN}* ${name}${RESET}`;
			}
			return `  ${name}`;
		});

		return new Command.Message(lines.join('\n'));
	}
}

module.exports = ListCommand;
