const fs = require('node:fs/promises');

const cleanup = async (env) =>
{
	await fs.rm(env.OCM_CONFIGS_DIR, { recursive: true, force: true });
	await fs.rm(env.OPENCODE_CONFIG_DIR, { recursive: true, force: true });
};

module.exports = { cleanup };
