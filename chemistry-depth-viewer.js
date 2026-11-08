/* Chemistry Structure Lab bilingual depth viewer v1.0.
   Read-only curriculum data; reflection notes remain local and optional. */
(function(){
"use strict";
const CACHE=new Map(), KEY="chemistry-depth-reflections-v1";
let extensionsPromise=null,bridgesPromise=null;
function loadBridges(){if(!bridgesPromise)bridgesPromise=fetch("./data/chemistry-knowledge-bridges-v1.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(data.schema!=="chemistry-knowledge-bridges"||data.schemaVersion!=="1.0"||!Array.isArray(data.bridges))throw Error("Invalid knowledge bridges");return data.bridges}).catch(e=>{bridgesPromise=null;throw e});return bridgesPromise}
function loadExtensions(){if(!extensionsPromise)extensionsPromise=fetch("./data/chemistry-depth-extensions-v1.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(data.schema!=="chemistry-depth-extensions"||data.schemaVersion!=="1.0"||!Array.isArray(data.topics))throw Error("Invalid extension curriculum");return data.topics}).catch(e=>{extensionsPromise=null;throw e});return extensionsPromise}
const COPY={
 ja:{heading:"詳しく学ぶ",subtitle:"順番は自由です。最初の節だけを開き、必要に応じて続きを読めます。",loading:"詳しい解説を読み込み中…",failed:"解説データを読み込めませんでした。接続をご確認いただくか、もう一度お試しください。",reopen:"再読み込み",example:"例題：自分で考える",showSolution:"解き方を見る",pitfall:"誤解しやすい点",bridge:"知識のつながり・後からの再解釈",inquiry:"自分で問いを立てる",note:"考えが変わったことや新しい疑問（記録は任意）",save:"気づきを保存",saved:"端末内に記録しました。",failedSave:"保存できませんでした。ブラウザの保存領域を確認してください。",previous:"以前の気づき",delete:"削除",draft:"詳細教材（編集初稿）",originTitle:"なぜ、この概念が必要だったのか",originIntro:"結論や公式を覚える前に、概念が生まれる理由から読む",entryOrigin:"最初から理由を読む",entryConcept:"原理から読む",entryExample:"例題から読む",entryBridge:"つながりから読む",priorHeading:"前に学んだことから、もう一度考える",priorIntro:"別の分野で理解した知識が、今回の概念を説明する材料になります。共通点だけでなく、当てはまらない部分も確認しましょう。",priorSource:"すでに使える知識",priorTarget:"今の単元で説明できること",priorLimit:"似ているけれど、同じではない点",priorRevisit:"後で読み直す",priorExplore:"経路と状態量を操作して比較",entryReasoning:"徹底解説を読む",entryGuided:"計算を一歩ずつ",guidedTitle:"解法の思考を一段ずつ確認する",guidedStep:"考える手順",reasoningTitle:"なぜそうなる？ 5つの視点で徹底解説",reasoningIntro:"説明は順番に読む必要はありません。知りたい視点から読んで、学んだ後に戻ってきてください。",lenses:["まず現象を観察する","原子・分子の動きで説明する","式・モデルで考える","どんな条件で成り立つか","新しい知識から読み直す"],extensions:"発展・横断：他の分野から読み直す",extensionReason:"ここでつながる知識",extensionQuestion:"考えてみる"},
 en:{heading:"Study in depth",subtitle:"There is no required order. Expand each section as needed; the first is open by default.",loading:"Loading extended explanations…",failed:"Could not load the extended lesson. Check your connection or try again.",reopen:"Retry",example:"Worked example: think first",showSolution:"Reveal a worked solution",pitfall:"Common misconception",bridge:"Connection and later reinterpretation",inquiry:"Investigate further",note:"An observation, changed idea or open question (optional)",save:"Save reflection",saved:"Saved on this device.",failedSave:"Unable to save to device storage.",previous:"Earlier reflections",delete:"Delete",draft:"Expanded curriculum (editorial draft)",originTitle:"Why did scientists need this concept?",originIntro:"Start with the problem before learning definitions and formulas",entryOrigin:"Start with the reason",entryConcept:"Start with principles",entryExample:"Start with an example",entryBridge:"Start with connections",priorHeading:"Revisit this topic through what you already know",priorIntro:"Prior knowledge from another discipline can explain a new chemical idea. Compare both the shared structure and the limits of the analogy.",priorSource:"Earlier knowledge",priorTarget:"New explanation",priorLimit:"Where the analogy stops",priorRevisit:"Revisit later",priorExplore:"Compare paths and state functions interactively",entryReasoning:"Explore why",entryGuided:"Guided calculation",guidedTitle:"Reason through a problem, one step at a time",guidedStep:"Reasoning step",reasoningTitle:"Why? Five connected perspectives",reasoningIntro:"No required reading order. Explore the perspective that matters, and return when another topic changes your understanding.",lenses:["Observe the phenomenon","Explain the particles","Build the mathematical or conceptual model","Check assumptions and limits","Revisit after learning something new"],extensions:"Further connections and advanced perspectives",extensionReason:"Why this connection matters",extensionQuestion:"Think about it"}
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
function renderLesson(host,id,lang,lesson){
 if(!host.isConnected||host.dataset.chapter!==id)return;
 styles();const t=COPY[lang];
 const title=lang==="ja"?"ja":"en",body=lang==="ja"?"textJa":"textEn",sol=lang==="ja"?"solutionJa":"solutionEn";
 const block=lesson.sections.map((section,i)=>'<details data-depth-section="concept-'+i+'" '+(i===0?"open":"")+'><summary>'+escapeHTML((i+1)+". "+section[title])+'</summary><p class="depth-text">'+escapeHTML(section[body])+'</p></details>').join("");
 const origin=lesson.originJourney&&Array.isArray(lesson.originJourney.sections)&&lesson.originJourney.sections.length?
 '<section class="depth-origin" id="depthOrigin"><h3>'+escapeHTML(t.originTitle)+'</h3><p>'+escapeHTML(lesson.originJourney[lang==="ja"?"premiseJa":"premiseEn"])+'</p>'+
 lesson.originJourney.sections.map((entry,i)=>'<details data-depth-section="origin-'+i+'" '+(i===0?"open":"")+'><summary>'+escapeHTML(entry[title])+'</summary><p class="depth-text">'+escapeHTML(entry[lang==="ja"?"textJa":"textEn"])+'</p>'+renderStageVisual(id,lang,entry.id)+'</details>').join("")+'</section>':"";
 const guided=lesson.guidedExample&&Array.isArray(lesson.guidedExample.steps)&&lesson.guidedExample.steps.length===5?
 '<details class="depth-guided" data-depth-section="guided"><summary>'+escapeHTML(t.guidedTitle)+'</summary><p class="depth-problem">'+escapeHTML(lesson.guidedExample[lang==="ja"?"titleJa":"titleEn"])+'</p>'+
 lesson.guidedExample.steps.map((step,i)=>'<details class="depth-step" '+(i===0?'open':'')+'><summary>'+escapeHTML(t.guidedStep)+" "+(i+1)+'</summary><p>'+escapeHTML(step[lang==="ja"?0:1])+'</p></details>').join("")+'</details>':"";
 const deep=lesson.reasoning&&Array.isArray(lesson.reasoning.lenses)&&lesson.reasoning.lenses.length===5?
 '<details class="depth-deep" data-depth-section="reasoning"><summary>'+escapeHTML(t.reasoningTitle)+'</summary><p class="depth-reasoning-intro">'+escapeHTML(t.reasoningIntro)+'</p>'+lesson.reasoning.lenses.map((lens,i)=>'<section class="depth-lens"><h4><span>'+String(i+1)+'</span>'+escapeHTML(t.lenses[i])+'</h4><p>'+escapeHTML(lens[lang==="ja"?"ja":"en"])+'</p></section>').join("")+'</details>':"";
 host.innerHTML='<section class="depth-area" aria-label="'+escapeHTML(t.heading)+'"><h3>'+escapeHTML(t.heading)+'</h3><p class="depth-caption">'+escapeHTML(t.subtitle)+'</p><p class="depth-hint">'+escapeHTML(t.draft)+'</p>'+
 '<div class="depth-routes" role="group" aria-label="Learning entry points">'+(origin?'<button type="button" data-depth-open="origin-0">'+escapeHTML(t.entryOrigin)+'</button>':'')+'<button type="button" data-depth-open="concept-0">'+escapeHTML(t.entryConcept)+'</button><button type="button" data-depth-open="reasoning">'+escapeHTML(t.entryReasoning)+'</button>'+(guided?'<button type="button" data-depth-open="guided">'+escapeHTML(t.entryGuided)+'</button>':'')+'<button type="button" data-depth-open="example">'+escapeHTML(t.entryExample)+'</button><button type="button" data-depth-open="bridge">'+escapeHTML(t.entryBridge)+'</button></div>'+
 origin+block+deep+guided+
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
 if(!host)return;lang=lang==="en"?"en":"ja";const t=COPY[lang];const group=String(id).split("-")[0];host.dataset.chapter=id;host.dataset.language=lang;host.innerHTML='<div class="depth-area" role="status">'+escapeHTML(t.loading)+'</div>';
 try{const value=await groupData(group),lesson=value.chapters.find(x=>x.id===id);
 if(!lesson)throw Error("Missing chapter "+id);renderLesson(host,id,lang,lesson);
 await Promise.allSettled([loadBridges().then(items=>appendBridges(host,id,lang,items)),loadExtensions().then(topics=>appendExtensions(host,id,lang,topics))]);}
 catch(error){if(!host.isConnected||host.dataset.chapter!==id)return;host.innerHTML='<div class="depth-area"><p>'+escapeHTML(t.failed)+'</p><button type="button" class="depth-retry">'+escapeHTML(t.reopen)+'</button></div>';host.querySelector(".depth-retry").onclick=()=>render(id,lang,host);}
}
window.ChemistryDepth={render};
})();