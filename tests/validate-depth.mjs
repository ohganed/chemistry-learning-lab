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
const enthalpy=all.find(x=>x.id==='2-0');
assert.ok(enthalpy.originJourney?.version==='1.0','Enthalpy motivation course must be versioned');
assert.equal(enthalpy.originJourney.sections.length,10,'Ten progressive enthalpy explanations are required');
const journeyIds=['question','system','internal','firstlaw','piston','why','distinction','reaction','hess','boundaries'];
assert.deepEqual(enthalpy.originJourney.sections.map(x=>x.id),journeyIds);
for(const block of enthalpy.originJourney.sections){
 assert.ok(block.ja?.length>10 && block.en?.length>10,'Missing bilingual headings for '+block.id);
 assert.ok(block.textJa?.length>=140 && block.textEn?.length>=220,'Enthalpy explanation too short for '+block.id);
}
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='why').textJa.includes('H = U + PV'),'Enthalpy definition is derived');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='firstlaw').textJa.includes('ΔU = q + w'),'The first law must precede enthalpy');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='piston').textJa.includes('P_ext ΔV'),'Expansion work must be explained');

const requiredLenses=['observation','particles','model','limits','revisit'];
let guidedCount=0,reasoningCount=0;
for(const ch of all) {
 assert.equal(ch.reasoning?.schemaVersion,'1.0','Reasoning schema missing: '+ch.id);
 assert.deepEqual(ch.reasoning.lenses.map(x=>x.type),requiredLenses,'Five conceptual perspectives missing: '+ch.id);
 for(const lens of ch.reasoning.lenses){
   assert.ok(lens.ja?.length>=100,'Five-perspective Japanese explanation incomplete: '+ch.id+'/'+lens.type);
   assert.ok(lens.en?.length>=160,'Five-perspective English explanation incomplete: '+ch.id+'/'+lens.type);
   reasoningCount++;
 }
 if(ch.guidedExample){
   guidedCount++;
   assert.ok(ch.guidedExample.titleJa?.length>10&&ch.guidedExample.titleEn?.length>15,'Bilingual guided example title missing: '+ch.id);
   assert.equal(ch.guidedExample.steps.length,5,'Guided calculation must have five steps: '+ch.id);
   for(const step of ch.guidedExample.steps){
     assert.ok(Array.isArray(step)&&step[0]?.length>=50&&step[1]?.length>=60,'Incomplete guided calculation step: '+ch.id);
   }
 }
}
assert.equal(reasoningCount,145,'29 chapters × five perspectives');
assert.equal(guidedCount,16,'Expected sixteen cross-curriculum guided problems');
const viewer=readFileSync(new URL('../chemistry-depth-viewer.js',import.meta.url),'utf8');
assert.ok(viewer.includes('chemistry-depth-reflections-v1'));
assert.ok(viewer.includes('depth-deep')&&viewer.includes('data-depth-section="reasoning"'),'Five-lens viewer controls missing');
assert.ok(viewer.includes('depth-guided')&&viewer.includes('data-depth-section="guided"'),'Guided calculations not rendered');
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
const extensions=JSON.parse(readFileSync(new URL('../data/chemistry-depth-extensions-v1.json',import.meta.url),'utf8'));
assert.equal(extensions.schema,'chemistry-depth-extensions');
assert.equal(extensions.schemaVersion,'1.0');
assert.ok(extensions.topics.length>=18,'Expected 18 supplementary cross-topic lessons');
const extensionIds=new Set();
for(const ext of extensions.topics){
  assert.ok(!extensionIds.has(ext.id),'Duplicate extension ID');
  extensionIds.add(ext.id);
  assert.ok(ext.chapters?.length>0 && ext.chapters.every(id=>seen.has(id)),'Every extension must link to existing high-school chapter IDs');
  for(const key of ['ja','en'])assert.ok(ext[key]?.length>=4,'Incomplete bilingual supplemental title: '+ext.id+'/'+key);
  for(const key of ['bodyJa','bodyEn','reasonJa','reasonEn','questionJa','questionEn'])assert.ok(ext[key]?.length>15,'Incomplete bilingual supplemental field: '+ext.id+'/'+key);
}
assert.ok(viewer.includes('chemistry-depth-extensions-v1.json'),'Viewer does not load optional extensions');
assert.ok(sw.includes('chemistry-depth-extensions-v1.json'),'Extensions must be included in offline cache');
console.log('PASS: '+extensions.topics.length+' supplemental explanations with mapped bilingual inquiry prompts.');

console.log('PASS: 29 chapters, 87 core sections, 145 bilingual causal explanations and 16 five-step guided calculations. Offline and backup integration checked.');
