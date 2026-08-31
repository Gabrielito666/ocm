const { describe, it } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');
const UseCommand = require('../../../src/commands/use');

describe('use.parseArgs', () =>
{
	it('should parse name', () =>
	{
		const cmd = new UseCommand();
		const result = cmd.parseArgs(['my-config']);
		assert.deepStrictEqual(result, { name: 'my-config' });
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new UseCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});
});
