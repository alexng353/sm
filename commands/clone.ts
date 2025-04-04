import { $ } from "bun";
import { getConfigFile } from "../config";
import {  hasFlag, pwd } from "../utils";

export default {
  command: "clone",
  description: `Clone the specified repos relative to this file.
Usage: sm clone [options]
Options:
  --ssh     use ssh (default)
  --https   use https
  `,
  handler: async (args: string[]) => {
    const config = await getConfigFile()
    const repos = config.repos;
    const useSSH = !hasFlag(args, "--https")
    
    if (repos.length === 0) {
      console.error("No repos to clone");
      process.exit(1);
    }

    console.log(`Cloning ${repos.length} repos relative to ${pwd} using ${useSSH ? "ssh" : "https"}`);

    for (const repo of repos) {
      const { path, repo: github_repo } = repo;
      const url = `${useSSH ? "git@github.com:" : "https://github.com/"}${github_repo}`;

      console.log(`Cloning into '${pwd}/${path}'...`);
      await $`git clone ${url} ${pwd}/${path}`.quiet().catch((err) => {
        process.stderr.write("\x1b[31m" + err.stderr.toString() + "\x1b[0m");
      });
    }
  }
}
