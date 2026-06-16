// Unfolds RFC 5322 header lines and splits into name/value pairs.

export interface RawField {
  name: string;  // lowercase
  value: string; // unfolded, trimmed
}

export function tokenize(raw: string): RawField[] {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const fields: RawField[] = [];
  let current: string | null = null;

  // Match a genuine RFC 5322 header start: "Name:" optionally followed by space/tab.
  // Lines that fail this test (including Outlook-stripped continuation lines that lack
  // leading whitespace) are treated as continuations of the current field.
  const newFieldRe = /^[A-Za-z][A-Za-z0-9_-]*\s*:(?:[ \t]|$)/;

  for (const line of lines) {
    if (line === '') continue;
    if (line[0] === ' ' || line[0] === '\t' || !newFieldRe.test(line)) {
      if (current !== null) current += ' ' + line.trim();
      continue;
    }
    if (current !== null) pushField(fields, current);
    current = line;
  }
  if (current !== null) pushField(fields, current);
  return fields;
}

function pushField(out: RawField[], line: string) {
  const colon = line.indexOf(':');
  if (colon > 0) {
    out.push({ name: line.slice(0, colon).trim().toLowerCase(), value: line.slice(colon + 1).trim() });
  }
}

export function getFirst(fields: RawField[], name: string): string | undefined {
  return fields.find(f => f.name === name)?.value;
}

export function getAll(fields: RawField[], name: string): string[] {
  return fields.filter(f => f.name === name).map(f => f.value);
}
