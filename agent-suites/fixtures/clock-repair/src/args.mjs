// Options are declared as { name: 'boolean' | 'string' } and given on the command line as --name.
export function parseOptions(argv, spec) {
  const options = {}
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      rest.push(arg)
      continue
    }
    const name = arg.slice(2)
    if (!Object.hasOwn(spec, name)) throw new Error(`Unknown option ${arg}`)
    if (spec[name] === 'boolean') options[name] = true
    else {
      const value = argv[++i]
      if (value === undefined) throw new Error(`${arg} needs a value`)
      options[name] = value
    }
  }
  return { options, rest }
}
