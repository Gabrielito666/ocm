const { describe, it, afterEach, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const { runOcm } = require('./helpers/exec');
const { exists, isSymlink, getSymlinkTarget } = require('./helpers/fs');
const { cleanup } = require('./helpers/cleanup');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const getTestEnv = () => ({
	OCM_CONFIGS_DIR: `/tmp/ocm-test-configs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	OPENCODE_CONFIG_DIR: `/tmp/ocm-test-opencode-${Date.now()}-${Math.random().toString(36).slice(2)}`
});

let testEnv;

describe('use', () =>
{
	before(async () =>
	{
		testEnv = getTestEnv();
	});

	afterEach(async () =>
	{
		await cleanup(testEnv);
		testEnv = getTestEnv();
	});

	it('should create symlink when config exists', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		const symlinkPath = testEnv.OPENCODE_CONFIG_DIR;
		assert.strictEqual(await isSymlink(symlinkPath), true);
		const target = await getSymlinkTarget(symlinkPath);
		assert.strictEqual(target, path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config'));
	});

	it('should fail when config does not exist', async () =>
	{
		await assert.rejects(
			() => runOcm(['use', 'non-existent'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should replace existing symlink', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'other-config'], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		await runOcm(['use', 'other-config'], testEnv);
		const symlinkPath = testEnv.OPENCODE_CONFIG_DIR;
		assert.strictEqual(await isSymlink(symlinkPath), true);
		const target = await getSymlinkTarget(symlinkPath);
		assert.strictEqual(target, path.join(testEnv.OCM_CONFIGS_DIR, 'other-config'));
	});

	it('should create backup when OPENCODE_CONFIG_DIR is a real directory', async () =>
	{
		await fs.mkdir(testEnv.OPENCODE_CONFIG_DIR, { recursive: true });
		await fs.writeFile(path.join(testEnv.OPENCODE_CONFIG_DIR, 'test-file'), 'test');
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		const symlinkPath = testEnv.OPENCODE_CONFIG_DIR;
		assert.strictEqual(await isSymlink(symlinkPath), true);
		const backups = await fs.readdir(testEnv.OCM_CONFIGS_DIR);
		const backupDir = backups.find(name => name.startsWith('backup-'));
		assert.ok(backupDir, 'Backup directory should exist');
		const backupContent = await fs.readFile(
			path.join(testEnv.OCM_CONFIGS_DIR, backupDir, 'test-file'),
			'utf8'
		);
		assert.strictEqual(backupContent, 'test');
	});
});
