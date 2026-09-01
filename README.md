# OCM - OpenCode Manager

Configuration manager for OpenCode, inspired by nvm. Uses symbolic links to switch between different OpenCode configurations.

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/Gabrielito666/ocm/main/install.sh | bash
```

## How it works

OCM manages multiple OpenCode configurations stored in `~/.local/share/ocm/`. The active configuration is controlled via a symbolic link at `~/.config/opencode`. When you switch configurations with `ocm use`, OCM simply updates this symlink to point to the desired configuration.

## Commands

### install
Install a configuration from a Git repository or local path.
```bash
ocm install <source> [-n <name>]
```
- `source`: Git URL (with optional `#tag`) or local path
- `-n, --name`: Custom name for the configuration (optional)
- If the source contains an `ocm.json` with a `name` field, it will be used as default

### update
Update an existing configuration from a new source.
```bash
ocm update <name> <source>
```
- `name`: Name of the configuration to update
- `source`: New Git URL or local path
- The configuration name is preserved even if the new source has a different name

### rename
Rename an existing configuration.
```bash
ocm rename <current-name> <new-name>
```
- If the renamed configuration is currently active, the symlink is automatically updated

### remove
Remove an installed configuration.
```bash
ocm remove <name>
```
- Cannot remove the currently active configuration

### list
List all installed configurations.
```bash
ocm list
```
- The active configuration is marked with `*` and highlighted

### current
Show the currently active configuration.
```bash
ocm current
```

### use
Switch to a different configuration.
```bash
ocm use <name>
```
- Creates a symbolic link from `~/.config/opencode` to the selected configuration
- If `~/.config/opencode` is a real directory (not a symlink), it's backed up to `~/.local/share/ocm/backup-<timestamp>`

### worklink
Create a symbolic link to a configuration for editing purposes.
```bash
ocm worklink <name> <output-path>
```
- Useful for editing configurations without navigating to `~/.local/share/ocm/`
- Deleting the worklink doesn't affect the original configuration

### create-empty
Create a new empty configuration with a basic template.
```bash
ocm create-empty <name>
```
- Creates a configuration with an empty `AGENTS.md` file

## Contributing

Currently, OCM only supports Debian-based distributions. We welcome contributions to add support for:
- Arch Linux (PKGBUILD)
- Fedora/RHEL (RPM)
- macOS (Homebrew)
- Other distributions

If you're interested in helping, please open an issue or submit a pull request!

## License

ISC
