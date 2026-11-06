/* Chemistry Structure Lab bilingual depth viewer v1.0.
   Read-only curriculum data; reflection notes remain local and optional. */
(function(){
"use strict";
const CACHE=new Map(), KEY="chemistry-depth-reflections-v1";
let extensionsPromise=null;
function loadExtensions(){if(!extensionsPromise)extensionsPromise=fetch("./data/chemistry-depth-extensions-v1.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(data.schema!=="chemistry-depth-extensions"||data.schemaVersion!=="1.0"||!Array.isArray(data.topics))throw Error("Invalid extension curriculum");return data.topics}).catch(e=>{extensionsPromise=null;throw e});return extensionsPromise}
const COPY={
 ja:{heading:"詳しく学ぶ",subtitle:"順番は自由です。最初の節だけを開き、必要に応じて続きを読めます。",loading:"詳しい解説を読み込み中…",failed:"解説データを読み込めませんでした。接続をご確認いただくか、もう一度お試しください。",reopen:"再読み込み",example:"例題：自分で考える",showSolution:"解き方を見る",pitfall:"誤解しやすい点",bridge:"知識のつながり・後からの再解釈",inquiry:"自分で問いを立てる",note:"考えが変わったことや新しい疑問（記録は任意）",save:"気づきを保存",saved:"端末内に記録しました。",failedSave:"保存できませんでした。ブラウザの保存領域を確認してください。",previous:"以前の気づき",delete:"削除",draft:"詳細教材（編集初稿）",entryConcept:"原理から読む",entryExample:"例題から読む",entryBridge:"つながりから読む",entryReasoning:"徹底解説を読む",entryGuided:"計算を一歩ずつ",guidedTitle:"解法の思考を一段ずつ確認する",guidedStep:"考える手順",reasoningTitle:"なぜそうなる？ 5つの視点で徹底解説",reasoningIntro:"説明は順番に読む必要はありません。知りたい視点から読んで、学んだ後に戻ってきてください。",lenses:["まず現象を観察する","原子・分子の動きで説明する","式・モデルで考える","どんな条件で成り立つか","新しい知識から読み直す"],extensions:"発展・横断：他の分野から読み直す",extensionReason:"ここでつながる知識",extensionQuestion:"考えてみる"},
 en:{heading:"Study in depth",subtitle:"There is no required order. Expand each section as needed; the first is open by default.",loading:"Loading extended explanations…",failed:"Could not load the extended lesson. Check your connection or try again.",reopen:"Retry",example:"Worked example: think first",showSolution:"Reveal a worked solution",pitfall:"Common misconception",bridge:"Connection and later reinterpretation",inquiry:"Investigate further",note:"An observation, changed idea or open question (optional)",save:"Save reflection",saved:"Saved on this device.",failedSave:"Unable to save to device storage.",previous:"Earlier reflections",delete:"Delete",draft:"Expanded curriculum (editorial draft)",entryConcept:"Start with principles",entryExample:"Start with an example",entryBridge:"Start with connections",entryReasoning:"Explore why",entryGuided:"Guided calculation",guidedTitle:"Reason through a problem, one step at a time",guidedStep:"Reasoning step",reasoningTitle:"Why? Five connected perspectives",reasoningIntro:"No required reading order. Explore the perspective that matters, and return when another topic changes your understanding.",lenses:["Observe the phenomenon","Explain the particles","Build the mathematical or conceptual model","Check assumptions and limits","Revisit after learning something new"],extensions:"Further connections and advanced perspectives",extensionReason:"Why this connection matters",extensionQuestion:"Think about it"}
};
const escapeHTML=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeRead=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a.filter(n=>n&&typeof n==="object"&&typeof n.chapter==="string"&&typeof n.note==="string"&&n.note.length<=1200).slice(-500):[]}catch{return []}};
let records=safeRead();
function styles(){if(document.getElementById("chemistryDepthStyle"))return;const style=document.createElement("style");style.id="chemistryDepthStyle";style.textContent=`
.depth-area{border-top:2px solid #d5e7da;margin:24px 0;padding-top:16px}
.depth-area .depth-caption{font-size:13px;color:#587468}
.depth-reasoning-intro{color:#516d61;font-size:14px;line-height:1.8}
.depth-lens{padding:11px 7px;border-bottom:1px solid #e5eee8}
.depth-lens:last-child{border-bottom:0}
.depth-lens h4{font-size:15px;color:#176757;margin:0 0 9px}
.depth-lens h4>span{display:inline-block;border:1px solid #a7d1b7;border-radius:50%;width:25px;height:25px;text-align:center;line-height:23px;margin-right:8px}
.depth-lens p{white-space:pre-line;line-height:1.95;margin:0;color:#263e36}
.depth-deep{background:#f6fbf7!important;border-color:#bddcc8!important}
.depth-guided{background:#fafcf7!important;border-color:#d7e4c8!important}
.depth-guided .depth-problem{font-weight:700;line-height:1.9;padding:11px 12px;background:#f0f5e9;border-radius:8px}
.depth-guided .depth-step{margin:8px 1px}
.depth-guided .depth-step summary{font-weight:700;font-size:14px}
.depth-guided .depth-step p{line-height:1.95;margin:10px 4px 16px}
.depth-guided .depth-step:last-child{margin-bottom:15px}
.depth-deep>summary{color:#12674d!important}
.depth-deep .depth-reasoning-intro{margin:4px 5px 12px}
.depth-routes{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 15px}
.depth-routes button{flex:1;min-width:100px;background:#edf7f0;border:1px solid #91bda5;padding:9px 10px;font-size:13px;font-weight:800;color:#176451}
.depth-routes button:focus-visible{outline:3px solid #6aa69b}
.depth-area details{border:1px solid #d5e7df;border-radius:12px;margin:9px 0;background:#fcfefd;padding:0 13px}
.depth-area summary{font-weight:800;color:#174f4a;cursor:pointer;padding:14px 5px;line-height:1.55;min-height:48px}
.depth-area summary:focus-visible{outline:3px solid #6aa69b;outline-offset:2px}
.depth-area details[open]>summary{border-bottom:1px solid #e0ece4;margin-bottom:9px}
.depth-area .depth-text{white-space:pre-line;margin:9px 5px 17px;line-height:1.9}
.depth-area .depth-box{background:#f0f7f2;border-left:4px solid #4b9b7f;padding:13px 15px;border-radius:10px;margin:11px 0}
.depth-area .depth-hint{font-size:13px;color:#5a786d}
.depth-area textarea{display:block;width:100%;min-height:78px;border:1px solid #b2cbbd;border-radius:10px;padding:12px;font:inherit;resize:vertical}
.depth-area button{min-height:42px;cursor:pointer;margin:6px 0}
.depth-area .depth-log{margin-top:10px;padding:10px 13px;border:1px solid #dbe9df;border-radius:10px}
.depth-area .depth-log small{display:block;color:#6c7f72}
@media(max-width:730px){.depth-area{margin:16px 0}.depth-area details{margin:7px 0;padding:0 10px}.depth-area summary{font-size:15px}.depth-area .depth-text{font-size:15px;line-height:1.85}.depth-area button{min-height:46px}}
`;document.head.appendChild(style)}
async function groupData(group){
 if(!CACHE.has(group))CACHE.set(group,fetch("./data/chemistry-depth-"+group+".json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(v=>{if(v.schema!=="chemistry-depth-textbook"||v.schemaVersion!=="1.0"||String(v.group)!==group||!Array.isArray(v.chapters))throw Error("Invalid depth curriculum");return v}).catch(error=>{CACHE.delete(group);throw error}));
 return CACHE.get(group);
}
function renderLogs(mount,id,lang){
 const t=COPY[lang],out=mount.querySelector(".depth-logs");if(!out)return;
 const notes=records.filter(x=>x.chapter===id).slice().reverse();
 out.innerHTML=notes.length?'<h4>'+t.previous+'</h4>'+notes.map(n=>'<div class="depth-log"><small>'+escapeHTML((n.date||"").slice(0,10))+'</small><p>'+escapeHTML(n.note)+'</p><button type="button" data-depth-delete="'+escapeHTML(n.id)+'">'+t.delete+'</button></div>').join(""):"";
 out.querySelectorAll("[data-depth-delete]").forEach(b=>b.addEventListener("click",()=>{const next=records.filter(n=>n.id!==b.dataset.depthDelete);try{localStorage.setItem(KEY,JSON.stringify(next));records=next;renderLogs(mount,id,lang)}catch{const status=mount.querySelector(".depth-status");if(status)status.textContent=t.failedSave}}));
}
function appendExtensions(host,id,lang,topics){
 if(!host.isConnected||host.dataset.chapter!==id)return;
 const selected=topics.filter(x=>Array.isArray(x.chapters)&&x.chapters.includes(id));
 if(!selected.length)return;
 const t=COPY[lang],key=lang==="ja"?"ja":"en",body=lang==="ja"?"bodyJa":"bodyEn",reason=lang==="ja"?"reasonJa":"reasonEn",question=lang==="ja"?"questionJa":"questionEn";
 const container=host.querySelector(".depth-area");
 if(!container)return;
 const section=document.createElement("section");section.className="depth-extensions";
 section.innerHTML='<h3>'+escapeHTML(t.extensions)+'</h3>'+selected.map(item=>'<details><summary>'+escapeHTML(item[key])+'</summary><p class="depth-text">'+escapeHTML(item[body])+'</p><h4>'+escapeHTML(t.extensionReason)+'</h4><p class="depth-text">'+escapeHTML(item[reason])+'</p><div class="depth-box"><strong>'+escapeHTML(t.extensionQuestion)+'</strong><p>'+escapeHTML(item[question])+'</p></div></details>').join("");
 container.appendChild(section);
}
function renderLesson(host,id,lang,lesson){
 if(!host.isConnected||host.dataset.chapter!==id)return;
 styles();const t=COPY[lang];
 const title=lang==="ja"?"ja":"en",body=lang==="ja"?"textJa":"textEn",sol=lang==="ja"?"solutionJa":"solutionEn";
 const block=lesson.sections.map((section,i)=>'<details data-depth-section="concept-'+i+'" '+(i===0?"open":"")+'><summary>'+escapeHTML((i+1)+". "+section[title])+'</summary><p class="depth-text">'+escapeHTML(section[body])+'</p></details>').join("");
 const guided=lesson.guidedExample&&Array.isArray(lesson.guidedExample.steps)&&lesson.guidedExample.steps.length===5?
 '<details class="depth-guided" data-depth-section="guided"><summary>'+escapeHTML(t.guidedTitle)+'</summary><p class="depth-problem">'+escapeHTML(lesson.guidedExample[lang==="ja"?"titleJa":"titleEn"])+'</p>'+
 lesson.guidedExample.steps.map((step,i)=>'<details class="depth-step" '+(i===0?'open':'')+'><summary>'+escapeHTML(t.guidedStep)+" "+(i+1)+'</summary><p>'+escapeHTML(step[lang==="ja"?0:1])+'</p></details>').join("")+'</details>':"";
 const deep=lesson.reasoning&&Array.isArray(lesson.reasoning.lenses)&&lesson.reasoning.lenses.length===5?
 '<details class="depth-deep" data-depth-section="reasoning"><summary>'+escapeHTML(t.reasoningTitle)+'</summary><p class="depth-reasoning-intro">'+escapeHTML(t.reasoningIntro)+'</p>'+lesson.reasoning.lenses.map((lens,i)=>'<section class="depth-lens"><h4><span>'+String(i+1)+'</span>'+escapeHTML(t.lenses[i])+'</h4><p>'+escapeHTML(lens[lang==="ja"?"ja":"en"])+'</p></section>').join("")+'</details>':"";
 host.innerHTML='<section class="depth-area" aria-label="'+escapeHTML(t.heading)+'"><h3>'+escapeHTML(t.heading)+'</h3><p class="depth-caption">'+escapeHTML(t.subtitle)+'</p><p class="depth-hint">'+escapeHTML(t.draft)+'</p>'+
 '<div class="depth-routes" role="group" aria-label="Learning entry points"><button type="button" data-depth-open="concept-0">'+escapeHTML(t.entryConcept)+'</button><button type="button" data-depth-open="reasoning">'+escapeHTML(t.entryReasoning)+'</button>'+(guided?'<button type="button" data-depth-open="guided">'+escapeHTML(t.entryGuided)+'</button>':'')+'<button type="button" data-depth-open="example">'+escapeHTML(t.entryExample)+'</button><button type="button" data-depth-open="bridge">'+escapeHTML(t.entryBridge)+'</button></div>'+
 block+deep+guided+
 '<details data-depth-section="example"><summary>'+escapeHTML(t.example)+'</summary><p class="depth-text">'+escapeHTML(lesson.example[title])+'</p><details><summary>'+escapeHTML(t.showSolution)+'</summary><p class="depth-text">'+escapeHTML(lesson.example[sol])+'</p></details></details>'+
 '<details><summary>'+escapeHTML(t.pitfall)+'</summary><p class="depth-text">'+escapeHTML(lesson.pitfall[title])+'</p></details>'+
 '<details data-depth-section="bridge"><summary>'+escapeHTML(t.bridge)+'</summary><p class="depth-text">'+escapeHTML(lesson.bridge[title])+'</p></details>'+
 '<details><summary>'+escapeHTML(t.inquiry)+'</summary><p class="depth-text">'+escapeHTML(lesson.inquiry[title])+'</p><label for="depthNote" class="depth-hint">'+escapeHTML(t.note)+'</label><textarea id="depthNote" maxlength="1200"></textarea><button type="button" class="depth-save">'+escapeHTML(t.save)+'</button><p class="depth-status" role="status"></p><div class="depth-logs"></div></details></section>';
 host.querySelectorAll("[data-depth-open]").forEach(b=>b.addEventListener("click",()=>{
 const target=Array.from(host.querySelectorAll("[data-depth-section]")).find(d=>d.dataset.depthSection===b.dataset.depthOpen);
 if(!target)return;target.open=true;target.scrollIntoView({block:"start",behavior:"smooth"});
}));
 const save=host.querySelector(".depth-save");save.addEventListener("click",()=>{
 const note=host.querySelector("#depthNote").value.trim();if(!note)return;
 const next=[...records,{id:"dn-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),chapter:id,note,date:new Date().toISOString(),provenance:"learner-reflection"}].slice(-500);
 try{localStorage.setItem(KEY,JSON.stringify(next));records=next;host.querySelector("#depthNote").value="";host.querySelector(".depth-status").textContent=t.saved;renderLogs(host,id,lang)}catch{host.querySelector(".depth-status").textContent=t.failedSave}
 });renderLogs(host,id,lang);
}
async function render(id,lang,host){
 if(!host)return;lang=lang==="en"?"en":"ja";const t=COPY[lang];const group=String(id).split("-")[0];host.dataset.chapter=id;host.innerHTML='<div class="depth-area" role="status">'+escapeHTML(t.loading)+'</div>';
 try{const value=await groupData(group),lesson=value.chapters.find(x=>x.id===id);
 if(!lesson)throw Error("Missing chapter "+id);renderLesson(host,id,lang,lesson);try{const topics=await loadExtensions();appendExtensions(host,id,lang,topics)}catch{ /* Optional extension data is non-blocking. */ }}
 catch(error){if(!host.isConnected||host.dataset.chapter!==id)return;host.innerHTML='<div class="depth-area"><p>'+escapeHTML(t.failed)+'</p><button type="button" class="depth-retry">'+escapeHTML(t.reopen)+'</button></div>';host.querySelector(".depth-retry").onclick=()=>render(id,lang,host);}
}
window.ChemistryDepth={render};
})();