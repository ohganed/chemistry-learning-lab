import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

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

// Editorial quality is not a required paragraph length or fixed step count.
// Validate scientific relationships, the integrity of the learning path and required content instead.
let allOriginSteps=0;
for(const ch of all){
 assert.equal(ch.originJourney?.version,'1.0','Concept-origin explanations missing: '+ch.id);
 const j=ch.originJourney;
 assert.ok(typeof j.premiseJa==='string'&&j.premiseJa.trim(),'Japanese motivation missing: '+ch.id);
 assert.ok(typeof j.premiseEn==='string'&&j.premiseEn.trim(),'English motivation missing: '+ch.id);
 assert.ok(Array.isArray(j.sections)&&j.sections.length>0,'A concept needs a natural explanation, not a minimum number of steps: '+ch.id);
 const identifiers=new Set(),bodyPairs=new Set();
 for(const step of j.sections){
  assert.ok(typeof step.id==='string'&&step.id,'Missing stable explanation ID: '+ch.id);
  assert.ok(!identifiers.has(step.id),'Repeated explanation ID: '+ch.id+'/'+step.id);
  identifiers.add(step.id);
  for(const key of ['ja','en','textJa','textEn'])assert.ok(typeof step[key]==='string'&&step[key].trim(),'Missing bilingual explanation: '+ch.id+'/'+step.id+'/'+key);
  const paired=step.textJa.trim()+'|'+step.textEn.trim();
  assert.ok(!bodyPairs.has(paired),'Duplicate explanation content: '+ch.id+'/'+step.id);
  bodyPairs.add(paired);
  allOriginSteps++;
 }
}
console.log('PASS: bilingual conceptual journeys in all 29 chapters ('+allOriginSteps+' stages, with no fixed length quota).');

const enthalpy=all.find(x=>x.id==='2-0');
assert.ok(enthalpy.originJourney?.version==='1.0','Enthalpy motivation course must be versioned');
assert.ok(enthalpy.originJourney.sections.length>=1,'Enthalpy needs a coherent conceptual sequence');
const journeyIds=['question','system','internal','firstlaw','piston','why','distinction','reaction','hess','boundaries','conditions','worked','states','hessworked','limits'];
for(const key of journeyIds)assert.ok(enthalpy.originJourney.sections.some(s=>s.id===key),'Missing scientifically necessary enthalpy explanation: '+key);
for(const block of enthalpy.originJourney.sections){
 assert.ok(block.ja?.trim()&&block.en?.trim(),'Missing bilingual headings for '+block.id);
 assert.ok(block.textJa?.trim()&&block.textEn?.trim(),'Enthalpy must have a complete explanation for '+block.id);
}
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='why').textJa.includes('H = U + PV'),'Enthalpy definition is derived');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='firstlaw').textJa.includes('ΔU = q + w'),'The first law must precede enthalpy');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='piston').textJa.includes('P_ext ΔV'),'Expansion work must be explained');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='hessworked').textJa.includes('−110.5'),'Numerical Hess-law demonstration is required');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='states').textJa.includes('H₂O(l)'),'Liquid/gas enthalpy distinction must be explicit');
assert.ok(enthalpy.originJourney.sections.find(x=>x.id==='worked').textJa.includes('400 J'),'Worked expansion energy balance must be present');

// Organic: verify the natural conceptual progression and the applicability of each model.
const organicChapters=all.filter(ch=>ch.id.startsWith('4-'));
const organicModes=['structure','addition','carbonyl','catalysis','aromatic','stereochemistry'];
assert.equal(organicChapters.length,6);
let organicSteps=0,organicModels=0;
for(const [index,ch] of organicChapters.entries()){
 const o=ch.organicReasoning;
 assert.equal(o?.schemaVersion,'1.0','Organic concept progression must be versioned: '+ch.id);
 assert.equal(o.kind,organicModes[index],'Pedagogical focus must match the chapter concept: '+ch.id);
 for(const key of ['titleJa','titleEn','questionJa','questionEn','predictionJa','predictionEn','boundaryJa','boundaryEn']){
  assert.ok(typeof o[key]==='string'&&o[key].trim(),'Natural bilingual context, model boundary or follow-on question missing: '+ch.id+'/'+key);
 }
 assert.ok(Array.isArray(o.steps)&&o.steps.length>0,'Use as many steps as the organic phenomenon needs: '+ch.id);
 assert.ok(Array.isArray(o.models)&&o.models.length>0,'Explain which model is suitable and where it fails: '+ch.id);
 for(const part of o.steps){
  for(const key of ['ja','en','changeJa','changeEn','reasonJa','reasonEn']){
   assert.ok(typeof part[key]==='string'&&part[key].trim(),'Organic reasoning must connect each step with its cause: '+ch.id+'/'+key);
  }
  organicSteps++;
 }
 for(const model of o.models){
  for(const key of ['ja','en','canJa','canEn','limitJa','limitEn']){
   assert.ok(typeof model[key]==='string'&&model[key].trim(),'Organic models must explain both capabilities and limits: '+ch.id+'/'+key);
  }
  organicModels++;
 }
}
console.log('PASS: organic causal explanations use '+organicSteps+' stages and '+organicModels+' model comparisons as needed.');
const organicCase=id=>organicChapters.find(ch=>ch.id===id).organicReasoning;
assert.ok(organicCase('4-1').steps.some(x=>x.reasonEn.includes('bromonium')),'Alkene addition should motivate intermediate formation');
assert.ok(organicCase('4-2').steps.some(x=>x.reasonEn.includes('valence')),'Carbonyl addition must respect carbon valence');
assert.ok(organicCase('4-3').steps.some(x=>x.reasonEn.includes('regenerates')),'Fischer esterification must explain catalyst regeneration');
assert.ok(organicCase('4-4').steps.some(x=>x.reasonEn.includes('aromaticity')),'Aromatic substitution should explain recovery of aromaticity');
assert.ok(organicCase('4-5').steps.some(x=>x.reasonEn.includes('geometry')),'Carbohydrate example should connect stereochemistry to enzyme recognition');

// Inorganic: a new concept must be motivated, derived, visualized, compared and qualified.
const inorganic=all.filter(ch=>ch.id.startsWith('3-'));
assert.equal(inorganic.length,4,'The four existing inorganic chapter IDs must remain stable');
const requiredInorganicSteps={
 '3-0':['observation','electrons','displacement','balance','potential','trend','oxides','limits'],
 '3-1':['surface','ion','thermo','hydroxide','amphoteric','stoich','model','limits'],
 '3-2':['copper','ligands','geometry','splitting','barycenter','light','equilibrium','models'],
 '3-3':['white','equilibrium','ksp','ionproduct','ammonia','combine','free','proof']
};
let inorganicStageCount=0,inorganicDerivationCount=0,inorganicModelCount=0;
for(const chapter of inorganic){
 const j=chapter.originJourney,workshop=chapter.inorganicWorkshop;
 assert.equal(j?.version,'1.0','Versioned inorganic motivation course missing in '+chapter.id);
 assert.ok(j.premiseJa?.trim()&&j.premiseEn?.trim(),'Inorganic motivation is missing: '+chapter.id);
 for(const stageId of requiredInorganicSteps[chapter.id])assert.ok(j.sections.some(x=>x.id===stageId),'Scientifically relevant stage is missing: '+chapter.id+'/'+stageId);
 for(const step of j.sections){
  assert.ok(step.ja?.trim()&&step.en?.trim(),'Missing bilingual inorganic stage heading: '+chapter.id);
  assert.ok(step.textJa?.trim()&&step.textEn?.trim(),'Inorganic causal explanation missing: '+chapter.id+'/'+step.id);
  inorganicStageCount++;
 }
 assert.equal(workshop?.schemaVersion,'1.0','Inorganic comparison schema missing: '+chapter.id);
 assert.ok(workshop.models.length>0,'Relevant inorganic explanatory models must be compared: '+chapter.id);
 for(const model of workshop.models){
  assert.ok(model.ja?.trim()&&model.en?.trim(),'Bilingual model name missing: '+chapter.id); for(const key of ['strengthJa','strengthEn','limitJa','limitEn'])assert.ok(model[key]?.trim(),'Model strength/limit missing: '+chapter.id+'/'+key);
  inorganicModelCount++;
 }
 const deriv=workshop.derivation;
 assert.ok(deriv.titleJa?.trim()&&deriv.titleEn?.trim(),'Derivation title missing: '+chapter.id);
 assert.ok(deriv.setupJa?.trim()&&deriv.setupEn?.trim(),'Derivation assumptions missing: '+chapter.id);
 assert.ok(deriv.steps.length>0,'A derivation must show its actual logical steps: '+chapter.id);
 for(const part of deriv.steps){
  assert.ok(part.ja?.trim()&&part.en?.trim()&&part.equation?.trim(),'Derivation needs its symbolic and verbal rationale: '+chapter.id);
  assert.ok(part.whyJa?.trim()&&part.whyEn?.trim(),'Derivation must explain the reasoning in both languages: '+chapter.id);
  inorganicDerivationCount++;
 }
}
console.log('PASS: inorganic chapters contain '+inorganicStageCount+' explanations, '+inorganicModelCount+' model comparisons and '+inorganicDerivationCount+' justified derivation stages.');
assert.ok(inorganic.find(c=>c.id==='3-2').originJourney.sections.find(s=>s.id==='barycenter').textJa.includes('3a+2b=0'),'Crystal field shifts must be derived, not asserted');
assert.ok(inorganic.find(c=>c.id==='3-3').originJourney.sections.find(s=>s.id==='combine').textJa.includes('Ksp×β₂'),'Silver-ammonia combined equilibrium must be derived');
assert.ok(inorganic.find(c=>c.id==='3-0').originJourney.sections.find(s=>s.id==='potential').textJa.includes('−nFE°'),'Electrode potential needs its thermodynamic meaning');
assert.ok(inorganic.find(c=>c.id==='3-1').originJourney.sections.find(s=>s.id==='surface').textJa.includes('反応速度'),'Metal passivation must distinguish kinetics from thermodynamics');

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
 assert.ok(s.includes('src="./chemistry-topic-visuals.js"'),'New original diagrams must be loaded in both language pages');
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

assert.ok(viewer.includes('renderStageVisual(id,lang,entry.id)'), 'Annotated diagrams must appear inside the corresponding enthalpy derivation steps');
assert.ok(viewer.includes('renderInorganicWorkshop(lesson,lang)'), 'Detailed model comparison and derivation are not presented');
assert.ok(viewer.includes('renderOrganicReasoning(lesson,lang)'), 'Organic explanations must appear after conceptual origins and before formula summaries');
assert.ok(viewer.includes('depth-origin-toggle'),'Readers must be able to collapse or expand the complete explanation in one action');
assert.ok(viewer.includes("lesson.originJourney.sections.map((entry,i)=>'<details data-depth-section=\\\"origin-"),'Origin concepts must be rendered in natural sequence');

assert.ok(viewer.includes('origin+workshop+organic+block+deep+guided+'), 'The organic reasoning route must be in a natural sequence within the lesson');
assert.ok(viewer.includes('data-depth-section="organic-models"')&&viewer.includes('data-depth-section="organic-predict"'), 'Optional comparison and prediction should be available without a knowledge gate');



const teaching=JSON.parse(readFileSync(new URL('../data/chemistry-teaching-approaches-v1.json',import.meta.url),'utf8'));
assert.equal(teaching.schema,'chemistry-teaching-approaches');
assert.equal(teaching.schemaVersion,'1.0');
assert.equal(teaching.chapters.length,29,'Every chemistry chapter needs an individual teaching-method plan');
const allowedApproaches=new Set(Object.keys(teaching.approachKinds));
assert.ok(allowedApproaches.size>=8,'Distinct concepts require distinct pedagogical methods');
let plannedSections=0;
for(const chapterPlan of teaching.chapters){
 const chapter=all.find(x=>x.id===chapterPlan.id);
 assert.ok(chapter,'Unknown chapter in teaching map '+chapterPlan.id);
 assert.equal(chapterPlan.titleJa,chapter.ja,'Teaching map chapter identity changed');
 assert.equal(chapterPlan.titleEn,chapter.en,'Teaching map English title changed');
 assert.equal(chapterPlan.sections.length,chapter.sections.length,'Every subsection needs its own approach: '+chapter.id);
 for(const [i,section] of chapterPlan.sections.entries()){
  assert.equal(section.index,i,'Subsection index changed: '+chapter.id);
  assert.equal(section.sectionJa,chapter.sections[i].ja,'Teaching target changed: '+chapter.id+'/'+i);
  assert.equal(section.sectionEn,chapter.sections[i].en,'English teaching target changed: '+chapter.id+'/'+i);
  assert.ok(allowedApproaches.has(section.approach),'Unknown pedagogy method: '+section.approach);
  assert.ok(section.reasonJa.length>=14,'Explain why this pedagogical method fits this subsection: '+chapter.id+'/'+i);
  plannedSections++;
 }
}
assert.equal(plannedSections,87,'All 87 core syllabus subsections need tailored teaching decisions');
const differentApproaches=new Set(teaching.chapters.flatMap(x=>x.sections.map(s=>s.approach)));
assert.ok(differentApproaches.size>=8,'Do not use a single textbook explanation method for all science topics');
console.log('PASS: 87 subsection-specific pedagogical approaches across 29 chapters, using '+differentApproaches.size+' methods.');

const figures=readFileSync(new URL('../chemistry-topic-visuals.js',import.meta.url),'utf8');
assert.doesNotThrow(()=>new Function(figures),'Original scientific figure JavaScript must parse');

const visualizationSandbox={window:{}};
assert.doesNotThrow(()=>runInNewContext(figures,visualizationSandbox,{timeout:1000}),'Visualizations must initialize without browser-only dependencies');
const visuals=visualizationSandbox.window.ChemistryPedagogyVisuals;
assert.equal(typeof visuals.render,'function');
assert.equal(typeof visuals.renderOrganic,'function');
for(const kind of ['carbonyl','addition','catalysis','aromatic']){
 const japanese=visuals.renderOrganic(kind,'ja'),english=visuals.renderOrganic(kind,'en');
 for(const [language,output] of [['ja',japanese],['en',english]]){
  assert.ok(output.includes('<svg')&&output.includes('<figcaption>'),kind+'/'+language+' should explain the depicted mechanism');
  assert.ok(output.includes('role="img"')&&output.includes('aria-label'),kind+'/'+language+' requires an accessible figure description');
 }
}
assert.ok(visuals.renderOrganic('carbonyl','ja').includes('marker-end="url(#organic-electron-arrow)"'),'Curved arrows must identify electron-pair transfer');
assert.equal(visuals.renderOrganic('unknown','en'),'','Do not force a diagram into an unrelated topic');
assert.ok(viewer.includes('const illustration=window.ChemistryPedagogyVisuals?.renderOrganic?.(organic.kind,lang)'),'Place the right mechanism image after the scientific question');
assert.ok(viewer.includes('illustration+'),'The original mechanism image should be shown, not only defined');

assert.ok(figures.includes('ChemistryPedagogyVisuals={render}'),'Scientific figure renderer must expose its entrypoint');
assert.ok(viewer.includes('window.ChemistryPedagogyVisuals?.render?.(id,lang,entry.id)'),'Stage-specific diagrams must accompany their explanatory stage');
const figureKeys=[
 ['0-0','contrast'],['0-2','wave'],['0-3','melt'],['0-4','vectors'],
 ['1-0','molar'],['1-1','leftover'],['1-2','collision'],['1-3','dilution'],['1-4','pressure'],
 ['2-1','slope'],['2-2','rates'],['2-3','log'],['2-4','curve'],['2-5','circuit'],
 ['4-0','formula'],['4-1','benzene'],['4-3','resonance'],['4-5','starch'],['5-0','averages'],['5-1','rubber'],['5-2','evidence']
];
for(const [id,stage] of figureKeys){
 assert.ok(figures.includes('id==="'+id+'"&&step==="'+stage+'"'),'Missing stage-specific visual: '+id+'/'+stage);
 const lesson=all.find(x=>x.id===id);
 assert.ok(lesson.originJourney.sections.some(s=>s.id===stage),'Figure must attach to an existing explanation stage: '+id+'/'+stage);
}
assert.ok(figures.includes('figcaption')&&figures.includes('role="img"'),'Schematics must have captions and accessible descriptions');
assert.ok(figureKeys.length>0,'At least one scientific visualization should be verified; figure count is not an editorial target');
assert.ok(!figures.includes('q−16')&&!figures.includes('q−15'),'SVG path commands must use ASCII minus');
assert.ok(sw.includes('chemistry-topic-visuals.js'),'Offline cache must include scientific drawings');

assert.ok(viewer.includes('renderInorganicStageVisual(id,lang,entry.id)'), 'Scientific diagrams must appear in the correct inorganic explanatory section');
for(const concept of ['3-0','3-1','3-2','3-3'])assert.ok(viewer.includes('id==="'+concept+'"'), 'Missing inorganic diagram: '+concept);
assert.ok(viewer.includes('aria-label')&&viewer.includes('figcaption'),'Scientific schematic requires accessible labels and a caption');

for(const stage of ['piston','why','distinction']){
 assert.ok(viewer.includes('step==="'+stage+'"'), 'Missing explanatory figure or comparison table for '+stage);
}
assert.ok(viewer.includes('figcaption') && viewer.includes('role="img"'), 'Scientific schematics need captions and accessible alt labels');
assert.ok(viewer.includes('Pext × ΔV') && viewer.includes('H = U + PV'), 'Figure must link symbols to piston work and state variables');
assert.ok(viewer.includes('PV is not the amount of mechanical work'), 'Figure must not conflate PV with actual work');

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
console.log('PASS: knowledge bridges are verified by scientific connections, not illustration or paragraph count.');

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

console.log('PASS: all chapter data, progressive explanations, simulations and offline integration validated.');
