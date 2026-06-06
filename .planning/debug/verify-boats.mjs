import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
const errs = [];
p.on("pageerror", e => errs.push(e.message.slice(0,140)));
p.on("console", m => { if (m.type()==="error") errs.push("C:"+m.text().slice(0,120)); });
await p.goto("http://localhost:3500/sydney-food-map", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3500);
const counts = await p.evaluate(() => ({
  domBoats: document.querySelectorAll(".river-boat").length,
  canvasLayers: document.querySelectorAll(".food-canvas-layer").length,
  boatsPane: !!document.querySelector("[class*=food-boats]"),
  pinsPane: !!document.querySelector("[class*=food-pins]"),
}));
// check boat canvas pixels change over 600ms (animation running)
async function boatHash() {
  return p.evaluate(() => {
    const c = document.querySelectorAll(".food-canvas-layer");
    // boats pane is the lower z; grab both, sum non-transparent pixels of each
    let sig = "";
    for (const cv of c) {
      const ctx = cv.getContext("2d");
      const d = ctx.getImageData(0,0,Math.min(cv.width,300),Math.min(cv.height,300)).data;
      let s=0; for (let i=3;i<d.length;i+=4*37) s+=d[i];
      sig += s+",";
    }
    return sig;
  });
}
const h1 = await boatHash();
await p.waitForTimeout(700);
const h2 = await boatHash();
await p.screenshot({ path: ".planning/debug/boats.png" });
console.log("counts:", JSON.stringify(counts));
console.log("animating:", h1 !== h2, "(", h1, "vs", h2, ")");
console.log("errors:", errs.length ? JSON.stringify(errs.slice(0,5)) : "none");
await b.close();
