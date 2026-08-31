const { describe, it } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');
const InstallCommand = require('../../../src/commands/install');

describe('install.parseArgs', () =>
{
	it('should parse source only', () =>
	{
		const cmd = new InstallCommand();
		const result = cmd.parseArgs(['https://github.com/user/repo']);
		assert.deepStrictEqual(result, {
			source: 'https://github.com/user/repo',
			name: undefined
		});
	});

	it('should parse source with -n flag', () =>
	{
		const cmd = new InstallCommand();
		const result = cmd.parseArgs(['https://github.com/user/repo', '-n', 'my-config']);
		assert.deepStrictEqual(result, {
			source: 'https://github.com/user/repo',
			name: 'my-config'
		});
	});

	it('should parse source with --name flag', () =>
	{
		const cmd = new InstallCommand();
		const result = cmd.parseArgs(['https://github.com/user/repo', '--name', 'my-config']);
		assert.deepStrictEqual(result, {
			source: 'https://github.com/user/repo',
			name: 'my-config'
		});
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new InstallCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});

	it('should parse source with ref (#tag)', () =>
	{
		const cmd = new InstallCommand();
		const result = cmd.parseArgs(['https://github.com/user/repo#v1.0.0']);
		assert.deepStrictEqual(result, {
			source: 'https://github.com/user/repo#v1.0.0',
			name: undefined
		});
	});
});
