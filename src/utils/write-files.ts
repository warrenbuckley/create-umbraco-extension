import { writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { select, isCancel } from '@clack/prompts';
import type { GeneratedFile } from '../types.js';

/**
 * The result of a `writeFiles` call — mirrors the `--json` output shape.
 */
export interface WriteResult {
  /** Paths of files that did not previously exist and were written. */
  created: string[];
  /** Paths of files that already existed and were overwritten by the user's choice. */
  updated: string[];
  /** Paths of files that already existed and were skipped by the user's choice. */
  skipped: string[];
}

/**
 * Thrown when the user chooses "Abort" during a file conflict prompt.
 * Caught in `cli.ts` to exit with a friendly message, leaving already-written files in place.
 */
export class WriteAbortedError extends Error {
  constructor() {
    super('Scaffolding aborted.');
    this.name = 'WriteAbortedError';
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Writes a list of generated files to disk relative to `outputDir`.
 *
 * - Creates intermediate directories automatically.
 * - When a file already exists, prompts the user to overwrite, skip, or abort.
 * - In dry-run mode, reports what would be written without touching the filesystem.
 *
 * @throws {WriteAbortedError} When the user chooses to abort at a conflict prompt.
 */
export async function writeFiles(
  files: GeneratedFile[],
  outputDir: string,
  dryRun: boolean,
): Promise<WriteResult> {
  const result: WriteResult = { created: [], updated: [], skipped: [] };

  for (const file of files) {
    const fullPath = join(outputDir, file.path);
    const exists = await fileExists(fullPath);

    if (exists) {
      const action = await select({
        message: `${file.path} already exists`,
        options: [
          { value: 'overwrite', label: 'Overwrite', hint: 'replace the existing file' },
          { value: 'skip',      label: 'Skip',      hint: 'keep the existing file' },
          { value: 'abort',     label: 'Abort',     hint: 'stop scaffolding immediately' },
        ],
      });

      if (isCancel(action) || action === 'abort') {
        throw new WriteAbortedError();
      }

      if (action === 'skip') {
        result.skipped.push(file.path);
        continue;
      }

      // action === 'overwrite'
      if (!dryRun) {
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, file.content, 'utf-8');
      }
      result.updated.push(file.path);
    } else {
      if (!dryRun) {
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, file.content, 'utf-8');
      }
      result.created.push(file.path);
    }
  }

  return result;
}
