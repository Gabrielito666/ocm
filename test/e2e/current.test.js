const { describe, it, afterEach, before } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { runOcm } = require('./helpers/exec');
const { cleanup } = require('./helpers/cleanup');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const getTestEnv = () => ({
	OCM_CONFIGS_DIR: `/tmp/ocm-test-configs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	OPENCODE_CONFIG_DIR: `/tmp/ocm-test-opencode-${Date.now()}-${Math.random().toString(36).slice(2)}`
});

let testEnv;

describe('current', () =>
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

	it('should show config name when symlink exists', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		const { stdout } = await runOcm(['current'], testEnv);
		assert.ok(stdout.includes('proof-config'));
	});

	it('should show message when no symlink exists', async () =>
	{
		const { stdout } = await runOcm(['current'], testEnv);
		assert.ok(
			stdout.includes('no') ||
			stdout.includes('none') ||
			stdout.includes('not set') ||
			stdout.trim() === ''
		);
	});

	it('should show new config after use command', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'other-config'], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		await runOcm(['use', 'other-config'], testEnv);
		const { stdout } = await runOcm(['current'], testEnv);
		assert.ok(stdout.includes('other-config'));
		assert.ok(!stdout.includes('proof-config'));
	});
});
