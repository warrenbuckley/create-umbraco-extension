import { resolve, join } from 'node:path';
import { styleText } from 'node:util';
import { createRequire } from 'node:module';
import {
  intro,
  outro,
  note,
  text,
  select,
  confirm,
  spinner,
  isCancel,
  cancel,
  log,
} from '@clack/prompts';
import { pickIntroTagline, pickOutroTagline } from './taglines.js';
import { detectExistingProject, detectAliasPrefix } from './detect.js';
import { fetchUmbracoVersions } from './versions.js';
import { discoverGenerators } from './discover.js';
import { writeFiles, WriteAbortedError } from './utils/write-files.js';
import { patchBundleManifests } from './utils/bundle-patch.js';
import { generateProject } from './generators/project.js';
import { builtInGenerators } from './generators/index.js';
import { normalisePrefix } from './utils/alias.js';
import { toKebabCase } from './utils/strings.js';
import { detectPackageManager, runInstall, nextStepsMessage } from './utils/package-manager.js';
import type { GeneratorContext } from './types.js';

const _require = createRequire(import.meta.url);
const { version } = _require('../package.json') as { version: string };

// ─── Argument parsing ─────────────────────────────────────────────────────────

interface CliArgs {
  type?: string;
  name?: string;
  prefix?: string;
  umbracoVersion?: string;
  example: boolean;
  dryRun: boolean;
  json: boolean;
  cwd: string;
}

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const args: CliArgs = {
    example: false,
    dryRun: false,
    json: false,
    cwd: process.cwd(),
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--type':            args.type = argv[++i]; break;
      case '--name':            args.name = argv[++i]; break;
      case '--prefix':          args.prefix = argv[++i]; break;
      case '--umbraco-version': args.umbracoVersion = argv[++i]; break;
      case '--example':         args.example = true; break;
      case '--dry-run':         args.dryRun = true; break;
      case '--json':            args.json = true; break;
      case '--cwd':             args.cwd = argv[++i]; break;
    }
  }

  return args;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function runCLI(): Promise<void> {
  const args = parseArgs();
  const cwd = resolve(args.cwd);

  // Non-interactive: --type --name --prefix all provided
  if (args.type && args.name && args.prefix) {
    await runNonInteractive(cwd, args);
    return;
  }

  await runInteractive(cwd, args);
}

// ─── Interactive mode ─────────────────────────────────────────────────────────

async function runInteractive(cwd: string, args: CliArgs): Promise<void> {
  intro('create-umbraco-extension');
  log.message(styleText(['yellow', 'italic'], pickIntroTagline()), { spacing: 0 });
  log.message(styleText('dim', `version: ${version}`), { spacing: 0 });

  const existingProject = await detectExistingProject(cwd);

  // interactiveNewProject handles its own outro (needs project name + PM info).
  // interactiveAddExtension does not, so we call outro here for that path.
  let outroHandled = false;

  try {
    if (existingProject) {
      log.info(`Found Umbraco project: ${existingProject}`);

      const choice = prompt(await select({
        message: 'What would you like to do?',
        options: [
          { value: 'add', label: 'Add an extension to this project' },
          { value: 'new', label: 'Scaffold a new project in a subdirectory' },
        ],
      }));

      if (choice === 'add') {
        const detectedPrefix = await detectAliasPrefix(cwd);
        await interactiveAddExtension(cwd, existingProject, args, detectedPrefix);
      } else {
        await interactiveNewProject(cwd, args);
        outroHandled = true;
      }
    } else {
      await interactiveNewProject(cwd, args);
      outroHandled = true;
    }
  } catch (err) {
    if (err instanceof WriteAbortedError) {
      log.error(err.message);
      outro('Scaffolding aborted — no further files written.');
      return;
    }
    throw err;
  }

  if (!outroHandled){
    outro(styleText(['yellow', 'italic'], pickOutroTagline()));
  }
}

async function interactiveNewProject(cwd: string, args: CliArgs): Promise<void> {
  const rawProjectName = prompt(
    await text({
      message: 'Project name',
      placeholder: 'my-plugin',
      validate: (v) => (v?.trim() ? undefined : 'Project name is required'),
    }),
  );
  const projectName = toKebabCase(rawProjectName);
  if (projectName !== rawProjectName.trim()) {
    log.info(`Project name normalised to: ${projectName}`);
  }

  const derivedPrefix = projectName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('.');

  const aliasPrefix = prompt(
    await text({
      message: 'Alias prefix',
      initialValue: derivedPrefix,
      validate: (v) => (v?.trim() ? undefined : 'Alias prefix is required'),
    }),
  );

  const s = spinner();
  s.start('Fetching Umbraco versions...');
  const versions = await fetchUmbracoVersions();
  s.stop('Umbraco versions loaded');

  const packageVersion = prompt(
    await select({
      message: 'Umbraco version',
      options: versions.map((v) => ({ value: v.packageVersion, label: v.label })),
    }),
  );

  s.start('Generating project scaffold...');
  const files = await generateProject(
    projectName,
    normalisePrefix(aliasPrefix),
    packageVersion,
  );
  s.stop('Scaffold generated');

  // Scaffold into a subdirectory named after the project, e.g. cwd/my-plugin/
  const projectDir = join(cwd, toKebabCase(projectName));
  const result = await writeFiles(files, projectDir, args.dryRun);
  showWriteSummary(result, args.dryRun);

  // Immediately offer extension selection — no need to run the CLI again
  const normalisedPrefix = normalisePrefix(aliasPrefix);
  let addAnother = true;
  while (addAnother) {
    await interactiveAddExtension(projectDir, projectName, args, normalisedPrefix);
    addAnother = prompt(await confirm({ message: 'Add another extension?', initialValue: false }));
  }

  // Detect which package manager invoked the CLI and offer to install
  const pm = detectPackageManager();
  const shouldInstall = prompt(
    await confirm({ message: `Install dependencies now? (${pm.installCmd})` }),
  );

  let installed = false;
  if (shouldInstall) {
    const s = spinner();
    s.start(`Running ${pm.installCmd}...`);
    try {
      await runInstall(projectDir, pm);
      s.stop('Dependencies installed');
      installed = true;
    } catch {
      s.error('Installation failed — run it manually');
    }
  }

  note(nextStepsMessage(toKebabCase(projectName), pm, installed), 'Next steps');
  outro(styleText(['yellow', 'italic'], pickOutroTagline()));
}

async function interactiveAddExtension(
  cwd: string,
  projectName: string,
  args: CliArgs,
  defaultAliasPrefix?: string,
): Promise<void> {
  const generators = await discoverGenerators(cwd, builtInGenerators);

  const generatorType = prompt(
    await select({
      message: 'Extension type',
      options: generators.map((g) => ({
        value: g.type,
        label: g.group ? `[${g.group}] ${g.name}` : g.name,
        hint: g.description,
      })),
    }),
  );

  const generator = generators.find((g) => g.type === generatorType)!;

  const extensionName = prompt(
    await text({
      message: 'Extension name',
      validate: (v) => (v?.trim() ? undefined : 'Extension name is required'),
    }),
  );

  // Use the known project prefix directly. Only ask if detection found nothing
  // (e.g. existing project not created by this CLI).
  const aliasPrefix = defaultAliasPrefix ?? prompt(
    await text({
      message: 'Alias prefix',
      placeholder: 'My.Plugin',
      validate: (v) => (v?.trim() ? undefined : 'Alias prefix is required'),
    }),
  );

  const withExample = prompt(
    await confirm({ message: 'Include a working example implementation?' }),
  );

  const context: GeneratorContext = {
    projectName,
    aliasPrefix: normalisePrefix(aliasPrefix),
    extensionName,
    outputDir: cwd,
    withExample,
  };

  const answers = await generator.questions(context);

  const s = spinner();
  s.start('Generating files...');
  const files = await generator.generate(answers, context);
  s.stop('Files generated');

  const result = await writeFiles(files, cwd, args.dryRun);

  const manifestFile = files.find((f) => f.path.endsWith('/manifest.ts'));
  if (manifestFile) {
    const patch = await patchBundleManifests(cwd, manifestFile.path, args.dryRun);
    if (patch.patched) log.success('Registered in src/bundle.manifests.ts');
  }

  showWriteSummary(result, args.dryRun);
}

// ─── Non-interactive mode ─────────────────────────────────────────────────────

async function runNonInteractive(cwd: string, args: CliArgs): Promise<void> {
  const existingProject = await detectExistingProject(cwd);

  // Derive a project name from the prefix if no project is detected
  // e.g. 'Dev.Test' → 'dev-test'
  const projectName = existingProject ?? toKebabCase(args.prefix!.replace(/\./g, ' '));

  const generators = await discoverGenerators(cwd, builtInGenerators);
  const generator = generators.find((g) => g.type === args.type);
  if (!generator) {
    const available = generators.map((g) => g.type).join(', ');
    throw new Error(`Unknown extension type: "${args.type}". Available: ${available}`);
  }

  const context: GeneratorContext = {
    projectName,
    aliasPrefix: normalisePrefix(args.prefix!),
    extensionName: args.name!,
    outputDir: cwd,
    withExample: args.example,
  };

  const answers = await generator.questions(context);
  const files = await generator.generate(answers, context);
  const result = await writeFiles(files, cwd, args.dryRun);

  const manifestFile = files.find((f) => f.path.endsWith('/manifest.ts'));
  let bundlePatched = false;
  if (manifestFile) {
    const patch = await patchBundleManifests(cwd, manifestFile.path, args.dryRun);
    bundlePatched = patch.patched;
  }

  if (args.json) {
    const generated = files.map((f) => ({
      path: f.path,
      status: result.created.includes(f.path)
        ? 'created'
        : result.updated.includes(f.path)
          ? 'updated'
          : 'skipped',
    }));

    process.stdout.write(
      JSON.stringify({ mode: 'add', type: args.type, projectName, dryRun: args.dryRun, generated, bundlePatched }, null, 2) + '\n',
    );
  } else {
    showWriteSummary(result, args.dryRun);
  }
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

/**
 * Unwraps a prompt result, exiting cleanly if the user cancelled.
 * Named `prompt` to read naturally at call sites: `const name = prompt(await text(...))`.
 */
function prompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return value as T;
}

function showWriteSummary(
  result: { created: string[]; updated: string[]; skipped: string[] },
  dryRun: boolean,
): void {
  const tag = dryRun ? ' (dry run)' : '';
  if (result.created.length) log.success(`Created ${result.created.length} file(s)${tag}`);
  if (result.updated.length) log.info(`Updated ${result.updated.length} file(s)${tag}`);
  if (result.skipped.length) log.warn(`Skipped ${result.skipped.length} file(s)${tag}`);
}
