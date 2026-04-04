export const taglines: ReadonlyArray<string> = [
  'Because nobody enjoys writing manifests from scratch.',
  'Less boilerplate. More backoffice.',
  'Stop copy-pasting manifests. Start shipping extensions.',
  'Your shortcut to backoffice enlightenment.',
  'The fastest path from idea to Umbraco extension.',
  "Manifests? Sorted. Boilerplate? Gone.",
  'From blank slate to backoffice extension, in minutes.',
  "Turn 'ugh, another manifest' into 'done, next.'",
  'No copy-paste was harmed in the making of this extension.',
  "Because life's too short to write vite.config.ts by hand.",
];

export function pickTagline(): string {
  return taglines[Math.floor(Math.random() * taglines.length)];
}
