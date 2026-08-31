const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const ListCommand = require('../../../src/commands/list');
const UseCommand = require('../../../src/commands/use');
const Command = require('lapiz-cli/command');

describe('list integration', () =>
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

	it('should list installed configs', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const listCmd = new ListCommand();
		const result = await listCmd.run(listCmd.parseArgs());

		assert.ok(result instanceof Command.Message);
		assert.ok(result.text.includes('proof-config'));
	});

	it('should mark active config with asterisk', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const useCmd = new UseCommand();
		await useCmd.run(useCmd.parseArgs(['proof-config']));

		const listCmd = new ListCommand();
		const result = await listCmd.run(listCmd.parseArgs());

		assert.ok(result.text.includes('*'));
		assert.ok(result.text.includes('proof-config'));
	});

	it('should show message when no configs', async () =>
	{
		const listCmd = new ListCommand();
		const result = await listCmd.run(listCmd.parseArgs());

		assert.ok(result.text.toLowerCase().includes('no configs'));
	});
});
