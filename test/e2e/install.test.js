const { describe, it, afterEach, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { runOcm } = require('./helpers/exec');
const { exists } = require('./helpers/fs');
const { cleanup } = require('./helpers/cleanup');

const execFileAsync = promisify(execFile);

const REPO_URL = 'https://github.com/octocat/Hello-World';
const REPO_NAME = 'Hello-World';
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const getTestEnv = () => ({
	OCM_CONFIGS_DIR: `/tmp/ocm-test-configs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	OPENCODE_CONFIG_DIR: `/tmp/ocm-test-opencode-${Date.now()}-${Math.random().toString(36).slice(2)}`
});

const createGitRepo = async (dir, files = {}) =>
{
	await fs.mkdir(dir, { recursive: true });
	for (const [name, content] of Object.entries(files))
	{
		await fs.writeFile(path.join(dir, name), content);
	}
	await execFileAsync('git', ['init'], { cwd: dir });
	await execFileAsync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
	await execFileAsync('git', ['config', 'user.name', 'Test'], { cwd: dir });
	await execFileAsync('git', ['add', '.'], { cwd: dir });
	await execFileAsync('git', ['commit', '-m', 'initial'], { cwd: dir });
};

const createGitRepoWithTag = async (dir, tag, files = {}) =>
{
	await createGitRepo(dir, files);
	await execFileAsync('git', ['tag', tag], { cwd: dir });
};

let testEnv;

describe('install', () =>
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

	it('should install repo to default name', async () =>
	{
		await runOcm(['install', REPO_URL], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, REPO_NAME);
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install repo at specific commit/tag to default name', async () =>
	{
		await runOcm(['install', `${REPO_URL}#master`], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, REPO_NAME);
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install local path to default name', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install local path with -n flag', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config'), '-n', 'mi-configuracion'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'mi-configuracion');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install repo with -n flag', async () =>
	{
		await runOcm(['install', REPO_URL, '-n', 'mi-configuracion'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'mi-configuracion');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should fail when installing local path that already exists', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await assert.rejects(
			() => runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when installing repo that already exists', async () =>
	{
		await runOcm(['install', REPO_URL], testEnv);
		await assert.rejects(
			() => runOcm(['install', REPO_URL], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should install local path using name from ocm.json', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-name-config')], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'with-name');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install local path with -n overriding ocm.json', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-name-config'), '-n', 'mi-configuracion'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'mi-configuracion');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should install repo using name from ocm.json', async () =>
	{
		const tmpRepo = `/tmp/ocm-test-repo-with-name-${Date.now()}`;
		try
		{
			await createGitRepo(tmpRepo, {
				'ocm.json': '{"name": "with-name"}',
				'AGENTS.md': '# Test'
			});
			await runOcm(['install', tmpRepo], testEnv);
			const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'with-name');
			assert.strictEqual(await exists(configPath), true);
		}
		finally
		{
			await fs.rm(tmpRepo, { recursive: true, force: true });
		}
	});

	it('should install repo with -n overriding ocm.json', async () =>
	{
		const tmpRepo = `/tmp/ocm-test-repo-with-name2-${Date.now()}`;
		try
		{
			await createGitRepo(tmpRepo, {
				'ocm.json': '{"name": "with-name"}',
				'AGENTS.md': '# Test'
			});
			await runOcm(['install', tmpRepo, '-n', 'mi-configuracion'], testEnv);
			const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'mi-configuracion');
			assert.strictEqual(await exists(configPath), true);
		}
		finally
		{
			await fs.rm(tmpRepo, { recursive: true, force: true });
		}
	});

	it('should install repo at specific commit/tag with -n flag', async () =>
	{
		await runOcm(['install', `${REPO_URL}#master`, '-n', 'mi-configuracion'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'mi-configuracion');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should fail when installing repo at specific commit/tag that already exists', async () =>
	{
		await runOcm(['install', `${REPO_URL}#master`], testEnv);
		await assert.rejects(
			() => runOcm(['install', `${REPO_URL}#master`], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});
});
