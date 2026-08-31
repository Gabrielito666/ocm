const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const WorklinkCommand = require('../../../src/commands/worklink');
const Command = require('lapiz-cli/command');

describe('worklink integration', () =>
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

	it('should create worklink', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const worklinkPath = path.join(tmpDir, 'my-link');
		const worklinkCmd = new WorklinkCommand();
		const input = worklinkCmd.parseArgs(['proof-config', worklinkPath]);
		const result = await worklinkCmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const target = await fs.readlink(worklinkPath);
		assert.ok(target.includes('proof-config'));
	});

	it('should not affect original config when worklink is deleted', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const worklinkPath = path.join(tmpDir, 'my-link');
		const worklinkCmd = new WorklinkCommand();
		await worklinkCmd.run(worklinkCmd.parseArgs(['proof-config', worklinkPath]));

		await fs.unlink(worklinkPath);

		const configDir = path.join(configsDir, 'proof-config');
		const stat = await fs.stat(configDir);
		assert.ok(stat.isDirectory());
	});
});
