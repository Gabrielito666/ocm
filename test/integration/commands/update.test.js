const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const UpdateCommand = require('../../../src/commands/update');
const Command = require('lapiz-cli/command');

describe('update integration', () =>
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

	it('should update config with local directory', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const newContentDir = path.join(__dirname, '../../e2e/fixtures/new-content');

		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const updateCmd = new UpdateCommand();
		const input = updateCmd.parseArgs(['proof-config', newContentDir]);
		const result = await updateCmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const updatedDir = path.join(configsDir, 'proof-config');
		const agentsContent = await fs.readFile(path.join(updatedDir, 'AGENTS.md'), 'utf8');
		assert.ok(agentsContent.includes('New Content'));
	});

	it('should preserve config name after update', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const nameConfigDir = path.join(__dirname, '../../e2e/fixtures/proof-name-config');

		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const updateCmd = new UpdateCommand();
		await updateCmd.run(updateCmd.parseArgs(['proof-config', nameConfigDir]));

		const originalDir = path.join(configsDir, 'proof-config');
		const stat = await fs.stat(originalDir);
		assert.ok(stat.isDirectory());
	});
});
