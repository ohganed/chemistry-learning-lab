/* Chemistry Structure Lab bilingual depth viewer v1.0.
   Read-only curriculum data; reflection notes remain local and optional. */
(function(){
"use strict";
const CACHE=new Map(), KEY="chemistry-depth-reflections-v1";
let extensionsPromise=null,bridgesPromise=null;
function loadBridges(){if(!bridgesPromise)bridgesPromise=fetch("./data/chemistry-knowledge-bridges-v1.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(data.schema!=="chemistry-knowledge-bridges"||data.schemaVersion!=="1.0"||!Array.isArray(data.bridges))throw Error("Invalid knowledge bridges");return data.bridges}).catch(e=>{bridgesPromise=null;throw e});return bridgesPromise}
function loadExtensions(){if(!extensionsPromise)extensionsPromise=fetch("./data/chemistry-depth-extensions-v1.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(data.schema!=="chemistry-depth-extensions"||data.schemaVersion!=="1.0"||!Array.isArray(data.topics))throw Error("Invalid extension curriculum");return data.topics}).catch(e=>{extensionsPromise=null;throw e});return extensionsPromise}
const COPY={
 ja:{heading:"詳しく学ぶ",subtitle:"順番は自由です。最初の節だけを開き、必要に応じて続きを読めます。",loading:"詳しい解説を読み込み中…",failed:"解説データを読み込めませんでした。接続をご確認いただくか、もう一度お試しください。",reopen:"再読み込み",example:"例題：自分で考える",showSolution:"解き方を見る",pitfall:"誤解しやすい点",bridge:"知識のつながり・後からの再解釈",inquiry:"自分で問いを立てる",note:"考えが変わったことや新しい疑問（記録は任意）",save:"気づきを保存",saved:"端末内に記録しました。",failedSave:"保存できませんでした。ブラウザの保存領域を確認してください。",previous:"以前の気づき",delete:"削除",draft:"詳細教材（編集初稿）",originTitle:"なぜ、この概念が必要だったのか",originIntro:"結論や公式を覚える前に、概念が生まれる理由から読む",originCollapse:"見出しだけ表示",originExpand:"説明を続けて読む",entryOrigin:"最初から理由を読む",entryConcept:"原理から読む",entryExample:"例題から読む",entryBridge:"つながりから読む",priorHeading:"前に学んだことから、もう一度考える",priorIntro:"別の分野で理解した知識が、今回の概念を説明する材料になります。共通点だけでなく、当てはまらない部分も確認しましょう。",priorSource:"すでに使える知識",priorTarget:"今の単元で説明できること",priorLimit:"似ているけれど、同じではない点",priorRevisit:"後で読み直す",priorExplore:"経路と状態量を操作して比較",entryReasoning:"徹底解説を読む",entryGuided:"計算を一歩ずつ",guidedTitle:"解法の思考を一段ずつ確認する",guidedStep:"考える手順",reasoningTitle:"なぜそうなる？ 5つの視点で徹底解説",reasoningIntro:"説明は順番に読む必要はありません。知りたい視点から読んで、学んだ後に戻ってきてください。",lenses:["まず現象を観察する","原子・分子の動きで説明する","式・モデルで考える","どんな条件で成り立つか","新しい知識から読み直す"],extensions:"発展・横断：他の分野から読み直す",extensionReason:"ここでつながる知識",extensionQuestion:"考えてみる"},
 en:{heading:"Study in depth",subtitle:"There is no required order. Expand each section as needed; the first is open by default.",loading:"Loading extended explanations…",failed:"Could not load the extended lesson. Check your connection or try again.",reopen:"Retry",example:"Worked example: think first",showSolution:"Reveal a worked solution",pitfall:"Common misconception",bridge:"Connection and later reinterpretation",inquiry:"Investigate further",note:"An observation, changed idea or open question (optional)",save:"Save reflection",saved:"Saved on this device.",failedSave:"Unable to save to device storage.",previous:"Earlier reflections",delete:"Delete",draft:"Expanded curriculum (editorial draft)",originTitle:"Why did scientists need this concept?",originIntro:"Start with the problem before learning definitions and formulas",originCollapse:"Show headings only",originExpand:"Read the full explanation",entryOrigin:"Start with the reason",entryConcept:"Start with principles",entryExample:"Start with an example",entryBridge:"Start with connections",priorHeading:"Revisit this topic through what you already know",priorIntro:"Prior knowledge from another discipline can explain a new chemical idea. Compare both the shared structure and the limits of the analogy.",priorSource:"Earlier knowledge",priorTarget:"New explanation",priorLimit:"Where the analogy stops",priorRevisit:"Revisit later",priorExplore:"Compare paths and state functions interactively",entryReasoning:"Explore why",entryGuided:"Guided calculation",guidedTitle:"Reason through a problem, one step at a time",guidedStep:"Reasoning step",reasoningTitle:"Why? Five connected perspectives",reasoningIntro:"No required reading order. Explore the perspective that matters, and return when another topic changes your understanding.",lenses:["Observe the phenomenon","Explain the particles","Build the mathematical or conceptual model","Check assumptions and limits","Revisit after learning something new"],extensions:"Further connections and advanced perspectives",extensionReason:"Why this connection matters",extensionQuestion:"Think about it"}
};
const escapeHTML=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeRead=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a.filter(n=>n&&typeof n==="object"&&typeof n.chapter==="string"&&typeof n.note==="string"&&n.note.length<=1200).slice(-500):[]}catch{return []}};
let records=safeRead();
function styles(){if(document.getElementById("chemistryDepthStyle"))return;const style=document.createElement("style");style.id="chemistryDepthStyle";style.textContent=`
.depth-area{border-top:2px solid #d5e7da;margin:24px 0;padding-top:16px}
.depth-area .depth-caption{font-size:13px;color:#587468}
.depth-prior{border:1px solid #c8ddcc;border-radius:14px;padding:13px;margin:12px 0 20px;background:#f8fcf9}
.depth-prior h3{font-size:19px;line-height:1.5;color:#175844;margin:4px 0 8px}
.depth-prior>p{font-size:14px;line-height:1.85;color:#566e60}
.depth-prior article{margin:8px 0}
.depth-prior summary{font-size:15px}
.depth-prior .depth-prior-step summary{font-size:14px;font-weight:700;color:#315f50}
.depth-prior .depth-prior-step p{white-space:pre-line;line-height:2.0;margin:9px 5px 16px}
.depth-prior small{display:block;line-height:1.7}
.depth-prior .depth-prior-hook{background:#edf7ef;border-radius:9px;padding:10px 13px;line-height:1.85}
.depth-prior .depth-prior-note{border-left:3px solid #7f9f8d;padding:10px 12px;line-height:1.9}
.depth-prior a{color:#176d57;text-decoration:underline;font-weight:700;display:inline-block;min-height:44px;padding:9px 4px}
@media(max-width:730px){.depth-prior{padding:10px}.depth-prior .depth-prior-step p{font-size:15px}}
.depth-origin{border:2px solid #90b8a1;border-radius:15px;padding:12px 13px;margin:13px 0;background:#f5faf7}

.depth-schematic{margin:13px 4px 18px;padding:12px;background:#f4f9f7;border:1px solid #c8e0d3;border-radius:12px;color:#23433b}
.depth-schematic h4{margin:0 0 9px;color:#174e41;font-size:16px}
.depth-schematic svg{display:block;width:100%;height:auto;max-height:240px}
.depth-schematic figcaption{font-size:13px;line-height:1.75;color:#4b675c;margin:10px 0 0}
.depth-schematic .schematic-math{background:#e5f3ea;border-radius:8px;padding:9px 12px;line-height:1.75;overflow-wrap:anywhere;font-weight:700}
.depth-schematic .schematic-row{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:11px 0}
.depth-schematic .schematic-term{padding:11px 12px;background:#fff;border:1px solid #d6e7dd;border-radius:9px}
.depth-schematic .schematic-term strong{display:block;color:#17604c}
.depth-schematic .schematic-term small{display:block;line-height:1.6}
.depth-schematic .schematic-table{width:100%;border-collapse:collapse;font-size:14px}
.depth-schematic .schematic-table td,.depth-schematic .schematic-table th{border-bottom:1px solid #d3e6d9;text-align:left;padding:8px 7px;vertical-align:top}
@media(max-width:560px){.depth-schematic{padding:10px 7px}.depth-schematic .schematic-row{grid-template-columns:1fr}.depth-schematic h4{font-size:15px}.depth-schematic .schematic-table{font-size:13px}}


/* Organic chemistry: purpose-driven reasoning, not a fixed page-length template. */
.depth-organic-reasoning{margin:17px 0;border:1px solid #d7dfce;border-radius:15px;padding:14px;background:#fbfcf8}
.depth-organic-reasoning h3{margin:3px 0 8px;color:#45623d;font-size:19px;line-height:1.5}
.depth-organic-question{margin:10px 0 13px;background:#eff5e8;border-left:3px solid #6f9970;border-radius:6px;padding:11px 13px;line-height:1.9}
.depth-organic-reasoning details{border-color:#d9e5d3;background:#fff}
.depth-organic-reasoning summary{color:#335f41}
.depth-organic-reasoning .depth-organic-step{border-left:3px solid #91ab81;padding:8px 13px;margin:11px 0;background:#f8fbf5;border-radius:0 10px 10px 0}
.depth-organic-reasoning .depth-organic-step strong{display:block;color:#335c45}
.depth-organic-equation{background:#eaf2ea;padding:9px 11px;line-height:1.8;overflow-wrap:anywhere;border-radius:8px;font-weight:700;font-size:15px;margin:8px 0}
.depth-organic-reasoning .depth-organic-step p{margin:8px 0;line-height:1.9;font-size:15px}
.depth-organic-reasoning .depth-organic-model{padding:10px 11px;border:1px solid #d9e5d3;border-radius:9px;background:#fcfefb;margin:9px 0}
.depth-organic-reasoning .depth-organic-model h4{margin:0 0 7px;font-size:15px;color:#2e5d43}
.depth-organic-reasoning .depth-organic-model p{line-height:1.85;font-size:14px;margin:6px 0}
.depth-organic-reasoning .depth-organic-note{line-height:1.9;margin:11px 0}
.depth-organic-reasoning .depth-organic-subhead{font-weight:750;color:#4c6e4f;font-size:13px;display:block;margin:9px 0 2px}
@media(max-width:650px){.depth-organic-reasoning{padding:10px}.depth-organic-reasoning .depth-organic-step{padding:8px}}
.depth-inorganic-workshop{padding:12px 14px;margin:18px 0;background:#f7f9fc;border:2px solid #ced9e9;border-radius:15px}
.depth-inorganic-workshop>h3{margin:3px 0 9px;color:#254969;font-size:20px;line-height:1.5}
.depth-inorganic-workshop .workshop-intro{font-size:14px;line-height:1.9;color:#516471}
.depth-inorganic-workshop details{background:#fff;border-color:#d2dfea}
.depth-model-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:9px;margin:12px 0}
.depth-model{background:#f7fbff;border:1px solid #d7e6f2;padding:11px;border-radius:10px}
.depth-model h4{font-size:15px;line-height:1.5;margin:0 0 7px;color:#1b5778}
.depth-model .subhead{font-size:12px;font-weight:800;color:#436778;margin:11px 0 3px}
.depth-model p{font-size:14px;line-height:1.9;margin:0;color:#283d4a}
.depth-derivation-intro{background:#eaf2f8;padding:10px 13px;border-radius:9px;white-space:pre-line;line-height:1.9}
.depth-derivation-list{list-style:none;counter-reset:derive;margin:12px 0 14px;padding:0}
.depth-derivation-list li{counter-increment:derive;margin:11px 0;border-left:3px solid #6b9cba;padding:6px 10px;background:#f8fbfd;border-radius:0 8px 8px 0}
.depth-derivation-list li h4{margin:0 0 4px;font-size:15px;line-height:1.5}
.depth-derivation-list li h4:before{content:counter(derive) ". ";color:#2f7698}
.depth-derivation-list li p{margin:8px 0;font-size:14px;line-height:1.9}
.depth-equation{font-size:16px;font-weight:750;color:#164b63;background:#eaf3f7;padding:9px 10px;border-radius:8px;overflow-wrap:anywhere;line-height:1.9}
.depth-inorganic-visual{margin:13px 3px 17px;border:1px solid #c4dcca;background:#f7faf8;border-radius:12px;padding:10px}
.depth-inorganic-visual svg{display:block;max-width:100%;height:auto;width:100%}
.depth-inorganic-visual figcaption{font-size:13px;color:#43675b;line-height:1.85;margin-top:8px}
@media(max-width:730px){.depth-inorganic-workshop{padding:10px}.depth-inorganic-workshop>h3{font-size:18px}.depth-equation{font-size:15px}}
.depth-origin-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.depth-origin-toggle{padding:6px 11px;min-height:42px;border:1px solid #8eb5a1;border-radius:8px;background:#f0f7f1;color:#205d48;font-size:13px;cursor:pointer;flex-shrink:0}
.depth-origin-toggle:focus-visible{outline:3px solid #27745a;outline-offset:2px}
.depth-origin h3{font-size:20px;color:#175844;margin:5px 4px 8px}
.depth-origin>p{margin:8px 4px 13px;line-height:1.85}
.depth-origin details{margin:9px 0;background:#fff}
.depth-origin details summary{font-weight:800}
.depth-origin .depth-text{line-height:2.05;font-size:16px;white-space:pre-line}
@media(max-width:730px){.depth-origin{padding:10px;margin:8px 0}.depth-origin h3{font-size:19px}.depth-origin .depth-text{font-size:16px;line-height:2.05}}

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
function appendBridges(host,id,lang,items){
 if(!host.isConnected||host.dataset.chapter!==id||host.dataset.language!==lang)return;
 const selected=items.filter(item=>Array.isArray(item.chapters)&&item.chapters.includes(id));
 if(!selected.length)return;
 const t=COPY[lang],title=lang==="ja"?"ja":"en",body=lang==="ja"?"textJa":"textEn";
 const section=document.createElement("section");section.className="depth-prior";section.id="depthPrior";
 section.innerHTML='<h3>'+escapeHTML(t.priorHeading)+'</h3><p>'+escapeHTML(t.priorIntro)+'</p>'+
 selected.map((item,idx)=>{
  const source=item.source[title],target=item.target[title],hook=item.hook[title];
  const steps=item.steps.map((step,i)=>'<details class="depth-prior-step" '+(idx===0&&i===0?"open":"")+'><summary>'+escapeHTML(step[title])+'</summary><p>'+escapeHTML(step[body])+'</p></details>').join("");
  const url=item.lab==="state-function-lab.html"?'./state-function-lab.html'+(lang==="en"?"?lang=en":""):null;
  return '<article><details class="depth-prior-card" '+(id==="2-0"&&idx===0?"open":"")+'><summary>'+escapeHTML(source)+' → '+escapeHTML(target)+'</summary><div class="depth-prior-hook">'+escapeHTML(hook)+'</div><small><strong>'+escapeHTML(t.priorSource)+': </strong>'+escapeHTML(source)+' / <strong>'+escapeHTML(t.priorTarget)+': </strong>'+escapeHTML(target)+'</small>'+steps+'<p class="depth-prior-note"><strong>'+escapeHTML(t.priorLimit)+'</strong> '+escapeHTML(item.limits[title])+'</p><p class="depth-prior-note"><strong>'+escapeHTML(t.priorRevisit)+'</strong> '+escapeHTML(item.revisit[title])+'</p>'+(url?'<a href="'+url+'">'+escapeHTML(t.priorExplore)+'</a>':"")+'</details></article>';
 }).join("");
 const area=host.querySelector(".depth-area"),routes=area?.querySelector(".depth-routes");
 if(routes)routes.insertAdjacentElement("afterend",section);else if(area)area.appendChild(section);
}

function renderStageVisual(id,lang,step){
 if(id!=="2-0")return "";
 const en=lang==="en";
 if(step==="piston"){
  const title=en?"Why is pressure multiplied by a volume change?":"なぜ圧力に体積変化を掛けるのか";
  const labelA=en?"Before expansion":"膨張前",labelB=en?"After expansion":"膨張後";
  const caption=en?"An original schematic: a gas expands by pushing a piston with cross-sectional area A through a displacement x. The external pressure Pext is assumed constant, the piston moves vertically, and only pressure–volume work is illustrated. The picture is not to scale.":"模式図：断面積 A のピストンが距離 x だけ動き、気体が膨張する。外圧 Pext は一定と仮定し、ここでは圧力・体積仕事だけを表す。寸法・粒子数は模式的なもの。";
  const alt=en?"A piston moves upward as a gas expands. Its displacement x and area A give a larger volume, delta V equals A times x.":"気体が膨張してピストンを押し上げ、断面積Aと移動距離xの積が体積変化になることを示す図";
  return '<figure class="depth-schematic" aria-label="'+escapeHTML(alt)+'"><h4>'+escapeHTML(title)+'</h4>'+
  '<svg viewBox="0 0 560 215" role="img" aria-label="'+escapeHTML(alt)+'" xmlns="http://www.w3.org/2000/svg">'+
  '<rect x="55" y="25" width="136" height="146" rx="4" fill="#eaf4f2" stroke="#477e73" stroke-width="2"/>'+
  '<rect x="61" y="117" width="124" height="47" fill="#b1ded2"/>'+
  '<rect x="61" y="106" width="124" height="11" rx="2" fill="#637f79"/>'+
  '<path d="M123 106 V36" stroke="#637f79" stroke-width="7"/>'+
  '<path d="M123 42 V72 M115 63 L123 72 L131 63" stroke="#b56d46" stroke-width="2" fill="none"/>'+
  '<rect x="345" y="25" width="136" height="146" rx="4" fill="#eaf4f2" stroke="#477e73" stroke-width="2"/>'+
  '<rect x="351" y="74" width="124" height="90" fill="#b1ded2"/>'+
  '<rect x="351" y="63" width="124" height="11" rx="2" fill="#637f79"/>'+
  '<path d="M413 63 V8" stroke="#637f79" stroke-width="7"/>'+
  '<path d="M413 14 V37 M405 28 L413 37 L421 28" stroke="#b56d46" stroke-width="2" fill="none"/>'+
  '<path d="M255 95 L320 95 M309 86 L320 95 L309 104" stroke="#348a70" stroke-width="3" fill="none"/>'+
  '<path d="M501 66 V109 M496 71 L501 66 L506 71 M496 104 L501 109 L506 104" stroke="#348a70" stroke-width="2" fill="none"/>'+
  '<text x="513" y="90" font-size="15" fill="#215648" font-weight="700">x</text>'+
  '<text x="158" y="41" font-size="14" fill="#91532e">Pext</text>'+
  '<text x="445" y="20" font-size="14" fill="#91532e">Pext</text>'+
  '<text x="122" y="193" font-size="14" text-anchor="middle" fill="#26574b">'+escapeHTML(labelA)+'</text>'+
  '<text x="414" y="193" font-size="14" text-anchor="middle" fill="#26574b">'+escapeHTML(labelB)+'</text>'+
  '<text x="273" y="120" font-size="13" text-anchor="middle" fill="#26574b">ΔV = A x</text>'+
  '</svg>'+
  '<div class="schematic-math">F = Pext × A　→　Wby = F × x = Pext × ΔV</div>'+
  '<figcaption>'+escapeHTML(caption)+'</figcaption></figure>';
 }
 if(step==="why"){
  const title=en?"A state quantity and a process quantity are different":"状態を表す量と、過程で移動する量は違う";
  const terms=en?[
    ["U","Internal energy: property of a state"],
    ["P × V","Pressure–volume product: property of a state"],
    ["H = U + PV","Enthalpy: a newly defined state function"],
    ["q and w","Heat and work: transferred during a process"]
  ]:[
    ["U","内部エネルギー：系の状態で決まる"],
    ["P × V","圧力×体積：系の状態で決まる"],
    ["H = U + PV","エンタルピー：新しく定義した状態量"],
    ["q と w","熱と仕事：過程の間に移動するエネルギー"]
  ];
  const caption=en?"PV is not the amount of mechanical work already performed. With constant pressure and only pressure–volume work, the change in enthalpy equals the heat received: ΔH = qp. This equality is conditional; it is not the definition of H.":"PV は「これまでにした仕事の量」ではない。定圧で、圧力・体積仕事以外の仕事がないなどの条件を満たすとき、変化量 ΔH が受け取った熱 qp に一致する。この一致は条件付きの結果であり、H の定義ではない。";
  return '<figure class="depth-schematic"><h4>'+escapeHTML(title)+'</h4><div class="schematic-row">'+
  terms.map(t=>'<div class="schematic-term"><strong>'+escapeHTML(t[0])+'</strong><small>'+escapeHTML(t[1])+'</small></div>').join("")+
  '</div><figcaption>'+escapeHTML(caption)+'</figcaption></figure>';
 }
 if(step==="distinction"){
  const title=en?"The physical role of each quantity":"物理量の役割を比べる";
  const rows=en?[
   ["U, H","State properties","Same endpoints → same difference"],
   ["q, w","Process quantities","Same endpoints may allow different values"],
   ["PV","A product of state variables","Not identical with work W"],
   ["PΔV","Expansion-work magnitude under stated conditions","Requires constant external pressure"]
  ]:[
   ["U、H","状態量","同じ始状態・終状態なら差も同じ"],
   ["q、w","過程量","同じ始状態・終状態でも値が異なり得る"],
   ["PV","状態変数の積","仕事そのものではない"],
   ["PΔV","条件付きで膨張仕事の大きさ","外圧一定などの条件が必要"]
  ];
  const caption=en?"A comparison table to distinguish definition, units, and physical meaning; equal units do not mean interchangeable concepts.":"定義と役割を区別する比較表。同じ単位（J）でも、物理的な意味が同じとは限らない。";
  return '<figure class="depth-schematic"><h4>'+escapeHTML(title)+'</h4><table class="schematic-table"><tbody>'+
  rows.map(r=>'<tr>'+r.map(t=>'<td>'+escapeHTML(t)+'</td>').join("")+'</tr>').join("")+'</tbody></table><figcaption>'+escapeHTML(caption)+'</figcaption></figure>';
 }
 return "";
}

function renderInorganicStageVisual(id,lang,stage){
 const en=lang==="en";
 const fig=(title,desc,svg,formula)=>'<figure class="depth-inorganic-visual"><svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escapeHTML(desc)+'">'+svg+'</svg>'+(formula?'<div class="depth-equation">'+escapeHTML(formula)+'</div>':"")+'<figcaption><strong>'+escapeHTML(title)+':</strong> '+escapeHTML(desc)+'</figcaption></figure>';
 const r=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="'+fill+'" stroke="#6a9b86" stroke-width="2"/>';
 const t=(x,y,value,size=19,fill="#24483c")=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" font-weight="650" fill="'+fill+'">'+escapeHTML(value)+'</text>';
 if(id==="3-0"&&stage==="balance"){
  const title=en?"Electron conservation in halogen displacement":"ハロゲン置換反応での電子の保存";
  const desc=en?"The bromide oxidation half-reaction releases two electrons. Chlorine reduction accepts the same two electrons. Adding them eliminates electrons and preserves charge; schematic only.":"臭化物イオンの酸化で2個の電子を放出し、塩素の還元がその2個を受け取る。半反応式を足せば電子が相殺され、電荷も保存される。模式図。";
  const svg=r(17,23,265,69,"#eef8fa")+r(318,23,265,69,"#f7eff7")+
   t(149,51,en?"Oxidation":"酸化",18)+t(448,51,en?"Reduction":"還元",18)+
   t(149,78,"2Br⁻ → Br₂ + 2e⁻",18)+t(448,78,"Cl₂ + 2e⁻ → 2Cl⁻",18)+
   '<path d="M300 103 V139" stroke="#3a796a" stroke-width="3"/><path d="M292 129 L300 139 L308 129" fill="none" stroke="#3a796a" stroke-width="3"/>'+
   t(300,161,en?"Add and cancel 2e⁻":"足して2e⁻を消去する",17)+r(85,180,430,45,"#e9f4ed")+t(300,209,"Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂",20);
  return fig(title,desc,svg,"2e⁻ ("+(en?"lost":"放出")+") = 2e⁻ ("+(en?"gained":"受容")+")");
 }
 if(id==="3-1"&&stage==="surface"){
  const title=en?"A thin surface layer changes reaction rate":"薄い表面膜が反応速度を変える";
  const desc=en?"Aluminium substrate covered by a thin aluminium-oxide-rich protective film. Arrows from air stop at the film, illustrating passivation, not an exact microscopic reaction mechanism or scale.":"アルミニウム金属の上に酸化アルミニウムに富む保護膜が形成される。外部からの矢印が膜で止まる模式図。正確な膜厚や微視的機構を描いたものではない。";
  const svg=r(32,139,536,77,"#b7cbd8")+r(32,110,536,26,"#7ebca5")+
   t(295,188,en?"Al metal":"Al 金属",22)+t(295,128,en?"Protective oxide film":"酸化物保護膜",18,"#103f35")+
   t(295,29,en?"O₂ / H₂O from the environment":"外界のO₂・H₂O",19)+
   '<path d="M125 40 V97 M275 40 V97 M425 40 V97" stroke="#b66d42" stroke-width="3" stroke-dasharray="5 4"/>'+
   '<path d="M114 86 L125 97 L136 86 M264 86 L275 97 L286 86 M414 86 L425 97 L436 86" fill="none" stroke="#b66d42" stroke-width="3"/>'+
   '<path d="M102 140 L146 140 M252 140 L296 140 M402 140 L446 140" stroke="#b65855" stroke-width="5"/>';
  return fig(title,desc,svg,en?"Favorable oxidation ≠ necessarily fast corrosion":"酸化が熱力学的に有利 ≠ 腐食が必ず速い");
 }
 if(id==="3-2"&&stage==="barycenter"){
  const title=en?"Octahedral d-orbital splitting: energy bookkeeping":"八面体結晶場のd軌道分裂とエネルギーの数え方";
  const desc=en?"Ideal octahedral crystal-field energy-level diagram. Two upper e_g orbitals shift +0.6Δo and three lower t₂g orbitals −0.4Δo relative to the conserved barycenter. The diagram is not a quantitative spectrum or an image of spatial orbital shape.":"理想八面体結晶場のエネルギー準位模式図。上側のe_gは2軌道で+0.6Δo、下側のt₂gは3軌道で−0.4Δo。中央の破線は重心。実際の吸収スペクトルや軌道の空間形状を描いたものではない。";
  let upper="",lower="";
  [300,375].forEach(x=>upper+='<path d="M'+x+' 66 H'+(x+52)+'" stroke="#356c9d" stroke-width="4"/>');
  [248,323,398].forEach(x=>lower+='<path d="M'+x+' 176 H'+(x+52)+'" stroke="#34836d" stroke-width="4"/>');
  const svg=t(83,23,en?"Energy ↑":"エネルギー↑",19)+
  '<path d="M92 31 V217" stroke="#4a6e73" stroke-width="3"/><path d="M85 42 L92 31 L99 42" fill="none" stroke="#4a6e73" stroke-width="3"/>'+
  '<path d="M180 124 H528" stroke="#829da3" stroke-dasharray="6 5" stroke-width="2"/>'+
  upper+lower+t(470,52,"e_g (+0.6Δₒ)",18)+t(480,210,"t₂g (−0.4Δₒ)",18)+
  t(170,117,en?"Barycenter":"重心",16)+
  '<path d="M549 68 V177 M543 76 L549 68 L555 76 M543 169 L549 177 L555 169" fill="none" stroke="#b77e48" stroke-width="2.5"/>'+
  t(555,125,"Δₒ",18);
  return fig(title,desc,svg,"3 × (−0.4Δₒ) + 2 × (+0.6Δₒ) = 0");
 }
 if(id==="3-3"&&(stage==="combine"||stage==="ammonia")){
  const title=en?"Two coupled equilibria explain redissolution":"二つの平衡をつなげて再溶解を説明する";
  const desc=en?"AgCl(s) dissolves into free Ag⁺ and Cl⁻; NH₃ binds free Ag⁺ to form [Ag(NH₃)₂]⁺, favoring further dissolution under suitable conditions. Competing equilibria and concentrations are omitted from this schematic.":"AgCl(s)が溶けてAg⁺とCl⁻をつくり、NH₃が遊離Ag⁺を錯体に取り込むことで条件によって追加の溶解が進む。共存する多数の平衡や濃度は省略した模式図。";
  const svg=r(15,64,149,94,"#edf2f9")+r(220,64,145,94,"#eff9f4")+r(419,64,165,94,"#eaf1fb")+
  t(88,105,"AgCl(s)",22)+t(88,129,en?"Solid":"固体",15)+
  t(292,100,"Ag⁺ + Cl⁻",21)+t(292,129,en?"Aqueous ions":"溶存イオン",15)+
  t(502,105,"[Ag(NH₃)₂]⁺",17)+t(502,131,"+ Cl⁻",17)+
  '<path d="M165 109 H219 M207 102 L219 109 L207 116" fill="none" stroke="#3d8c72" stroke-width="3"/>'+
  '<path d="M367 109 H418 M406 102 L418 109 L406 116" fill="none" stroke="#3d8c72" stroke-width="3"/>'+
  t(189,78,"Ksp",16)+t(394,78,"β₂",16)+
  t(394,47,"+2NH₃",17)+t(300,201,"K = Ksp × β₂",24);
  return fig(title,desc,svg,"AgCl(s) + 2NH₃ ⇌ [Ag(NH₃)₂]⁺ + Cl⁻");
 }
 return "";
}
function renderInorganicWorkshop(lesson,lang){
 const content=lesson.inorganicWorkshop;
 if(!content||content.schemaVersion!=="1.0"||!Array.isArray(content.models)||!content.derivation)return "";
 const en=lang==="en",title=en?"en":"ja",strong=en?"strengthEn":"strengthJa",limit=en?"limitEn":"limitJa",why=en?"whyEn":"whyJa";
 const table=content.models.map(item=>'<article class="depth-model"><h4>'+escapeHTML(item[title])+'</h4><div class="subhead">'+(en?"Explains":"説明できること")+'</div><p>'+escapeHTML(item[strong])+'</p><div class="subhead">'+(en?"Does not explain alone":"この模型だけでは説明できないこと")+'</div><p>'+escapeHTML(item[limit])+'</p></article>').join("");
 const deriv=content.derivation;
 const steps=deriv.steps.map(item=>'<li><h4>'+escapeHTML(item[title])+'</h4><div class="depth-equation">'+escapeHTML(item.equation)+'</div><p>'+escapeHTML(item[why])+'</p></li>').join("");
 return '<section class="depth-inorganic-workshop"><h3>'+(en?"Understand a model before using its equations":"模型の意味を理解してから式を使う")+'</h3><p class="workshop-intro">'+(en?"Compare explanatory power and limits. The original derivations below show why the equations arise, not just how to substitute numbers.":"説明できること・できないことを比較します。次のオリジナル導出では、数値を代入する前に式が必要になる理由と、途中の論理を確かめます。")+'</p>'+
 '<details open data-depth-section="inorganic-models"><summary>'+escapeHTML(content[en?"titleEn":"titleJa"])+'</summary><div class="depth-model-grid">'+table+'</div></details>'+
 '<details open data-depth-section="inorganic-derivation"><summary>'+escapeHTML(deriv[en?"titleEn":"titleJa"])+'</summary><p class="depth-derivation-intro">'+escapeHTML(deriv[en?"setupEn":"setupJa"])+'</p><ol class="depth-derivation-list">'+steps+'</ol></details></section>';
}

function renderOrganicReasoning(lesson,lang){
 const organic=lesson.organicReasoning;
 if(!organic||organic.schemaVersion!=="1.0"||!Array.isArray(organic.steps)||organic.steps.length===0)return "";
 const en=lang==="en",textKey=en?"en":"ja",whyKey=en?"reasonEn":"reasonJa",changeKey=en?"changeEn":"changeJa";
 const stages=organic.steps.map((step,i)=>
  '<div class="depth-organic-step"><strong>'+escapeHTML((i+1)+". "+step[textKey])+'</strong>'+
  '<div class="depth-organic-equation">'+escapeHTML(step[changeKey])+'</div>'+
  '<p>'+escapeHTML(step[whyKey])+'</p></div>').join("");
 const models=organic.models.map(item=>'<div class="depth-organic-model"><h4>'+escapeHTML(item[textKey])+'</h4>'+
  '<span class="depth-organic-subhead">'+(en?"Can explain":"説明できること")+'</span><p>'+escapeHTML(item[en?"canEn":"canJa"])+'</p>'+
  '<span class="depth-organic-subhead">'+(en?"Cannot explain alone":"この模型だけでは説明できないこと")+'</span><p>'+escapeHTML(item[en?"limitEn":"limitJa"])+'</p></div>').join("");
 const title=organic[en?"titleEn":"titleJa"],question=organic[en?"questionEn":"questionJa"];
 return '<section class="depth-organic-reasoning" aria-label="'+escapeHTML(title)+'">'+
 '<h3>'+escapeHTML(title)+'</h3><p class="depth-organic-question">'+escapeHTML(question)+'</p>'+
 '<details data-depth-section="organic-mechanism" open><summary>'+(en?"Follow the explanation, one justified step at a time":"一段ずつ理由を追う")+'</summary>'+stages+'</details>'+
 '<details data-depth-section="organic-models"><summary>'+(en?"Compare explanatory models":"説明モデルの比較")+'</summary>'+models+'</details>'+
 '<details data-depth-section="organic-predict"><summary>'+(en?"Try predicting a different case (optional)":"別の事例を予測する（任意）")+'</summary><p class="depth-organic-note">'+escapeHTML(organic[en?"predictionEn":"predictionJa"])+'</p></details>'+
 '<details data-depth-section="organic-boundary"><summary>'+(en?"Where this explanation has limits":"この説明が成り立つ範囲と限界")+'</summary><p class="depth-organic-note">'+escapeHTML(organic[en?"boundaryEn":"boundaryJa"])+'</p></details></section>';
}
function renderLesson(host,id,lang,lesson){
 if(!host.isConnected||host.dataset.chapter!==id)return;
 styles();const t=COPY[lang];
 const title=lang==="ja"?"ja":"en",body=lang==="ja"?"textJa":"textEn",sol=lang==="ja"?"solutionJa":"solutionEn";
 const block=lesson.sections.map((section,i)=>'<details data-depth-section="concept-'+i+'" '+(i===0?"open":"")+'><summary>'+escapeHTML((i+1)+". "+section[title])+'</summary><p class="depth-text">'+escapeHTML(section[body])+'</p></details>').join("");
 const origin=lesson.originJourney&&Array.isArray(lesson.originJourney.sections)&&lesson.originJourney.sections.length?
 '<section class="depth-origin" id="depthOrigin"><div class="depth-origin-header"><h3>'+escapeHTML(t.originTitle)+'</h3><button type="button" class="depth-origin-toggle" aria-expanded="true">'+escapeHTML(t.originCollapse)+'</button></div><p>'+escapeHTML(lesson.originJourney[lang==="ja"?"premiseJa":"premiseEn"])+'</p>'+
 lesson.originJourney.sections.map((entry,i)=>'<details data-depth-section="origin-'+i+'" open><summary>'+escapeHTML(entry[title])+'</summary><p class="depth-text">'+escapeHTML(entry[lang==="ja"?"textJa":"textEn"])+'</p>'+renderStageVisual(id,lang,entry.id)+renderInorganicStageVisual(id,lang,entry.id)+(window.ChemistryPedagogyVisuals?.render?.(id,lang,entry.id)||'')+'</details>').join("")+'</section>':"";
 const workshop=renderInorganicWorkshop(lesson,lang);
 const organic=renderOrganicReasoning(lesson,lang);
 const guided=lesson.guidedExample&&Array.isArray(lesson.guidedExample.steps)&&lesson.guidedExample.steps.length===5?
 '<details class="depth-guided" data-depth-section="guided"><summary>'+escapeHTML(t.guidedTitle)+'</summary><p class="depth-problem">'+escapeHTML(lesson.guidedExample[lang==="ja"?"titleJa":"titleEn"])+'</p>'+
 lesson.guidedExample.steps.map((step,i)=>'<details class="depth-step" '+(i===0?'open':'')+'><summary>'+escapeHTML(t.guidedStep)+" "+(i+1)+'</summary><p>'+escapeHTML(step[lang==="ja"?0:1])+'</p></details>').join("")+'</details>':"";
 const deep=lesson.reasoning&&Array.isArray(lesson.reasoning.lenses)&&lesson.reasoning.lenses.length===5?
 '<details class="depth-deep" data-depth-section="reasoning"><summary>'+escapeHTML(t.reasoningTitle)+'</summary><p class="depth-reasoning-intro">'+escapeHTML(t.reasoningIntro)+'</p>'+lesson.reasoning.lenses.map((lens,i)=>'<section class="depth-lens"><h4><span>'+String(i+1)+'</span>'+escapeHTML(t.lenses[i])+'</h4><p>'+escapeHTML(lens[lang==="ja"?"ja":"en"])+'</p></section>').join("")+'</details>':"";
 host.innerHTML='<section class="depth-area" aria-label="'+escapeHTML(t.heading)+'"><h3>'+escapeHTML(t.heading)+'</h3><p class="depth-caption">'+escapeHTML(t.subtitle)+'</p><p class="depth-hint">'+escapeHTML(t.draft)+'</p>'+
 '<div class="depth-routes" role="group" aria-label="Learning entry points">'+(origin?'<button type="button" data-depth-open="origin-0">'+escapeHTML(t.entryOrigin)+'</button>':'')+'<button type="button" data-depth-open="concept-0">'+escapeHTML(t.entryConcept)+'</button><button type="button" data-depth-open="reasoning">'+escapeHTML(t.entryReasoning)+'</button>'+(guided?'<button type="button" data-depth-open="guided">'+escapeHTML(t.entryGuided)+'</button>':'')+'<button type="button" data-depth-open="example">'+escapeHTML(t.entryExample)+'</button><button type="button" data-depth-open="bridge">'+escapeHTML(t.entryBridge)+'</button></div>'+
 origin+workshop+organic+block+deep+guided+
 '<details data-depth-section="example"><summary>'+escapeHTML(t.example)+'</summary><p class="depth-text">'+escapeHTML(lesson.example[title])+'</p><details><summary>'+escapeHTML(t.showSolution)+'</summary><p class="depth-text">'+escapeHTML(lesson.example[sol])+'</p></details></details>'+
 '<details><summary>'+escapeHTML(t.pitfall)+'</summary><p class="depth-text">'+escapeHTML(lesson.pitfall[title])+'</p></details>'+
 '<details data-depth-section="bridge"><summary>'+escapeHTML(t.bridge)+'</summary><p class="depth-text">'+escapeHTML(lesson.bridge[title])+'</p></details>'+
 '<details><summary>'+escapeHTML(t.inquiry)+'</summary><p class="depth-text">'+escapeHTML(lesson.inquiry[title])+'</p><label for="depthNote" class="depth-hint">'+escapeHTML(t.note)+'</label><textarea id="depthNote" maxlength="1200"></textarea><button type="button" class="depth-save">'+escapeHTML(t.save)+'</button><p class="depth-status" role="status"></p><div class="depth-logs"></div></details></section>';
 host.querySelectorAll("[data-depth-open]").forEach(b=>b.addEventListener("click",()=>{
 const target=Array.from(host.querySelectorAll("[data-depth-section]")).find(d=>d.dataset.depthSection===b.dataset.depthOpen);
 if(!target)return;target.open=true;target.scrollIntoView({block:"start",behavior:"smooth"});
}));
 const originToggle=host.querySelector(".depth-origin-toggle");
 if(originToggle){
  const sections=Array.from(host.querySelectorAll('.depth-origin > details[data-depth-section^="origin-"]'));
  const updateOriginToggle=()=>{
   const allOpen=sections.every(section=>section.open);
   originToggle.textContent=allOpen?t.originCollapse:t.originExpand;
   originToggle.setAttribute("aria-expanded",String(allOpen));
  };
  originToggle.addEventListener("click",()=>{
   const expand=sections.some(section=>!section.open);
   sections.forEach(section=>{section.open=expand});
   updateOriginToggle();
  });
  sections.forEach(section=>section.addEventListener("toggle",updateOriginToggle));
  updateOriginToggle();
 }
 const save=host.querySelector(".depth-save");save.addEventListener("click",()=>{
 const note=host.querySelector("#depthNote").value.trim();if(!note)return;
 const next=[...records,{id:"dn-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),chapter:id,note,date:new Date().toISOString(),provenance:"learner-reflection"}].slice(-500);
 try{localStorage.setItem(KEY,JSON.stringify(next));records=next;host.querySelector("#depthNote").value="";host.querySelector(".depth-status").textContent=t.saved;renderLogs(host,id,lang)}catch{host.querySelector(".depth-status").textContent=t.failedSave}
 });renderLogs(host,id,lang);
}
async function render(id,lang,host){
 if(!host)return;lang=lang==="en"?"en":"ja";const t=COPY[lang];const group=String(id).split("-")[0];host.dataset.chapter=id;host.dataset.language=lang;host.innerHTML='<div class="depth-area" role="status">'+escapeHTML(t.loading)+'</div>';
 try{const value=await groupData(group),lesson=value.chapters.find(x=>x.id===id);
 if(!lesson)throw Error("Missing chapter "+id);renderLesson(host,id,lang,lesson);
 await Promise.allSettled([loadBridges().then(items=>appendBridges(host,id,lang,items)),loadExtensions().then(topics=>appendExtensions(host,id,lang,topics))]);}
 catch(error){if(!host.isConnected||host.dataset.chapter!==id)return;host.innerHTML='<div class="depth-area"><p>'+escapeHTML(t.failed)+'</p><button type="button" class="depth-retry">'+escapeHTML(t.reopen)+'</button></div>';host.querySelector(".depth-retry").onclick=()=>render(id,lang,host);}
}
window.ChemistryDepth={render};
})();