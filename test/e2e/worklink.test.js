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
let tempWorklinkDir;

describe('worklink', () =>
{
	before(async () =>
	{
		testEnv = getTestEnv();
		tempWorklinkDir = `/tmp/ocm-test-worklink-${Date.now()}`;
	});

	afterEach(async () =>
	{
		await cleanup(testEnv);
		await fs.rm(tempWorklinkDir, { recursive: true, force: true });
		testEnv = getTestEnv();
	});

	it('should create symlink when config exists', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await fs.mkdir(tempWorklinkDir, { recursive: true });
		const outputPath = path.join(tempWorklinkDir, 'my-link');
		await runOcm(['worklink', 'proof-config', outputPath], testEnv);
		assert.strictEqual(await isSymlink(outputPath), true);
		const target = await getSymlinkTarget(outputPath);
		assert.strictEqual(target, path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config'));
	});

	it('should fail when config does not exist', async () =>
	{
		await fs.mkdir(tempWorklinkDir, { recursive: true });
		const outputPath = path.join(tempWorklinkDir, 'my-link');
		await assert.rejects(
			() => runOcm(['worklink', 'non-existent', outputPath], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when output path is an existing directory', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await fs.mkdir(tempWorklinkDir, { recursive: true });
		const existingDir = path.join(tempWorklinkDir, 'existing-dir');
		await fs.mkdir(existingDir);
		await assert.rejects(
			() => runOcm(['worklink', 'proof-config', existingDir], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when output path is an existing symlink', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await fs.mkdir(tempWorklinkDir, { recursive: true });
		const existingLink = path.join(tempWorklinkDir, 'existing-link');
		await fs.symlink('/tmp', existingLink);
		await assert.rejects(
			() => runOcm(['worklink', 'proof-config', existingLink], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when parent directory does not exist', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		const outputPath = '/non/existent/parent/link';
		await assert.rejects(
			() => runOcm(['worklink', 'proof-config', outputPath], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should not affect original config when symlink is deleted', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await fs.mkdir(tempWorklinkDir, { recursive: true });
		const outputPath = path.join(tempWorklinkDir, 'my-link');
		await runOcm(['worklink', 'proof-config', outputPath], testEnv);
		await fs.unlink(outputPath);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		assert.strictEqual(await exists(configPath), true);
	});
});
