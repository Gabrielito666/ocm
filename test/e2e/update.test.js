const { describe, it, afterEach, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { runOcm } = require('./helpers/exec');
const { exists, isSymlink, getSymlinkTarget } = require('./helpers/fs');
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

describe('update', () =>
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

	it('should update config with local path', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['update', 'proof-config', path.join(FIXTURES_DIR, 'new-content')], testEnv);
		const agentsPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config', 'AGENTS.md');
		const content = await fs.readFile(agentsPath, 'utf8');
		assert.strictEqual(content.trim(), '# New Content');
	});

	it('should update config with repo URL', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['update', 'proof-config', REPO_URL], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should update config with repo URL at specific commit/tag', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['update', 'proof-config', `${REPO_URL}#master`], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should fail when updating non-existent config', async () =>
	{
		await assert.rejects(
			() => runOcm(['update', 'non-existent', path.join(FIXTURES_DIR, 'proof-config')], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should preserve folder name when updating with source that has ocm.json', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['update', 'proof-config', path.join(FIXTURES_DIR, 'proof-name-config')], testEnv);
		const originalPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		const newPath = path.join(testEnv.OCM_CONFIGS_DIR, 'with-name');
		assert.strictEqual(await exists(originalPath), true);
		assert.strictEqual(await exists(newPath), false);
	});

	it('should fail when updating with non-existent path', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await assert.rejects(
			() => runOcm(['update', 'proof-config', '/non/existent/path'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when updating with non-existent repo', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await assert.rejects(
			() => runOcm(['update', 'proof-config', 'https://github.com/non/existent-repo-404'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should maintain symlink when updating active config', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		await runOcm(['update', 'proof-config', path.join(FIXTURES_DIR, 'new-content')], testEnv);
		const symlinkPath = testEnv.OPENCODE_CONFIG_DIR;
		assert.strictEqual(await isSymlink(symlinkPath), true);
		const target = await getSymlinkTarget(symlinkPath);
		assert.strictEqual(target, path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config'));
	});
});
