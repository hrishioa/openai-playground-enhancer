export const VERBOSE=true;

export function consoleLog(...args: any[]) {
  if (VERBOSE) {
    console.log(...args);
  }
}