export function toKebabCase(input: string | undefined): string {
  if (!input) {
    return "undefined";
  }
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase or PascalCase ➝ camel-Case
    .replace(/[\s_]+/g, "-") // spaces or underscores ➝ -
    .replace(/[^a-zA-Z0-9\-]/g, "") // remove non-alphanumerics (except dash)
    .replace(/--+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, "") // trim starting/ending dashes
    .toLowerCase();
}

export function getLocalizedString(
  textObj: Record<string, string> | undefined,
): string | undefined {
  if (!textObj) return undefined;
  return textObj.en ?? textObj["??"] ?? textObj[Object.keys(textObj)[0]!];
}

export function prependGatewayUrl(cid: string | undefined): string | undefined {
  if (!cid) {
    return undefined;
  }
  const gatewayUrl = useAppConfig().kuboGatewayUrl;
  return `${gatewayUrl}/${cid}`;
}