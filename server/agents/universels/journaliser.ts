// Spec: ../_universels/JOURNALISER.md — interface LOCKED
import { appendStore } from '../../lib/json-store'

export interface JournaliserInput {
  processus: string
  event_name: string
  acteur_id?: string
  ressource_type?: string
  ressource_id?: string
  payload?: Record<string, unknown>
}

export interface JournaliserResult {
  ok: boolean
  log_id: string
}

export async function journaliser(input: JournaliserInput): Promise<JournaliserResult> {
  const entry = await appendStore('logs_activite', {
    action: input.event_name,
    contexte: {
      processus: input.processus,
      acteur_id: input.acteur_id,
      ressource_type: input.ressource_type,
      ressource_id: input.ressource_id,
      payload: input.payload,
    },
    prospect_id: input.ressource_id ?? null,
  })
  return { ok: true, log_id: entry.id }
}