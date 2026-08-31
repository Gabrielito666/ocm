const { describe, it, afterEach, before } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { runOcm } = require('./helpers/exec');
const { exists } = require('./helpers/fs');
const { cleanup } = require('./helpers/cleanup');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const getTestEnv = () => ({
	OCM_CONFIGS_DIR: `/tmp/ocm-test-configs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	OPENCODE_CONFIG_DIR: `/tmp/ocm-test-opencode-${Date.now()}-${Math.random().toString(36).slice(2)}`
});

let testEnv;

describe('remove', () =>
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

	it('should remove existing config', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['remove', 'proof-config'], testEnv);
		const configPath = path.join(testEnv.OCM_CONFIGS_DIR, 'proof-config');
		assert.strictEqual(await exists(configPath), false);
	});

	it('should fail when removing non-existent config', async () =>
	{
		await assert.rejects(
			() => runOcm(['remove', 'non-existent'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should fail when removing active config', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		await assert.rejects(
			() => runOcm(['remove', 'proof-config'], testEnv),
			(err) => err.code !== 0 || err.stderr.length > 0
		);
	});

	it('should not show removed config in list', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['remove', 'proof-config'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(!stdout.includes('proof-config'));
	});
});
