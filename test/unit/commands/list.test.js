const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('list.parseArgs', () =>
{
	let ListCommand;

	beforeEach(async () =>
	{
		mock.reset();
		ListCommand = require('../../../src/commands/list');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return empty object', () =>
	{
		const cmd = new ListCommand();
		const result = cmd.parseArgs();
		assert.deepStrictEqual(result, {});
	});
});

describe('list.run', () =>
{
	let ListCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			lstat: mock.fn(async () => ({ isSymbolicLink: () => false })),
			readlink: mock.fn(async () => ''),
			readdir: mock.fn(async () => ['config1', 'config2'])
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		ListCommand = require('../../../src/commands/list');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message with configs list', async () =>
	{
		const cmd = new ListCommand();
		const result = await cmd.run();
		assert.ok(result instanceof Command.Message);
	});

	it('should return Message with "No configs" when empty', async () =>
	{
		fsMock.readdir = mock.fn(async () => []);
		const cmd = new ListCommand();
		const result = await cmd.run();
		assert.ok(result.text.includes('No configs'));
	});

	it('should filter out backup directories', async () =>
	{
		fsMock.readdir = mock.fn(async () => ['config1', 'backup-2024', 'config2']);
		const cmd = new ListCommand();
		const result = await cmd.run();
		assert.ok(!result.text.includes('backup-'));
	});

	it('should mark active config with asterisk', async () =>
	{
		fsMock.lstat = mock.fn(async () => ({ isSymbolicLink: () => true }));
		fsMock.readlink = mock.fn(async () => '/configs/config1');
		const cmd = new ListCommand();
		const result = await cmd.run();
		assert.ok(result.text.includes('*'));
	});
});
