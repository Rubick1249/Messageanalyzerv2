import { describe, it, expect } from 'vitest';
import { tokenize, getFirst, getAll } from '../tokenizer';

const SAMPLE = `Subject: Hello World
From: Alice <alice@example.com>
To: bob@example.com
Received: from mail.example.com (1.2.3.4)
 by mx.contoso.com with SMTP; Mon, 1 Jan 2024 12:00:00 +0000
X-Custom: value1; value2`;

describe('tokenizer', () => {
  it('splits simple headers', () => {
    const fields = tokenize(SAMPLE);
    expect(getFirst(fields, 'subject')).toBe('Hello World');
    expect(getFirst(fields, 'from')).toBe('Alice <alice@example.com>');
  });

  it('unfolds continuation lines', () => {
    const fields = tokenize(SAMPLE);
    const received = getFirst(fields, 'received');
    expect(received).toContain('from mail.example.com');
    expect(received).toContain('by mx.contoso.com');
    expect(received).not.toContain('\n');
  });

  it('returns all headers with same name', () => {
    const raw = `Received: from a by b; Mon, 1 Jan 2024 12:00:00 +0000\nReceived: from c by d; Mon, 1 Jan 2024 11:59:58 +0000`;
    const fields = tokenize(raw);
    expect(getAll(fields, 'received')).toHaveLength(2);
  });

  it('handles CRLF line endings', () => {
    const raw = 'Subject: Test\r\nFrom: a@b.com\r\n';
    const fields = tokenize(raw);
    expect(getFirst(fields, 'subject')).toBe('Test');
  });

  it('normalizes header names to lowercase', () => {
    const fields = tokenize('X-Custom: hello');
    expect(getFirst(fields, 'x-custom')).toBe('hello');
  });
});
