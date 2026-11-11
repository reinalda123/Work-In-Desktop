import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP_ROOT = path.resolve(SCRIPT_DIR, '..');
const APP_DIST_DIR = path.join(DESKTOP_ROOT, 'app-dist');
const TAURI_ICONS_DIR = path.join(DESKTOP_ROOT, 'src-tauri', 'icons');
const CACHE_WEB_DIR = path.join(DESKTOP_ROOT, '.web-cache', 'Work-In');
const REMOTE_REPO = 'https://github.com/reinalda123/Work-In.git';

function parseArgs(argv) {
  let remote = false;
  let source = process.env.WORKIN_WEB_DIR || '';
  let ref = process.env.WORKIN_WEB_REF || 'main';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--remote') {
      remote = true;
    } else if (arg === '--source' && argv[i + 1]) {
      source = argv[i + 1];
      i += 1;
    } else if (arg === '--ref' && argv[i + 1]) {
      ref = argv[i + 1];
      i += 1;
    }
  }

  return { remote, source, ref };
}

function runCommand(command, args, options = {}) {
  const needsCmdWrapper = process.platform === 'win32' && (command === 'npm' || command === 'npx');
  const executable = needsCmdWrapper ? process.env.ComSpec || 'cmd.exe' : command;
  const executableArgs = needsCmdWrapper ? ['/d', '/s', '/c', command, ...args] : args;

  const result = spawnSync(executable, executableArgs, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(' ')}`);
  }
}

function syncRemoteWebSource(ref) {
  fs.mkdirSync(path.dirname(CACHE_WEB_DIR), { recursive: true });

  if (fs.existsSync(path.join(CACHE_WEB_DIR, '.git'))) {
    console.log(`[work-in-desktop] Updating cached web source (${ref})...`);
    runCommand('git', ['fetch', '--depth', '1', 'origin', ref], { cwd: CACHE_WEB_DIR });
    runCommand('git', ['checkout', 'FETCH_HEAD'], { cwd: CACHE_WEB_DIR });
  } else {
    fs.rmSync(CACHE_WEB_DIR, { recursive: true, force: true });
    console.log(`[work-in-desktop] Cloning ${REMOTE_REPO} (${ref})...`);
    runCommand('git', ['clone', '--depth', '1', '--branch', ref, REMOTE_REPO, CACHE_WEB_DIR]);
  }

  if (!fs.existsSync(path.join(CACHE_WEB_DIR, 'node_modules'))) {
    console.log('[work-in-desktop] Installing web dependencies...');
    runCommand('npm', ['ci'], { cwd: CACHE_WEB_DIR });
  }

  return CACHE_WEB_DIR;
}

function resolveWebSource({ remote, source, ref }) {
  if (remote) {
    return syncRemoteWebSource(ref);
  }

  const candidate = source
    ? path.resolve(DESKTOP_ROOT, source)
    : path.resolve(DESKTOP_ROOT, '..', 'Work-In');

  if (!fs.existsSync(path.join(candidate, 'package.json'))) {
    throw new Error(
      `Web source directory not found at "${candidate}". Set WORKIN_WEB_DIR or run with --remote.`,
    );
  }

  return candidate;
}

function stripPwaArtifacts(distDir) {
  for (const filename of ['registerSW.js', 'sw.js', 'manifest.webmanifest']) {
    fs.rmSync(path.join(distDir, filename), { force: true });
  }

  for (const entry of fs.readdirSync(distDir)) {
    if (/^workbox-.*\.js$/i.test(entry)) {
      fs.rmSync(path.join(distDir, entry), { force: true });
    }
  }

  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const html = fs
      .readFileSync(indexPath, 'utf-8')
      .replace(/<link\b[^>]*\brel=["']manifest["'][^>]*>\s*/gi, '')
      .replace(/<script\b[^>]*\bid=["']vite-plugin-pwa:register-sw["'][^>]*>\s*<\/script>\s*/gi, '');
    fs.writeFileSync(indexPath, html, 'utf-8');
  }
}

function syncTauriIconsIfNeeded(sourceDir) {
  const sourceIcon = path.join(sourceDir, 'public', 'icons', 'icon-512.png');
  if (!fs.existsSync(sourceIcon)) {
    throw new Error(`Missing source icon at "${sourceIcon}"`);
  }

  const targetIco = path.join(TAURI_ICONS_DIR, 'icon.ico');
  const shouldRegenerate =
    !fs.existsSync(targetIco) ||
    fs.statSync(sourceIcon).mtimeMs > fs.statSync(targetIco).mtimeMs;

  if (shouldRegenerate) {
    console.log('[work-in-desktop] Regenerating Tauri icons from icon-512.png...');
    runCommand('npx', ['tauri', 'icon', sourceIcon], { cwd: DESKTOP_ROOT });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const webDir = resolveWebSource(options);
  console.log(`[work-in-desktop] Building renderer from "${webDir}"...`);

  runCommand('npm', ['run', 'build'], {
    cwd: webDir,
    env: {
      ...process.env,
      VITE_BASE_PATH: '/',
    },
  });

  const builtDist = path.join(webDir, 'dist');
  if (!fs.existsSync(path.join(builtDist, 'index.html'))) {
    throw new Error(`Expected built web bundle at "${builtDist}"`);
  }

  fs.rmSync(APP_DIST_DIR, { recursive: true, force: true });
  fs.cpSync(builtDist, APP_DIST_DIR, { recursive: true });
  stripPwaArtifacts(APP_DIST_DIR);
  syncTauriIconsIfNeeded(webDir);

  console.log('[work-in-desktop] Renderer bundle prepared cleanly for Tauri v2.');
}

main();
