#!/usr/bin/env node
// Rate every variant of one arm, per task, 1–5. Answers: is there enough variety for
// "build N, keep the best" to beat a single build by your eye?
// Usage: node scripts/ui-bench-pick.mjs [bench-id] [--arm one-liner]  → http://127.0.0.1:8770
import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import {
  benchDir,
  collectRuns,
  latestBenchId,
  loadBench,
  loadTasks,
  tasksRootOf,
  readJson,
  writeJson,
} from './lib/ui-bench-data.mjs'
import { mulberry32, pickSummary } from './lib/ui-bench-stats.mjs'

const PORT = 8770
const VIEWS = ['390', '1440', '390-dark', '1440-dark']

const args = process.argv.slice(2)
const armFlag = args.indexOf('--arm')
const arm = armFlag >= 0 ? args[armFlag + 1] : 'one-liner'
const id =
  args.find((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--arm') ??
  (await latestBenchId(['bench-', 'quick-', 'compare-', 'app-']))
const bench = await loadBench(id)
const runs = collectRuns(bench).filter((run) => run.arm === arm)
const tasks = loadTasks(tasksRootOf(bench))
const picksPath = join(benchDir(id), `picks-${arm}.json`)
const picks = await readJson(picksPath, { ratings: [] })

const random = mulberry32(11)
const groups = [...Map.groupBy(runs, (run) => run.task)]
  .filter(([, list]) => list.length >= 2)
  .map(([task, list]) => ({
    task,
    variants: list
      .map((run) => ({ run, key: random() }))
      .sort((x, y) => x.key - y.key)
      .map(({ run }) => run),
  }))
if (!groups.length) throw new Error(`No task in ${id} has 2+ ${arm} runs to compare.`)

const files = new Map()
const shotUrl = (path) => {
  if (!path) return null
  const key = `/shot/${files.size}.png`
  files.set(key, path)
  return key
}
const titleOf = (task) =>
  (tasks[task].brief.split('\n').find((line) => line.trim()) ?? task).replace(/^#+\s*/, '')
const payload = groups.map((group) => ({
  task: group.task,
  title: titleOf(group.task),
  variants: group.variants.map((run, index) => ({
    label: `V${index + 1}`,
    runId: run.runId,
    shots: Object.fromEntries(VIEWS.map((view) => [view, shotUrl(run.screenshots[view])])),
  })),
}))

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>UI Bench Pick</title>
<style>
:root{--bg:#f6f6f4;--panel:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e2e1dc;--accent:#2f5d50}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--panel:#1f1f1d;--ink:#ecebe6;--muted:#9a9993;--line:#33332f;--accent:#8cc4b3}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif;padding:16px}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}
.col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0}
.col h2{margin:0 0 6px;font-size:15px}.col img{display:block;width:100%;border:1px solid var(--line);border-radius:6px;margin:2px 0 10px;background:#fff;cursor:zoom-in}
.col small{color:var(--muted)}.rate{display:flex;gap:4px;flex-wrap:wrap}
button{font:inherit;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
button[aria-pressed=true]{background:var(--accent);color:var(--bg);border-color:var(--accent)}button:focus-visible{outline:3px solid #1f6feb;outline-offset:2px}
dialog{padding:0;border:0;background:transparent;max-width:96vw;max-height:96vh}dialog img{max-width:96vw}dialog::backdrop{background:rgb(0 0 0/.85)}
.views label{font-size:12px;color:var(--muted);margin-right:8px}
</style></head><body>
<div class="bar"><div><strong id="progress"></strong> · <span id="title"></span></div><div class="views" id="views"></div><button id="next" class="primary">Next task</button></div>
<p style="color:var(--muted)">Rate every version 1 (bad) to 5 (would ship). Ratings save as you click.</p>
<div class="grid" id="grid"></div>
<dialog id="zoom"><img alt=""></dialog>
<script>
const GROUPS=${JSON.stringify(payload)};const VIEWS=${JSON.stringify(VIEWS)};const SAVED=${JSON.stringify(Object.fromEntries(picks.ratings.map((r) => [r.runId, r.score])))};
let pos=0;const shown=new Set(['390','1440']);const $=id=>document.getElementById(id);
function draw(){if(pos>=GROUPS.length){document.body.innerHTML='<h1>All tasks rated.</h1><p>Run <code>npm run bench:ui:report</code>.</p>';return}
const g=GROUPS[pos];$('progress').textContent='Task '+(pos+1)+' / '+GROUPS.length;$('title').textContent=g.title;
$('views').innerHTML=VIEWS.map(v=>'<label><input type="checkbox" value="'+v+'"'+(shown.has(v)?' checked':'')+'> '+v+'</label>').join('');
$('views').querySelectorAll('input').forEach(c=>c.onchange=()=>{c.checked?shown.add(c.value):shown.delete(c.value);draw()});
$('grid').innerHTML=g.variants.map(v=>'<section class="col"><h2>'+v.label+'</h2><div class="rate">'+[1,2,3,4,5].map(n=>'<button data-run="'+v.runId+'" data-score="'+n+'" aria-pressed="'+(SAVED[v.runId]===n)+'">'+n+'</button>').join('')+'</div>'+VIEWS.filter(x=>shown.has(x)&&v.shots[x]).map(x=>'<small>'+x+'</small><img src="'+v.shots[x]+'" alt="'+v.label+' '+x+'">').join('')+'</section>').join('');
$('grid').querySelectorAll('[data-score]').forEach(b=>b.onclick=async()=>{SAVED[b.dataset.run]=Number(b.dataset.score);await fetch('/rate',{method:'POST',body:JSON.stringify({task:g.task,runId:b.dataset.run,score:Number(b.dataset.score)})});draw()});scrollTo(0,0)}
$('next').onclick=()=>{pos++;draw()};
document.addEventListener('click',e=>{if(e.target.matches('.col img')){$('zoom').querySelector('img').src=e.target.src;$('zoom').showModal()}});$('zoom').onclick=()=>$('zoom').close();draw();
</script></body></html>`

let port = PORT
const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/rate') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      const rating = JSON.parse(body)
      picks.ratings = picks.ratings.filter((existing) => existing.runId !== rating.runId)
      picks.ratings.push({ ...rating, ratedAt: new Date().toISOString() })
      await writeJson(picksPath, picks)
      res.end('ok')
      const summary = pickSummary(picks.ratings)
      if (summary.gain !== null)
        console.log(
          `Rated ${picks.ratings.length}: best ${summary.meanBest.toFixed(2)} vs typical ${summary.meanTypical.toFixed(2)} (gain ${summary.gain.toFixed(2)})`,
        )
    })
  } else if (files.has(req.url) && existsSync(files.get(req.url))) {
    res.setHeader('content-type', 'image/png')
    createReadStream(files.get(req.url)).pipe(res)
  } else {
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.end(page)
  }
})
server
  .on('error', (error) => {
    if (error.code !== 'EADDRINUSE' || port >= PORT + 10) throw error
    server.listen(++port, '127.0.0.1')
  })
  .on('listening', () =>
    console.log(`Pick ${arm} variants in ${id}: http://127.0.0.1:${port} (${groups.length} tasks)`),
  )
  .listen(port, '127.0.0.1')
