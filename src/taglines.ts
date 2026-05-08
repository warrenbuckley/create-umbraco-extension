export const introTaglines: ReadonlyArray<string> = [
  'No copy-paste was harmed in the making of this extension.',
  "Because life's too short to write vite.config.ts by hand.",
  'More Umbraco, less Urgh-mbraco',
  'The rabbit is hard at work.',
  "Eric's mum says hi",
  "Opening the backoffice toolbox. Mind your fingers.",
  "Telling node_modules this is not about them.",
  'double-quoting the single quotes',
  'Reticulating nodes'
];

export const outroTaglines: ReadonlyArray<string> = [
  'Happy coding',
  "We've done the legwork, go do the real work",
  "All done. May your manifests be valid and your builds be green.",
  "Extension scaffolded. Coffee now permitted.",
  "Go and convert coffee in to code!",
  "Nodes successfully reticulated."
];

export function pickIntroTagline(): string {
  return introTaglines[Math.floor(Math.random() * introTaglines.length)];
}

export function pickOutroTagline(): string {
  return outroTaglines[Math.floor(Math.random() * outroTaglines.length)];
}
