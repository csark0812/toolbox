#!/usr/bin/env node
// Blind calibration: you rate ~15 judged pairs; the report compares your picks with the judge.
// Usage: node scripts/ui-bench-calibrate.mjs [bench-id]  → http://127.0.0.1:8766
import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import {
  benchDir,
  collectRuns,
  latestBenchId,
  loadBench,
  loadTasks,
  readJson,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { mulberry32, resolveOrders } from './lib/ui-bench-stats.mjs'

const PORT = 8766
const SAMPLE = 15

const id = process.argv[2] ?? (await latestBenchId())
const bench = await loadBench(id)
const runs = new Map(collectRuns(bench).map((run) => [run.runId, run]))
const tasks = loadTasks()
const calibrationPath = join(benchDir(id), 'calibration.json')
const calibration = await readJson(calibrationPath, { ratings: [] })

// Sample from judged real pairs, without the judge's answer, in random left/right order.
const random = mulberry32(99)
const judged = resolveOrders(await readJson(join(benchDir(id), 'judgments.json'), [])).filter(
  (pair) => pair.complete && runs.has(pair.a) && runs.has(pair.b),
)
const shuffled = judged.map((pair) => ({ pair, key: random() })).sort((x, y) => x.key - y.key)
const items = shuffled.slice(0, SAMPLE).map(({ pair }, index) => {
  const [left, right] = random() < 0.5 ? [pair.a, pair.b] : [pair.b, pair.a]
  return { index, pairId: pair.pairId, task: pair.task, left, right }
})
if (!items.length) throw new Error('No judged pairs yet. Run the bench and judge first.')

const files = new Map()
const shotUrl = (runId, view) => {
  const path = runs.get(runId).screenshots[view]
  const key = `/shot/${files.size}.png`
  files.set(key, path)
  return key
}
const payload = items.map((item) => {
  const shots = tasks[item.task].judgeShots
  return {
    index: item.index,
    title: (tasks[item.task].brief.split('\n').find((line) => line.trim()) ?? item.task).replace(
      /^#+\s*/,
      '',
    ),
    left: shots.map((view) => ({ view, src: shotUrl(item.left, view) })),
    right: shots.map((view) => ({ view, src: shotUrl(item.right, view) })),
  }
})

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>UI Bench Calibration</title>
<style>:root{--bg:#f6f6f4;--panel:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e2e1dc}@media (prefers-color-scheme:dark){:root{--bg:#161615;--panel:#1f1f1d;--ink:#ecebe6;--muted:#9a9993;--line:#33332f}}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif;padding:16px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px}.col h2{margin:0 0 6px;font-size:15px}
.col img{width:100%;border:1px solid var(--line);border-radius:6px;margin-bottom:8px;background:#fff}.col small{color:var(--muted)}
button{font:inherit;padding:8px 18px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}button:focus-visible{outline:3px solid #1f6feb}
.actions{display:flex;gap:8px}</style></head><body>
<div class="top"><div><strong id="progress"></strong> · <span id="title"></span></div><div class="actions"><button data-pick="left">Left is better</button><button data-pick="tie">Tie</button><button data-pick="right">Right is better</button></div></div>
<div class="cols"><section class="col"><h2>Left</h2><div id="left"></div></section><section class="col"><h2>Right</h2><div id="right"></div></section></div>
<script>const ITEMS=${JSON.stringify(payload)};let i=0;
const shots=(list)=>list.map(s=>'<small>'+s.view+'</small><img src="'+s.src+'" alt="'+s.view+'">').join('');
function show(){if(i>=ITEMS.length){document.body.innerHTML='<h1>Done — thank you.</h1><p>Close this tab and run <code>npm run bench:ui:report</code>.</p>';return}
const it=ITEMS[i];document.getElementById('progress').textContent=(i+1)+' / '+ITEMS.length;document.getElementById('title').textContent=it.title;
document.getElementById('left').innerHTML=shots(it.left);document.getElementById('right').innerHTML=shots(it.right);scrollTo(0,0)}
document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=async()=>{await fetch('/rate',{method:'POST',body:JSON.stringify({index:ITEMS[i].index,pick:b.dataset.pick})});i++;show()});show()</script></body></html>`

createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/rate') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      const { index, pick } = JSON.parse(body)
      const item = items[index]
      const winner = pick === 'tie' ? 'tie' : pick === 'left' ? item.left : item.right
      calibration.ratings = calibration.ratings.filter((rating) => rating.pairId !== item.pairId)
      calibration.ratings.push({ pairId: item.pairId, winner, ratedAt: new Date().toISOString() })
      await writeJson(calibrationPath, calibration)
      res.end('ok')
      if (calibration.ratings.length >= items.length)
        console.log(`All ${items.length} pairs rated. Saved ${calibrationPath}`)
    })
  } else if (files.has(req.url) && existsSync(files.get(req.url))) {
    res.setHeader('content-type', 'image/png')
    createReadStream(files.get(req.url)).pipe(res)
  } else {
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.end(page)
  }
}).listen(PORT, '127.0.0.1', () =>
  console.log(`Calibration for ${id}: http://127.0.0.1:${PORT} (${items.length} pairs)`),
)
