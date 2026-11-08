/* Electron-flow Foundations: 12 lesson-specific original SVG explanations.
 * iPhone-first portrait layout. Do not interpret curved arrows as electron trajectories.
 * Figures are intentionally located at the scientific concept being taught. */
(function(){
"use strict";
const txt=(x,y,v,size=18,color="#193f36",anchor="middle",weight=650)=>
 '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="'+size+'" font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif" font-weight="'+weight+'">'+safe(v)+'</text>';
const safe=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rect=(x,y,w,h,color="#f1f7f3")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="'+color+'" stroke="#c7ddd2" stroke-width="1.5"/>';
const line=(x,y,X,Y,color="#487970",w=3)=>'<path d="M'+x+' '+y+' L'+X+' '+Y+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round"/>';
const dot=(x,y,color="#b05d3d")=>'<circle cx="'+x+'" cy="'+y+'" r="3.2" fill="'+color+'"/>';
const pair=(x,y)=>dot(x-4,y)+dot(x+4,y);
const path=(d,color="#b05d3d",width=3)=>'<path d="'+d+'" stroke="'+color+'" stroke-width="'+width+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
const arrow=(d,id)=>'<path d="'+d+'" stroke="#b05d3d" stroke-width="3.2" fill="none" stroke-linecap="round" marker-end="url(#'+id+')"/>';
const tip=id=>'<defs><marker id="'+id+'" viewBox="0 0 12 12" markerWidth="11" markerHeight="11" refX="10" refY="6" orient="auto"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#b05d3d" stroke-width="2.1" stroke-linecap="round"/></marker></defs>';
const cap={
 why:["反応式の前後に加えて、何が結合を変えたのかという問いを置く。","Go beyond the net reaction: what changed the bonds?"],
 electrons:["炭素と酸素の価電子を点で表す模型。実際の電子雲の位置ではない。","Dots count valence electrons; their locations are not measured electron positions."],
 lewis:["水の酸素は結合2本・孤立電子対2組。OH⁻の酸素は結合1本・孤立電子対3組。","Water oxygen has two bonds and two lone pairs; hydroxide has one bond and three lone pairs."],
 charge:["NH₃とNH₄⁺の形式電荷を比較。C=Oのδは結合の極性であり、形式電荷とは異なる。","Formal charge on NH₃/NH₄⁺ differs from the partial-charge notation for C=O."],
 donor:["曲矢印の始点は電子対、終点は電子対を受け取る原子。図は求核付加の一部分。","The arrow starts at an electron pair and points to an accepting site, shown using a carbonyl."],
 arrows:["二股の曲矢印は電子2個、片矢は電子1個。反応矢印や平衡記号とは区別する。","A full-headed arrow tracks an electron pair; a fishhook tracks one electron."],
 checks:["矢印の形式的な整合性を点検した後に、実験的根拠を確認する。","Audit electron bookkeeping first, then consider experimental support."],
 proton:["NH₃の孤立電子対からHへ、元のO–H結合電子対からOへ。","One pair goes from nitrogen to H; the original O–H bonding pair returns to oxygen."],
 substitution:["HO⁻の電子対から炭素へ。C–Brの電子対は臭素へ移り、Br⁻が離れる。","A hydroxide pair forms C–O while the C–Br pair departs with bromide."],
 carbonyl:["二本の曲矢印で、Nu–C結合形成とC=Oのπ電子対の酸素への移動を同時に示す。","The two arrows account for C–Nu formation and relocation of the C=O π pair to oxygen."],
 resonance:["共鳴式の↔は、二つの異なる分子が反応していることを意味しない。","Resonance ↔ represents contributors to one electronic state, not chemical interconversion."],
 evidence:["曲矢印の模型から予測をつくり、実験結果と比較して説明を更新する。","Use a mechanism to predict observations, then compare with evidence and revise."]
};
const headers={
 why:["反応式だけでは見えないこと","What the overall equation leaves out"],
 electrons:["価電子を数える","Count the valence electrons"],
 lewis:["結合電子対と孤立電子対","Bonding pairs and lone pairs"],
 charge:["形式電荷と部分電荷を分ける","Formal and partial charges"],
 donor:["電子を与える部位・受け取る部位","Electron-pair donor and acceptor"],
 arrows:["曲矢印で何個の電子を表すか","How many electrons does an arrow represent?"],
 checks:["矢印の後で何を確かめるか","Audit an arrow sequence"],
 proton:["プロトン移動と二本の曲矢印","Two arrows in proton transfer"],
 substitution:["求核置換と電子対の行き先","Bond replacement in substitution"],
 carbonyl:["カルボニル付加の二本の曲矢印","The two arrows of carbonyl addition"],
 resonance:["共鳴と化学反応の違い","Resonance is not a reaction"],
 evidence:["反応機構はどう確かめるか","How to evaluate a proposed mechanism"]
};
function art(id,en){
 const m="ef-curve-"+id;let a=tip(m);
 if(id==="why"){
  a+=rect(18,20,324,76)+txt(180,47,en?"What we observe":"観察できる反応式",16)+txt(180,78,"HO⁻ + CH₃Br → CH₃OH + Br⁻",17);
  a+=rect(18,125,324,106,"#edf4fb")+txt(180,153,en?"What changed inside?":"途中で何が変わった？",18);
  a+=txt(180,185,en?"C–O forms; C–Br breaks":"C–O ができ、C–Br が切れる",17)+txt(180,214,en?"Which electron pairs moved?":"電子対はどこからどこへ？",16);
  a+=path("M180 97 L180 119","#4a8a73",2)+path("M180 232 L180 255","#4a8a73",2);
  a+=txt(180,285,en?"Mechanism connects the two":"反応機構が前後をつなぐ",17);
 }
 if(id==="electrons"){
  a+=rect(12,16,162,213)+rect(186,16,162,213);
  a+=txt(90,51,en?"Carbon":"炭素",17)+txt(90,131,"C",35);a+=dot(90,85)+dot(59,118)+dot(122,118)+dot(90,156);
  a+=txt(270,51,en?"Oxygen":"酸素",17)+txt(270,131,"O",35);a+=pair(270,82)+pair(270,165)+dot(239,120)+dot(301,120);
  a+=txt(90,202,en?"4 valence e⁻":"価電子 4個",15)+txt(270,202,en?"6 valence e⁻":"価電子 6個",15);
  a+=rect(21,245,318,70,"#eef4fb")+txt(180,272,en?"Shared pairs build bonds":"結合では電子対を共有する",16)+txt(180,298,en?"Unshared pairs can also react":"孤立電子対も反応に使われる",15);
 }
 if(id==="lewis"){
  a+=rect(13,17,334,144);
  a+=txt(48,52,"H₂O",19);a+=txt(173,104,"O",31);
  a+=txt(78,104,"H",27)+txt(270,104,"H",27)+line(96,96,150,96)+line(195,96,250,96);
  a+=pair(170,60)+pair(170,133);
  a+=txt(185,151,en?"2 bonds / 2 lone pairs":"結合2本・孤立電子対2組",14);
  a+=rect(13,174,334,146,"#edf4fb")+txt(56,212,"OH⁻",19);
  a+=txt(164,254,"O",31)+txt(280,254,"H",27)+line(191,246,255,246);
  a+=pair(160,210)+pair(160,284)+pair(126,246);
  a+=txt(185,312,en?"1 bond / 3 lone pairs":"結合1本・孤立電子対3組",14);
 }
 if(id==="charge"){
  a+=rect(12,16,164,157)+rect(184,16,164,157);
  a+=txt(94,45,"NH₃",19)+txt(94,107,"N",29)+txt(94,67,"H",18)+line(94,76,94,89);
  a+=txt(50,129,"H",18)+txt(136,129,"H",18)+line(74,116,65,122)+line(113,116,122,122)+pair(94,148);
  a+=txt(94,166,en?"FC = 0":"形式電荷 0",13);
  a+=txt(266,45,"NH₄⁺",19)+txt(266,107,"N",29)+txt(266,65,"H",18)+line(266,75,266,89);
  a+=txt(221,116,"H",18)+txt(311,116,"H",18)+line(239,109,249,107)+line(284,107,294,109);
  a+=txt(266,151,"H",18)+line(266,122,266,137)+txt(266,169,en?"FC = +1":"形式電荷 +1",13);
  a+=rect(18,199,324,117,"#edf4fb");
  a+=txt(180,231,en?"C=O bond polarization":"C=O結合の電子の偏り",17);
  a+=txt(118,268,"C",28)+txt(244,268,"O",28)+line(144,256,217,256)+line(144,266,217,266);
  a+=txt(111,291,"δ⁺",18,"#ad5f46")+txt(252,291,"δ⁻",18,"#ad5f46");
  a+=txt(180,312,en?"δ is not formal charge":"δは形式電荷ではない",13);
 }
 if(id==="donor"){
  a+=rect(11,16,338,245);
  a+=txt(88,50,en?"Nucleophile":"求核剤",16)+txt(268,50,en?"Electrophile":"求電子剤",16);
  a+=txt(75,137,"HO:⁻",30)+txt(252,139,"C",30)+txt(252,79,"O",24);
  a+=line(245,109,245,90)+line(258,109,258,90);
  a+=arrow("M127 127 C167 78 213 87 239 118",m);
  a+=txt(180,191,en?"pair → accepting atom":"電子対 → 受け取る原子",16);
  a+=rect(18,273,324,62,"#edf4fb")+txt(180,299,en?"Nu: is a pair source":"Nu: は電子対を与える",16)+txt(180,321,en?"It need not be negatively charged":"必ず陰イオンとは限らない",14);
 }
 if(id==="arrows"){
  a+=rect(11,15,338,138);a+=txt(180,47,en?"Full-headed curved arrow":"二股の曲矢印",18);
  a+=arrow("M82 120 Q177 47 266 120",m);
  a+=txt(180,146,en?"one pair = 2 electrons":"電子対 1組＝電子2個",16);
  a+=rect(11,165,338,122,"#edf4fb")+txt(180,193,en?"Fishhook (single-barbed)":"片矢（フィッシュフック）",17);
  a+=path("M80 258 Q171 185 273 257","#b05d3d",3);
  a+=path("M273 257 l-8 -14","#b05d3d",3);
  a+=txt(180,279,en?"single electron = 1 e⁻":"電子1個の移動",16);
  a+=txt(180,319,en?"Resonance ↔   Equilibrium ⇌":"共鳴 ↔    化学平衡 ⇌",16);
 }
 if(id==="checks"){
  const terms=en?["1. Where is the electron pair?","2. Which bonds change?","3. Valence and total charge?","4. What evidence supports it?"]:["1. 電子対はどこにある？","2. どの結合が変わる？","3. 原子価と全電荷は？","4. 実験の証拠は？"];
  for(let i=0;i<4;i++){
   a+=rect(20,14+i*80,320,60,i%2?"#edf4fb":"#f1f7f3");
   a+=txt(180,52+i*80,terms[i],i===3?17:18);
   if(i<3)a+=path("M180 "+(74+i*80)+" l0 17","#4a8a73",2);
  }
 }
 if(id==="proton"){
  a+=rect(14,16,332,197);
  a+=txt(77,109,":NH₃",28)+txt(220,109,"H",26)+txt(298,109,"O⁺",28);
  a+=line(241,99,274,99);a+=txt(297,66,"H",18)+txt(324,138,"H",18);
  a+=arrow("M121 104 Q166 53 202 92",m)+arrow("M253 91 Q272 55 294 80",m);
  a+=txt(180,174,en?"N lone pair → H":"窒素の孤立電子対 → H",15);
  a+=txt(180,196,en?"O–H bond pair → O":"O–H結合の電子対 → O",15);
  a+=rect(14,233,332,85,"#edf4fb")+txt(180,269,"NH₄⁺ + H₂O",24)+txt(180,298,en?"net charge +1 stays +1":"全電荷 +1 → +1",15);
 }
 if(id==="substitution"){
  a+=rect(14,16,332,213);a+=txt(70,129,"HO:⁻",27)+txt(221,129,"CH₃",26)+txt(303,129,"Br",24);
  a+=line(252,120,280,120);
  a+=arrow("M119 116 Q150 64 205 109",m)+arrow("M262 111 Q291 62 314 101",m);
  a+=txt(180,187,en?"O lone pair → C":"Oの孤立電子対 → C",16);
  a+=txt(180,212,en?"C–Br bond pair → Br":"C–Br結合電子対 → Br",15);
  a+=rect(14,244,332,75,"#edf4fb")+txt(180,275,"CH₃OH + Br⁻",23)+txt(180,302,en?"charge −1 remains −1":"電荷 −1 → −1",14);
 }
 if(id==="carbonyl"){
  a+=rect(13,12,334,214);a+=txt(70,128,"Nu:⁻",25);
  a+=txt(232,124,"C",28)+txt(232,53,"O",26);
  a+=line(226,92,226,68)+line(239,92,239,68);
  a+=txt(164,184,"R",22)+txt(309,184,"R′",22);
  a+=line(215,135,178,169)+line(250,135,295,169);
  a+=arrow("M113 120 Q151 72 215 106",m)+arrow("M247 86 Q285 71 250 53",m);
  a+=txt(180,207,en?"Nu pair → C; π pair → O":"Nu電子対 → C、π電子対 → O",15);
  a+=rect(13,239,334,86,"#edf4fb");
  a+=txt(180,276,"R₂C(O⁻)(Nu)",24)+txt(180,305,en?"O⁻ after addition":"付加後は O⁻",17);
 }
 if(id==="resonance"){
  a+=rect(12,15,336,188);
  a+=txt(180,52,en?"One delocalized species":"電子が非局在化した一つの化学種",16);
  a+=txt(180,106,"R–C(=O)–O⁻",22);
  a+=txt(180,142,"↔",30,"#ad5c42");
  a+=txt(180,181,"R–C(–O⁻)=O",22);
  a+=rect(12,217,336,107,"#edf4fb");
  a+=txt(180,258,en?"Not two molecules changing":"二種類の分子が反応するのではない",15);
  a+=txt(180,292,en?"Reversible reaction: A ⇌ B":"可逆反応の記号は A ⇌ B",16);
 }
 if(id==="evidence"){
  const aterms=en?["Proposed electron flow","Predict stereochemistry","Observe reaction products","Compare / revise model"]:["電子対の模型を作る","立体化学などを予測","生成物や速度を観察","比較して模型を修正"];
  for(let i=0;i<4;i++){
   a+=rect(13,17+i*79,334,59,i%2?"#edf4fb":"#f1f7f3")+txt(180,53+i*79,aterms[i],17);
   if(i<3)a+=path("M180 "+(76+i*79)+" L180 "+(93+i*79),"#4a8a73",2);
  }
 }
 return a;
}
function render(id,locale){
 if(!Object.prototype.hasOwnProperty.call(headers,id))return "";
 const en=locale==="en",n=en?1:0;
 const caption=cap[id][n],header=headers[id][n];
 const description=header+". "+caption;
 return '<figure class="concept-figure" data-concept-figure="'+safe(id)+'">'+
  '<h3>'+safe(header)+'</h3>'+
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 345" role="img" aria-label="'+safe(description)+'" preserveAspectRatio="xMidYMid meet">'+art(id,en)+'</svg>'+
  '<figcaption>'+safe(caption)+'</figcaption>'+
 '</figure>';
}
window.ElectronFlowFigures={render,topics:Object.freeze(Object.keys(headers))};
})();