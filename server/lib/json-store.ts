// Couche data — Supabase (remplace le JSON sur disque)
import { supabase } from './supabase'

export async function readStore<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true })
  if (error) throw new Error(`readStore(${table}): ${error.message}`)
  return (data ?? []) as T[]
}

export async function appendStore<T extends object>(
  table: string,
  record: T
): Promise<T & { id: string; created_at: string }> {
  const { data, error } = await supabase.from(table).insert(record).select().single()
  if (error) throw new Error(`appendStore(${table}): ${error.message}`)
  return data as T & { id: string; created_at: string }
}

export async function updateStore(
  table: string,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) throw new Error(`updateStore(${table}): ${error.message}`)
}

export async function writeStore<T>(table: string, rows: T[]): Promise<void> {
  // Utilisé uniquement par envoyer-messages pour passer APPROUVE → ENVOYE
  // On itère pour respecter l'interface existante
  for (const row of rows as Array<T & { id?: string; statut?: string }>) {
    if (row.id) {
      const { id, ...patch } = row
      const { error } = await supabase.from(table).update(patch).eq('id', id)
      if (error) throw new Error(`writeStore(${table}): ${error.message}`)
    }
  }
}
