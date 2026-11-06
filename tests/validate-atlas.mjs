import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const file = new URL('../data/chemistry-knowledge-atlas-v1.json', import.meta.url);
const atlas = JSON.parse(readFileSync(file, 'utf8'));
assert.equal(atlas.schema, 'chemistry-knowledge-atlas');
assert.equal(atlas.schemaVersion, '1.0');
assert.ok(Array.isArray(atlas.nodes) && Array.isArray(atlas.edges));
const ids = new Set(atlas.nodes.map(n => n.id));
assert.equal(ids.size, atlas.nodes.length, 'Every concept ID must be unique');
const types = new Set(['prerequisite','analogy','contrast','application','reinterpret']);
const chapters = new Set();
for (const n of atlas.nodes) {
  assert.match(n.id, /^chem\.(hs\.[0-5]-[0-9]+\.[ab]|uni\.[a-z]+)$/);
  assert.ok(n.ja?.trim() && n.en?.trim(), 'Concept has both languages');
  if (n.level === 'high-school') {
    assert.match(n.chapter, /^[0-5]-[0-9]+$/);
    chapters.add(n.chapter);
  } else assert.equal(n.level, 'university');
}
assert.equal(chapters.size, 29, 'Every high-school chapter is represented');
const university = atlas.nodes.filter(n => n.level === 'university');
assert.equal(university.length, 9, 'Nine university core fields are represented');
const adjacency = new Map(atlas.nodes.map(n => [n.id, []]));
const signatures = new Set();
for (const e of atlas.edges) {
  assert.ok(ids.has(e.from) && ids.has(e.to), 'Connection endpoints must exist');
  assert.notEqual(e.from, e.to, 'Self-referential connections should be reviewed');
  assert.ok(types.has(e.type), 'Known relation type');
  assert.ok(e.ja?.trim() && e.en?.trim(), 'Connections explain why in both languages');
  assert.equal(e.provenance, 'curated-draft');
  const signature = [e.from, e.to, e.type].join('|');
  assert.ok(!signatures.has(signature), 'Duplicate directed relation');
  signatures.add(signature);
  adjacency.get(e.from).push(e.to);
  adjacency.get(e.to).push(e.from);
}
const seen = new Set([atlas.nodes[0].id]), queue = [atlas.nodes[0].id];
for (const id of queue) {
  for (const neighbor of adjacency.get(id)) {
    if (!seen.has(neighbor)) {seen.add(neighbor);queue.push(neighbor);}
  }
}
assert.equal(seen.size, atlas.nodes.length, 'Every concept is connected to the network');
console.log('PASS: '+atlas.nodes.length+' concepts, '+atlas.edges.length+' connections, 29 chapters, 9 university fields; all connected.');
