var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/message/index.js
var require_message = __commonJS({
  "node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/message/index.js"(exports2, module2) {
    var RESET = "\x1B[0m";
    var BRIGHT_RED = "\x1B[91m";
    var BRIGHT_GREEN = "\x1B[92m";
    var BRIGHT_YELLOW = "\x1B[93m";
    var BRIGHT_BLUE = "\x1B[94m";
    var BOLD = "\x1B[1m";
    var Message = class {
      /**
       * @param {string} text
       */
      constructor(text) {
        this.text = text;
      }
      static template = "$text$";
      /**
       * @param {string} template
       * @returns {void}
       */
      static setTemplate(template) {
        this.template = template;
      }
      /**
       * @returns {void}
       */
      log() {
        console.log(
          /**@type {typeof Message}*/
          this.constructor.template.replace("$text$", this.text)
        );
      }
    };
    var Message_Success = class extends Message {
      static template = `${BOLD}${BRIGHT_GREEN}[Success]${RESET}: $text$`;
    };
    var Message_Error = class extends Message {
      static template = `${BOLD}${BRIGHT_RED}[Error]${RESET}: $text$`;
    };
    var Message_Warn = class extends Message {
      static template = `${BOLD}${BRIGHT_YELLOW}[Warning]${RESET}: $text$`;
    };
    var Message_Info = class extends Message {
      static template = `${BOLD}${BRIGHT_BLUE}[Info]${RESET}: $text$`;
    };
    Message.Success = Message_Success;
    Message.Error = Message_Error;
    Message.Warn = Message_Warn;
    Message.Info = Message_Info;
    module2.exports = Message;
  }
});

// node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/command/index.js
var require_command = __commonJS({
  "node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/command/index.js"(exports2, module2) {
    var Message = require_message();
    var Command = class {
      static Message = Message;
      /**
       * @param {string} name
       * @param {string} description
       * @param {string} example
       * @param {{ other_names?: string[] }} [options]
       */
      constructor(name, description, example, options) {
        this.name = name;
        this.description = description;
        this.example = example;
        this.options = {
          other_names: options?.other_names ? options.other_names : []
        };
      }
      /**
       * Method to get the input
       * @type {ICommand<I>["parseArgs"]}
       */
      parseArgs(rawArgs) {
        throw `[Lapiz-CLI ERROR]: Must implement Command "${this.name}" parseArgs method"`;
      }
      /**
       * @type {ICommand<I>["run"]}
       */
      run(input) {
        throw `[Lapiz-CLI ERROR]: Must implement Command "${this.name}" run method"`;
      }
    };
    module2.exports = Command;
  }
});

// node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/default-help-command/index.js
var require_default_help_command = __commonJS({
  "node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/default-help-command/index.js"(exports2, module2) {
    var Command = require_command();
    var Message = require_message();
    var centerString = (width, text) => text.padStart(Math.floor(text.length + (width - text.length) / 2)).padEnd(width);
    var DefaultHelpCommand = class extends Command {
      /**
       * @param {string} programName
       * @param {string} repoLink
       * @param {...ICommand<unknown>} commands
       */
      constructor(programName, repoLink, ...commands) {
        super("help", "I need somebody... helps you remember the commands", `${programName} help`);
        this.commands = commands;
        this.programName = programName;
        this.repoLink = repoLink;
      }
      /**@type {ICommand<void>["parseArgs"]}*/
      parseArgs(args) {
        if (args.length > 0) return new Command.Message.Error("This command does not require arguments");
        return void 0;
      }
      /**@type {ICommand<void>["run"]}*/
      run() {
        const title = "\n\u2554" + "\u2550".repeat(60) + "\u2557\n\u2551" + centerString(60, `\u{1F4DA} ${this.programName} COMMANDS`) + "\u2551\n\u255A" + "\u2550".repeat(60) + "\u255D\n";
        const body = this.commands.map((cmd) => {
          return "  \u250C\u2500  " + cmd.name + "\n  \u2502   " + cmd.description + "\n  \u2514\u2500  Example: " + cmd.example + "\n";
        }).join("\n");
        const repoTextBox = "\u2554" + "\u2550".repeat(80) + "\u2557\n\u2551" + centerString(80, `For more info visit: ${this.repoLink}`) + "\u2551\n\u255A" + "\u2550".repeat(80) + "\u255D\n";
        return new Message(`${title}
${body}
${repoTextBox}`);
      }
    };
    module2.exports = DefaultHelpCommand;
  }
});

// node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/program/index.js
var require_program = __commonJS({
  "node_modules/.pnpm/lapiz-cli@1.0.0/node_modules/lapiz-cli/lib/program/index.js"(exports2, module2) {
    var Message = require_message();
    var DefaultHelpCommand = require_default_help_command();
    var Program2 = class {
      /**
       * @param {string} programName
       * @param {string} repoLink
       * @param {...ICommand<unknown>} commands
       */
      constructor(programName, repoLink, ...commands) {
        if (!commands.some((c) => c.name === "help")) {
          commands.unshift(new DefaultHelpCommand(programName, repoLink, ...commands));
        }
        this.commandsMap = /* @__PURE__ */ new Map();
        for (const c of commands) {
          const posibleNames = [c.name, ...c.options.other_names];
          for (const name of posibleNames) {
            if (this.commandsMap.has(name)) {
              throw new Error(`[Lapiz-CLI Error]: There is more than one command with the name: \u201C${name}\u201D. Check your commands to see if you have a duplicate name or options.other_names.`);
            }
            this.commandsMap.set(name, c);
          }
        }
      }
      async run() {
        const command = this.commandsMap.get(process.argv[2]);
        if (!command) {
          new Message.Error("This is not a valid command. Please check out the documentation.").log();
          return;
        }
        const args = command.parseArgs(process.argv.slice(3));
        if (args instanceof Message) {
          args.log();
          return void 0;
        }
        const result = await command.run(args);
        if (result instanceof Message) return result.log();
        return void 0;
      }
    };
    module2.exports = Program2;
  }
});

// src/commands/install.js
var require_install = __commonJS({
  "src/commands/install.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var { execFile } = require("node:child_process");
    var { promisify } = require("node:util");
    var Command = require_command();
    var execFileAsync = promisify(execFile);
    var getOcmJsonName = async (dir) => {
      try {
        const content = await fs.readFile(path.join(dir, "ocm.json"), "utf8");
        const json = JSON.parse(content);
        return json.name;
      } catch {
        return null;
      }
    };
    var cloneRepo = async (url, dest, ref) => {
      await execFileAsync("git", ["clone", url, dest]);
      if (ref) {
        await execFileAsync("git", ["checkout", ref], { cwd: dest });
      }
    };
    var copyDir = async (src, dest) => {
      await fs.cp(src, dest, { recursive: true });
    };
    var parseSource = (source) => {
      const hashIndex = source.indexOf("#");
      if (hashIndex === -1) {
        return { url: source, ref: null };
      }
      return {
        url: source.slice(0, hashIndex),
        ref: source.slice(hashIndex + 1)
      };
    };
    var getRepoName = (url) => {
      const parts = url.split("/");
      const last = parts[parts.length - 1];
      return last.replace(/\.git$/, "");
    };
    var InstallCommand2 = class extends Command {
      constructor() {
        super(
          "install",
          "Install a config from repo or local path",
          "ocm install <source> [-n <name>]"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length === 0) {
          return new Command.Message.Error("Source is required");
        }
        const source = rawArgs[0];
        let name = null;
        const nameIdx = rawArgs.indexOf("-n");
        const nameIdxLong = rawArgs.indexOf("--name");
        const idx = nameIdx !== -1 ? nameIdx : nameIdxLong;
        if (idx !== -1 && rawArgs[idx + 1]) {
          name = rawArgs[idx + 1];
        }
        return { source, name: name || void 0 };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ source, name }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        await fs.mkdir(configsDir, { recursive: true });
        let resolvedName = name;
        const isRepo = source.startsWith("http://") || source.startsWith("https://") || source.includes("@");
        const { url, ref } = parseSource(source);
        if (!resolvedName) {
          if (isRepo) {
            const tmpDir = `/tmp/ocm-install-${Date.now()}`;
            await cloneRepo(url, tmpDir, ref);
            const jsonName = await getOcmJsonName(tmpDir);
            resolvedName = jsonName || getRepoName(url);
            const destDir = path.join(configsDir, resolvedName);
            await fs.mkdir(destDir, { recursive: true });
            await copyDir(tmpDir, destDir);
            await fs.rm(tmpDir, { recursive: true, force: true });
          } else {
            const jsonName = await getOcmJsonName(source);
            resolvedName = jsonName || path.basename(source);
            const destDir = path.join(configsDir, resolvedName);
            await copyDir(source, destDir);
          }
        } else {
          const destDir = path.join(configsDir, resolvedName);
          if (isRepo) {
            await cloneRepo(url, destDir, ref);
          } else {
            await copyDir(source, destDir);
          }
        }
        return new Command.Message.Success(`Installed ${resolvedName}`);
      }
    };
    module2.exports = InstallCommand2;
  }
});

// src/commands/update.js
var require_update = __commonJS({
  "src/commands/update.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var { execFile } = require("node:child_process");
    var { promisify } = require("node:util");
    var Command = require_command();
    var execFileAsync = promisify(execFile);
    var cloneRepo = async (url, dest, ref) => {
      await execFileAsync("git", ["clone", url, dest]);
      if (ref) {
        await execFileAsync("git", ["checkout", ref], { cwd: dest });
      }
    };
    var copyDir = async (src, dest) => {
      await fs.cp(src, dest, { recursive: true });
    };
    var parseSource = (source) => {
      const hashIndex = source.indexOf("#");
      if (hashIndex === -1) {
        return { url: source, ref: null };
      }
      return {
        url: source.slice(0, hashIndex),
        ref: source.slice(hashIndex + 1)
      };
    };
    var UpdateCommand2 = class extends Command {
      constructor() {
        super(
          "update",
          "Update an existing config from repo or local path",
          "ocm update <name> <source>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length < 2) {
          return new Command.Message.Error("Name and source are required");
        }
        return { name: rawArgs[0], source: rawArgs[1] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ name, source }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const configDir = path.join(configsDir, name);
        await fs.access(configDir);
        const isRepo = source.startsWith("http://") || source.startsWith("https://") || source.includes("@");
        const { url, ref } = parseSource(source);
        const tmpDir = `${configDir}-tmp-${Date.now()}`;
        if (isRepo) {
          await cloneRepo(url, tmpDir, ref);
        } else {
          await copyDir(source, tmpDir);
        }
        await fs.rm(configDir, { recursive: true, force: true });
        await fs.rename(tmpDir, configDir);
        return new Command.Message.Success(`Updated ${name}`);
      }
    };
    module2.exports = UpdateCommand2;
  }
});

// src/commands/rename.js
var require_rename = __commonJS({
  "src/commands/rename.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var RenameCommand2 = class extends Command {
      constructor() {
        super(
          "rename",
          "Rename an existing config",
          "ocm rename <current-name> <new-name>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length < 2) {
          return new Command.Message.Error("Current name and new name are required");
        }
        return { currentName: rawArgs[0], newName: rawArgs[1] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ currentName, newName }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const currentDir = path.join(configsDir, currentName);
        const newDir = path.join(configsDir, newName);
        await fs.access(currentDir);
        const newDirExists = await fs.access(newDir).then(() => true).catch(() => false);
        if (newDirExists) {
          return new Command.Message.Error(`Config ${newName} already exists`);
        }
        await fs.rename(currentDir, newDir);
        const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || "", ".config/opencode");
        const stat = await fs.lstat(opencodeDir).catch(() => null);
        if (stat && stat.isSymbolicLink()) {
          const target = await fs.readlink(opencodeDir);
          if (target === currentDir) {
            await fs.unlink(opencodeDir);
            await fs.symlink(newDir, opencodeDir);
          }
        }
        return new Command.Message.Success(`Renamed ${currentName} to ${newName}`);
      }
    };
    module2.exports = RenameCommand2;
  }
});

// src/commands/remove.js
var require_remove = __commonJS({
  "src/commands/remove.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var RemoveCommand2 = class extends Command {
      constructor() {
        super(
          "remove",
          "Remove an existing config",
          "ocm remove <name>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length === 0) {
          return new Command.Message.Error("Name is required");
        }
        return { name: rawArgs[0] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ name }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const configDir = path.join(configsDir, name);
        await fs.access(configDir);
        const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || "", ".config/opencode");
        const stat = await fs.lstat(opencodeDir).catch(() => null);
        if (stat && stat.isSymbolicLink()) {
          const target = await fs.readlink(opencodeDir);
          if (target === configDir) {
            return new Command.Message.Error(`Cannot remove active config. Use 'ocm use <other-config>' first`);
          }
        }
        await fs.rm(configDir, { recursive: true, force: true });
        return new Command.Message.Success(`Removed ${name}`);
      }
    };
    module2.exports = RemoveCommand2;
  }
});

// src/commands/list.js
var require_list = __commonJS({
  "src/commands/list.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var GREEN = "\x1B[92m";
    var RESET = "\x1B[0m";
    var ListCommand2 = class extends Command {
      constructor() {
        super(
          "list",
          "List all installed configs",
          "ocm list"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs() {
        return {};
      }
      /**@type {ICommand<I>["run"]}*/
      async run() {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || "", ".config/opencode");
        let activeConfig = null;
        const stat = await fs.lstat(opencodeDir).catch(() => null);
        if (stat && stat.isSymbolicLink()) {
          const target = await fs.readlink(opencodeDir);
          activeConfig = path.basename(target);
        }
        const configs = await fs.readdir(configsDir).catch(() => []);
        const filtered = configs.filter((name) => !name.startsWith("backup-"));
        if (filtered.length === 0) {
          return new Command.Message("No configs installed");
        }
        const lines = filtered.map((name) => {
          if (name === activeConfig) {
            return `${GREEN}* ${name}${RESET}`;
          }
          return `  ${name}`;
        });
        return new Command.Message(lines.join("\n"));
      }
    };
    module2.exports = ListCommand2;
  }
});

// src/commands/current.js
var require_current = __commonJS({
  "src/commands/current.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var CurrentCommand2 = class extends Command {
      constructor() {
        super(
          "current",
          "Show the currently active config",
          "ocm current"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs() {
        return {};
      }
      /**@type {ICommand<I>["run"]}*/
      async run() {
        const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || "", ".config/opencode");
        const stat = await fs.lstat(opencodeDir).catch(() => null);
        if (stat && stat.isSymbolicLink()) {
          const target = await fs.readlink(opencodeDir);
          const name = path.basename(target);
          return new Command.Message(name);
        }
        return new Command.Message("No active config");
      }
    };
    module2.exports = CurrentCommand2;
  }
});

// src/commands/use.js
var require_use = __commonJS({
  "src/commands/use.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var formatDate = (date) => {
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      const s = String(date.getSeconds()).padStart(2, "0");
      return `${y}-${mo}-${d}_${h}-${mi}-${s}`;
    };
    var UseCommand2 = class extends Command {
      constructor() {
        super(
          "use",
          "Set the active config",
          "ocm use <name>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length === 0) {
          return new Command.Message.Error("Name is required");
        }
        return { name: rawArgs[0] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ name }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const configDir = path.join(configsDir, name);
        const opencodeDir = process.env.OPENCODE_CONFIG_DIR || path.join(process.env.HOME || "", ".config/opencode");
        await fs.access(configDir);
        const stat = await fs.lstat(opencodeDir).catch(() => null);
        if (stat) {
          if (stat.isSymbolicLink()) {
            await fs.unlink(opencodeDir);
          } else if (stat.isDirectory()) {
            const backupName = `backup-${formatDate(/* @__PURE__ */ new Date())}`;
            const backupDir = path.join(configsDir, backupName);
            await fs.rename(opencodeDir, backupDir);
          }
        }
        await fs.symlink(configDir, opencodeDir);
        return new Command.Message.Success(`Now using ${name}`);
      }
    };
    module2.exports = UseCommand2;
  }
});

// src/commands/worklink.js
var require_worklink = __commonJS({
  "src/commands/worklink.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var WorklinkCommand2 = class extends Command {
      constructor() {
        super(
          "worklink",
          "Create a symlink to a config for editing",
          "ocm worklink <name> <output>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length < 2) {
          return new Command.Message.Error("Name and output path are required");
        }
        return { name: rawArgs[0], output: rawArgs[1] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ name, output }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const configDir = path.join(configsDir, name);
        await fs.access(configDir);
        await fs.access(path.dirname(output));
        const outputExists = await fs.access(output).then(() => true).catch(() => false);
        if (outputExists) {
          return new Command.Message.Error(`Output path already exists: ${output}`);
        }
        await fs.symlink(configDir, output);
        return new Command.Message.Success(`Created worklink at ${output}`);
      }
    };
    module2.exports = WorklinkCommand2;
  }
});

// src/commands/create-empty.js
var require_create_empty = __commonJS({
  "src/commands/create-empty.js"(exports2, module2) {
    var fs = require("node:fs/promises");
    var path = require("node:path");
    var Command = require_command();
    var CreateEmptyCommand2 = class extends Command {
      constructor() {
        super(
          "create-empty",
          "Create an empty config with template",
          "ocm create-empty <name>"
        );
      }
      /**@type {ICommand<I>["parseArgs"]}*/
      parseArgs(rawArgs) {
        if (rawArgs.length === 0) {
          return new Command.Message.Error("Name is required");
        }
        return { name: rawArgs[0] };
      }
      /**@type {ICommand<I>["run"]}*/
      async run({ name }) {
        const configsDir = process.env.OCM_CONFIGS_DIR || path.join(process.env.HOME || "", ".local/share/ocm");
        const configDir = path.join(configsDir, name);
        const configExists = await fs.access(configDir).then(() => true).catch(() => false);
        if (configExists) {
          return new Command.Message.Error(`Config ${name} already exists`);
        }
        await fs.mkdir(configDir, { recursive: true });
        await fs.writeFile(path.join(configDir, "AGENTS.md"), "");
        return new Command.Message.Success(`Created empty config ${name}`);
      }
    };
    module2.exports = CreateEmptyCommand2;
  }
});

// src/cli.js
var Program = require_program();
var InstallCommand = require_install();
var UpdateCommand = require_update();
var RenameCommand = require_rename();
var RemoveCommand = require_remove();
var ListCommand = require_list();
var CurrentCommand = require_current();
var UseCommand = require_use();
var WorklinkCommand = require_worklink();
var CreateEmptyCommand = require_create_empty();
var cli = new Program(
  "ocm",
  "https://github.com/Gabrielito666/ocm",
  new InstallCommand(),
  new UpdateCommand(),
  new RenameCommand(),
  new RemoveCommand(),
  new ListCommand(),
  new CurrentCommand(),
  new UseCommand(),
  new WorklinkCommand(),
  new CreateEmptyCommand()
);
cli.run();
