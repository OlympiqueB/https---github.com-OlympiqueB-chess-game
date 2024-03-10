export function deepCopy(arr) {
  return JSON.parse(JSON.stringify(arr));
}