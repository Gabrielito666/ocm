const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const Command = require('lapiz-cli/command');

describe('current.parseArgs', () =>
{
	let CurrentCommand;

	beforeEach(async () =>
	{
		mock.reset();
		CurrentCommand = require('../../../src/commands/current');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return empty object', () =>
	{
		const cmd = new CurrentCommand();
		const result = cmd.parseArgs();
		assert.deepStrictEqual(result, {});
	});
});

describe('current.run', () =>
{
	let CurrentCommand;
	let fsMock;

	beforeEach(async () =>
	{
		mock.reset();

		fsMock = {
			lstat: mock.fn(async () => ({ isSymbolicLink: () => false })),
			readlink: mock.fn(async () => '')
		};

		mock.module('node:fs/promises', {
			namedExports: fsMock
		});

		CurrentCommand = require('../../../src/commands/current');
	});

	afterEach(() =>
	{
		mock.restore();
	});

	it('should return Message with config name when symlink exists', async () =>
	{
		fsMock.lstat = mock.fn(async () => ({ isSymbolicLink: () => true }));
		fsMock.readlink = mock.fn(async () => '/configs/my-config');
		const cmd = new CurrentCommand();
		const result = await cmd.run();
		assert.ok(result.text.includes('my-config'));
	});

	it('should return Message with "No active config" when no symlink', async () =>
	{
		const cmd = new CurrentCommand();
		const result = await cmd.run();
		assert.ok(result.text.includes('No active config'));
	});

	it('should return Message with "No active config" when symlink is broken', async () =>
	{
		fsMock.lstat = mock.fn(async () => { throw new Error('ENOENT'); });
		const cmd = new CurrentCommand();
		const result = await cmd.run();
		assert.ok(result.text.includes('No active config'));
	});
});
