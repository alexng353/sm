import fs from "fs/promises";
import { z } from "zod";
import { hasFlag, pwd } from "./utils";

const configSchema = z.object({
  sessionName: z.string(),
  sessions: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      commands: z.array(z.string()),
    })
  ),
  repos: z.array(
    z.object({
      /** 
       * The path to the repo relative to the config file
       */
      path: z.string().refine(
        (path) => !path.startsWith("/") && !path.startsWith("~"),
        "path must be relative to the config file"
      ),
      /** 
       * The github repo in the form "username/repository"
       * with only URL-safe characters. Ends with ".git".
       */
      repo: z.string().regex(
        /^[\w.-]+\/[\w.-]+$/,
        'github_repo must be in the form "username/repository" with only URL-safe characters'
      ).transform(str => str.endsWith(".git") ? str : str + ".git")
    })
  ),
});
export const defaultConfig: z.infer<typeof configSchema> = {
  sessionName: "default",
  sessions: [],
  repos: [],
};

const args = process.argv;

export async function getConfigFile() {
  let configFilePath = pwd + "/.sm.json";
  {
    const idx = hasFlag(args, "-c", "--config", true);
    if (idx !== -1) {
      const file = args[idx + 1];

      if (file.startsWith("/") || file.startsWith("~")) {
        configFilePath = file;
      } else {
        configFilePath = pwd + "/" + file;
      }
    }
  }
  if (!await fs.exists(configFilePath)) {
    console.error(`Config file ${configFilePath} does not exist. To create a config file, run "sm init"`);
    process.exit(1);
  }

  const file = await fs.readFile(configFilePath, "utf8");
  return configSchema.parse(JSON.parse(file));
}
