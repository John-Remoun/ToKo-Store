#!/usr/bin/env node
/**
 * Generates .env.development from .env.example, filling in random hex
 * secrets for every *_SECRET_KEY / *_TOKEN_SECRET_KEY / ENC_KEY variable.
 * Everything else is left blank for you to fill in (DB_URI, third-party
 * keys, etc — see SETUP.md). Existing .env.development is never overwritten.
 *
 * Usage: node scripts/generate-env.js
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, '.env.example');
const DEST = path.join(ROOT, '.env.development');

const SECRET_KEY_PATTERN = /(SECRET_KEY|ENC_KEY)$/;

function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Could not find ${SRC}`);
    process.exit(1);
  }

  if (fs.existsSync(DEST)) {
    console.error(
      `${DEST} already exists — refusing to overwrite it. Delete it first if you want to regenerate.`,
    );
    process.exit(1);
  }

  const lines = fs.readFileSync(SRC, 'utf8').split('\n');

  const output = lines.map((line) => {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!match) return line;

    const [, key, value] = match;
    if (value.trim() !== '') return line; // keep example defaults (PORT, etc.)
    if (SECRET_KEY_PATTERN.test(key)) {
      return `${key}=${randomHex(32)}`;
    }
    return line;
  });

  fs.writeFileSync(DEST, output.join('\n'));
  console.log(`✅ Wrote ${DEST} with fresh random secrets.`);
  console.log(
    '   Fill in DB_URI and any third-party keys you need (see SETUP.md).',
  );
}

main();
