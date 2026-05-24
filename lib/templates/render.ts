export function renderTemplate(body: string, inputs: Record<string, string>) {
  return body.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    const value = inputs[key]
    return value && value.trim() ? value.trim() : `{${key}}`
  })
}

export function extractVariables(body: string) {
  return Array.from(new Set(Array.from(body.matchAll(/\{([a-zA-Z0-9_]+)\}/g)).map((m) => m[1])))
}
