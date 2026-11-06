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
assert.equal(enthalpy.originJourney.sections.length,15,'Fifteen progressive enthalpy explanations are required');
const journeyIds=['question','system','internal','firstlaw','piston','why','distinction','reaction','hess','boundaries','conditions','worked','states','hessworked','limits'];
assert.deepEqual(enthalpy.originJourney.sections.map(x=>x.id),journeyIds);
for(const block of enthalpy.originJourney.sections){
 assert.ok(block.ja?.length>10 && block.en?.length>10,'Missing bilingual headings for '+block.id);
 assert.ok(block.textJa?.length>=140 && block.textEn?.length>=220,'Enthalpy explanation too short for '+block.id);
}
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='why').textJa.includes('H = U + PV'),'Enthalpy definition is derived');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='firstlaw').textJa.includes('ΔU = q + w'),'The first law must precede enthalpy');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='piston').textJa.includes('P_ext ΔV'),'Expansion work must be explained');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='hessworked').textJa.includes('−110.5'),'Numerical Hess-law demonstration is required');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='states').textJa.includes('H₂O(l)'),'Liquid/gas enthalpy distinction must be explicit');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='worked').textJa.includes('400 J'),'Worked expansion energy balance must be present');

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
 const code=s.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(code,'Missing inline chapter logic');
 assert.doesNotThrow(()=>new Function(code),'Chapter JS must parse');
 assert.ok(code.indexOf('<div id="depthMount"></div>')<code.indexOf('<details class="chapter-summary">'),'Detailed explanations must appear before the compact review');
 assert.ok(code.includes("esc(s.body)")&&code.includes("esc(s.formula)"),'Existing chapter content must remain available');

});
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
for(let group=0;group<6;group++)assert.ok(sw.includes('chemistry-depth-'+group+'.json'), 'Missing offline data group '+group);
assert.ok(sw.includes('chemistry-depth-viewer.js'), 'Viewer not offline-cached');
const backup=readFileSync(new URL('../learning-interchange.html',import.meta.url),'utf8');
assert.ok(backup.includes('chemistry-depth-reflections-v1'),'Reflections not backed up');
const bridges=JSON.parse(readFileSync(new URL('../data/chemistry-knowledge-bridges-v1.json',import.meta.url),'utf8'));
assert.equal(bridges.schema,'chemistry-knowledge-bridges');
assert.equal(bridges.schemaVersion,'1.0');
assert.equal(bridges.bridges.length,11,'Eleven detailed interdisciplinary bridges are required');
const bridgeIds=new Set(),covered=new Set();
for(const item of bridges.bridges){
 assert.ok(!bridgeIds.has(item.id),'Duplicate bridge ID');
 bridgeIds.add(item.id);
 assert.ok(item.chapters?.length>=1,'Bridge chapter IDs missing: '+item.id);
 for(const id of item.chapters){
  assert.ok(seen.has(id),'Unknown chemistry chapter in bridge '+item.id+'/'+id);
  covered.add(id);
 }
 assert.ok(item.steps?.length>=3,'At least three explanatory stages needed: '+item.id);
 for(const step of item.steps){
  assert.ok(step.ja?.length>=5&&step.en?.length>=8,'Bilingual bridge heading missing: '+item.id);
  assert.ok(step.textJa?.length>=100&&step.textEn?.length>=160,'Detailed bilingual bridge explanation incomplete: '+item.id);
 }
 for(const obj of [item.source,item.target,item.hook,item.limits,item.revisit]){
  assert.ok(obj?.ja?.length>=7&&obj.en?.length>=12,'Prior-knowledge bridge missing a bilingual connection or limitation: '+item.id);
 }
}
assert.equal(covered.size,29,'Every chapter needs a verified connection to another knowledge domain');
assert.ok(bridges.bridges.some(x=>x.id==='conservative-state'&&x.chapters.includes('2-0')&&x.lab==='state-function-lab.html'),'Conservative force → enthalpy connection missing');
assert.ok(viewer.includes('chemistry-knowledge-bridges-v1.json')&&viewer.includes('appendBridges'),'Viewer does not load prior-knowledge bridges');
const lab=readFileSync(new URL('../state-function-lab.html',import.meta.url),'utf8');
assert.ok(lab.includes('workA')&&lab.includes('workB')&&lab.includes('distance'),'Path dependence must be explorable in mechanics and thermodynamics');
const labCode=lab.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(labCode,'Standalone lab script missing');
assert.doesNotThrow(()=>new Function(labCode),'Interactive lab JS must parse');
assert.doesNotThrow(()=>new Function(viewer),'Curriculum viewer JS must parse');
assert.ok(lab.includes('400+Wby')&&lab.includes('q+w'),'Energy balance must conserve ΔU under path changes');
assert.ok(lab.includes('H=U+PV'),'Keep state-property and work definitions distinct');
assert.ok(sw.includes('chemistry-knowledge-bridges-v1.json')&&sw.includes('state-function-lab.html'),'New learning connections must be cached offline');
const quizJS=html;
quizJS.forEach(s=>{
 assert.ok(s.includes("const status=$('feedback')"),'Quiz feedback should not reset the long explanation');
 assert.ok(!s.includes("catch{}select(id)"),'Re-render on quiz answer discards open sections and note drafts');
});
console.log('PASS: 11 prior-knowledge bridges, all 29 chapters, 34 detailed linked explanations, interactive state-function model.');

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
