const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('update.parseArgs', () =>
{
	let UpdateCommand;

	beforeEach(async () =>
	{
		mock.reset();
		UpdateCommand = require('../../../src/commands/update');
	});

	afterEach(() =>
	{
		mock.restore();
	});

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

describe('update.run', () =>
{
	let UpdateCommand;
	let fsMock;
	let childProcessMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => {}),
			rm: mock.fn(async () => {}),
			rename: mock.fn(async () => {}),
			cp: mock.fn(async () => {})
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

		UpdateCommand = require('../../../src/commands/update');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful update', async () =>
	{
		const cmd = new UpdateCommand();
		const result = await cmd.run({ name: 'my-config', source: './test-path' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call access to verify config exists', async () =>
	{
		const cmd = new UpdateCommand();
		await cmd.run({ name: 'my-config', source: './test-path' });
		assert.ok(fsMock.access.mock.calls.length > 0);
	});

	it('should call rename to replace config directory', async () =>
	{
		const cmd = new UpdateCommand();
		await cmd.run({ name: 'my-config', source: './test-path' });
		assert.ok(fsMock.rename.mock.calls.length > 0);
	});
});
