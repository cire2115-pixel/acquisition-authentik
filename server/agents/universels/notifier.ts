// Spec: ../_universels/NOTIFIER.md — interface LOCKED
import { appendStore } from '../../lib/json-store'

export interface NotifierInput {
  canal: 'email' | 'push' | 'sms'
  destinataires: string[]
  sujet: string
  corps: string
  metadata?: Record<string, unknown>
}

export interface NotifierResult {
  ok: boolean
  notification_id: string
}

export async function notifier(input: NotifierInput): Promise<NotifierResult> {
  // Écrit NOTIFICATION_PENDING — provider réel branché séparément
  const entry = appendStore('logs_activite', {
    action: 'NOTIFICATION_PENDING',
    contexte: {
      canal: input.canal,
      destinataires: input.destinataires,
      sujet: input.sujet,
      corps: input.corps,
      metadata: input.metadata,
    },
    prospect_id: null,
  })
  return { ok: true, notification_id: entry.id }
}