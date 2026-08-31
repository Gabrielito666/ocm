const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('create-empty.parseArgs', () =>
{
	let CreateEmptyCommand;

	beforeEach(async () =>
	{
		mock.reset();
		CreateEmptyCommand = require('../../../src/commands/create-empty');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should parse name', () =>
	{
		const cmd = new CreateEmptyCommand();
		const result = cmd.parseArgs(['my-config']);
		assert.deepStrictEqual(result, { name: 'my-config' });
	});

	it('should return Message.Error when no args', () =>
	{
		const cmd = new CreateEmptyCommand();
		const result = cmd.parseArgs([]);
		assert.ok(result instanceof Command.Message.Error);
	});
});

describe('create-empty.run', () =>
{
	let CreateEmptyCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			access: mock.fn(async () => { throw new Error('ENOENT'); }),
			mkdir: mock.fn(async () => {}),
			writeFile: mock.fn(async () => {})
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		CreateEmptyCommand = require('../../../src/commands/create-empty');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message.Success on successful create', async () =>
	{
		const cmd = new CreateEmptyCommand();
		const result = await cmd.run({ name: 'my-config' });
		assert.ok(result instanceof Command.Message.Success);
	});

	it('should call mkdir to create directory', async () =>
	{
		const cmd = new CreateEmptyCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.mkdir.mock.calls.length > 0);
	});

	it('should call writeFile to create AGENTS.md', async () =>
	{
		const cmd = new CreateEmptyCommand();
		await cmd.run({ name: 'my-config' });
		assert.ok(fsMock.writeFile.mock.calls.length > 0);
	});

	it('should return Message.Error when config already exists', async () =>
	{
		fsMock.access = mock.fn(async () => {});
		const cmd = new CreateEmptyCommand();
		const result = await cmd.run({ name: 'my-config' });
		assert.ok(result instanceof Command.Message.Error);
	});
});
