import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { formatToolResult } from '../types.js';

const MAX_OUTPUT_CHARS = 50_000;
const DEFAULT_TIMEOUT_SECONDS = 120;
const MAX_TIMEOUT_SECONDS = 600;

/**
 * Detect available Python command.
 * Checks `python3` first, then `python`.
 */
async function detectPython(): Promise<string | null> {
  for (const cmd of ['python3', 'python']) {
    try {
      const proc = Bun.spawn([cmd, '--version'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      await proc.exited;
      if (proc.exitCode === 0) return cmd;
    } catch {
      // Command not found, try next
    }
  }
  return null;
}

/**
 * Truncate output that exceeds the max character limit.
 * Keeps the first half and last half with a truncation notice in between.
 */
function truncateOutput(output: string): string {
  if (output.length <= MAX_OUTPUT_CHARS) return output;
  const half = Math.floor(MAX_OUTPUT_CHARS / 2);
  const head = output.slice(0, half);
  const tail = output.slice(-half);
  return `${head}\n\n... [TRUNCATED ${output.length - MAX_OUTPUT_CHARS} characters] ...\n\n${tail}`;
}

export const pythonReplTool = new DynamicStructuredTool({
  name: 'python_repl',
  description:
    'Execute Python code or run Python scripts. Use for data analysis, ML model training, statistical computations, and file processing.',
  schema: z.object({
    code: z
      .string()
      .optional()
      .describe('Inline Python code to execute. Mutually exclusive with file_path.'),
    file_path: z
      .string()
      .optional()
      .describe('Path to a .py file to execute. Mutually exclusive with code.'),
    args: z
      .array(z.string())
      .optional()
      .describe('Command-line arguments when running a file via file_path.'),
    timeout_seconds: z
      .number()
      .min(1)
      .max(MAX_TIMEOUT_SECONDS)
      .optional()
      .describe(`Execution timeout in seconds (default ${DEFAULT_TIMEOUT_SECONDS}, max ${MAX_TIMEOUT_SECONDS}).`),
    pip_install: z
      .array(z.string())
      .optional()
      .describe('Python packages to install via pip before execution (e.g. ["numpy", "pandas"]).'),
  }),
  func: async ({ code, file_path, args, timeout_seconds, pip_install }) => {
    try {
      // Validate input
      if (!code && !file_path) {
        return formatToolResult({ error: 'Either code or file_path must be provided.' });
      }
      if (code && file_path) {
        return formatToolResult({ error: 'Provide either code or file_path, not both.' });
      }

      // Detect Python
      const pythonCmd = await detectPython();
      if (!pythonCmd) {
        return formatToolResult({
          error: 'Python not found. Please install Python 3 and ensure python3 or python is on your PATH.',
        });
      }

      const timeout = (timeout_seconds ?? DEFAULT_TIMEOUT_SECONDS) * 1000;

      // Install pip packages if requested
      if (pip_install && pip_install.length > 0) {
        const pipProc = Bun.spawn([pythonCmd, '-m', 'pip', 'install', '--quiet', ...pip_install], {
          stdout: 'pipe',
          stderr: 'pipe',
        });

        const pipTimedOut = await Promise.race([
          pipProc.exited.then(() => false),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(true), timeout)),
        ]);

        if (pipTimedOut) {
          pipProc.kill();
          return formatToolResult({
            error: `pip install timed out after ${timeout_seconds ?? DEFAULT_TIMEOUT_SECONDS}s. Packages: ${pip_install.join(', ')}`,
          });
        }

        if (pipProc.exitCode !== 0) {
          const stderr = await new Response(pipProc.stderr).text();
          return formatToolResult({
            error: `pip install failed (exit code ${pipProc.exitCode}): ${stderr.trim()}`,
          });
        }
      }

      // Build command
      const command: string[] = code
        ? [pythonCmd, '-u', '-c', code]
        : [pythonCmd, '-u', file_path!, ...(args ?? [])];

      // Execute
      const proc = Bun.spawn(command, {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const timedOut = await Promise.race([
        proc.exited.then(() => false),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(true), timeout)),
      ]);

      if (timedOut) {
        proc.kill();
        return formatToolResult({
          error: `Execution timed out after ${timeout_seconds ?? DEFAULT_TIMEOUT_SECONDS}s.`,
        });
      }

      const stdout = truncateOutput(await new Response(proc.stdout).text());
      const stderr = truncateOutput(await new Response(proc.stderr).text());

      return formatToolResult({
        exit_code: proc.exitCode,
        stdout,
        stderr,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return formatToolResult({ error: message });
    }
  },
});
