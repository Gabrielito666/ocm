const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('use.parseArgs', () =>
{
	let UseCommand;

	beforeEach(async () =>
	{
		mock.reset();
		UseCommand = require('../../../src/commands/use');
	});

	afterEach(() =>
	{
		mock.restore();
	});

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

describe('use.run', () =>
{
	let UseCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => {}),
			lstat: mock.fn(async () => ({ isSymbolicLink: () => false, isDirectory: () => false })),
			unlink: mock.fn(async () => {}),
			rename: mock.fn(async () => {}),
			symlink: mock.fn(async () => {})
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		UseCommand = require('../../../src/commands/use');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful use', async () =>
	{
		const cmd = new UseCommand();
		const result = await cmd.run({ name: 'my-config' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call access to verify config exists', async () =>
	{
		const cmd = new UseCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.access.mock.calls.length > 0);
	});

	it('should call symlink to create link', async () =>
	{
		const cmd = new UseCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.symlink.mock.calls.length > 0);
	});

	it('should call unlink when previous symlink exists', async () =>
	{
		fsMock.lstat = mock.fn(async () => ({ isSymbolicLink: () => true, isDirectory: () => false }));
		const cmd = new UseCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.unlink.mock.calls.length > 0);
	});

	it('should call rename when previous directory exists', async () =>
	{
		fsMock.lstat = mock.fn(async () => ({ isSymbolicLink: () => false, isDirectory: () => true }));
		const cmd = new UseCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.rename.mock.calls.length > 0);
	});
});
