# sm

A simple bin to create a tmux session

## Installation

```bash
cd ~/.programs # or anywhere else you want
git clone https://github.com/alexng353/sm.git && cd sm
bun install # requires zod and bun
chmod +x sm.sh

cd "place in your path"
ln -s ~/.programs/sm/sm.sh sm # note: you can call it whatever you want

# restart your terminal
exec $SHELL
```

## Configuration

sm relies on a config file located at `YOUR_PROJECT/.sm.json`. Here's my config:

```jsonc
{
  "sessionName": "my-session",
  "sessions": [
    {
      "name": "api server",
      "path": "~/code/project-name/api", // must be a full path or ~/path. If relative, things don't work.
      "commands": [
        "bun db:start",
        "bun db:m",
        "bun watch"
      ]
    },
    // ...
  ]
}
```

I recommend using a similar structure to this:

```jsonc
[
    "api server",
    "api ide", // probably only useful if you're using neovim or another terminal based editor
    "web server",
    "web ide",
    "shell", // or something else
    // ...
]
```

## Usage

```bash
sm <flags> [options]
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
