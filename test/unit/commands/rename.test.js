const { describe, it } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');
const RenameCommand = require('../../../src/commands/rename');

describe('rename.parseArgs', () =>
{
	it('should parse current and new name', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs(['old-name', 'new-name']);
		assert.deepStrictEqual(result, {
			currentName: 'old-name',
			newName: 'new-name'
		});
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});

	it('should return Message.Error when only one arg', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs(['old-name']);
		assert.ok(result instanceof Command.Message.Error);
	});
});
