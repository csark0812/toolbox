#!/usr/bin/env node
// UI benchmark report: verdicts, intervals, defects, cost, render usage, judge health, your grades.
// Usage: node scripts/ui-bench-report.mjs [bench-id]  → .agent-test/ui-bench/<id>/report.{json,html}
import { writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import {
  benchDir,
  collectRuns,
  latestBenchId,
  JUDGE_VERSION,
  loadBench,
  loadJudgments,
  loadTasks,
  readJson,
  writeJson,
} from './lib/ui-bench-data.mjs'
import {
  armOf,
  BAR,
  clusterBootstrap,
  contrastOutcomes,
  judgeHealth,
  MIN_REPEATS,
  resolveOrders,
  verdict,
  winRate,
} from './lib/ui-bench-stats.mjs'

const SKILLS = ['css-craft', 'interface-design']
const BASELINE = 'one-liner'
/** Arms present for a skill: the baseline first, then our skill, then any source skills. */
const armsOf = (runs) =>
  [...new Set(runs.map((run) => run.arm))].sort((a, b) =>
    a === BASELINE
      ? -1
      : b === BASELINE
        ? 1
        : a === 'skill'
          ? -1
          : b === 'skill'
            ? 1
            : a.localeCompare(b),
  )
const RENDER_USAGE_FLOOR = 0.1

const mean = (values) => {
  const numbers = values.filter((value) => typeof value === 'number')
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null
}
const median = (values) => {
  const sorted = values.filter((value) => typeof value === 'number').sort((a, b) => a - b)
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null
}

export async function computeReport(id) {
  const bench = await loadBench(id)
  const runs = collectRuns(bench)
  const judgments = await loadJudgments(id)
  const grades = await readJson(join(benchDir(id), 'grades.json'), null)
  const tasks = loadTasks()
  const health = judgeHealth(judgments)
  const resolved = resolveOrders(judgments)
  const scores = shipScores(judgments)
  const repeats = Math.max(0, ...runs.map((run) => run.repeat + 1))
  const looks = new Set(bench.executions.map((execution) => execution.batch)).size

  const skills = SKILLS.filter((skill) => runs.some((run) => run.skill === skill)).map((skill) => {
    const skillRuns = runs.filter((run) => run.skill === skill)
    const armNames = armsOf(skillRuns)
    const taskIds = new Set(skillRuns.map((run) => run.task))
    const skillResolved = resolved.filter((pair) => taskIds.has(pair.task))
    const arms = Object.fromEntries(
      armNames.map((arm) => {
        const armRuns = skillRuns.filter((run) => run.arm === arm)
        return [
          arm,
          {
            runs: armRuns.length,
            defectsPerRun: armRuns.length
              ? armRuns.reduce((sum, run) => sum + run.defects.length, 0) / armRuns.length
              : null,
            defectsByCheck: countBy(
              armRuns.flatMap((run) => run.defects.map((defect) => defect.check)),
            ),
            medianTokens: median(armRuns.map((run) => run.measurements.tokens)),
            medianDurationMs: median(armRuns.map((run) => run.measurements.durationMs)),
            renderUsage: armRuns.length
              ? armRuns.filter((run) => run.renderUsage.rendered).length / armRuns.length
              : null,
            shipScore: mean(armRuns.map((run) => scores.get(run.runId))),
            renderDrivenFix: armRuns.length
              ? armRuns.filter((run) => run.renderUsage.editedAfterFindings).length / armRuns.length
              : null,
          },
        ]
      }),
    )
    const yours = (grades?.ratings ?? []).filter((rating) => tasks[rating.task]?.skill === skill)
    // Every other arm against the one-liner; the first (our skill when present) is primary.
    const contrasts = armNames
      .filter((arm) => arm !== BASELINE)
      .map((focus, index) => {
        const rows = contrastOutcomes(skillResolved, focus, BASELINE)
        const graded = yours.filter((rating) =>
          rating.pairId.split(' vs ').some((runId) => armOf(runId) === focus),
        )
        const you = winRate(
          graded.map((rating) => ({
            outcome:
              rating.winner === 'tie' ? 'tie' : armOf(rating.winner) === focus ? 'win' : 'loss',
          })),
        )
        return {
          focus,
          other: BASELINE,
          role: index === 0 ? 'primary' : 'secondary',
          ...winRate(rows),
          ...clusterBootstrap(rows),
          you,
        }
      })
    const primary = contrasts[0]
    const raw = verdict(
      { rate: primary.rate, lower: primary.lower, upper: primary.upper, repeats },
      { focus: arms[primary.focus].defectsPerRun ?? 0, other: arms[BASELINE].defectsPerRun ?? 0 },
    )
    const renderExercised = armNames.some(
      (arm) => (arms[arm].renderUsage ?? 0) >= RENDER_USAGE_FLOOR,
    )
    return {
      skill,
      tasks: [...taskIds].sort(),
      arms,
      contrasts,
      verdict: health.healthy ? raw : 'withheld',
      verdictIfHealthy: raw,
      renderExercised,
    }
  })

  return {
    bench: id,
    judgeVersion: JUDGE_VERSION,
    generatedAt: new Date().toISOString(),
    repeats,
    looks,
    runs: runs.length,
    bar: BAR,
    minRepeats: MIN_REPEATS,
    health,
    calibration: calibrationAgreement(grades, resolved),
    skills,
    decided: skills.every((skill) => ['better', 'not-better'].includes(skill.verdict)),
    gallery: gallery(runs, id, scores),
  }
}

/**
 * How well the order-consistent judge matches your grades.
 * agreement: on pairs you decided, the judge picked the same run (≥ 70% needed).
 * exactAgreement: on every pair both graded, same win/loss/tie (≥ 60% needed), so a judge
 * that decides what you call a tie is caught too.
 */
export function calibrationAgreement(grades, resolved) {
  if (!grades?.ratings?.length) return { done: false }
  const byPair = new Map(resolved.map((pair) => [pair.pairId, pair]))
  const both = grades.ratings.filter((rating) => byPair.has(rating.pairId))
  const decisive = both.filter((rating) => rating.winner !== 'tie')
  const same = (rating) => byPair.get(rating.pairId).winner === rating.winner
  const agreement = decisive.length ? decisive.filter(same).length / decisive.length : null
  const exactAgreement = both.length ? both.filter(same).length / both.length : null
  return {
    done: true,
    rated: grades.ratings.length,
    decisive: decisive.length,
    agreement,
    exactAgreement,
    ok: agreement !== null && agreement >= 0.7 && exactAgreement >= 0.6,
  }
}

/** Mean judge ship score (1–5) per run, averaged over every comparison it appeared in. */
function shipScores(judgments) {
  const totals = new Map()
  for (const judgment of judgments) {
    if (judgment.control || judgment.retestOf || !judgment.scores) continue
    for (const side of ['first', 'second']) {
      const score = judgment.scores[side]
      if (typeof score !== 'number') continue
      const entry = totals.get(judgment[side]) ?? { sum: 0, count: 0 }
      totals.set(judgment[side], { sum: entry.sum + score, count: entry.count + 1 })
    }
  }
  return new Map([...totals].map(([runId, { sum, count }]) => [runId, sum / count]))
}

function countBy(values) {
  const counts = {}
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1
  return counts
}

function gallery(runs, id, scores) {
  const from = benchDir(id)
  return runs
    .map((run) => ({
      runId: run.runId,
      task: run.task,
      skill: run.skill,
      arm: run.arm,
      repeat: run.repeat,
      defects: run.defects.length,
      ship: scores.get(run.runId) ?? null,
      shots: Object.fromEntries(
        Object.entries(run.screenshots).map(([view, path]) => [view, relative(from, path)]),
      ),
    }))
    .sort(
      (a, b) => a.task.localeCompare(b.task) || a.repeat - b.repeat || a.arm.localeCompare(b.arm),
    )
}

const pct = (value) => (value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`)
const esc = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  )
const VERDICT_TEXT = {
  better: 'Better',
  'not-better': 'Not better',
  inconclusive: 'Inconclusive',
  withheld: 'Withheld (judge health failed)',
}

export function renderHtml(report) {
  const skillCards = report.skills
    .map((skill) => {
      const contrastRows = skill.contrasts
        .map(
          (c) =>
            `<tr><td>${c.focus} vs ${c.other}${c.role === 'primary' ? ' <span class="tag">primary</span>' : ''}</td><td>${pct(c.rate)}</td><td>${c.lower === null ? '—' : `${pct(c.lower)} – ${pct(c.upper)}`}</td><td>${c.wins}/${c.losses}/${c.ties}</td></tr>`,
        )
        .join('')
      const youRows = skill.contrasts
        .filter((c) => c.you.wins + c.you.losses + c.you.ties > 0)
        .map(
          (c) =>
            `<tr><td>${c.focus} vs ${c.other} <span class="tag">your grades</span></td><td>${pct(c.you.rate)}</td><td>—</td><td>${c.you.wins}/${c.you.losses}/${c.you.ties}</td></tr>`,
        )
        .join('')
      const armRows = Object.keys(skill.arms)
        .map((arm) => {
          const a = skill.arms[arm]
          return `<tr><td>${arm}</td><td>${a.runs}</td><td>${a.shipScore === null ? '—' : `${a.shipScore.toFixed(1)}/5`}</td><td>${a.defectsPerRun === null ? '—' : a.defectsPerRun.toFixed(1)}</td><td>${a.medianTokens ? `${Math.round(a.medianTokens / 1000)}k` : '—'}</td><td>${a.medianDurationMs ? `${Math.round(a.medianDurationMs / 1000)}s` : '—'}</td><td>${pct(a.renderUsage)}</td><td>${pct(a.renderDrivenFix)}</td></tr>`
        })
        .join('')
      return `<section class="card">
  <header><h2>${skill.skill}</h2><span class="verdict v-${skill.verdict}">${VERDICT_TEXT[skill.verdict]}</span></header>
  ${skill.renderExercised ? '' : '<p class="warn">Render tool barely used in any arm: the skill\'s rendered-verification guidance was not exercised.</p>'}
  <table><thead><tr><th>Contrast</th><th>Win rate</th><th>95% interval</th><th>W/L/T</th></tr></thead><tbody>${contrastRows}${youRows}</tbody></table>
  <table><thead><tr><th>Arm</th><th>Runs</th><th>Ship score</th><th>Defects/run</th><th>Tokens</th><th>Time</th><th>Rendered</th><th>Render-driven fix</th></tr></thead><tbody>${armRows}</tbody></table>
</section>`
    })
    .join('\n')
  const healthRows = report.health.checks
    .map(
      (check) =>
        `<tr><td>${check.name}</td><td>${pct(check.value)}</td><td>${esc(check.expect)}</td><td class="${check.ok ? 'ok' : 'bad'}">${check.ok ? 'ok' : 'fail'}</td></tr>`,
    )
    .join('')
  const cal = report.calibration
  const calText = cal.done
    ? `${cal.rated} pairs graded, ${cal.decisive} decisive, judge agrees with you on ${pct(cal.agreement)} of decided pairs and ${pct(cal.exactAgreement)} exactly (ties included) ${cal.ok ? '(ok)' : '(needs ≥ 70% and ≥ 60%: revise the judge before trusting its verdicts)'}`
    : 'No grades yet. Run <code>npm run bench:ui:grade</code>.'
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>UI Bench Report</title>
<style>
:root{--bg:#f6f6f4;--panel:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e2e1dc;--ok:#1f7a4d;--bad:#b3261e;--warn:#8a5a00}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--panel:#1f1f1d;--ink:#ecebe6;--muted:#9a9993;--line:#33332f;--ok:#5cc28f;--bad:#f2857c;--warn:#e0b050}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,sans-serif;padding:16px;max-width:1100px;margin-inline:auto}
h1{font-size:20px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 16px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:16px;overflow-x:auto}
.card header{display:flex;justify-content:space-between;align-items:center;gap:8px}.card h2{font-size:16px;margin:0}
.verdict{font-weight:700;padding:2px 10px;border-radius:999px;border:1px solid currentColor}
.v-better{color:var(--ok)}.v-not-better{color:var(--bad)}.v-inconclusive,.v-withheld{color:var(--warn)}
table{border-collapse:collapse;width:100%;margin-top:10px;font-variant-numeric:tabular-nums}th,td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:500}
.tag{font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:0 4px}.ok{color:var(--ok)}.bad{color:var(--bad)}.warn{color:var(--warn)}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}.gal figure{margin:0}.gal img{width:100%;border:1px solid var(--line);border-radius:6px;background:#fff}
figcaption{font-size:12px;color:var(--muted)}select{font:inherit}
</style></head><body>
<h1>UI bench · ${esc(report.bench)} · judge v${report.judgeVersion}</h1>
<p class="sub">${report.runs} graded runs · ${report.repeats} repeat${report.repeats === 1 ? '' : 's'} per arm per task · ${report.looks} look${report.looks === 1 ? '' : 's'} · verdicts need ≥ ${report.minRepeats} repeats · bar ${pct(report.bar)} vs one-liner with interval lower bound &gt; 50%</p>
${skillCards}
<section class="card"><header><h2>Judge health</h2><span class="verdict ${report.health.healthy ? 'v-better' : 'v-not-better'}">${report.health.healthy ? 'Healthy' : 'Failing'}</span></header>
<table><thead><tr><th>Check</th><th>Value</th><th>Expected</th><th></th></tr></thead><tbody>${healthRows}</tbody></table>
<p>Your grades: ${calText}</p></section>
<section class="card"><header><h2>Screenshots</h2><label>View <select id="view"><option>390</option><option>1440</option><option>390-dark</option><option>1440-dark</option></select></label></header>
<div id="gal"></div></section>
<script>
const G=${JSON.stringify(report.gallery)};
const draw=()=>{const v=document.getElementById('view').value;const by={};for(const r of G)(by[r.task+' · repeat '+r.repeat]??=[]).push(r);
document.getElementById('gal').innerHTML=Object.entries(by).map(([k,rs])=>'<h3>'+k+'</h3><div class="gal">'+rs.map(r=>'<figure>'+(r.shots[v]?'<a href="'+r.shots[v]+'" target="_blank"><img loading="lazy" src="'+r.shots[v]+'" alt="'+r.arm+'"></a>':'')+'<figcaption><strong>'+r.arm+'</strong> · ship '+(r.ship===null?'-':r.ship.toFixed(1))+' · '+r.defects+' defects</figcaption></figure>').join('')+'</div>').join('')};
document.getElementById('view').onchange=draw;draw();
</script></body></html>`
}

export async function writeReport(id) {
  const report = await computeReport(id)
  await writeJson(join(benchDir(id), 'report.json'), report)
  await writeFile(join(benchDir(id), 'report.html'), renderHtml(report))
  return report
}

export function summarize(report) {
  const lines = [
    `Bench ${report.bench}: ${report.runs} runs, ${report.repeats} repeats, judge ${report.health.healthy ? 'healthy' : 'UNHEALTHY'}`,
  ]
  for (const skill of report.skills) {
    lines.push(`  ${skill.skill}: ${VERDICT_TEXT[skill.verdict]}`)
    for (const c of skill.contrasts)
      lines.push(
        `    ${c.focus} vs one-liner: ${pct(c.rate)} [${pct(c.lower)}–${pct(c.upper)}] (${c.wins}W/${c.losses}L/${c.ties}T) · ship ${skill.arms[c.focus].shipScore?.toFixed(1) ?? '—'} vs ${skill.arms[BASELINE].shipScore?.toFixed(1) ?? '—'}`,
      )
  }
  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const id = process.argv[2] ?? (await latestBenchId())
  const report = await writeReport(id)
  console.log(summarize(report))
  console.log(`Report: ${join(benchDir(id), 'report.html')}`)
}
