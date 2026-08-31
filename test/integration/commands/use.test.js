const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const InstallCommand = require('../../../src/commands/install');
const UseCommand = require('../../../src/commands/use');
const Command = require('lapiz-cli/command');

describe('use integration', () =>
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

	it('should set active config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const useCmd = new UseCommand();
		const input = useCmd.parseArgs(['proof-config']);
		const result = await useCmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const target = await fs.readlink(opencodeDir);
		assert.ok(target.includes('proof-config'));
	});

	it('should change active config', async () =>
	{
		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));
		await installCmd.run(installCmd.parseArgs([fixtureDir, '-n', 'other-config']));

		const useCmd = new UseCommand();
		await useCmd.run(useCmd.parseArgs(['proof-config']));
		await useCmd.run(useCmd.parseArgs(['other-config']));

		const target = await fs.readlink(opencodeDir);
		assert.ok(target.includes('other-config'));
	});

	it('should backup existing directory', async () =>
	{
		await fs.mkdir(opencodeDir, { recursive: true });
		await fs.writeFile(path.join(opencodeDir, 'test-file'), 'test');

		const fixtureDir = path.join(__dirname, '../../e2e/fixtures/proof-config');
		const installCmd = new InstallCommand();
		await installCmd.run(installCmd.parseArgs([fixtureDir]));

		const useCmd = new UseCommand();
		await useCmd.run(useCmd.parseArgs(['proof-config']));

		const target = await fs.readlink(opencodeDir);
		assert.ok(target.includes('proof-config'));

		const backups = await fs.readdir(configsDir);
		const backupDir = backups.find(name => name.startsWith('backup-'));
		assert.ok(backupDir);

		const backupContent = await fs.readFile(path.join(configsDir, backupDir, 'test-file'), 'utf8');
		assert.strictEqual(backupContent, 'test');
	});
});
