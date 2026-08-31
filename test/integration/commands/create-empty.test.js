const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const CreateEmptyCommand = require('../../../src/commands/create-empty');
const Command = require('lapiz-cli/command');

describe('create-empty integration', () =>
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

	it('should create empty config', async () =>
	{
		const cmd = new CreateEmptyCommand();
		const input = cmd.parseArgs(['my-empty-config']);
		const result = await cmd.run(input);

		assert.ok(result instanceof Command.Message.Success);
		const configDir = path.join(configsDir, 'my-empty-config');
		const stat = await fs.stat(configDir);
		assert.ok(stat.isDirectory());
	});

	it('should create AGENTS.md file', async () =>
	{
		const cmd = new CreateEmptyCommand();
		await cmd.run(cmd.parseArgs(['my-empty-config']));

		const agentsPath = path.join(configsDir, 'my-empty-config', 'AGENTS.md');
		const stat = await fs.stat(agentsPath);
		assert.ok(stat.isFile());
	});

	it('should fail when config already exists', async () =>
	{
		const cmd = new CreateEmptyCommand();
		await cmd.run(cmd.parseArgs(['my-empty-config']));

		const result = await cmd.run(cmd.parseArgs(['my-empty-config']));
		assert.ok(result instanceof Command.Message.Error);
	});
});
