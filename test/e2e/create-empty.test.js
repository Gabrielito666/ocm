const { describe, it, afterEach, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const { runOcm } = require('./helpers/exec');
const { exists } = require('./helpers/fs');
const { cleanup } = require('./helpers/cleanup');

const getTestEnv = () => ({
	OCM_CONFIGS_DIR: `/tmp/ocm-test-configs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	OPENCODE_CONFIG_DIR: `/tmp/ocm-test-opencode-${Date.now()}-${Math.random().toString(36).slice(2)}`
});

let testEnv;

describe('create-empty', () =>
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

	it('should create empty config with template', async () =>
	{
		await runOcm(['create-empty', 'my-empty-config'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'my-empty-config');
		assert.strictEqual(await exists(configPath), true);
	});

	it('should fail when config name already exists', async () =>
	{
		await runOcm(['create-empty', 'my-empty-config'], testEnv);
		await assert.rejects(
			() => runOcm(['create-empty', 'my-empty-config'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should create AGENTS.md in the template', async () =>
	{
		await runOcm(['create-empty', 'my-empty-config'], testEnv);
		const agentsPath = path.join(testEnv.OCM_CONFIGS_DIR, 'my-empty-config', 'AGENTS.md');
		assert.strictEqual(await exists(agentsPath), true);
	});

	it('should show created config in list', async () =>
	{
		await runOcm(['create-empty', 'my-empty-config'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.includes('my-empty-config'));
	});
});
