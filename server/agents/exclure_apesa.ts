// Spec: EXCLURE_APESA.md v1.0.0 — script AUTONOMOUS, tolérance zéro
const APESA_KEYWORDS = ['apesa', 'a.p.e.s.a', 'aide aux professionnels']

export interface ExclureApesaInput {
  payload: Record<string, unknown>
  contexte_orchestrer: Record<string, unknown>
}

export interface ExclureApesaResult {
  exclu: boolean
  raison?: string
  feedback_memoire: { signal: 'positif' | 'negatif'; detail: string }
}

export function exclure_apesa(input: ExclureApesaInput): ExclureApesaResult {
  const text = JSON.stringify(input.payload).toLowerCase()
  const detected = APESA_KEYWORDS.find((kw) => text.includes(kw))

  if (detected) {
    return {
      exclu: true,
      raison: `Mot-clé APESA détecté : "${detected}"`,
      feedback_memoire: { signal: 'negatif', detail: `Exclusion APESA déclenchée — mot-clé : ${detected}` },
    }
  }

  return {
    exclu: false,
    feedback_memoire: { signal: 'positif', detail: 'Aucune correspondance APESA détectée.' },
  }
}