// Spec: _SCHEMA.md v1.0.0 — lecture/écriture JSON sur disque (couche data/)
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`)
}

export function readStore<T>(name: string): T[] {
  const fp = filePath(name)
  if (!fs.existsSync(fp)) return []
  return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[]
}

export function writeStore<T>(name: string, data: T[]): void {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8')
}

export function appendStore<T extends object>(name: string, record: T): T & { id: string; created_at: string } {
  const store = readStore<T & { id: string; created_at: string }>(name)
  const entry = {
    ...record,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  store.push(entry)
  writeStore(name, store)
  return entry
}