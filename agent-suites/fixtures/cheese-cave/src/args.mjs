// --name value pairs into an object; anything without a leading -- is positional.
export function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) opts._.push(arg)
    else if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) opts[arg.slice(2)] = true
    else opts[arg.slice(2)] = argv[++i]
  }
  return opts
}

export function today(opts) {
  return opts.date ?? new Date().toISOString().slice(0, 10)
}
