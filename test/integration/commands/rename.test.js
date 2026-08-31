const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const RenameCommand = require('../../../src/commands/rename');
const UseCommand = require('../../../src/commands/use');
const Command = require('lapiz-cli/command');

describe('rename integration', () =>
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

	it('should rename config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const renameCmd = new RenameCommand();
		const input = renameCmd.parseArgs(['proof-config', 'new-name']);
		const result = await renameCmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const oldDir = path.join(configsDir, 'proof-config');
		const newDir = path.join(configsDir, 'new-name');

		await assert.rejects(fs.stat(oldDir));
		const stat = await fs.stat(newDir);
		assert.ok(stat.isDirectory());
	});

	it('should update symlink when renaming active config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const useCmd = new UseCommand();
		await useCmd.run(useCmd.parseArgs(['proof-config']));

		const renameCmd = new RenameCommand();
		await renameCmd.run(renameCmd.parseArgs(['proof-config', 'new-name']));

		const target = await fs.readlink(opencodeDir);
		assert.ok(target.includes('new-name'));
	});
});
