const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const Command = require('lapiz-cli/command');

describe('install integration', () =>
{
	let tmpDir;
	let configsDir;
	let opencodeDir;
	let originalConfigsDir;
	let originalOpencodeDir;

	beforeEach(async () =>
	{
		originalConfigsDir = process.env.OCM_CONFIGS_DIR;
		originalOpencodeDir = process.env.OPENCODE_CONFIG_DIR;
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocm-test-'));
		configsDir = path.join(tmpDir, 'configs');
		opencodeDir = path.join(tmpDir, 'opencode');
		process.env.OCM_CONFIGS_DIR = configsDir;
		process.env.OPENCODE_CONFIG_DIR = opencodeDir;
	});

	afterEach(async () =>
	{
		process.env.OCM_CONFIGS_DIR = originalConfigsDir;
		process.env.OPENCODE_CONFIG_DIR = originalOpencodeDir;
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	it('should install local directory', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const cmd = new InstallCommand();
		const input = cmd.parseArgs([fixtureDir]);
		const result = await cmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const installedDir = path.join(configsDir, 'proof-config');
		const stat = await fs.stat(installedDir);
		assert.ok(stat.isDirectory());
	});

	it('should install local directory with custom name', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const cmd = new InstallCommand();
		const input = cmd.parseArgs([fixtureDir, '-n', 'custom-name']);
		const result = await cmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const installedDir = path.join(configsDir, 'custom-name');
		const stat = await fs.stat(installedDir);
		assert.ok(stat.isDirectory());
	});

	it('should install local directory with name from ocm.json', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-name-config');
		const cmd = new InstallCommand();
		const input = cmd.parseArgs([fixtureDir]);
		const result = await cmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const installedDir = path.join(configsDir, 'with-name');
		const stat = await fs.stat(installedDir);
		assert.ok(stat.isDirectory());
	});

	it('should create configs directory if not exists', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const cmd = new InstallCommand();
		const input = cmd.parseArgs([fixtureDir]);
		await cmd.run(input);

		const stat = await fs.stat(configsDir);
		assert.ok(stat.isDirectory());
	});
});
