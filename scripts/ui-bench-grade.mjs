#!/usr/bin/env node
// Grade skill vs one-liner pairs yourself, blind. After each pick the page reveals which side
// was the skill and what the judge decided. Ratings feed the report's "You" row and judge agreement.
// Usage: node scripts/ui-bench-grade.mjs [bench-id]  → http://127.0.0.1:8766
import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import {
  benchDir,
  collectRuns,
  latestBenchId,
  loadBench,
  loadJudgments,
  loadTasks,
  readJson,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { armOf, mulberry32, resolveOrders } from './lib/ui-bench-stats.mjs'
import { plannedPairs } from './ui-bench-judge.mjs'

const PORT = 8766
const VIEWS = ['390', '1440', '320', '768', '390-dark', '1440-dark']

const id = process.argv[2] ?? (await latestBenchId(['bench-', 'quick-']))
const bench = await loadBench(id)
const runs = new Map(collectRuns(bench).map((run) => [run.runId, run]))
const tasks = loadTasks()
const gradesPath = join(benchDir(id), 'grades.json')
const grades = await readJson(gradesPath, { ratings: [] })
const judgments = await loadJudgments(id)
const resolved = new Map(resolveOrders(judgments).map((pair) => [pair.pairId, pair]))

// Every skill↔one-liner pair, in a stable shuffled order with a random left/right side.
// Arm labels never go to the page until the pick for that pair is saved.
const random = mulberry32(7)
const items = plannedPairs([...runs.values()])
  .map((pair) => ({ pair, key: random(), flip: random() < 0.5 }))
  .sort((x, y) => x.key - y.key)
  .map(({ pair, flip }, index) => ({
    index,
    pairId: pair.pairId,
    task: pair.task,
    left: flip ? pair.b : pair.a,
    right: flip ? pair.a : pair.b,
  }))
if (!items.length) throw new Error(`No skill vs one-liner pairs in ${id} yet.`)

const files = new Map()
const shotUrl = (runId, view) => {
  const path = runs.get(runId).screenshots[view]
  if (!path) return null
  const key = `/shot/${files.size}.png`
  files.set(key, path)
  return key
}
const titleOf = (task) =>
  (tasks[task].brief.split('\n').find((line) => line.trim()) ?? task).replace(/^#+\s*/, '')
const rated = new Map(grades.ratings.map((rating) => [rating.pairId, rating]))
const payload = items.map((item) => ({
  index: item.index,
  title: titleOf(item.task),
  brief: tasks[item.task].brief,
  defaultViews: tasks[item.task].judgeShots,
  rated: rated.has(item.pairId),
  left: Object.fromEntries(VIEWS.map((view) => [view, shotUrl(item.left, view)])),
  right: Object.fromEntries(VIEWS.map((view) => [view, shotUrl(item.right, view)])),
}))

/** What the page may learn about a pair once it is rated. */
function reveal(item, pick) {
  const side = (runId) => (runId === item.left ? 'left' : 'right')
  const judged = resolved.get(item.pairId)
  const raw = judgments.filter((judgment) => judgment.pairId === item.pairId && !judgment.control)
  return {
    pick,
    arms: { left: armOf(item.left), right: armOf(item.right) },
    defects: { left: runs.get(item.left).defects, right: runs.get(item.right).defects },
    judge: judged
      ? {
          winner: judged.winner === 'tie' ? 'tie' : side(judged.winner),
          split: judged.complete && judged.winner === 'tie' && raw.some((j) => j.winner !== 'tie'),
          // The judge wrote "A"/"B"; say which side of this page each letter was.
          orders: raw.map((judgment) => ({
            a: side(judgment.first),
            reasons: judgment.reasons ?? [],
          })),
        }
      : null,
  }
}

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>UI Bench Grading</title>
<style>
:root{--bg:#f6f6f4;--panel:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e2e1dc;--accent:#2f5d50;--ok:#1f7a4d;--bad:#b3261e}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--panel:#1f1f1d;--ink:#ecebe6;--muted:#9a9993;--line:#33332f;--accent:#8cc4b3;--ok:#5cc28f;--bad:#f2857c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif;padding:16px}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0 10px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between}
.views{display:flex;flex-wrap:wrap;gap:6px}.views label{font-size:12px;color:var(--muted);display:flex;gap:4px;align-items:center}
details{margin:10px 0;color:var(--muted)}details pre{white-space:pre-wrap;font:13px/1.5 system-ui,sans-serif;color:var(--ink)}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0}
.col h2{margin:0 0 6px;font-size:15px}.col h2 .arm{font-weight:500;color:var(--accent)}
.shot small{color:var(--muted)}.shot img{display:block;width:100%;border:1px solid var(--line);border-radius:6px;margin:2px 0 10px;background:#fff;cursor:zoom-in}
.actions{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;padding:8px 16px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
button.primary{background:var(--accent);color:var(--bg);border-color:var(--accent)}button:focus-visible{outline:3px solid #1f6feb;outline-offset:2px}button:disabled{opacity:.5;cursor:default}
textarea{width:100%;font:inherit;color:inherit;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 8px;min-height:2.5rem}
.reveal{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:10px 0}.agree{color:var(--ok);font-weight:600}.disagree{color:var(--bad);font-weight:600}
.reveal ul{margin:6px 0 0;padding-left:18px}dialog{padding:0;border:0;background:transparent;max-width:96vw;max-height:96vh}dialog img{max-width:96vw}dialog::backdrop{background:rgb(0 0 0/.85)}
kbd{border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:12px}
</style></head><body>
<div class="bar"><div><strong id="progress"></strong> · <span id="title"></span></div>
<div class="views" id="views"></div>
<div class="actions"><button data-pick="left">Left better <kbd>1</kbd></button><button data-pick="tie">Tie <kbd>2</kbd></button><button data-pick="right">Right better <kbd>3</kbd></button><button class="primary" id="next" hidden>Next <kbd>N</kbd></button></div></div>
<details><summary>Task brief</summary><pre id="brief"></pre></details>
<label>Why (optional): <textarea id="note" placeholder="What made one better?"></textarea></label>
<div id="reveal"></div>
<div class="cols"><section class="col"><h2>Left <span class="arm" id="armLeft"></span></h2><div id="left"></div></section><section class="col"><h2>Right <span class="arm" id="armRight"></span></h2><div id="right"></div></section></div>
<dialog id="zoom"><img alt=""></dialog>
<script>
const ITEMS=${JSON.stringify(payload)};const VIEWS=${JSON.stringify(VIEWS)};
let order=ITEMS.filter(i=>!i.rated).concat(ITEMS.filter(i=>i.rated)),pos=0,shown=new Set(),done=false;
const $=id=>document.getElementById(id);
function views(){const it=order[pos];if(!shown.size)it.defaultViews.forEach(v=>shown.add(v));
$('views').innerHTML=VIEWS.map(v=>'<label><input type="checkbox" value="'+v+'"'+(shown.has(v)?' checked':'')+'>'+v+'</label>').join('');
$('views').querySelectorAll('input').forEach(c=>c.onchange=()=>{c.checked?shown.add(c.value):shown.delete(c.value);draw()})}
function col(set){return VIEWS.filter(v=>shown.has(v)&&set[v]).map(v=>'<div class="shot"><small>'+v+'</small><img src="'+set[v]+'" alt="'+v+'"></div>').join('')}
function draw(){const it=order[pos];$('left').innerHTML=col(it.left);$('right').innerHTML=col(it.right)}
function show(){if(pos>=order.length){document.body.innerHTML='<h1>All pairs graded.</h1><p>Run <code>npm run bench:ui:report</code> to see your verdict next to the judge.</p>';return}
const it=order[pos];done=false;$('progress').textContent=(pos+1)+' / '+order.length+(it.rated?' (re-grading)':'');$('title').textContent=it.title;$('brief').textContent=it.brief;
$('note').value='';$('reveal').innerHTML='';$('armLeft').textContent='';$('armRight').textContent='';$('next').hidden=true;
document.querySelectorAll('[data-pick]').forEach(b=>b.disabled=false);views();draw();scrollTo(0,0)}
function revealHtml(r){const j=r.judge;let s='<div class="reveal"><strong>Left was '+r.arms.left+', right was '+r.arms.right+'.</strong> ';
if(!j)s+='Not judged yet.';else{const agree=j.winner===r.pick;s+='Judge: '+(j.winner==='tie'?(j.split?'tie (the two orders disagreed)':'tie'):j.winner+' ('+r.arms[j.winner]+')')+' · You: '+r.pick+' · <span class="'+(agree?'agree':'disagree')+'">'+(agree?'agree':'disagree')+'</span>';
j.orders.forEach(o=>{s+='<p><strong>Judge with A = '+o.a+', B = '+(o.a==='left'?'right':'left')+':</strong></p><ul>'+o.reasons.map(x=>'<li>'+x.replace(/</g,'&lt;')+'</li>').join('')+'</ul>'})}
const d=s=>s.length?s.map(x=>x.check).join(', '):'none';return s+'<p>Hard-check defects. Left: '+d(r.defects.left)+'. Right: '+d(r.defects.right)+'.</p></div>'}
async function pick(p){if(done)return;done=true;document.querySelectorAll('[data-pick]').forEach(b=>b.disabled=true);
const res=await fetch('/rate',{method:'POST',body:JSON.stringify({index:order[pos].index,pick:p,note:$('note').value})});const r=await res.json();
$('armLeft').textContent='· '+r.arms.left;$('armRight').textContent='· '+r.arms.right;$('reveal').innerHTML=revealHtml(r);$('next').hidden=false;$('next').focus()}
document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>pick(b.dataset.pick));$('next').onclick=()=>{pos++;shown.clear();show()};
document.addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;const k={'1':'left','2':'tie','3':'right'}[e.key];if(k)pick(k);if((e.key==='n'||e.key==='Enter')&&done){pos++;shown.clear();show()}});
document.addEventListener('click',e=>{if(e.target.matches('.shot img')){$('zoom').querySelector('img').src=e.target.src;$('zoom').showModal()}});$('zoom').onclick=()=>$('zoom').close();
show();
</script></body></html>`

createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/rate') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      const { index, pick, note } = JSON.parse(body)
      const item = items[index]
      const winner = pick === 'tie' ? 'tie' : pick === 'left' ? item.left : item.right
      grades.ratings = grades.ratings.filter((rating) => rating.pairId !== item.pairId)
      grades.ratings.push({
        pairId: item.pairId,
        task: item.task,
        winner,
        ...(note?.trim() ? { note: note.trim() } : {}),
        ratedAt: new Date().toISOString(),
      })
      await writeJson(gradesPath, grades)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(reveal(item, pick)))
    })
  } else if (files.has(req.url) && existsSync(files.get(req.url))) {
    res.setHeader('content-type', 'image/png')
    createReadStream(files.get(req.url)).pipe(res)
  } else {
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.end(page)
  }
}).listen(PORT, '127.0.0.1', () =>
  console.log(
    `Grading ${id}: http://127.0.0.1:${PORT} (${items.length} pairs, ${rated.size} already graded)`,
  ),
)
