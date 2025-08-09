export function toKebabCase(input: string | undefined): string {
  if (!input) {
    return 'undefined';
  }
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')     // camelCase or PascalCase ➝ camel-Case
    .replace(/[\s_]+/g, '-')                    // spaces or underscores ➝ -
    .replace(/[^a-zA-Z0-9\-]/g, '')             // remove non-alphanumerics (except dash)
    .replace(/--+/g, '-')                       // collapse multiple dashes
    .replace(/^-+|-+$/g, '')                    // trim starting/ending dashes
    .toLowerCase();
}
