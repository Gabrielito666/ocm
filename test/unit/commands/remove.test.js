const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('remove.parseArgs', () =>
{
	let RemoveCommand;

	beforeEach(async () =>
	{
		mock.reset();
		RemoveCommand = require('../../../src/commands/remove');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should parse name', () =>
	{
		const cmd = new RemoveCommand();
		const result = cmd.parseArgs(['my-config']);
		assert.deepStrictEqual(result, { name: 'my-config' });
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new RemoveCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});
});

describe('remove.run', () =>
{
	let RemoveCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => {}),
			rm: mock.fn(async () => {}),
			lstat: mock.fn(async () => ({ isSymbolicLink: () => false })),
			readlink: mock.fn(async () => '')
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		RemoveCommand = require('../../../src/commands/remove');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful remove', async () =>
	{
		const cmd = new RemoveCommand();
		const result = await cmd.run({ name: 'my-config' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call access to verify config exists', async () =>
	{
		const cmd = new RemoveCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.access.mock.calls.length > 0);
	});

	it('should call rm to remove directory', async () =>
	{
		const cmd = new RemoveCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.rm.mock.calls.length > 0);
	});

	it('should return Message.Error when config is active', async () =>
	{
		fsMock.lstat = mock.fn(async () => ({ isSymbolicLink: () => true }));
		fsMock.readlink = mock.fn(async () => '/configs/my-config');
		const cmd = new RemoveCommand();
		const result = await cmd.run({ name: 'my-config' });
		assert.ok(result instanceof Command.Message.Error);
	});
});
