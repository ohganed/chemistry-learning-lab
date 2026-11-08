import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const html=readFileSync(new URL("../electron-flow-foundations.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../electron-flow-foundations.js",import.meta.url),"utf8");
const figures=readFileSync(new URL("../electron-flow-figures.js",import.meta.url),"utf8");
const viewer=readFileSync(new URL("../chemistry-depth-viewer.js",import.meta.url),"utf8");
const jaCourse=readFileSync(new URL("../high-school-chemistry.html",import.meta.url),"utf8");
const enCourse=readFileSync(new URL("../high-school-chemistry-en.html",import.meta.url),"utf8");
const homepage=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");

assert.doesNotThrow(()=>new Function(js),"Electron-flow curriculum JavaScript must parse");
assert.doesNotThrow(()=>new Function(figures),"Inline scientific diagrams must parse");
const figureSandbox={window:{}};
assert.doesNotThrow(()=>runInNewContext(figures,figureSandbox,{timeout:1000}),"Inline figure module must initialize");
const scienceFigures=figureSandbox.window.ElectronFlowFigures;
const requiredFigures=["firstlook","atom","bondbegin","sharing","symbols","rearrange","why","electrons","lewis","charge","donor","arrows","checks","proton","substitution","carbonyl","resonance","evidence"];
assert.deepEqual(Array.from(scienceFigures.topics),requiredFigures,"One original scientific diagram is needed for each concept");
for(const topic of requiredFigures){
 for(const lang of ["ja","en"]){
  const svg=scienceFigures.render(topic,lang);
  assert.ok(svg.includes('<figure class="concept-figure"')&&svg.includes('<svg')&&svg.includes('<figcaption>'),"Each section requires an actual inline figure: "+topic+"/"+lang);
  assert.ok(svg.includes('viewBox="0 0 360 345"')&&svg.includes('role="img"')&&svg.includes('aria-label'),"Figures must have portrait legibility and a meaningful accessible description: "+topic+"/"+lang);
 }
}
for(const topic of ["donor","proton","substitution","carbonyl"]){
 const svg=scienceFigures.render(topic,"ja");
 assert.ok(svg.includes('marker-end="url(#ef-curve-'+topic+')"'),"Electron-pair curves must be drawn in the relevant science topic: "+topic);
}
assert.equal(scienceFigures.render("unknown","ja"),"","Do not substitute unrelated graphics for scientific explanations");

assert.ok(html.includes("width=device-width")&&html.includes("@media(max-width:800px)"),"The independent lesson must adapt to mobile screens");
assert.ok(html.includes('src="./electron-flow-foundations.js"'),"The independent page must load its actual curriculum");
assert.ok(html.includes('src="./electron-flow-figures.js"'),"The visual module must be loaded before the lesson engine");
assert.ok(html.indexOf('src="./electron-flow-figures.js"')<html.indexOf('src="./electron-flow-foundations.js"'),"Diagrams must be available before the lesson is rendered");
assert.ok(html.includes(".concept-figure svg")&&html.includes("max-width:470px"),"Lesson SVGs must fit the mobile portrait layout");
assert.ok(html.includes("figure-guide")&&html.includes('id="chapterMenu"'),"Every beginner concept should have a figure explanation and a compact table of contents");
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
assert.ok(sw.includes("./electron-flow-figures.js"),"Scientific diagrams must remain available offline");

function simulate(lang){
 const elements=new Map();
 function make(id){
  if(elements.has(id))return elements.get(id);
  const n={id,_html:"",_buttons:[],textContent:"",href:"",hidden:false,disabled:false,
   dataset:{},listeners:{},
   get innerHTML(){return this._html},
   set innerHTML(content){
    this._html=String(content);
    this._buttons=Array.from(this._html.matchAll(/data-(case|answer)="([^"]+)"/g),match=>{
     const button={dataset:{[match[1]]:match[2]},listeners:{},classList:{toggle(){}},
       addEventListener(kind,fn){this.listeners[kind]=fn}};
     return button;
    });
   },
   addEventListener(kind,fn){this.listeners[kind]=fn},
   querySelectorAll(selector){return selector==="button"?this._buttons:[]},
   scrollIntoView(){}
  };
  elements.set(id,n);
  return n;
 }
 const context={
  URLSearchParams,location:{search:lang==="en"?"?lang=en":"",hash:""},
  document:{documentElement:{lang:"ja"},getElementById:make,title:""},
  window:{ElectronFlowFigures:scienceFigures,matchMedia:()=>({matches:true})},requestAnimationFrame:fn=>fn()
 };
 runInNewContext(js,context,{timeout:2000});
 const root=context.window.ElectronFlowFoundations;
 assert.equal(root.locale,lang,"Language query parameter must select the display language");
 assert.ok(Array.isArray(root.curriculum.lessons));
 assert.ok(Array.isArray(root.curriculum.cases));
 assert.equal(new Set(root.curriculum.lessons.map(x=>x.id)).size,root.curriculum.lessons.length,"Repeated lesson IDs");
 const ids=new Set(root.curriculum.lessons.map(x=>x.id));
 const introductory=["firstlook","atom","bondbegin","sharing","symbols","rearrange"];
 assert.deepEqual(Array.from(root.curriculum.lessons.slice(0,introductory.length).map(x=>x.id)),introductory,"Begin with atoms, bonds and accessible symbols before using organic reaction notation");
 assert.ok(root.curriculum.lessons.findIndex(x=>x.id==="donor")>introductory.length,"Nucleophile and electrophile terminology should not appear before prerequisite concepts");
 assert.equal(make("chapterMenu").open,false,"On a narrow phone, the longer chapter contents should start collapsed");
 assert.ok(make("heroLead").textContent.includes(lang==="ja"?"原子って何":"What is an atom"),"The first explanation should genuinely welcome beginners");

 for(const required of ["why","electrons","lewis","charge","donor","arrows","checks","proton","substitution","carbonyl","resonance","evidence"]){
  assert.ok(ids.has(required),"Missing scientific foundation: "+required);
 }
 for(const lesson of root.curriculum.lessons){
  for(const l of ["ja","en"]){
   assert.ok(lesson.title[l]?.trim()&&lesson.question[l]?.trim()&&lesson.limit[l]?.trim(),"Bilingual lesson fields missing: "+lesson.id);
   assert.ok(lesson.body[l]?.length>0&&lesson.body[l].every(p=>p.trim()),"Each explanation must have meaningful content: "+lesson.id+"/"+l);
   assert.ok(Array.isArray(lesson.guide?.[l])&&lesson.guide[l].length>0,"Every diagram needs a step-by-step reading guide: "+lesson.id+"/"+l);

  }
  assert.ok(lesson.formula?.trim(),"The illustration needs a scientific relation or formula: "+lesson.id);
  assert.ok(make("lessons").innerHTML.includes('id="'+lesson.id+'"'),"All lessons must render: "+lesson.id+"/"+lang);
  assert.ok(make("lessons").innerHTML.includes('data-concept-figure="'+lesson.id+'"'),"An actual explanatory diagram must render in every section: "+lesson.id+"/"+lang);
  assert.ok(make("lessons").innerHTML.includes('<div class="figure-guide">'),"Diagram guidance must render alongside the figure");

  const segment=make("lessons").innerHTML.split('id="'+lesson.id+'"')[1]?.split('</article>')[0]||"";
  assert.ok(segment.indexOf('class="question"')>=0&&segment.indexOf('class="concept-figure"')>segment.indexOf('class="question"'),"Scientific illustration must immediately follow the concept question: "+lesson.id+"/"+lang);
  const figureEnd=segment.indexOf('</figure>');
  assert.ok(segment.indexOf('<div class="figure-guide">')>figureEnd,"The figure should be interpreted immediately, before introducing additional terms: "+lesson.id+"/"+lang);

  assert.ok(figureEnd>=0&&segment.indexOf('<p>',figureEnd)>figureEnd,"Explanatory paragraphs should follow the diagram rather than burying it at the end: "+lesson.id+"/"+lang);
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
 assert.ok(make("caseTitle").textContent.includes(lang==="ja"?"水素":"hydrogen"),"The first interactive example must use only atoms and electrons before curved-arrow mechanisms");
 // Click the actual Next button to reveal shared pairs before using advanced reaction symbols.
 const next=make("nextStep");
 assert.equal(typeof next.listeners.click,"function","Interactive stages must have a working Next button");
 next.listeners.click();
 assert.ok(make("reactionDiagram").innerHTML.includes("H:H"),"The next step should show two electrons as one shared bonding pair");
 next.listeners.click();
 assert.ok(make("reactionDiagram").innerHTML.includes("H–H"),"The next step should replace a pair of dots with a bond line");
 assert.ok(!make("reactionDiagram").innerHTML.includes('marker-end="url(#curved-pair-arrow)"'),"Do not misrepresent two radical H atoms using a two-electron curved mechanism arrow");
 // Select the carbonyl case using the same click callback that the user triggers.
 const carbonylButton=make("caseButtons").querySelectorAll("button").find(button=>button.dataset.case==="carbonyl");
 assert.ok(carbonylButton&&typeof carbonylButton.listeners.click==="function","Interactive case switching must be wired");
 carbonylButton.listeners.click();
 next.listeners.click();
 const after=make("reactionDiagram").innerHTML;
 assert.ok(after.includes('marker-end="url(#curved-pair-arrow)"'),"Carbonyl addition should reveal curved electron-pair arrows");
 assert.ok((after.match(/marker-end="url\(#curved-pair-arrow\)"/g)||[]).length>=2,"Carbonyl addition requires both electron-pair arrows");
 assert.ok(lang==="ja"?make("stepReason").textContent.includes("価数"):/valence|overbonded|bond count/i.test(make("stepReason").textContent),"The second stage should explain how electron-pair relocation preserves appropriate carbon bonding");
 assert.ok(make("questionArea").innerHTML.includes('data-answer="0"'),"Optional questions must render");
 const answer=make("questionArea").querySelectorAll("button").find(button=>button.dataset.answer==="0");
 assert.ok(answer&&typeof answer.listeners.click==="function","Optional question must be interactive");
 answer.listeners.click();
 assert.equal(make("answerFeedback").hidden,false,"Selecting an answer must reveal an explanation without blocking progression");

 assert.ok(make("connections").innerHTML.includes("#chapter=4-2"),"Return paths to the prior carbonyl topic must exist");
 assert.equal(make("backToCourse").href,"./high-school-chemistry"+(lang==="en"?"-en":"")+".html#chapter=4-2","Language-aware return path must be preserved");
 return {lessons:root.curriculum.lessons.length,cases:cases.length};
}
const ja=simulate("ja"),en=simulate("en");
assert.deepEqual(ja,en,"Both languages must provide the same learning structure");
assert.ok(js.includes("Electron-pair")||js.includes("electron-pair")||js.includes("electron pair"),"Explicitly identify which entities the arrows track");
assert.ok(js.includes("total electric charge")||js.includes("total charge"),"Charge conservation must be taught");
assert.ok(!js.includes("localStorage.setItem"),"This independent chapter should not modify any existing progress history");
assert.ok(scienceFigures.render("sharing","ja").includes("H:H"),"The first bonding visual should connect two electron dots to one bond line");
assert.ok(scienceFigures.render("atom","ja").includes("ef-cloud"),"First principles should avoid pretending electrons follow a fixed circular trajectory");
assert.ok(scienceFigures.render("bondbegin","ja").includes("安定な結合"),"Bond energy should be explained using the physical situation rather than a memorized slogan");

assert.ok(js.includes("window.ElectronFlowFigures?.render?.(x.id,lang)"),"A diagram must be embedded in the lesson prose, not hidden at the end in a separate playground");
console.log("PASS: original electron-flow chapter, "+ja.lessons+" bilingual concept explanations, "+ja.cases+" interactive mechanisms, working next-step arrows, links, mobile layout and offline integration.");
