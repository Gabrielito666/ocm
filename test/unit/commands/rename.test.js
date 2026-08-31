const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('rename.parseArgs', () =>
{
	let RenameCommand;

	beforeEach(async () =>
	{
		mock.reset();
		RenameCommand = require('../../../src/commands/rename');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should parse current and new name', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs(['old-name', 'new-name']);
		assert.deepStrictEqual(result, {
			currentName: 'old-name',
			newName: 'new-name'
		});
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});

	it('should return Message.Error when only one arg', () =>
	{
		const cmd = new RenameCommand();
		const result = cmd.parseArgs(['old-name']);
		assert.ok(result instanceof Command.Message.Error);
	});
});

describe('rename.run', () =>
{
	let RenameCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => {}),
			rename: mock.fn(async () => {}),
			lstat: mock.fn(async () => ({ isSymbolicLink: () => false })),
			readlink: mock.fn(async () => ''),
			unlink: mock.fn(async () => {}),
			symlink: mock.fn(async () => {})
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		RenameCommand = require('../../../src/commands/rename');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful rename', async () =>
	{
		const cmd = new RenameCommand();
		const result = await cmd.run({ currentName: 'old-name', newName: 'new-name' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call access to verify current config exists', async () =>
	{
		const cmd = new RenameCommand();
		await cmd.run({ currentName: 'old-name', newName: 'new-name' });
		assert.ok(fsMock.access.mock.calls.length > 0);
	});

	it('should call rename to rename directory', async () =>
	{
		const cmd = new RenameCommand();
		await cmd.run({ currentName: 'old-name', newName: 'new-name' });
		assert.ok(fsMock.rename.mock.calls.length > 0);
	});

	it('should return Message.Error when new name already exists', async () =>
	{
		fsMock.access = mock.fn(async () => {});
		const cmd = new RenameCommand();
		const result = await cmd.run({ currentName: 'old-name', newName: 'new-name' });
		assert.ok(result instanceof Command.Message.Error);
	});
});
