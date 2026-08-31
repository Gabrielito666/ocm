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

describe('list', () =>
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

	it('should show empty message when no configs installed', async () =>
	{
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.trim() === '' || stdout.includes('no configs') || stdout.includes('no hay'));
	});

	it('should show config without asterisk when not active', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.includes('proof-config'));
		assert.ok(!stdout.includes('*'));
	});

	it('should show multiple configs without asterisk when none is active', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'other-config'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.includes('proof-config'));
		assert.ok(stdout.includes('other-config'));
		assert.ok(!stdout.includes('*'));
	});

	it('should show active config with asterisk and different color', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'other-config'], testEnv);
		await runOcm(['use', 'proof-config'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		assert.ok(stdout.includes('*'));
		assert.ok(stdout.includes('proof-config'));
	});

	it('should show asterisk on used config after use command', async () =>
	{
		await runOcm(['install', path.join(FIXTURES_DIR, 'proof-config')], testEnv);
		await runOcm(['install', path.join(FIXTURES_DIR, 'new-content'), '-n', 'other-config'], testEnv);
		await runOcm(['use', 'other-config'], testEnv);
		const { stdout } = await runOcm(['list'], testEnv);
		const lines = stdout.split('\n');
		const activeLine = lines.find(line => line.includes('*'));
		assert.ok(activeLine);
		assert.ok(activeLine.includes('other-config'));
	});
});
