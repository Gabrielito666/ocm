const { describe, it } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');
const UpdateCommand = require('../../../src/commands/update');

describe('update.parseArgs', () =>
{
	it('should parse name and source', () =>
	{
		const cmd = new UpdateCommand();
		const result = cmd.parseArgs(['my-config', 'https://github.com/user/repo']);
		assert.deepStrictEqual(result, {
			name: 'my-config',
			source: 'https://github.com/user/repo'
		});
	});

	it('should parse name and source with ref', () =>
	{
		const cmd = new UpdateCommand();
		const result = cmd.parseArgs(['my-config', 'https://github.com/user/repo#v1.0.0']);
		assert.deepStrictEqual(result, {
			name: 'my-config',
			source: 'https://github.com/user/repo#v1.0.0'
		});
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new UpdateCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});

	it('should return Message.Error when only one arg', () =>
	{
		const cmd = new UpdateCommand();
		const result = cmd.parseArgs(['my-config']);
		assert.ok(result instanceof Command.Message.Error);
	});
});
