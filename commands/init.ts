import fs from "fs/promises";
import { defaultConfig } from "../config";
import { hasFlag, pwd } from "../utils";

export default {
  command: "init",
  description: `Initialize a new session at ./.sm.json
Usage: sm init [options]
Options:
  -n, --name <name>  Name of the session`,
  handler: async (args: string[]) => {
    if (await fs.exists(pwd + "/.sm.json")) {
      console.error("A config already exists at .sm.json. Please remove it first.");
      process.exit(1);
    }

    const configToWrite = defaultConfig;
    let nameFlagIdx = hasFlag(args, "-n", "--name", true);
    if (nameFlagIdx !== -1) {
      const name = args[nameFlagIdx + 1];
      if (!name) {
        console.error("You can't specify a name and not give one.\nUsage: sm init -n <name>");
        process.exit(1);
      }
      configToWrite.sessionName = name;
    }
    await fs.writeFile(pwd + "/.sm.json", JSON.stringify(configToWrite, null, 2) + "\n");
  }
}
