// @ts-nocheck
/* Ported verbatim from the v1 artifact (mascots + items + scenes). Returns SVG strings. */
let activeLook: (kind: string) => Record<string, string> = () => ({});
export function setLookProvider(fn) { activeLook = fn; }
/* ================= mascots ================= */
const HEART = "M0 3 C0 -1 6 -1 6 3 C6 -1 12 -1 12 3 C12 7 6 10 6 13 C6 10 0 7 0 3z";
let svgUid = 0;
function hearts(){
  return `<g fill="#ff6f8c"><g transform="translate(6 18)"><path class="heart" d="${HEART}"/></g>
    <g transform="translate(100 10)"><path class="heart" d="${HEART}" style="animation-delay:-.8s"/></g>
    <g transform="translate(54 -4) scale(.8)"><path class="heart" d="${HEART}" style="animation-delay:-1.5s"/></g></g>`;
}
const star = (cx, cy, r, fill, cls = "", extra = "") => {
  const pts = [];
  for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r; pts.push(`${(cx + rr*Math.cos(a)).toFixed(1)},${(cy + rr*Math.sin(a)).toFixed(1)}`); }
  return `<polygon class="${cls}" points="${pts.join(" ")}" fill="${fill}" ${extra}/>`;
};
const flower = (x, y, petal, center, r = 5.5, d = 7) =>
  `<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a => `<circle cx="${(d*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(d*Math.sin(a*Math.PI/180)).toFixed(1)}" r="${r}" fill="${petal}" stroke="rgba(0,0,0,.08)"/>`).join("")}<circle r="${r*.75}" fill="${center}"/></g>`;
const heartAt = (x, y, s, fill, cls = "") => `<g transform="translate(${x} ${y}) scale(${s})"><path class="${cls}" d="${HEART}" fill="${fill}"/></g>`;

/* arms + where a held item goes for each pose */
const HANDPOS = { normal:[97,128], sleepy:[97,128], happy:[110,80], wink:[110,80], ecstatic:[112,72], sad:[66,130] };
function arms(mood, fill, stroke){
  const A = (cx,cy,r,cls="") => `<g class="${cls}"><ellipse cx="${cx}" cy="${cy}" rx="8.5" ry="14" transform="rotate(${r} ${cx} ${cy})" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="2"`:""}/></g>`;
  if (mood === "ecstatic") return A(16,86,40,"wave l") + A(104,86,-40,"wave");
  if (mood === "happy" || mood === "wink") return A(31,118,22) + A(102,94,-38,"wave");
  if (mood === "sad") return A(47,121,-35) + A(73,121,35);
  return A(31,118,22) + A(89,118,-22);
}

/* ---------- item catalog ----------
   slot: head | face | neck | outfit | hand | aura | scene
   lvl: unlocked free at that bond level · cost: buy in the Boutique
   layer: back (behind body) · body (on the body, under the head) · under (neck, tucked under chin) · front (default) */
const ITEMS = [
  // HEAD
  {id:"blossom", slot:"head", name:"Blossom Clip", desc:"Sakura petal clip", lvl:2, draw:() => flower(26,22,"#fff","#ffd166")},
  {id:"silkbow", slot:"head", name:"Silk Ribbon Bow", desc:"Coral satin ribbon", lvl:4, draw:() => `<g transform="translate(92 30) rotate(15)"><path d="M0 0 l-14 -9 v18z M0 0 l14 -9 v18z" fill="#ff6f8c" stroke="#e0506e" stroke-width="1.2" stroke-linejoin="round"/><circle r="4.5" fill="#ff8fa3" stroke="#e0506e" stroke-width="1.2"/></g>`},
  {id:"crown", slot:"head", name:"Twin Crown", desc:"Royal hydration royalty", lvl:6, draw:c => `<g transform="translate(60 ${c.kind==="cat"?22:18})"><path d="M-16 6 l-3 -16 l10 8 l9 -12 l9 12 l10 -8 l-3 16z" fill="#ffd166" stroke="#e0a800" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="-2" r="2.2" fill="${c.kind==="cat"?"#7cc8ff":"#ff8fa3"}"/></g>`},
  {id:"sunflower", slot:"head", name:"Sunflower Pin", desc:"A pocket of sunshine", cost:60, draw:() => `<g transform="translate(92 24)">${Array.from({length:10},(_,i)=>`<ellipse cx="0" cy="-8" rx="3.2" ry="6" fill="#ffd23f" transform="rotate(${i*36})"/>`).join("")}<circle r="5" fill="#8a5a3c"/></g>`},
  {id:"beret", slot:"head", name:"Strawberry Beret", desc:"Cozy pink, very Paris", cost:90, draw:() => `<g transform="rotate(-10 60 24)"><ellipse cx="60" cy="25" rx="32" ry="12" fill="#ff6f7d" stroke="#e0506e" stroke-width="1.5"/>${[[46,24],[56,20],[68,22],[74,28],[52,29]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.3" ry="1.8" fill="#ffe08a"/>`).join("")}<path d="M60 14 q7 -9 13 -2 q-7 3 -13 2z" fill="#6fbf73"/><circle cx="60" cy="14" r="3" fill="#e0506e"/></g>`},
  {id:"matcha", slot:"head", name:"Matcha Beret", desc:"Tiny matcha latte vibes", cost:90, draw:() => `<g transform="rotate(8 60 24)"><ellipse cx="60" cy="25" rx="32" ry="12" fill="#a7cf8e" stroke="#7fae6a" stroke-width="1.5"/><circle cx="60" cy="14" r="3.2" fill="#7fae6a"/><path d="M46 26 q14 5 28 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/></g>`},
  {id:"wreath", slot:"head", name:"Peach Blossom Crown", desc:"Soft blush floral halo", cost:120, draw:() => { let s = ""; for (let i = 0; i < 7; i++){ const a = (205 + i*21.5)*Math.PI/180; const x = 60 + 43*Math.cos(a), y = 64 + 39*Math.sin(a); s += `<ellipse cx="${(x+4).toFixed(1)}" cy="${(y+3).toFixed(1)}" rx="5" ry="2.5" fill="#8fd194" transform="rotate(${i*25-70} ${x.toFixed(1)} ${y.toFixed(1)})"/>` + flower(x.toFixed(1), y.toFixed(1), ["#ffb3a7","#ffd6de","#fff"][i%3], "#ffd166", 3.4, 4.2); } return s; }},
  {id:"sleepcap", slot:"head", name:"Starry Sleep Cap", desc:"Sweet dreams pompom", cost:80, draw:() => `<path d="M26 34 Q48 -12 104 0 Q92 14 96 32 Z" fill="#4a6fa5"/>${star(56,14,3,"#ffe08a")}${star(76,8,2.5,"#ffe08a")}${star(88,20,2.2,"#ffe08a")}<path d="M24 34 Q60 22 98 31" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="106" cy="2" r="6.5" fill="#fff"/>`},
  {id:"froghat", slot:"head", name:"Froggy Hat", desc:"Ribbit ribbit", cost:110, draw:() => `<path d="M16 40 Q60 -8 104 40 Q60 30 16 40z" fill="#8fd18a" stroke="#5fa35a" stroke-width="2"/>${[38,82].map(x=>`<circle cx="${x}" cy="12" r="9" fill="#8fd18a" stroke="#5fa35a" stroke-width="2"/><circle cx="${x}" cy="12" r="5.5" fill="#fff"/><circle cx="${x+1}" cy="13" r="2.8" fill="#2d2a32"/>`).join("")}<path d="M50 24 q10 6 20 0" stroke="#5fa35a" stroke-width="2" fill="none" stroke-linecap="round"/>`},
  {id:"chef", slot:"head", name:"Little Chef Hat", desc:"Head chef of cha", cost:100, draw:() => `<g stroke="#eadfe3" stroke-width="1.5"><circle cx="46" cy="10" r="11" fill="#fff"/><circle cx="74" cy="10" r="11" fill="#fff"/><circle cx="60" cy="3" r="13" fill="#fff"/><rect x="40" y="14" width="40" height="14" rx="3" fill="#fff"/></g>`},
  // FACE
  {id:"glasses", slot:"face", name:"Round Specs", desc:"Smart & studious", cost:70, draw:c => { const [a,b] = c.kind==="cat"?[42,78]:[43,77]; return `<g fill="rgba(255,255,255,.25)" stroke="#6b4f3a" stroke-width="2.5"><circle cx="${a}" cy="62" r="11"/><circle cx="${b}" cy="62" r="11"/></g><path d="M${a+11} 61 q${(b-a-22)/2} -4 ${b-a-22} 0" stroke="#6b4f3a" stroke-width="2.5" fill="none"/>`; }},
  {id:"shades", slot:"face", name:"Heart Shades", desc:"Too cool to be thirsty", cost:90, draw:c => { const [a,b] = c.kind==="cat"?[42,78]:[43,77]; return heartAt(a-11,52,1.8,"#ff4d6d") + heartAt(b-11,52,1.8,"#ff4d6d") + `<path d="M${a+9} 58 h${b-a-18}" stroke="#ff4d6d" stroke-width="2.5"/>`; }},
  {id:"stickers", slot:"face", name:"Star Stickers", desc:"Sparkly cheek stickers", cost:40, draw:() => star(24,90,5.5,"#ffd166","","stroke='#e0a800' stroke-width='.8'") + star(97,88,4.5,"#ffd166","","stroke='#e0a800' stroke-width='.8'") + heartAt(88,94,.6,"#ff8fa3")},
  // NECK
  {id:"scarf", slot:"neck", name:"Cozy Scarf", desc:"Warm knit for chilly nights", lvl:5, layer:"under", draw:() => `<path d="M24 96 q36 20 72 0 l2 10 q-38 20 -76 0z" fill="#ff8fa3"/><rect x="74" y="100" width="10" height="16" rx="3" fill="#ff6f8c"/>`},
  {id:"daisy", slot:"neck", name:"Daisy Collar", desc:"Sunny white daisies", cost:60, draw:() => { let s = `<path d="M34 102 Q60 116 86 102" stroke="#8fd194" stroke-width="2" fill="none"/>`; for (let i=0;i<5;i++){ const x = 38 + i*11, y = 103 + 8*(1 - ((x-60)/24)**2); s += flower(x, y.toFixed(1), "#fff", "#ffd166", 2.3, 3); } return s; }},
  {id:"bowtie", slot:"neck", name:"Mint Bowtie", desc:"Dapper & fresh", cost:50, draw:() => `<g transform="translate(60 108)"><path d="M0 0 l-11 -7 v14z M0 0 l11 -7 v14z" fill="#7fd4ad" stroke="#4fb488" stroke-width="1.2" stroke-linejoin="round"/><circle r="3.5" fill="#4fb488"/></g>`},
  {id:"bell", slot:"neck", name:"Jingle Bell", desc:"Jingle when you sip", cost:50, draw:() => `<path d="M34 101 Q60 116 86 101" stroke="#ff6f7d" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="112" r="5.5" fill="#ffd166" stroke="#e0a800" stroke-width="1.2"/><path d="M56 113 h8" stroke="#a37400" stroke-width="1.2"/>`},
  // OUTFIT
  {id:"kimono", slot:"outfit", name:"Cozy Kimono", desc:"For chilly autumn tea sips", cost:150, layer:"body", draw:c => clipBody(c, `<rect x="20" y="90" width="80" height="62" fill="#ffd1dc"/>${[[38,108],[50,138],[80,112],[72,140],[30,128]].map(([x,y])=>flower(x,y,"#fff","#ffb3c1",2.2,2.8)).join("")}<path d="M44 94 L60 122 L76 94" stroke="#ff8fa3" stroke-width="4" fill="none"/><rect x="20" y="121" width="80" height="9" fill="#ff8fa3"/><circle cx="60" cy="125.5" r="4" fill="#ffc94d"/>`)},
  {id:"apron", slot:"outfit", name:"Tea Apron", desc:"Barista of the house", cost:110, layer:"body", draw:() => `<path d="M38 104 L32 96 M82 104 L88 96" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M40 103 h40 v28 q-20 12 -40 0z" fill="#fff" stroke="#eadfe3" stroke-width="1.5"/><rect x="50" y="116" width="20" height="11" rx="3" fill="#ffe3ea"/>${heartAt(55,116,.85,"#ff8fa3")}`},
  {id:"pjs", slot:"outfit", name:"Starry PJs", desc:"Periwinkle sleepwear", cost:130, layer:"body", draw:c => clipBody(c, `<rect x="20" y="90" width="80" height="62" fill="#9fb4ee"/>${[[36,110],[52,134],[78,108],[70,130],[86,124],[44,122]].map(([x,y])=>star(x,y,3,"#ffe08a")).join("")}<path d="M44 96 l16 12 l16 -12" stroke="#fff" stroke-width="3.5" fill="none" stroke-linejoin="round"/>`)},
  {id:"raincoat", slot:"outfit", name:"Puddle Raincoat", desc:"Splash-proof sunshine", cost:120, layer:"body", draw:c => clipBody(c, `<rect x="20" y="90" width="80" height="62" fill="#ffd23f"/><path d="M60 98 V150" stroke="#e0a800" stroke-width="2"/>${[108,120,132].map(y=>`<circle cx="66" cy="${y}" r="2.5" fill="#e0a800"/>`).join("")}<path d="M28 104 h10 M82 104 h10" stroke="#fff" stroke-width="3" opacity=".6"/>`)},
  {id:"sweater", slot:"outfit", name:"Lilac Knit", desc:"Soft chunky sweater", cost:100, layer:"body", draw:c => clipBody(c, `<rect x="20" y="90" width="80" height="62" fill="#c9a3e8"/>${[110,126,142].map(y=>`<rect x="20" y="${y}" width="80" height="4" fill="#b48cf2"/>`).join("")}${[30,40,50,60,70,80,90].map(x=>`<path d="M${x} 116 l3 4 l3 -4" stroke="#e6d4f7" stroke-width="1.4" fill="none"/>`).join("")}`)},
  {id:"cape", slot:"outfit", name:"Hero Cape", desc:"Hydration superhero", lvl:10, layer:"back", draw:() => `<path d="M28 100 Q60 92 92 100 L104 148 Q60 156 16 148 Z" fill="#ff5c7a"/><path d="M28 100 Q60 92 92 100 L96 110 Q60 102 24 110 Z" fill="#e0405f"/>`},
  // HAND
  {id:"bamboo", slot:"hand", name:"Bamboo Sprig", desc:"Crisp fresh chew-toy", lvl:3, draw:c => { const [x,y] = c.P; return `<g transform="translate(${x-2} ${y-24}) rotate(10)"><rect x="-2" y="0" width="4.5" height="28" rx="2" fill="#6fbf73"/><rect x="-2" y="10" width="4.5" height="2" fill="#4f9e55"/><path d="M1 6 q14 -9 20 2 q-11 5 -20 -2z" fill="#9bd89e"/><path d="M1 14 q-13 -6 -17 4 q10 3 17 -4z" fill="#8fd194"/></g>`; }},
  {id:"bottle", slot:"hand", name:"Water Bottle", desc:"Their #1 accessory", cost:40, draw:c => { const [x,y] = c.P; return `<g transform="translate(${x} ${y})"><rect x="-7" y="-24" width="14" height="27" rx="5" fill="#7cc8ff" stroke="#3a9ad6" stroke-width="1.5"/><rect x="-4.5" y="-30" width="9" height="7" rx="2" fill="#3d2f3b"/><rect x="-7" y="-14" width="14" height="7" fill="#fff" opacity=".75"/><path d="M-3 -11 q3 -3 6 0" stroke="#3a9ad6" stroke-width="1.2" fill="none"/></g>`; }},
  {id:"boba", slot:"hand", name:"Boba Cup", desc:"Butter yellow milk tea", cost:60, draw:c => { const [x,y] = c.P; return `<g transform="translate(${x} ${y})"><path d="M3 -24 L10 -38" stroke="#ff6f8c" stroke-width="3" stroke-linecap="round"/><path d="M-9 -22 L9 -22 L7 3 L-7 3z" fill="#ffe7b0" stroke="#d9a74a" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="0" cy="-22" rx="10" ry="3" fill="#fff" stroke="#d9a74a" stroke-width="1.2"/>${[[-4,-2],[1,-1],[5,-3],[-1,-5],[3,-7]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="1.8" fill="#4a3428"/>`).join("")}</g>`; }},
  {id:"teacup", slot:"hand", name:"Mint Teacup", desc:"Steaming herbal sip", cost:60, draw:c => { const [x,y] = c.P; return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="3" rx="13" ry="3" fill="#fff" stroke="#7fd4ad" stroke-width="1.2"/><path d="M-10 -10 h20 q0 13 -10 13 q-10 0 -10 -13z" fill="#bfe8d6" stroke="#7fd4ad" stroke-width="1.5"/><circle cx="12" cy="-5" r="3.5" fill="none" stroke="#7fd4ad" stroke-width="1.8"/><path d="M-3 -14 q-3 -4 0 -8 M3 -14 q-3 -4 0 -8" stroke="#c9b8c2" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`; }},
  {id:"balloon", slot:"hand", name:"Heart Balloon", desc:"Floaty little love", cost:70, draw:c => { const [x,y] = c.P; return `<path d="M${x} ${y} q-4 -16 2 -28" stroke="#c9b8c2" stroke-width="1.2" fill="none"/>${heartAt(x-10, y-54, 1.9, "#ff6f8c")}<path d="M${x-5} ${y-48} q2 -3 5 -2" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>`; }},
  {id:"wand", slot:"hand", name:"Star Wand", desc:"Grants hydration wishes", lvl:9, draw:c => { const [x,y] = c.P; return `<path d="M${x} ${y} L${x+4} ${y-26}" stroke="#c99a3e" stroke-width="3" stroke-linecap="round"/>${star(x+5,y-32,8,"#ffd166","","stroke='#e0a800' stroke-width='1.2'")}`; }},
  // AURA
  {id:"sparkle", slot:"aura", name:"Sparkle Aura", desc:"Hydration twinkles", lvl:7, draw:() => [[4,30,6],[114,22,7],[8,104,5],[116,98,6],[60,-8,5]].map(([x,y,r],i)=>star(x,y,r,"#ffd166","tw",`style="animation-delay:-${i*.4}s;transform-box:fill-box;transform-origin:center"`)).join("")},
  {id:"rainbow", slot:"aura", name:"Rainbow Arc", desc:"After the rain, a rainbow", lvl:8, layer:"back", draw:() => [["#ff9aa2",70],["#ffd6a5",63],["#fdffb6",56],["#caffbf",49],["#9bf6ff",42]].map(([c,r])=>`<path d="M${60-r} 104 A${r} ${r} 0 0 1 ${60+r} 104" stroke="${c}" stroke-width="7" fill="none" opacity=".9"/>`).join("")},
  {id:"loveaura", slot:"aura", name:"Love Bubbles", desc:"Floating little hearts", cost:80, draw:() => hearts()},
  {id:"bubbles", slot:"aura", name:"Sip Bubbles", desc:"Fizzy water bubbles", cost:70, draw:() => [[6,60,5],[112,40,4],[16,20,3.5],[108,110,6],[2,120,3]].map(([x,y,r],i)=>`<circle class="heart" cx="${x}" cy="${y}" r="${r}" fill="rgba(124,200,255,.25)" stroke="#7cc8ff" stroke-width="1.4" style="animation-delay:-${i*.5}s"/>`).join("")},
  // SCENES (backdrops)
  {id:"sky", slot:"scene", name:"Sunny Meadow", desc:"Fluffy clouds & grass", free:true},
  {id:"sakura", slot:"scene", name:"Sakura Park", desc:"Falling cherry petals", cost:100},
  {id:"night", slot:"scene", name:"Starry Night", desc:"Moon & twinkles", cost:100},
  {id:"beach", slot:"scene", name:"Cox's Bazar Beach", desc:"Sun, sea & sand", cost:120},
  {id:"rain", slot:"scene", name:"Rainy Day", desc:"Cozy puddle weather", cost:90},
  {id:"cafe", slot:"scene", name:"Tea Café", desc:"Warm cups & shelves", cost:110},
  {id:"rooftop", slot:"scene", name:"Dhaka Rooftop", desc:"Golden-hour skyline", cost:130},
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const SLOTS = [["head","Head","🎀"],["face","Face","👓"],["neck","Neck","🧣"],["outfit","Outfit","👘"],["hand","Hand","🧋"],["aura","Aura","✨"]];
const SLOT_NAME = Object.fromEntries(SLOTS.map(s => [s[0], s[1]])); SLOT_NAME.scene = "Scene";
function clipBody(c, inner){ return `<clipPath id="cb${c.u}"><ellipse cx="60" cy="120" rx="32" ry="25"/></clipPath><g clip-path="url(#cb${c.u})">${inner}</g><ellipse cx="60" cy="120" rx="32" ry="25" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`; }

/* ---------- character parts ---------- */
function pandaParts(mood){
  const W = "#ffffff", K = "#2d2a32";
  let eyes, mouth, extra = "";
  const arc = (x) => `<path d="M${x-6} 62 q6 -7 12 0" stroke="${W}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const dot = (x) => `<g class="blink"><circle cx="${x}" cy="61" r="5.5" fill="${W}"/><circle cx="${x+1}" cy="62" r="3" fill="${K}"/><circle cx="${x+2}" cy="60.5" r="1" fill="${W}"/></g>`;
  switch (mood){
    case "ecstatic":
      eyes = `<path d="M36 63 q7 -9 14 0" stroke="${W}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M70 63 q7 -9 14 0" stroke="${W}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M49 79 q11 17 22 0 z" fill="#5a2a35" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="88" rx="6" ry="3.4" fill="#ff7b93"/>`;
      extra = hearts(); break;
    case "happy":
      eyes = arc(43) + arc(77);
      mouth = `<path d="M53 80 q7 9 14 0 z" fill="#ff7b93" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`; break;
    case "wink":
      eyes = dot(43) + arc(77);
      mouth = `<path d="M53 80 q7 9 14 0 z" fill="#ff7b93" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="63" cy="85" rx="3" ry="2" fill="#ff5c7a"/>`; break;
    case "sleepy":
      eyes = `<path d="M37 62 q6 5 12 0" stroke="${W}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M71 62 q6 5 12 0" stroke="${W}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      mouth = `<ellipse cx="60" cy="84" rx="3.2" ry="2.6" fill="${K}"/>`;
      extra = `<text class="zz" x="98" y="22" font-size="15" font-weight="800" fill="#7b8bd6" font-family="Fredoka,sans-serif">z</text><text class="zz" x="108" y="10" font-size="11" font-weight="800" fill="#7b8bd6" font-family="Fredoka,sans-serif" style="animation-delay:-1.5s">z</text>`; break;
    case "sad":
      eyes = `<circle cx="43" cy="63" r="6.5" fill="${W}"/><circle cx="43.5" cy="64" r="4.3" fill="${K}"/><circle cx="45" cy="61.8" r="1.8" fill="${W}"/><circle cx="42" cy="66" r="1" fill="${W}"/>
              <circle cx="77" cy="63" r="6.5" fill="${W}"/><circle cx="76.5" cy="64" r="4.3" fill="${K}"/><circle cx="78" cy="61.8" r="1.8" fill="${W}"/><circle cx="75" cy="66" r="1" fill="${W}"/>
              <path d="M31 47 L46 41" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M74 41 L89 47" stroke="${K}" stroke-width="3" stroke-linecap="round"/>
              <path class="tear" d="M37 74 q3.5 6 0 9 q-3.5 -3 0 -9z" fill="#7cc8ff"/><path class="tear r" d="M83 74 q3.5 6 0 9 q-3.5 -3 0 -9z" fill="#7cc8ff"/>`;
      mouth = `<path d="M52 87 q8 -8 16 0" stroke="${K}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; break;
    default:
      eyes = dot(43) + dot(77);
      mouth = `<path d="M54 80 q3 3.5 6 0 q3 3.5 6 0" stroke="${K}" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
  }
  const blush = mood === "sad" ? .25 : mood === "ecstatic" ? 1 : .8;
  return {
    behind: `<ellipse cx="60" cy="147" rx="36" ry="4" fill="#000" opacity=".07"/>`,
    body: `<ellipse cx="44" cy="141" rx="11" ry="7" fill="${K}"/><ellipse cx="76" cy="141" rx="11" ry="7" fill="${K}"/><ellipse cx="60" cy="120" rx="32" ry="25" fill="${W}" stroke="${K}" stroke-width="2"/>`,
    head: `<circle cx="27" cy="30" r="15" fill="${K}"/><circle cx="93" cy="30" r="15" fill="${K}"/><circle cx="27" cy="30" r="7" fill="#4a4550"/><circle cx="93" cy="30" r="7" fill="#4a4550"/>
      <ellipse cx="60" cy="64" rx="46" ry="42" fill="${W}" stroke="${K}" stroke-width="2"/>
      <ellipse cx="42" cy="63" rx="11" ry="14" transform="rotate(-22 42 63)" fill="${K}"/><ellipse cx="78" cy="63" rx="11" ry="14" transform="rotate(22 78 63)" fill="${K}"/>
      ${eyes}<ellipse cx="60" cy="75" rx="5.5" ry="3.8" fill="${K}"/>${mouth}
      <ellipse cx="28" cy="80" rx="7" ry="4" fill="#ffb3c1" opacity="${blush}"/><ellipse cx="92" cy="80" rx="7" ry="4" fill="#ffb3c1" opacity="${blush}"/>`,
    arms: arms(mood, K), extra
  };
}
function catParts(mood){
  const F = "#f6b689", D = "#d9875a", K = "#2d2a32", P = "#ff9fb2", C = "#fff4e8";
  let eyes, mouth, extra = "";
  const arc = (x) => `<path d="M${x-6} 63 q6 -7 12 0" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const dot = (x) => `<g class="blink"><ellipse cx="${x}" cy="62" rx="6" ry="7.5" fill="${K}"/><circle cx="${x+2}" cy="59" r="2" fill="#fff"/></g>`;
  switch (mood){
    case "ecstatic":
      eyes = `<path d="M35 64 q7 -9 14 0" stroke="${K}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M71 64 q7 -9 14 0" stroke="${K}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M51 80 q9 16 18 0 z" fill="#5a2a35" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="88" rx="5" ry="3" fill="#ff7b93"/>`;
      extra = hearts(); break;
    case "happy":
      eyes = arc(42) + arc(78);
      mouth = `<path d="M52 80 q8 10 16 0 z" fill="#ff7b93" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`; break;
    case "wink":
      eyes = dot(42) + arc(78);
      mouth = `<path d="M52 80 q8 10 16 0 z" fill="#ff7b93" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="63" cy="85" rx="3" ry="2" fill="#ff5c7a"/>`; break;
    case "sleepy":
      eyes = `<path d="M36 63 q6 5 12 0" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M72 63 q6 5 12 0" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M60 79 q-4 4 -7 1 M60 79 q4 4 7 1" stroke="${K}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      extra = `<text class="zz" x="98" y="22" font-size="15" font-weight="800" fill="#7b8bd6" font-family="Fredoka,sans-serif">z</text><text class="zz" x="108" y="10" font-size="11" font-weight="800" fill="#7b8bd6" font-family="Fredoka,sans-serif" style="animation-delay:-1.5s">z</text>`; break;
    case "sad":
      eyes = `<ellipse cx="42" cy="64" rx="7.5" ry="8.5" fill="${K}"/><circle cx="44.5" cy="61" r="2.6" fill="#fff"/><circle cx="40" cy="67" r="1.2" fill="#fff"/>
              <ellipse cx="78" cy="64" rx="7.5" ry="8.5" fill="${K}"/><circle cx="80.5" cy="61" r="2.6" fill="#fff"/><circle cx="76" cy="67" r="1.2" fill="#fff"/>
              <path d="M32 52 L47 47" stroke="${D}" stroke-width="3" stroke-linecap="round"/><path d="M73 47 L88 52" stroke="${D}" stroke-width="3" stroke-linecap="round"/>
              <path class="tear" d="M35 72 q3.5 6 0 9 q-3.5 -3 0 -9z" fill="#7cc8ff"/><path class="tear r" d="M85 72 q3.5 6 0 9 q-3.5 -3 0 -9z" fill="#7cc8ff"/>`;
      mouth = `<path d="M53 87 q7 -7 14 0" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; break;
    default:
      eyes = dot(42) + dot(78);
      mouth = `<path d="M60 79 q-4 5 -8 1 M60 79 q4 5 8 1" stroke="${K}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  const earL = mood === "sad" ? `transform="rotate(-18 30 44)"` : mood === "ecstatic" ? `transform="rotate(6 30 44)"` : "";
  const earR = mood === "sad" ? `transform="rotate(18 90 44)"` : mood === "ecstatic" ? `transform="rotate(-6 90 44)"` : "";
  const tail = mood === "sad" || mood === "sleepy"
    ? `<path d="M88 134 q20 8 28 0 q3 -6 -3 -7 q-8 8 -24 -1z" fill="${F}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/>`
    : `<g class="tail"><path d="M86 132 q28 -2 24 -32 q-2 -9 -9 -5 q5 20 -17 26z" fill="${F}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/></g>`;
  const blush = mood === "sad" ? .2 : mood === "ecstatic" ? .9 : .6;
  return {
    behind: `<ellipse cx="60" cy="147" rx="36" ry="4" fill="#000" opacity=".07"/>${tail}`,
    body: `<ellipse cx="44" cy="141" rx="11" ry="7" fill="${F}" stroke="${D}" stroke-width="2"/><ellipse cx="76" cy="141" rx="11" ry="7" fill="${F}" stroke="${D}" stroke-width="2"/>
      <ellipse cx="60" cy="120" rx="32" ry="25" fill="${F}" stroke="${D}" stroke-width="2"/><ellipse cx="60" cy="124" rx="18" ry="17" fill="${C}"/>`,
    head: `<g ${earL}><path d="M16 54 L24 10 L56 32 Z" fill="${F}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/><path d="M24 44 L28 20 L44 32 Z" fill="${P}"/></g>
      <g ${earR}><path d="M104 54 L96 10 L64 32 Z" fill="${F}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/><path d="M96 44 L92 20 L76 32 Z" fill="${P}"/></g>
      <ellipse cx="60" cy="66" rx="46" ry="40" fill="${F}" stroke="${D}" stroke-width="2"/>
      <path d="M51 30 l2 10 M60 28 v12 M69 30 l-2 10" stroke="${D}" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="60" cy="81" rx="19" ry="13" fill="${C}"/>${eyes}
      <path d="M55.5 74 h9 l-4.5 4.5z" fill="${P}" stroke="${K}" stroke-width="1" stroke-linejoin="round"/>${mouth}
      <path d="M14 72 l20 3 M14 82 l20 -1 M106 72 l-20 3 M106 82 l-20 -1" stroke="${K}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="29" cy="79" rx="6.5" ry="4" fill="#ff8fa3" opacity="${blush}"/><ellipse cx="91" cy="79" rx="6.5" ry="4" fill="#ff8fa3" opacity="${blush}"/>`,
    arms: arms(mood, F, D), extra
  };
}
/* full character (inner SVG markup) wearing a look */
function mascot(kind, mood, look = {}){
  const c = {kind, mood, u: ++svgUid, P: HANDPOS[mood] || HANDPOS.normal};
  const L = (slot, layer) => { const it = look[slot] && ITEM[look[slot]]; return it && it.draw && (it.layer || "front") === layer ? it.draw(c) : ""; };
  const p = kind === "panda" ? pandaParts(mood) : catParts(mood);
  return L("aura","back") + L("outfit","back") + p.behind + p.body + L("outfit","body") + L("neck","under") + p.head
    + L("face","front") + L("neck","front") + L("head","front") + L("outfit","front") + p.arms + L("hand","front") + p.extra + L("aura","front");
}
const charSVG = (kind, mood, look) => `<svg viewBox="-8 -14 136 166" aria-hidden="true">${mascot(kind, mood, look)}</svg>`;
function pandaSVG(mood){ return charSVG("panda", mood, activeLook("panda")); }
function catSVG(mood){ return charSVG("cat", mood, activeLook("cat")); }
function setMascot(el, svgFn, mood){
  const kind = svgFn === catSVG ? "cat" : "panda";
  const key = mood + "|" + JSON.stringify(activeLook(kind));
  if (el.dataset.key !== key){ el.innerHTML = svgFn(mood); el.dataset.key = key; }
  el.classList.remove("normal","happy","ecstatic","sad","wink","sleepy"); el.classList.add(mood);
}
function poke(el){ el.classList.remove("poke"); void el.offsetWidth; el.classList.add("poke"); setTimeout(() => el.classList.remove("poke"), 650); }

/* ---------- scenes (300×200) ---------- */
function sceneSVG(id){
  const u = ++svgUid, g = (a,b) => `<defs><linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="200" fill="url(#g${u})"/>`;
  const cloud = (x,y,s=1,o=1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}"><ellipse cx="0" cy="0" rx="20" ry="9"/><ellipse cx="12" cy="-6" rx="13" ry="10"/><ellipse cx="-10" cy="-4" rx="10" ry="8"/></g>`;
  switch (id){
    case "sakura": return g("#ffe3ec","#fff6f8") + `<path d="M0 30 Q60 20 110 40 M40 26 q10 -14 26 -16" stroke="#8a5a4c" stroke-width="5" fill="none" stroke-linecap="round"/>` + [[20,26],[70,30],[100,38],[56,14],[86,28]].map(([x,y])=>flower(x,y,"#ffc2d0","#fff",4,5)).join("") + Array.from({length:14},(_,i)=>`<ellipse cx="${(i*53)%300}" cy="${40+(i*37)%120}" rx="3" ry="1.8" fill="#ffb3c6" transform="rotate(${i*40} ${(i*53)%300} ${40+(i*37)%120})"/>`).join("") + `<ellipse cx="150" cy="212" rx="220" ry="46" fill="#ffd6e0"/>`;
    case "night": return g("#2b3a67","#5a4e8c") + Array.from({length:22},(_,i)=>`<circle cx="${(i*67)%300}" cy="${(i*29)%120}" r="${i%3?1:1.8}" fill="#fff" opacity="${.5+(i%3)*.2}"/>`).join("") + `<circle cx="248" cy="40" r="18" fill="#fff3c4"/><circle cx="256" cy="34" r="16" fill="#3a4274"/>` + star(60,30,5,"#ffe08a","tw") + `<ellipse cx="150" cy="212" rx="220" ry="46" fill="#3d4a7a"/>`;
    case "beach": return g("#bfe9ff","#e8f8ff") + `<circle cx="250" cy="42" r="20" fill="#ffd166"/>` + cloud(70,40,1) + `<rect y="120" width="300" height="40" fill="#7cc8ff"/><path d="M0 128 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><ellipse cx="150" cy="205" rx="220" ry="50" fill="#ffe8b0"/>` + `<g transform="translate(36 150)"><path d="M0 0 l-10 18 h20z" fill="#ff8fa3"/></g>`;
    case "rain": return g("#c9d4e3","#eef2f7") + cloud(60,30,1.4,.9) + cloud(220,24,1.2,.9) + Array.from({length:26},(_,i)=>`<path d="M${(i*41)%300} ${40+(i*23)%110} l-4 10" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/>`).join("") + `<ellipse cx="150" cy="212" rx="220" ry="46" fill="#b9c8d9"/><ellipse cx="230" cy="186" rx="34" ry="6" fill="#9fb3cc" opacity=".6"/>`;
    case "cafe": return g("#f6e3cf","#f3d9bf") + `<rect x="24" y="18" width="92" height="70" rx="8" fill="#cfeaff" stroke="#a8724c" stroke-width="5"/><path d="M70 18 v70 M24 53 h92" stroke="#a8724c" stroke-width="4"/>` + cloud(52,40,.6) + `<rect x="170" y="50" width="110" height="5" rx="2" fill="#a8724c"/>` + [[186,"#ff8fa3"],[210,"#7fd4ad"],[234,"#ffd166"],[258,"#7cc8ff"]].map(([x,c])=>`<rect x="${x-7}" y="36" width="14" height="14" rx="3" fill="${c}"/>`).join("") + `<rect y="168" width="300" height="32" fill="#e3c4a2"/><rect y="166" width="300" height="4" fill="#c9a07a"/>`;
    case "rooftop": return g("#ffb38a","#b48cf2") + `<circle cx="150" cy="120" r="34" fill="#ffd166" opacity=".9"/>` + [[0,90,30],[34,70,26],[66,100,22],[92,60,30],[128,96,24],[156,80,28],[188,64,22],[214,92,30],[248,74,26],[278,96,24]].map(([x,y,w])=>`<rect x="${x}" y="${y}" width="${w}" height="${200-y}" fill="#5a3d5c"/>`+Array.from({length:3},(_,j)=>`<rect x="${x+5}" y="${y+10+j*16}" width="5" height="6" fill="#ffd166" opacity=".7"/>`).join("")).join("") + `<rect y="170" width="300" height="30" fill="#c98f7a"/><path d="M0 40 Q150 70 300 40" stroke="#5a3d5c" stroke-width="1" fill="none"/>` + Array.from({length:11},(_,i)=>{const x=i*30; const y=40+30*Math.sin(Math.PI*x/300)*.95; return `<circle cx="${x}" cy="${y.toFixed(1)}" r="3" fill="#fff3c4"/>`;}).join("");
    default: return g("#d9f0ff","#fff7ef") + cloud(60,40,1.1) + cloud(230,30,.9) + cloud(160,58,.6,.8) + `<ellipse cx="150" cy="215" rx="220" ry="50" fill="#cdeccf"/>` + [[30,176],[262,180],[84,188]].map(([x,y])=>flower(x,y,"#fff","#ffd166",2.5,3)).join("");
  }
}
const soloStage = (kind, mood, look, scene) => `<svg viewBox="0 0 300 200" role="img" aria-label="${kind}">${sceneSVG(scene)}<g transform="translate(93 42) scale(.95)"><g class="mc ${mood}">${mascot(kind, mood, look)}</g></g></svg>`;
const DUO = {
  together:{name:"Together Hug", desc:"Cozy nuzzle", icon:"🤗", pm:"happy", cm:"happy", close:true, heart:true},
  cheers:{name:"Goal Cheers", desc:"Hydration win!", icon:"🎉", pm:"ecstatic", cm:"ecstatic"},
  nap:{name:"Nap Time", desc:"Zzz snoozing", icon:"😴", pm:"sleepy", cm:"sleepy", close:true},
  tea:{name:"Tea Party", desc:"Sip sip hooray", icon:"🍵", pm:"happy", cm:"wink", hand:"teacup"},
  wink:{name:"Wink Wink", desc:"Cheeky twins", icon:"😉", pm:"wink", cm:"wink"},
  pout:{name:"Thirsty Pout", desc:"Water please", icon:"🥺", pm:"sad", cm:"sad"},
};
function duoStage(pose, scene, pl, cl){
  const d = DUO[pose] || DUO.together;
  if (d.hand){ pl = {...pl, hand:d.hand}; cl = {...cl, hand:d.hand}; }
  const [px, cx] = d.close ? [70, 132] : [48, 154];
  return `<svg viewBox="0 0 300 200" role="img" aria-label="Bao and Miso">${sceneSVG(scene)}
    <g transform="translate(${px} 62) scale(.82)"><g class="mc ${d.pm}">${mascot("panda", d.pm, pl)}</g></g>
    <g transform="translate(${cx} 62) scale(.82)"><g class="mc ${d.cm}" style="animation-delay:-.45s">${mascot("cat", d.cm, cl)}</g></g>
    ${d.heart ? heartAt(141, 48, 1.5, "#ff6f8c", "heart") : ""}</svg>`;
}

export { charSVG, mascot, sceneSVG, soloStage, duoStage, DUO, ITEMS, ITEM, SLOTS, SLOT_NAME };
