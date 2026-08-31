const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('worklink.parseArgs', () =>
{
	let WorklinkCommand;

	beforeEach(async () =>
	{
		mock.reset();
		WorklinkCommand = require('../../../src/commands/worklink');
	});

	afterEach(() =>
	{
		mock.restore();
	});

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

describe('worklink.run', () =>
{
	let WorklinkCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => { throw new Error('ENOENT'); }),
			symlink: mock.fn(async () => {})
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		WorklinkCommand = require('../../../src/commands/worklink');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful worklink', async () =>
	{
		fsMock.access = mock.fn(async () => {});
		const cmd = new WorklinkCommand();
		const result = await cmd.run({ name: 'my-config', output: './output' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call access to verify config exists', async () =>
	{
		fsMock.access = mock.fn(async () => {});
		const cmd = new WorklinkCommand();
		await cmd.run({ name: 'my-config', output: './output' });
		assert.ok(fsMock.access.mock.calls.length > 0);
	});

	it('should call symlink to create link', async () =>
	{
		fsMock.access = mock.fn(async () => {});
		const cmd = new WorklinkCommand();
		await cmd.run({ name: 'my-config', output: './output' });
		assert.ok(fsMock.symlink.mock.calls.length > 0);
	});

	it('should return Message.Error when output already exists', async () =>
	{
		fsMock.access = mock.fn(async (path) => {
			if (path.includes('output')) return;
			throw new Error('ENOENT');
		});
		const cmd = new WorklinkCommand();
		const result = await cmd.run({ name: 'my-config', output: './output' });
		assert.ok(result instanceof Command.Message.Error);
	});
});
