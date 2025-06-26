import { $ } from "bun";
import commands from "./commands";
import { hasFlag } from "./utils";
import { getConfigFile } from "./config";

const args = process.argv.slice(2);
const flags = args.filter((arg) => arg.startsWith("-"));

const isHelp = hasFlag(flags, "-h", "--help");

const command = args[0];
if (command && !command.startsWith("-")) {
  const commandObj = commands.find((c) => c.command === command);
  if (!commandObj) {
    console.error(`Command ${command} not found`);
    process.exit(1);
  }
  if (isHelp) {
    console.log(commandObj.description);
    process.exit(0);
  }
  await commandObj.handler(process.argv.slice(3));
  process.exit(0);
}

if (isHelp) {
  console.log(`
sm - Simple tmux Manager

Usage: sm [command] [options]

Options:
  -h, --help           Show this help
  -b, --background     Run in background
  -d, --down
  -k, --kill           Kill the session
`.trim());

  console.log("\nCommands:");
  for (const [idx, command] of commands.entries()) {
    const descriptionLines = command.description.split("\n");
    const formattedDescription = descriptionLines
      .map((line, idx) => (idx === 0 ? line : "    " + line))
      .join("\n");
    console.log(`  ${command.command} - ${formattedDescription}`);
    if (idx !== commands.length - 1) {
      console.log();
    }
  }
  process.exit(0);
}

const background = hasFlag(flags, "-b", "--background");
const kill = hasFlag(flags, "-d", "--down") || hasFlag(flags, "-k", "--kill");

const config = await getConfigFile();

const sessionName = config.sessionName;

if (kill) {
  await $`tmux kill-session -t ${sessionName}`;
  process.exit(0);
}

const out = await $`tmux new-session -d -s ${sessionName}`.nothrow().quiet();
if (out.exitCode !== 0) {
  if (out.stderr.toString().includes("duplicate session")) {
    await $`tmux attach -t ${sessionName}`;
    process.exit(0);
  }
  throw out;
}

for (const [index, session] of config.sessions.entries()) {
  if (index === 0) {
    await $`tmux rename-window -t ${sessionName}:${index} ${session.name}`;
    await $`tmux send-keys -t ${sessionName} "cd ${session.path}" C-m`;
  } else {
    await $`tmux new-window -t ${sessionName}:${index} -c ${session.path} -n ${session.name}`;
  }
  for (const command of session.commands) {
    await $`tmux send-keys -t ${sessionName}:${index} "${command}" C-m`;
  }
}

if (!background) {
  await $`tmux attach -t ${sessionName}`;
}

