import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const html=readFileSync(new URL("../electron-flow-foundations.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../electron-flow-foundations.js",import.meta.url),"utf8");
const viewer=readFileSync(new URL("../chemistry-depth-viewer.js",import.meta.url),"utf8");
const jaCourse=readFileSync(new URL("../high-school-chemistry.html",import.meta.url),"utf8");
const enCourse=readFileSync(new URL("../high-school-chemistry-en.html",import.meta.url),"utf8");
const homepage=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

assert.doesNotThrow(()=>new Function(js),"Electron-flow curriculum JavaScript must parse");
assert.ok(html.includes("width=device-width")&&html.includes("@media(max-width:800px)"),"The independent lesson must adapt to mobile screens");
assert.ok(html.includes('src="./electron-flow-foundations.js"'),"The independent page must load its actual curriculum");
assert.ok(html.includes('aria-live="polite"')&&html.includes('role="status"'),"Optional practice needs accessible feedback");
assert.ok(html.includes('id="lessons"')&&html.includes('id="reactionDiagram"')&&html.includes('id="toc"'),"The independent chapter must have its reading and visualization mounts");
assert.ok(html.includes("prefers-reduced-motion"),"Reading should respect reduced-motion settings");
assert.ok(jaCourse.includes('href="./electron-flow-foundations.html"'),"Japanese course must link to the foundational chapter");
assert.ok(enCourse.includes('href="./electron-flow-foundations.html?lang=en"'),"English course must link to the English foundation");
assert.ok(homepage.includes('href="./electron-flow-foundations.html"'),"Home navigation must expose this new chapter");
assert.ok(viewer.includes('const primerLink="./electron-flow-foundations.html"'),"Existing organic reaction mechanisms must connect to the foundation");
for(const target of ["lewis","donor","carbonyl","proton","resonance","electrons"]){
 assert.ok(viewer.includes('"'+target+'"'),"Organic lessons must deep-link to their relevant prerequisite: "+target);
}
assert.ok(sw.includes("./electron-flow-foundations.html")&&sw.includes("./electron-flow-foundations.js"),"The independent lesson must be offline-cacheable");

function simulate(lang){
 const elements=new Map();
 function make(id){
  if(elements.has(id))return elements.get(id);
  const n={id,innerHTML:"",textContent:"",href:"",hidden:false,disabled:false,
   dataset:{},listeners:{},
   addEventListener(kind,fn){this.listeners[kind]=fn},
   querySelectorAll(){return []},
   scrollIntoView(){}
  };
  elements.set(id,n);
  return n;
 }
 const context={
  URLSearchParams,location:{search:lang==="en"?"?lang=en":"",hash:""},
  document:{documentElement:{lang:"ja"},getElementById:make,title:""},
  window:{},requestAnimationFrame:fn=>fn()
 };
 runInNewContext(js,context,{timeout:2000});
 const root=context.window.ElectronFlowFoundations;
 assert.equal(root.locale,lang,"Language query parameter must select the display language");
 assert.ok(Array.isArray(root.curriculum.lessons));
 assert.ok(Array.isArray(root.curriculum.cases));
 assert.equal(new Set(root.curriculum.lessons.map(x=>x.id)).size,root.curriculum.lessons.length,"Repeated lesson IDs");
 const ids=new Set(root.curriculum.lessons.map(x=>x.id));
 for(const required of ["why","electrons","lewis","charge","donor","arrows","checks","proton","substitution","carbonyl","resonance","evidence"]){
  assert.ok(ids.has(required),"Missing scientific foundation: "+required);
 }
 for(const lesson of root.curriculum.lessons){
  for(const l of ["ja","en"]){
   assert.ok(lesson.title[l]?.trim()&&lesson.question[l]?.trim()&&lesson.limit[l]?.trim(),"Bilingual lesson fields missing: "+lesson.id);
   assert.ok(lesson.body[l]?.length>0&&lesson.body[l].every(p=>p.trim()),"Each explanation must have meaningful content: "+lesson.id+"/"+l);
  }
  assert.ok(lesson.formula?.trim(),"The illustration needs a scientific relation or formula: "+lesson.id);
  assert.ok(make("lessons").innerHTML.includes('id="'+lesson.id+'"'),"All lessons must render: "+lesson.id+"/"+lang);
  assert.ok(make("toc").innerHTML.includes('href="#'+lesson.id+'"'),"Every lesson must have a direct-access TOC link: "+lesson.id);
 }
 const cases=root.curriculum.cases;
 for(const id of ["acid","sub","carbonyl"])assert.ok(cases.some(x=>x.id===id),"Missing practical arrow case: "+id);
 for(const c of cases){
  assert.ok(c.steps.length>0,"Reasoning step count is determined by the mechanism, not by a hard-coded quota: "+c.id);
  for(const l of ["ja","en"]){
   assert.ok(c.title[l]&&c.prompt[l]&&c.boundary[l]&&c.quiz.question[l]&&c.quiz.why[l],"Interactive case missing bilingual explanation: "+c.id+"/"+l);
   assert.ok(c.quiz.choices[l].every(x=>x.trim()),"Practice choices missing: "+c.id+"/"+l);
  }
  assert.ok(c.quiz.answer>=0&&c.quiz.answer<c.quiz.choices.ja.length&&c.quiz.choices.ja.length===c.quiz.choices.en.length,"Practice answers must align bilingually: "+c.id);
  for(const step of c.steps){
   for(const l of ["ja","en"])assert.ok(step.title[l]?.trim()&&step.reason[l]?.trim(),"Each mechanism stage must explain why: "+c.id+"/"+l);
  }
 }
 const diagram=make("reactionDiagram").innerHTML;
 assert.ok(diagram.includes('<svg')&&diagram.includes('role="img"')&&diagram.includes('aria-label'),"The electron-pair model must have a readable accessible SVG");
 assert.ok(make("caseTitle").textContent.includes(lang==="ja"?"カルボニル":"Carbonyl")||make("caseTitle").textContent.includes(lang==="en"?"carbonyl":"求核"),"The carbonyl model is the initially selected worked example");
 // Click the real Next handler (the same callback used by the DOM button).
 const next=make("nextStep");
 assert.equal(typeof next.listeners.click,"function","Interactive stages must have a working Next button");
 next.listeners.click();
 const after=make("reactionDiagram").innerHTML;
 assert.ok(after.includes('marker-end="url(#curved-pair-arrow)"'),"The next stage must reveal electron-pair arrows");
 assert.ok((after.match(/marker-end="url\(#curved-pair-arrow\)"/g)||[]).length>=2,"Carbonyl addition requires both electron-pair arrows");
 assert.ok(lang==="ja"?make("stepReason").textContent.includes("価数"):/valence|overbonded|bond count/i.test(make("stepReason").textContent),"The second stage should explain how electron-pair relocation preserves appropriate carbon bonding");
 assert.ok(make("questionArea").innerHTML.includes('data-answer="0"'),"Optional questions must render");
 assert.ok(make("connections").innerHTML.includes("#chapter=4-2"),"Return paths to the prior carbonyl topic must exist");
 assert.equal(make("backToCourse").href,"./high-school-chemistry"+(lang==="en"?"-en":"")+".html#chapter=4-2","Language-aware return path must be preserved");
 return {lessons:root.curriculum.lessons.length,cases:cases.length};
}
const ja=simulate("ja"),en=simulate("en");
assert.deepEqual(ja,en,"Both languages must provide the same learning structure");
assert.ok(js.includes("Electron-pair")||js.includes("electron-pair")||js.includes("electron pair"),"Explicitly identify which entities the arrows track");
assert.ok(js.includes("total electric charge")||js.includes("total charge"),"Charge conservation must be taught");
assert.ok(!js.includes("localStorage.setItem"),"This independent chapter should not modify any existing progress history");
console.log("PASS: original electron-flow chapter, "+ja.lessons+" bilingual concept explanations, "+ja.cases+" interactive mechanisms, working next-step arrows, links, mobile layout and offline integration.");
