#!/home/alex/.bun/bin/bun run

import { $ } from "bun";
import fs from "fs/promises";
import z from "zod";

const args = process.argv.slice(2);
const flags = args.filter((arg) => arg.startsWith("-"));
const background = hasFlag(flags, "-b", "--background");
const kill = hasFlag(flags, "-d", "--down") || hasFlag(flags, "-k", "--kill");
const config = hasFlag(flags, "-c", "--config");

const pwd = (await $`pwd`.text()).replaceAll("\n", "");

let configFile = pwd + "/.sm.json";
if (config) {
  const idx = flags.indexOf("-c");
  const file = flags[idx + 1];
  if (file.startsWith("/")) {
    configFile = file;
  } else if (file.startsWith(".")) {
    configFile = pwd + "/" + file;
  } 
}
if (!await fs.exists(configFile)) {
  console.error(`Config file ${configFile} does not exist`);
  process.exit(1);
}

const schema = z.object({
  sessionName: z.string(),
  sessions: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      commands: z.array(z.string()),
    })
  ),
});

const data = schema.parse(JSON.parse(await fs.readFile(configFile, "utf8")));

const sessionName = data.sessionName;

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

for (const [index, session] of data.sessions.entries()) {
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

function hasFlag(args: string[], flag: string, flag2?: string): boolean {
  if (flag2) {
    return args.includes(flag) || args.includes(flag2);
  }
  return args.includes(flag);
}
