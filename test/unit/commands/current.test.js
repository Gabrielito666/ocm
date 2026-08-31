const { describe, it } = require('node:test');
const assert = require('node:assert');

const CurrentCommand = require('../../../src/commands/current');

describe('current.parseArgs', () =>
{
	it('should return empty object', () =>
	{
		const cmd = new CurrentCommand();
		const result = cmd.parseArgs();
		assert.deepStrictEqual(result, {});
	});
});
