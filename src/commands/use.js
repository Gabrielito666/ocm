/**
 * @file
 * @source ./src/commands/use.js
 * @description Use command - sets the active config
 * @input @typedef {{ name: string }} I
 * @import {ICommand} from "lapiz-cli/command"
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const Command = require('lapiz-cli/command');

const formatDate = (date) =>
{
	const y = date.getFullYear();
	const mo = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	const h = String(date.getHours()).padStart(2, '0');
	const mi = String(date.getMinutes()).padStart(2, '0');
	const s = String(date.getSeconds()).padStart(2, '0');
	return `${y}-${mo}-${d}_${h}-${mi}-${s}`;
};

/**
 * @class
 * @implements ICommand<I>
 * @extends Command<I>
 */
class UseCommand extends Command
{
	constructor()
	{
		super(
			'use',
			'Set the active config',
			'ocm use <name>'
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
		const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || '', '.config/opencode');

		await fs.access(configDir);

		const stat = await fs.lstat(opencodeDir).catch(() => null);
		if (stat)
		{
			if (stat.isSymbolicLink())
			{
				await fs.unlink(opencodeDir);
			}
			else if (stat.isDirectory())
			{
				const backupName = `backup-${formatDate(new Date())}`;
				const backupDir = path.join(configsDir, backupName);
				await fs.rename(opencodeDir, backupDir);
			}
		}

		await fs.symlink(configDir, opencodeDir);

		return new Command.Message.Success(`Now using ${name}`);
	}
}

module.exports = UseCommand;
