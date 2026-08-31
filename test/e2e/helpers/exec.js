const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const runOcm = (args, env = {}) =>
{
	return execFileAsync('ocm', args, {
		env: { ...process.env, ...env }
	});
};

module.exports = { runOcm };
