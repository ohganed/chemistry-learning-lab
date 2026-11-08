/* Original concept-focused scientific schematics for Chemistry Structure Lab.
   Each figure is deliberately situated in a particular lesson stage. */
(function(){
"use strict";
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rect=(x,y,w,h,fill="#eff7f2")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="11" stroke="#7ea89c" stroke-width="2" fill="'+fill+'"/>';
const tx=(x,y,s,size=18,fill="#244f47",anchor="middle")=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" text-anchor="'+anchor+'" font-weight="650" fill="'+fill+'">'+esc(s)+'</text>';
const ln=(x1,y1,x2,y2,color="#37846d",width=3,dash="")=>'<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+color+'" stroke-width="'+width+'" fill="none"'+(dash?' stroke-dasharray="'+dash+'"':"")+'/>';
const arrow=(x1,y1,x2,y2,color="#37846d")=>ln(x1,y1,x2,y2,color)+
'<path d="M'+(x2-9)+' '+(y2-6)+' L'+x2+' '+y2+' L'+(x2-9)+' '+(y2+6)+'" transform="rotate('+(Math.atan2(y2-y1,x2-x1)*180/Math.PI)+' '+x2+' '+y2+')" stroke="'+color+'" stroke-width="2.5" fill="none"/>';
function figure(title,caption,math,art){
 return '<figure class="depth-schematic"><h4>'+esc(title)+'</h4>'+
 '<svg viewBox="0 0 600 214" role="img" aria-label="'+esc(caption)+'" xmlns="http://www.w3.org/2000/svg">'+art+'</svg>'+
 (math?'<div class="schematic-math">'+esc(math)+'</div>':"")+
 '<figcaption>'+esc(caption)+'</figcaption></figure>';
}
function render(id,lang,step){
 const en=lang==="en";
 if(id==="0-0"&&step==="contrast"){
  const a=rect(13,44,174,125)+rect(417,44,174,125)+arrow(195,101,407,101);
  const art=a+tx(101,66,en?"Mixture":"混合物",17)+tx(101,96,en?"sand + saltwater":"砂＋食塩水",16)+
    tx(300,80,en?"filter":"ろ過",18)+tx(500,68,en?"Sand residue":"砂が残る",17)+
    tx(500,104,en?"saltwater filtrate":"ろ液は食塩水",16)+tx(300,135,en?"Dissolved salt passes":"溶存塩は通過",15);
  return figure(en?"Separation is chosen by a material property":"分離は物質の性質で方法を選ぶ",
    en?"Filtration traps sand but dissolved ions pass with water. To recover water and salt separately, another technique such as distillation is required; this is a conceptual flow, not a lab apparatus drawing.":"ろ過では砂を捕らえられるが、溶解したイオンは水とともに通過する。水と食塩を別々に回収するには蒸留など別の方法が必要。実験装置ではなく分離の原理を表す模式図。","size / state → choose a separation method",art);
 }
 if(id==="0-2"&&step==="wave"){
  let wave1="",wave2="";
  for(let i=0;i<180;i++){const x=260+i*1.65,y=66-31*Math.sin(Math.PI*i/179);wave1+=(i?" L":"M")+x.toFixed(1)+" "+y.toFixed(1);
    const yy=154-24*Math.sin(2*Math.PI*i/179);wave2+=(i?" L":"M")+x.toFixed(1)+" "+yy.toFixed(1)}
  const art=ln(252,28,252,186,"#536e78",3)+ln(562,28,562,186,"#536e78",3)+
    '<path d="'+wave1+'" fill="none" stroke="#3d88a7" stroke-width="3"/><path d="'+wave2+'" fill="none" stroke="#a17a50" stroke-width="3"/>'+
    tx(115,65,"n=1",22)+tx(115,154,"n=2",22)+
    tx(411,203,en?"fixed ends / length L":"固定端・長さ L",16);
  return figure(en?"Fixed boundaries select standing-wave wavelengths":"境界条件によって許される波長が決まる",
    en?"Two standing-wave shapes on a string of fixed length L. This illustrates boundary conditions; it is not a literal electron orbit or a numerical atomic spectrum.":"長さLの弦に現れる二つの定常波。境界条件で波長が選ばれるという数学的なたとえであり、電子の軌道や実際の原子スペクトルの図ではない。","L=nλ/2　→　λ=2L/n",art);
 }
 if(id==="0-3"&&step==="melt"){
  let solid="",melt="";for(let i=0;i<3;i++)for(let j=0;j<4;j++){
    const x=47+j*46,y=56+i*47;solid+='<circle cx="'+x+'" cy="'+y+'" r="15" fill="'+((i+j)%2?"#f3d5af":"#a9d5d0")+'" stroke="#6c9e8f"/>';
    solid+=tx(x,y+5,(i+j)%2?"−":"+",15);
    const mx=345+j*48+((i%2)*12),my=52+i*47+(j%2)*6;melt+='<circle cx="'+mx+'" cy="'+my+'" r="15" fill="'+((i+j)%2?"#f3d5af":"#a9d5d0")+'" stroke="#6c9e8f"/>';
    melt+=tx(mx,my+5,(i+j)%2?"−":"+",15)}
  const art=rect(14,25,227,167)+rect(302,25,281,167)+solid+melt+
   tx(128,209,en?"Solid: ions largely fixed":"固体：イオンは格子に束縛",13)+tx(442,209,en?"Melt: mobile ions":"融液：イオンが移動できる",13);
  return figure(en?"Conductivity depends on charge-carrier mobility":"導電性は電荷担体が動けるかで変わる",
    en?"Schematic alternating Na+ and Cl− ions in a lattice compared with mobile ions in an ionic melt; particle positions are qualitative, not crystallographic coordinates.":"Na⁺とCl⁻の固体格子と、融液中で移動できるイオンの比較。配置は定性的で、結晶学的な正確な原子位置を示すものではない。","charge + mobility → electrical current",art);
 }
 if(id==="0-4"&&step==="vectors"){
  const art=tx(138,41,"O = C = O",28)+
   ln(141,68,48,68,"#c07a52",4)+ln(141,68,231,68,"#c07a52",4)+
   tx(138,109,en?"Opposite dipoles cancel":"反対向きの双極子が相殺",16)+
   tx(440,45,"O",31)+tx(355,143,"H",28)+tx(529,143,"H",28)+
   ln(418,57,363,122,"#405e87",5)+ln(460,57,517,122,"#405e87",5)+
   ln(355,115,417,58,"#c07a52",3)+ln(529,115,461,58,"#c07a52",3)+
   tx(440,185,en?"Net dipole remains":"分子全体の双極子が残る",16);
  return figure(en?"Bond dipoles add as vectors":"結合双極子は向きをもつベクトルとして合成する",
    en?"Simplified contrast between linear CO₂ with canceling opposite bond dipoles and bent H₂O with a nonzero resultant. Arrows are conceptual, not measured vector lengths.":"直線形CO₂では反対方向の結合双極子が打ち消し合うが、折れ線形H₂Oでは打ち消しきれない。矢印の長さは定量値ではない。","vector sum: CO₂ ≈ 0; H₂O ≠ 0",art);
 }
 if(id==="1-0"&&step==="molar"){
  const art=rect(16,49,165,108)+rect(218,49,164,108)+rect(419,49,165,108)+
    tx(98,88,"36 g",27)+tx(98,117,en?"measured":"測定",16)+
    arrow(185,104,208,104)+tx(300,89,"÷18 g/mol",22)+tx(300,118,en?"molar mass":"モル質量",15)+
    arrow(385,104,409,104)+tx(500,89,"2 mol",27)+tx(500,117,en?"counted amount":"物質量",15);
  return figure(en?"Moles bridge mass and particle counts":"モルは天秤の質量と粒子数を結びつける",
    en?"The example uses water with approximate molar mass 18 g/mol. Division gives an amount of 2 mol; the measured mass and molar mass each carry units.":"水のモル質量を18 g/molと近似。36 gをモル質量で割ると2 molとなり、単位の約分で意味を確認できる。","n=m/M　→　36 g ÷ (18 g/mol)=2 mol",art);
 }
 if(id==="1-1"&&step==="leftover"){
  const art=rect(25,39,246,137)+rect(329,39,245,137)+
    tx(145,65,en?"Initial reactants":"最初の反応物",16)+tx(145,103,"3 H₂  +  1 O₂",26)+
    tx(450,65,en?"After complete reaction":"完全反応後",16)+tx(450,103,"2 H₂O + 1 H₂",25)+
    arrow(276,103,324,103)+tx(301,83,en?"reaction":"反応",14);
  return figure(en?"The limiting reactant determines maximum product":"制限試薬が理論生成量を決める",
    en?"With 3 mol hydrogen and 1 mol oxygen, oxygen is exhausted after producing 2 mol water, leaving 1 mol hydrogen. The diagram shows mole amounts, not literal molecular dimensions.":"H₂が3 mol、O₂が1 molなら、最大で水2 molができ、H₂が1 mol残る。図はmol単位の収支であり、実際の分子の大きさを示すものではない。","2H₂+O₂→2H₂O　|　ξ=1 mol",art);
 }
 if(id==="1-2"&&step==="collision"){
  const art=rect(20,33,560,147,"#eef7fa")+
  ln(480,39,480,173,"#5f8b9d",5)+
  '<circle cx="240" cy="98" r="19" fill="#efc78f" stroke="#b37a47" stroke-width="2"/>'+
  ln(262,98,444,98,"#4a879e",3)+ln(450,115,296,115,"#bc7655",3)+
  tx(360,84,"m, vₓ →",18)+tx(360,139,"← −vₓ",18)+
  tx(492,71,en?"wall":"壁",19)+tx(492,158,en?"impulse":"力積",14);
  return figure(en?"Pressure begins with momentum transfer":"圧力は壁との衝突による運動量移動から生まれる",
    en?"A single ideal elastic collision with a rigid wall reverses the velocity component normal to it; repeated collisions produce an average pressure. Not a molecular-scale photograph.":"弾性衝突により壁に垂直な速度成分が反転する。一回の衝突の運動量移動を積み重ね、平均の圧力につなげる模式図。","wall impulse magnitude=2m|vₓ|",art);
 }
 if(id==="1-3"&&step==="dilution"){
  const art=rect(20,28,221,145)+rect(359,28,221,145)+
  tx(129,68,"100 mL",24)+tx(129,102,"1.0 mol/L",21)+
  tx(469,68,"250 mL",24)+tx(469,102,"0.40 mol/L",21)+
  arrow(253,100,346,100)+tx(300,83,en?"add water":"水を加える",17)+
  tx(129,152,"n=0.10 mol",17)+tx(469,152,"n=0.10 mol",17);
  return figure(en?"Dilution changes volume, not retained solute amount":"希釈で変わるのは体積、保たれるのは溶質の物質量",
    en?"A 100 mL portion of 1.0 mol/L solute is diluted to 250 mL. This assumes no solute loss or chemical change and uses the final solution volume.":"1.0 mol/L、100 mLの溶液を最終体積250 mLまで希釈。溶質の損失や反応がないと仮定し、最終の溶液体積を使用する。","c₁V₁=c₂V₂　→　c₂=0.40 mol/L",art);
 }
 if(id==="1-4"&&step==="pressure"){
  const art=rect(32,30,240,157,"#eaf4fa")+rect(328,30,240,157,"#eef9f1")+
  tx(150,62,en?"Pure water":"純水",21)+tx(449,62,en?"Sugar solution":"糖の水溶液",21)+
  ln(300,21,300,196,"#729787",5,"5 5")+
  arrow(271,110,329,110)+ln(329,136,271,136,"#9e8472",2,"6 3")+
  tx(300,213,en?"water crosses":"水は通過する",15)+
  '<circle cx="407" cy="106" r="7" fill="#d3a768"/><circle cx="483" cy="138" r="7" fill="#d3a768"/><circle cx="450" cy="169" r="7" fill="#d3a768"/>';
  return figure(en?"Water moves both ways; pressure can offset net flow":"水は両方向へ動き、圧力差が正味の移動を変える",
    en?"A selectively permeable membrane allows water across but retains the illustrated solute. Increasing pressure can oppose net osmosis. This is a qualitative molecular cartoon.":"半透膜が水を通すが図示した溶質は通さない模型。水分子は両方向に移動し、圧力差で正味の流れが変わる。定性的な模式図。","chemical potential of water: μleft = μright at equilibrium",art);
 }
 if(id==="2-1"&&step==="slope"){
  const art=ln(74,27,74,177,"#53666f",3)+ln(74,177,564,177,"#53666f",3)+
  '<path d="M101 45 L493 130" stroke="#5386a0" stroke-width="4" fill="none"/>'+
  '<circle cx="101" cy="45" r="6" fill="#5386a0"/><circle cx="493" cy="130" r="6" fill="#5386a0"/>'+
  tx(112,27,"0.80",18)+tx(507,113,"0.50",18)+tx(296,196,"10 s",18)+
  tx(22,104,"[A]",19)+tx(515,157,en?"time":"時間",15);
  return figure(en?"Average reaction rate from two measurements":"二つの測定点から平均消費速度を求める",
    en?"Measured [A] falls from 0.80 to 0.50 mol/L over 10 s. The line connects the two observations for average-rate calculation and is not proof of a linear kinetic law.":"[A]が10秒間に0.80から0.50 mol/Lへ減少。線は平均速度を示すための二点間の接続であり、反応が常に直線的に進むという意味ではない。","vavg=−Δ[A]/Δt=0.030 mol L⁻¹ s⁻¹",art);
 }
 if(id==="2-2"&&step==="rates"){
  const art=rect(33,53,180,94)+rect(385,53,180,94)+
   tx(123,92,"A",34)+tx(476,92,"B",34)+
   arrow(220,82,376,82)+ln(375,123,221,123,"#b6824e",3)+
   tx(300,69,"vforward",15)+tx(300,146,"vreverse",15)+
   tx(300,188,en?"Equal rates ≠ equal concentrations":"等しい速度 ≠ 等しい濃度",17);
  return figure(en?"Dynamic equilibrium: opposing rates balance":"動的平衡は正逆反応の速度がつり合うこと",
    en?"Forward A→B and reverse B→A can continue at equal rates even when [A] and [B] differ. This shows a conceptual balance, not an externally pumped tank.":"A→BとB→Aの両反応が続き、速度が等しければ正味の濃度変化は止まる。[A]と[B]自体が等しい必要はない。","vforward=vreverse at equilibrium",art);
 }
 if(id==="2-3"&&step==="log"){
  const art=rect(28,42,169,117,"#f1e6df")+rect(215,42,169,117,"#f4f1e8")+rect(402,42,169,117,"#eaf4ef")+
  tx(112,87,"pH 2",28)+tx(299,87,"pH 3",28)+tx(487,87,"pH 4",28)+
  tx(112,125,"10⁻²",24)+tx(299,125,"10⁻³",24)+tx(487,125,"10⁻⁴",24)+
  tx(300,194,en?"Each step = 10× smaller H+ activity":"1目盛りでH⁺活量は10分の1",16);
  return figure(en?"pH turns factors of ten into steps of one":"pHは10倍の差を1の差へ変換する",
    en?"Illustrative dimensionless hydrogen-ion activities 10−2, 10−3 and 10−4 correspond to pH 2, 3 and 4, respectively. This is an activity scale, not raw concentration.":"水素イオン活量（無次元）の10⁻²、10⁻³、10⁻⁴を、pH 2、3、4と表す。濃度の値そのものではなく活量の対数尺度。","pH=−log₁₀ a(H⁺)",art);
 }
 if(id==="2-4"&&step==="curve"){
  const art=ln(74,24,74,187,"#586f6e",3)+ln(74,187,564,187,"#586f6e",3)+
  '<path d="M91 159 C177 144 261 143 340 129 C367 124 384 94 393 58 C406 24 430 22 545 21" fill="none" stroke="#478774" stroke-width="4"/>'+
  ln(397,27,397,187,"#bd895b",2,"6 4")+tx(410,172,en?"equivalence":"当量点",15)+
  tx(43,30,"pH",18)+tx(522,207,en?"volume base":"塩基の体積",15);
  return figure(en?"A weak-acid/strong-base titration curve is not a straight line":"弱酸と強塩基の滴定曲線の模式図",
    en?"Qualitative curve only: a buffer region precedes an equivalence region typically above pH 7 under common aqueous conditions. Exact pH values depend on acid, concentration and temperature.":"緩衝領域から当量点付近の急変へ進む弱酸・強塩基の定性的な曲線。実際のpH値は酸の種類・濃度・温度に依存する。","equivalence point ≠ indicator endpoint",art);
 }
 if(id==="2-5"&&step==="circuit"){
  const art=rect(18,66,206,124,"#e9f4f8")+rect(373,66,208,124,"#f2eee6")+
  tx(119,114,"Zn → Zn²⁺ + 2e⁻",19)+tx(477,114,"Cu²⁺ + 2e⁻ → Cu",17)+
  tx(118,147,en?"Anode: oxidation":"陽極：酸化",16)+tx(477,147,en?"Cathode: reduction":"陰極：還元",16)+
  arrow(226,49,372,49)+tx(300,32,en?"electrons in wire":"導線を流れる電子",16)+
  ln(229,191,369,191,"#608e81",4,"7 4")+tx(300,180,en?"ion transport":"イオン移動",16);
  return figure(en?"Electron and ion flows complete a galvanic circuit":"導線の電子移動と溶液のイオン移動は一組",
    en?"Schematic zinc–copper galvanic cell: zinc oxidizes and copper(II) reduces; electronic current travels through the external path while ions maintain charge balance internally. Not a scale diagram of electrode compartments.":"亜鉛と銅の電池の模式図。外部導線を通る電子と、溶液中で電荷の偏りを調整するイオン移動を区別する。実際の装置の正確な配置ではない。","Zn + Cu²⁺ → Zn²⁺ + Cu",art);
 }
 if(id==="4-0"&&step==="formula"){
  const art=rect(22,36,251,143,"#eef9f4")+rect(327,36,252,143,"#f5f0e8")+
  tx(146,81,"CH₃–CH₂–OH",24)+tx(452,81,"CH₃–O–CH₃",24)+
  tx(146,123,en?"ethanol (alcohol)":"エタノール",17)+tx(452,123,en?"dimethyl ether":"ジメチルエーテル",17)+
  tx(300,199,"C₂H₆O",22);
  return figure(en?"Same molecular formula, different connectivity":"同じ分子式でも結合順序が違う",
    en?"Ethanol and dimethyl ether have the same formula C₂H₆O but different bonds and functional groups. The structural formulas are connectivity models, not three-dimensional molecular images.":"エタノールとジメチルエーテルは同じ分子式C₂H₆Oだが、酸素の結合相手が異なる。分子式と構造式を区別した図で、立体配置の写真ではない。","molecular formula ≠ complete structural identity",art);
 }
 if(id==="5-1"&&step==="rubber"){
  let loose="",net="";
  for(let i=0;i<5;i++){let a=58+i*34;loose+='<path d="M'+a+' 47 q21 35 0 70 q−16 30 0 55" stroke="#5b90a2" stroke-width="3" fill="none"/>';
   let b=351+i*38;net+='<path d="M'+b+' 47 q18 35 0 70 q−15 30 0 55" stroke="#4b8e72" stroke-width="3" fill="none"/>'}
  net+=ln(356,99,517,99,"#ac7956",3)+ln(356,154,517,154,"#ac7956",3);
  const art=rect(20,22,232,165)+rect(315,22,263,165)+loose+net+
  tx(133,207,en?"Unlinked flexible chains":"架橋なしの鎖",14)+tx(447,207,en?"Crosslinked network":"架橋した網目",14);
  return figure(en?"Crosslinks change how polymer chains can move":"架橋は高分子鎖の動き方を変える",
    en?"Idealized polymer chains: crosslinks restrain large-scale flow while flexible segments can rearrange. Strand shape and density are schematic, not measured polymer-network morphology.":"架橋によって鎖どうしがつながり、全体の流動が抑えられる一方、鎖の部分は動き得る。模式図であり、実際の高分子網目の形や密度を測定した図ではない。","chain conformation + crosslinks → elastic response",art);
 }

 if(id==="4-1"&&step==="benzene"){
  const bond=(x1,y1,x2,y2,dash="")=>ln(x1,y1,x2,y2,"#497e79",3,dash);
  const x1=140,y1=113,R=65,x2=448,y2=113;
  let hexA="",hexB="";
  for(let i=0;i<6;i++){let a=i*Math.PI/3-Math.PI/2,b=(i+1)*Math.PI/3-Math.PI/2;
    hexA+=bond(x1+R*Math.cos(a),y1+R*Math.sin(a),x1+R*Math.cos(b),y1+R*Math.sin(b));
    hexB+=bond(x2+R*Math.cos(a),y2+R*Math.sin(a),x2+R*Math.cos(b),y2+R*Math.sin(b))}
  hexB+='<circle cx="'+x2+'" cy="'+y2+'" r="37" fill="none" stroke="#b97d4f" stroke-width="3"/>';
  const art=hexA+hexB+tx(294,113,"→",33)+
  tx(140,202,en?"One Lewis contributor":"一つの共鳴寄与構造",14)+tx(448,202,en?"Delocalized π model":"π電子非局在化模型",14);
  return figure(en?"Benzene is not three independent alkene bonds":"ベンゼンは独立した二重結合三つではない",
    en?"A polygon-like Lewis contributor is contrasted with a delocalized π-ring symbol. These are alternative representations of one electronic structure, not a time sequence or a measured electron-density map.":"結合を局在させたルイス型の表現と、π電子が環全体へ広がる模型の比較。共鳴式は時間的に交替する構造の写真ではない。","resonance contributors ≠ interconverting molecules",art);
 }
 if(id==="4-3"&&step==="resonance"){
  const art=rect(19,50,250,120,"#f1f7f9")+rect(331,50,249,120,"#f2f9f4")+
  tx(144,102,"R–C(=O)–O⁻",22)+tx(454,102,"R–C(–O⁻)=O",22)+
  tx(300,105,"↔",32)+tx(300,194,en?"Contributors to ONE state":"一つの状態を表す共鳴式",16);
  return figure(en?"The conjugate base has delocalized electron density":"共役塩基の電子は一つの酸素だけに固定されない",
    en?"Two resonance contributors for a carboxylate anion, shown schematically. The negative charge is delocalized; the two formulas are not distinct ions converting back and forth.":"カルボキシラートイオンの二つの共鳴寄与構造。負電荷に関係する電子密度は非局在化しており、二種類のイオンが行き来する図ではない。","RCOO⁻: electron density shared over both oxygen atoms",art);
 }
 if(id==="4-5"&&step==="starch"){
  const art=rect(16,34,268,145,"#eff7ef")+rect(315,34,267,145,"#eef3f9")+
  tx(150,73,en?"Starch":"デンプン",23)+tx(447,73,en?"Cellulose":"セルロース",23)+
  tx(150,122,"α glycosidic",21)+tx(447,122,"β-1,4 glycosidic",21)+
  tx(150,157,en?"enzyme recognition differs":"認識する酵素が異なる",13)+tx(447,157,en?"chain packing differs":"鎖の配列が異なる",13);
  return figure(en?"A stereochemical change can alter polymer function":"結合の立体配置が、高分子全体の性質を変える",
    en?"Conceptual comparison of α-type linkages common in starch and β-1,4 links in cellulose. This chart names linkage stereochemistry; it is not a 3D atomic drawing.":"デンプンの代表的なα型結合とセルロースのβ-1,4結合を比較。立体配置の違いを示す説明表であり、原子の三次元配置を正確に描いた模型ではない。","glucose residue ≠ guaranteed identical polymer structure",art);
 }
 if(id==="5-0"&&step==="averages"){
  const art=rect(22,44,253,122,"#edf7f0")+rect(327,44,249,122,"#f1f5fa")+
  tx(149,75,en?"Two chains":"分子鎖が2本",19)+tx(149,108,"M₁=100",20)+tx(149,137,"M₂=200",20)+
  tx(454,76,"Mn=150",23)+tx(454,114,"Mw≈166.7",23)+tx(300,110,"→",31);
  return figure(en?"Different averages answer different distribution questions":"平均をどう取るかで分子量の値は変わる",
    en?"Illustrative two-chain sample with molar masses 100 and 200 in the same units. The number-average is 150 and the weight-average is approximately 166.7. The values are invented solely for calculation.":"同じ単位でモル質量100と200の分子鎖が各1本ある模型。数平均150、重量平均約166.7。数値は計算方法の説明用で、実在の高分子試料の測定値ではない。","Mn=ΣNiMi/ΣNi; Mw=ΣNiMi²/ΣNiMi",art);
 }
 if(id==="5-2"&&step==="evidence"){
  const art=rect(16,49,258,118,"#faf2e9")+rect(330,49,254,118,"#e9f6f0")+
  tx(144,87,en?"Fragmentation":"細片化",24)+tx(455,87,en?"Mineralization":"無機化",24)+
  tx(144,127,en?"smaller pieces remain":"小片が残る",16)+tx(455,127,en?"carbon balance / CO₂":"炭素収支・CO₂測定",16)+
  tx(300,195,en?"Not interchangeable evidence":"同じ証拠として扱わない",17);
  return figure(en?"Breaking into fragments is not the same as biodegradation":"細かく砕けることと、生分解することは異なる",
    en?"A conceptual comparison: particle fragmentation can leave persistent polymer, while demonstrating biological mineralization needs suitable chemical evidence and controlled environmental conditions.":"細片化では高分子が残存する場合がある。生分解を調べるには炭素収支や生成CO₂などの化学的証拠と、測定条件の明記が必要となる。","origin label ≠ biodegradation rate",art);
 }
 return "";
}
window.ChemistryPedagogyVisuals={render};
})();