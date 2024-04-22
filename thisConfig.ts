import type { Config } from '../Utils/Config';
import { getConfig } from '../Utils/Config';

if (Bun.argv[2]) {
   // if args0 = -h or ?, show help then exit
   if (Bun.argv[2] === '-h' || Bun.argv[2] === '?') {
      console.log(`
   Simple Server Help --
   
   Usage:

   commandline args:

   arg[0]:
   -h or ? = this help
   if number = port number to use
   if string = folder to be served

   arg[1]:
   if arg[0] = folder then arg[1] (number) = port number to use
   if arg[0] = port number then arg[1] = (string) folder to be served

   This command uses/mutates the 'simple' entry in ./.vscode/dev.json
   dev.json:
   BuildTarget: "",
   Port: 80
   `);
   };
};

/**
 * required Cfg
 */
const requiredCfg = {
   "DEV": true,
   "Port": 80,
   "Serve": "/dist"
} satisfies Config;

// gets an existing config, or builds one
const cfg = await getConfig('simple', Bun.argv.slice(2), requiredCfg);
export const DEV = cfg.DEV || false;
export const folder = cfg.Serve || "";
export const port = cfg.Port || 80;
