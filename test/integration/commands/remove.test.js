const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const RemoveCommand = require('../../../src/commands/remove');
const Command = require('lapiz-cli/command');

describe('remove integration', () =>
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

	it('should remove config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const removeCmd = new RemoveCommand();
		const input = removeCmd.parseArgs(['proof-config']);
		const result = await removeCmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const removedDir = path.join(configsDir, 'proof-config');
		await assert.rejects(fs.stat(removedDir));
	});

	it('should not remove active config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const useCmd = require('../../../src/commands/use');
		const useCmdInstance = new useCmd();
		await useCmdInstance.run(useCmdInstance.parseArgs(['proof-config']));

		const removeCmd = new RemoveCommand();
		const result = await removeCmd.run(removeCmd.parseArgs(['proof-config']));

		assert.ok(result instanceof Command.Message.Error);
		const configDir = path.join(configsDir, 'proof-config');
		const stat = await fs.stat(configDir);
		assert.ok(stat.isDirectory());
	});
});
