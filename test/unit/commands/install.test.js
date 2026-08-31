const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const Command = require('lapiz-cli/command');

describe('install.parseArgs', () =>
{
	let InstallCommand;

	beforeEach(async () =>
	{
		mock.reset();
		InstallCommand = require('../../../src/commands/install');
	});

	afterEach(() =>
	{
		mock.restore();
	});

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

describe('install.run', () =>
{
	let InstallCommand;
	let fsMock;
	let childProcessMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			mkdir: mock.fn(async () => {}),
			cp: mock.fn(async () => {}),
			readFile: mock.fn(async () => '{}'),
			rm: mock.fn(async () => {})
		};

		childProcessMock = {
			execFile: mock.fn((cmd, args, opts, cb) => {
				if (typeof opts === 'function') {
					cb = opts;
				}
				cb(null, { stdout: '', stderr: '' });
			})
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		mock.module('node:child_process', {
			namedExports: childProcessMock
		});

		InstallCommand = require('../../../src/commands/install');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful install', async () =>
	{
		const cmd = new InstallCommand();
		const result = await cmd.run({ source: './test-path', name: 'test-name' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call mkdir to create configs directory', async () =>
	{
		const cmd = new InstallCommand();
		await cmd.run({ source: './test-path', name: 'test-name' });
		assert.ok(fsMock.mkdir.mock.calls.length > 0);
	});

	it('should call cp for local path install', async () =>
	{
		const cmd = new InstallCommand();
		await cmd.run({ source: './test-path', name: 'test-name' });
		assert.ok(fsMock.cp.mock.calls.length > 0);
	});
});
