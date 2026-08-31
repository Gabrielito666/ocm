const { describe, it } = require('node:test');
const assert = require('node:assert');

const ListCommand = require('../../../src/commands/list');

describe('list.parseArgs', () =>
{
	it('should return empty object', () =>
	{
		const cmd = new ListCommand();
		const result = cmd.parseArgs();
		assert.deepStrictEqual(result, {});
	});
});
