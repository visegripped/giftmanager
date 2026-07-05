/**
 * Convert MySQL gifts dump → Postgres items import SQL.
 * Usage: node scripts/convert-gifts-to-items.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'migration-data/gifts.sql');
const outputDir = path.join(root, 'migration-data/items');
/** Stay under Neon/Vercel SQL editor limits (~100k chars per query). */
const MAX_CHUNK_CHARS = 90_000;

function parseFields(rowBody) {
  const fields = [];
  let i = 0;

  const skipSeparators = () => {
    while (i < rowBody.length && (rowBody[i] === ',' || rowBody[i] === ' ')) {
      i += 1;
    }
  };

  while (i < rowBody.length) {
    skipSeparators();
    if (i >= rowBody.length) break;

    if (rowBody.startsWith('NULL', i)) {
      fields.push(null);
      i += 4;
      continue;
    }

    if (rowBody[i] === "'") {
      i += 1;
      let value = '';
      while (i < rowBody.length) {
        const ch = rowBody[i];
        if (ch === '\\' && i + 1 < rowBody.length) {
          const next = rowBody[i + 1];
          if (next === "'") {
            value += "'";
            i += 2;
            continue;
          }
          if (next === '\\') {
            value += '\\';
            i += 2;
            continue;
          }
          if (next === 'n') {
            value += '\n';
            i += 2;
            continue;
          }
          if (next === 'r') {
            value += '\r';
            i += 2;
            continue;
          }
          if (next === 't') {
            value += '\t';
            i += 2;
            continue;
          }
          value += next;
          i += 2;
          continue;
        }
        if (ch === "'" && rowBody[i + 1] === "'") {
          value += "'";
          i += 2;
          continue;
        }
        if (ch === "'") {
          i += 1;
          break;
        }
        value += ch;
        i += 1;
      }
      fields.push(value);
      continue;
    }

    if (rowBody.startsWith('0x', i)) {
      i += 2;
      let hex = '';
      while (i < rowBody.length && /[0-9a-fA-F]/.test(rowBody[i])) {
        hex += rowBody[i];
        i += 1;
      }
      fields.push(hex ? Buffer.from(hex, 'hex').toString('utf8') : '');
      continue;
    }

    let num = '';
    while (i < rowBody.length && rowBody[i] !== ',') {
      num += rowBody[i];
      i += 1;
    }
    fields.push(Number(num.trim()));
  }

  return fields;
}

function sqlString(value) {
  if (value == null || value === '') return "''";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNullableString(value) {
  if (value == null || value === '') return 'NULL';
  return sqlString(value);
}

function mapStatus(status) {
  if (status === 10) return 'purchased';
  if (status === 2 || status === 5) return 'reserved';
  return 'no change';
}

function mapRemoved(remove) {
  if (remove === 2) return 1;
  return remove ?? 0;
}

function parseUserId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function unixToTimestamp(unix) {
  if (unix == null || unix === 0) return null;
  const d = new Date(unix * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function unixToDateString(unix) {
  if (unix == null || unix === 0) return null;
  const d = new Date(unix * 1000);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function convertRow(fields) {
  const [
    itemid,
    userid,
    itemName,
    itemLink,
    itemDesc,
    _itemType,
    status,
    remove,
    createDate,
    _reserveDate,
    _buyDate,
    _removeDate,
    receivedDate,
    buyUseridRaw,
    archive,
  ] = fields;

  const buyUserid = parseUserId(buyUseridRaw);
  const statusText = mapStatus(status);
  const removed = mapRemoved(remove);

  let addedByUserid = userid;
  if (remove === 2 && buyUserid != null) {
    addedByUserid = buyUserid;
  } else if (
    status === 10 &&
    buyUserid != null &&
    buyUserid !== userid &&
    removed === 1
  ) {
    // Item added to another user's list as purchased (legacy behavior).
    addedByUserid = buyUserid;
  }

  const statusUserid =
    (status === 2 || status === 5 || status === 10) && buyUserid != null
      ? buyUserid
      : null;

  const dateAdded = unixToTimestamp(createDate);
  const dateReceived = unixToDateString(receivedDate);

  const description = itemDesc ?? '';

  return `  (${itemid}, ${userid}, ${sqlString(itemName)}, ${sqlString(description)}, ${sqlString(itemLink ?? '')}, ${addedByUserid}, ${statusUserid ?? 'NULL'}, 1, ${sqlString(statusText)}, ${removed}, ${archive}, ${dateAdded ? sqlString(dateAdded) : 'NULL'}, ${dateReceived ? sqlString(dateReceived) : 'NULL'})`;
}

function extractRows(sql) {
  const rows = [];

  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('(')) continue;
    if (!trimmed.endsWith('),') && !trimmed.endsWith(');')) continue;

    const rowBody = trimmed
      .replace(/^\(/, '')
      .replace(/\),?$/, '')
      .replace(/\);$/, '');
    rows.push(rowBody);
  }

  if (rows.length === 0) {
    throw new Error('Could not find gift rows in gifts.sql');
  }

  return rows;
}

const sql = fs.readFileSync(inputPath, 'utf8');
const rowBodies = extractRows(sql);
const converted = [];
const skipped = [];

for (const rowBody of rowBodies) {
  try {
    const fields = parseFields(rowBody);
    if (fields.length !== 15) {
      skipped.push({
        reason: `expected 15 fields, got ${fields.length}`,
        row: rowBody.slice(0, 80),
      });
      continue;
    }
    converted.push(convertRow(fields));
  } catch (error) {
    skipped.push({
      reason: error instanceof Error ? error.message : String(error),
      row: rowBody.slice(0, 80),
    });
  }
}

if (skipped.length > 0) {
  console.warn(`Skipped ${skipped.length} rows during conversion`);
  skipped.slice(0, 5).forEach((entry) => {
    console.warn(`- ${entry.reason}: ${entry.row}`);
  });
}

const headerTemplate = (
  part,
  total
) => `-- GiftManager items import (Postgres / Neon)
-- Source: MySQL export from vicegrip_family.gifts (phpMyAdmin)
-- Generated by scripts/convert-gifts-to-items.mjs
-- Part ${part} of ${total} — run all parts in order (each file is under 100k chars for Vercel/Neon SQL editor)
-- Run after users.sql and drizzle/migrations/0000_initial.sql

INSERT INTO items (
  itemid,
  userid,
  name,
  description,
  link,
  added_by_userid,
  status_userid,
  groupid,
  status,
  removed,
  archive,
  date_added,
  date_received
) OVERRIDING SYSTEM VALUE
VALUES
`;

const footer = `

-- Keep serial IDs working for future inserts (include only in the final part)
SELECT setval(
  pg_get_serial_sequence('items', 'itemid'),
  COALESCE((SELECT MAX(itemid) FROM items), 1)
);
`;

function chunkRows(rows) {
  const chunks = [];
  let current = [];

  const estimateSize = (partRows, partNum) =>
    headerTemplate(partNum, 99).length + partRows.join(',\n').length + 1;

  for (const row of rows) {
    const nextRows = [...current, row];
    const size = estimateSize(nextRows, chunks.length + 1);

    if (current.length > 0 && size > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = [row];
    } else {
      current = nextRows;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

fs.mkdirSync(outputDir, { recursive: true });

for (const existing of fs.readdirSync(outputDir)) {
  if (existing.endsWith('.sql')) {
    fs.unlinkSync(path.join(outputDir, existing));
  }
}

const rowChunks = chunkRows(converted);
const totalParts = rowChunks.length;

rowChunks.forEach((rows, index) => {
  const part = index + 1;
  const header = headerTemplate(part, totalParts);
  const isLast = part === totalParts;
  const body = `${header}${rows.join(',\n')};${isLast ? footer : ''}\n`;
  const filename = `items-part-${String(part).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(outputDir, filename), body, 'utf8');
  console.log(
    `Wrote ${rows.length} rows (${body.length} chars) to migration-data/items/${filename}`
  );
});

console.log(
  `Wrote ${converted.length} rows across ${totalParts} files in migration-data/items/`
);
