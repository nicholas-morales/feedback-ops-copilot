#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { processFeedback } from '../src/feedback-ops.mjs';

const target = process.argv[2] || 'samples/billing.example.json';
const raw = await readFile(resolve(process.cwd(), target), 'utf8');
const result = processFeedback(JSON.parse(raw));
console.log(JSON.stringify(result, null, 2));
