/* Original bilingual chemistry lessons; no learning gate or progress modification. */
(function(){
"use strict";
const en=new URLSearchParams(location.search).get("lang")==="en",lang=en?"en":"ja";
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const el=id=>document.getElementById(id);
const lessons=[
/*LESSONS*/
];
const cases=[
/*CASES*/
];
/*ENGINE*/
})();
