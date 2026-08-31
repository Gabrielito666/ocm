const fs = require('node:fs/promises');

const exists = async (p) =>
{
	try
	{
		await fs.access(p);
		return true;
	}
	catch
	{
		return false;
	}
};

const isSymlink = async (p) =>
{
	try
	{
		const stat = await fs.lstat(p);
		return stat.isSymbolicLink();
	}
	catch
	{
		return false;
	}
};

const getSymlinkTarget = async (p) =>
{
	return fs.readlink(p);
};

const listDir = async (p) =>
{
	try
	{
		return await fs.readdir(p);
	}
	catch
	{
		return [];
	}
};

module.exports = { exists, isSymlink, getSymlinkTarget, listDir };
