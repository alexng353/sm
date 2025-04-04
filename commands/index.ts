import fs from "fs/promises";

const commandFiles = (await fs.readdir(__dirname)).filter((file) => file.endsWith(".ts")).filter((file) => file !== "index.ts");

const commands: { command: string; description: string; handler: (args: string[]) => Promise<void> }[] = [];

for (const file of commandFiles) {
  const { command, description, handler } = (await import(`./${file}`)).default;
  commands.push({ command, description, handler });
}

export default commands;
