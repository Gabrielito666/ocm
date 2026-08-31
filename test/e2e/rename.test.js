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

describe('rename', () =>
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

	it('should rename config successfully', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['rename', 'proof-config', 'new-name'], testEnv);
		const oldPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		const newPath = path.join(testEnv.OCM_CONFIGS_DIR, 'new-name');
		assert.strictEqual(await exists(oldPath), false);
		assert.strictEqual(await exists(newPath), true);
	});

	it('should fail when renaming non-existent config', async () =>
	{
		await assert.rejects(
			() => runOcm(['rename', 'non-existent', 'new-name'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when new name already exists', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'existing-name'], testEnv);
		await assert.rejects(
			() => runOcm(['rename', 'proof-config', 'existing-name'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should update symlink when renaming active config', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		await runOcm(['rename', 'proof-config', 'new-name'], testEnv);
		const symlinkPath = testEnv.OPENCODE_CONFIG_DIR;
		assert.strictEqual(await isSymlink(symlinkPath), true);
		const target = await getSymlinkTarget(symlinkPath);
		assert.strictEqual(target, path.join(testEnv.OCM_CONFIGS_DIR, 'new-name'));
	});

	it('should show new name in list after rename', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['rename', 'proof-config', 'new-name'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.includes('new-name'));
		assert.ok(!stdout.includes('proof-config'));
	});
});
