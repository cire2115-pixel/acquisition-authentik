// Spec: CREER_LIEN.md v1.0.0 — ASSISTED : retourne proposition + validation_requise: true
import { callLLM } from '../lib/llm'
import type { FicheClub } from './reperer_clubs'
import type { MappingDecideur } from './cartographier_decideur'

export interface MessageContact {
  sujet: string
  corps: string
  fait_recent_utilise: string
  relances_count: number
}

export interface CreerLienInput {
  payload: {
    club: FicheClub
    decideur: MappingDecideur
    relances_count?: number
  }
  contexte_orchestrer: Record<string, unknown>
}

export interface CreerLienResult {
  resultat: {
    message: MessageContact
    validation_requise: true
    statut: 'EN_ATTENTE_VALIDATION'
  }
  feedback_memoire: { signal: 'positif' | 'negatif'; detail: string }
}

const SYSTEM_PROMPT = `Règles : JAMAIS de pitch avant lien humain réel — TOUJOURS faire valider un échantillon de messages par Éric ou Alain avant envoi autonome.
Comportement : Rédaction personnalisée basée sur un fait réel. Interdiction de pitch commercial ou d'offre à ce stade. Relances limitées à deux maximum avant retrait de la file active.
Retourne un objet JSON avec une clé "message" contenant : sujet, corps, fait_recent_utilise.
Le message doit être court (3-5 phrases), non commercial, ancré sur un fait récent du club.`

export async function creer_lien(input: CreerLienInput): Promise<CreerLienResult> {
  const { club, decideur, relances_count = 0 } = input.payload

  // Invariant : max 2 relances
  if (relances_count >= 2) {
    return {
      resultat: {
        message: { sujet: '', corps: '', fait_recent_utilise: '', relances_count },
        validation_requise: true,
        statut: 'EN_ATTENTE_VALIDATION',
      },
      feedback_memoire: {
        signal: 'negatif',
        detail: `Retrait de la file — ${relances_count} relances sans réponse (limite : 2).`,
      },
    }
  }

  const raw = await callLLM(
    SYSTEM_PROMPT,
    `Club : ${club.nom} (${club.categorie}, ${club.zone_geographique})
Décideur : ${decideur.nom_presume} — rôle : ${decideur.role}
Mode d'intro légitime : ${decideur.mode_intro}
Fait récent du club : ${club.activite_recente}
Contexte : ${decideur.fait_recent_contexte}

Rédige un premier message de contact non-commercial, personnalisé.`
  )

  const parsed = JSON.parse(raw) as { message: Omit<MessageContact, 'relances_count'> }

  return {
    resultat: {
      message: { ...parsed.message, relances_count },
      validation_requise: true,
      statut: 'EN_ATTENTE_VALIDATION',
    },
    feedback_memoire: {
      signal: 'positif',
      detail: `Message rédigé pour ${decideur.nom_presume} — en attente validation humaine.`,
    },
  }
}