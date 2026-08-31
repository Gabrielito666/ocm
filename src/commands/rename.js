/**
 * @file
 * @source ./src/commands/rename.js
 * @description Rename command - renames an existing config
 * @input @typedef {{ currentName: string, newName: string }} I
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
class RenameCommand extends Command
{
	constructor()
	{
		super(
			'rename',
			'Rename an existing config',
			'ocm rename <current-name> <new-name>'
		);
	}

	/**@type {ICommand<I>["parseArgs"]}*/
	parseArgs(rawArgs)
	{
		if (rawArgs.length < 2)
		{
			return new Command.Message.Error('Current name and new name are required');
		}

		return { currentName: rawArgs[0], newName: rawArgs[1] };
	}

	/**@type {ICommand<I>["run"]}*/
	async run({ currentName, newName })
	{
		const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || '', '.local/share/ocm');
		const currentDir = path.join(configsDir, currentName);
		const newDir = path.join(configsDir, newName);

		await fs.access(currentDir);

		const newDirExists = await fs.access(newDir).then(() => true).catch(() => false);
		if (newDirExists)
		{
			return new Command.Message.Error(`Config ${newName} already exists`);
		}

		await fs.rename(currentDir, newDir);

		const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || '', '.config/opencode');

		const stat = await fs.lstat(opencodeDir).catch(() => null);
		if (stat && stat.isSymbolicLink())
		{
			const target = await fs.readlink(opencodeDir);
			if (target === currentDir)
			{
				await fs.unlink(opencodeDir);
				await fs.symlink(newDir, opencodeDir);
			}
		}

		return new Command.Message.Success(`Renamed ${currentName} to ${newName}`);
	}
}

module.exports = RenameCommand;
