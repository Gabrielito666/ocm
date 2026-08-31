const { describe, it } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');
const WorklinkCommand = require('../../../src/commands/worklink');

describe('worklink.parseArgs', () =>
{
	it('should parse name and output', () =>
	{
		const cmd = new WorklinkCommand();
		const result = cmd.parseArgs(['my-config', './output']);
		assert.deepStrictEqual(result, {
			name: 'my-config',
			output: './output'
		});
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new WorklinkCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});

	it('should return Message.Error when only one arg', () =>
	{
		const cmd = new WorklinkCommand();
		const result = cmd.parseArgs(['my-config']);
		assert.ok(result instanceof Command.Message.Error);
	});
});
