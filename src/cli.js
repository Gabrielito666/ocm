/**
 * @file
 * @source ./src/cli.js
 * @description CLI entry point - registers all commands and runs the program
 */
const Program = require('lapiz-cli/program');

const InstallCommand = require('./commands/install');
const UpdateCommand = require('./commands/update');
const RenameCommand = require('./commands/rename');
const RemoveCommand = require('./commands/remove');
const ListCommand = require('./commands/list');
const CurrentCommand = require('./commands/current');
const UseCommand = require('./commands/use');
const WorklinkCommand = require('./commands/worklink');
const CreateEmptyCommand = require('./commands/create-empty');

const cli = new Program(
	'ocm',
	'https://github.com/Gabrielito666/ocm',
	new InstallCommand(),
	new UpdateCommand(),
	new RenameCommand(),
	new RemoveCommand(),
	new ListCommand(),
	new CurrentCommand(),
	new UseCommand(),
	new WorklinkCommand(),
	new CreateEmptyCommand()
);

cli.run();
