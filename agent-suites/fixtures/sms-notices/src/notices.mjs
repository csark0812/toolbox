/** Fill `{key}` placeholders; a missing value is an error naming the key. */
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (values[key] === undefined) throw new RangeError(`missing value for {${key}}`)
    return values[key]
  })
}
