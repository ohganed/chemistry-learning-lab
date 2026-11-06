import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const expected = [5,5,6,4,6,3];
const all = [],seen = new Set();
for (let group=0;group<expected.length;group++) {
  const data=JSON.parse(readFileSync(new URL(`../data/chemistry-depth-${group}.json`, import.meta.url),'utf8'));
  assert.equal(data.schema,'chemistry-depth-textbook');
  assert.equal(data.schemaVersion,'1.0');
  assert.equal(String(data.group),String(group));
  assert.deepEqual(data.locale,['ja','en']);
  assert.equal(data.chapters.length,expected[group],`Unexpected chapter count in group ${group}`);
  data.chapters.forEach((ch,index)=>{
    const id=group+'-'+index;
    assert.equal(ch.id,id,'Stable chapter ID mismatch');
    assert.ok(!seen.has(ch.id),'Duplicate chapter ID');
    seen.add(ch.id);
    assert.ok(ch.ja.length>=2&&ch.en.length>=3,'Bilingual chapter titles are required');
    assert.equal(ch.sections.length,3,`Three explanatory steps required for ${id}`);
    ch.sections.forEach((sec,part)=>{
      assert.ok(sec.ja?.length>3 && sec.en?.length>3,`Bilingual section heading missing: ${id}/${part}`);
      assert.ok(sec.textJa?.length>=80,`Japanese explanation is too short: ${id}/${part}`);
      assert.ok(sec.textEn?.length>=120,`English explanation is too short: ${id}/${part}`);
    });
    for(const key of ['example','pitfall','bridge','inquiry']){
      assert.ok(ch[key]&&ch[key].ja?.length>=18&&ch[key].en?.length>=20,`Bilingual ${key} is missing: ${id}`);
    }
    assert.ok(ch.example.solutionJa.length>=40&&ch.example.solutionEn.length>=55,`Worked solution incomplete: ${id}`);
    assert.equal(ch.status,'editorial-draft');
    all.push(ch);
  });
}
assert.equal(seen.size,29);
const viewer=readFileSync(new URL('../chemistry-depth-viewer.js',import.meta.url),'utf8');
assert.ok(viewer.includes('chemistry-depth-reflections-v1'));
const html=['high-school-chemistry.html','high-school-chemistry-en.html'].map(p=>readFileSync(new URL('../'+p,import.meta.url),'utf8'));
html.forEach(s=>{
 assert.ok(s.includes('src="./chemistry-depth-viewer.js"'),'Viewer missing');
 assert.ok(s.includes('window.ChemistryDepth.render'),'Viewer not invoked');
 assert.ok(s.includes('id="depthMount"'),'No explanation mount');
});
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
for(let group=0;group<6;group++)assert.ok(sw.includes('chemistry-depth-'+group+'.json'), 'Missing offline data group '+group);
assert.ok(sw.includes('chemistry-depth-viewer.js'), 'Viewer not offline-cached');
const backup=readFileSync(new URL('../learning-interchange.html',import.meta.url),'utf8');
assert.ok(backup.includes('chemistry-depth-reflections-v1'),'Reflections not backed up');
console.log('PASS: 29 chapters, 87 bilingual explanation sections, worked examples, misconceptions, cross-links and optional inquiries. Offline and backup integration checked.');
