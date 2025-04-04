import { $ } from "bun";

export const pwd = (await $`pwd`.text()).replaceAll("\n", "");

export function hasFlag(args: string[], flag: string): number;
export function hasFlag(args: string[], flag: string, returnIndex: true): number;
export function hasFlag(args: string[], flag: string, flag2: string): boolean;
export function hasFlag(args: string[], flag: string, flag2: string, returnIndex: true): number;
export function hasFlag(args: string[], flag: string, flag2?: string | boolean, returnIndex: boolean = false): boolean | number {
  if (typeof flag2 === "boolean") {
    returnIndex = flag2;
    flag2 = undefined;
  }
  if (returnIndex) {
    if (flag2) {
      return args.indexOf(flag) || args.indexOf(flag2);
    }
    return args.indexOf(flag)
  }
  if (flag2) {
    return args.includes(flag) || args.includes(flag2);
  }
  return args.includes(flag);
}
