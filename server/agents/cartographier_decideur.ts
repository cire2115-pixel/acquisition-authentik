// Spec: CARTOGRAPHIER_DECIDEUR.md v1.0.0
import { callLLM } from '../lib/llm'
import type { FicheClub } from './reperer_clubs'

export interface MappingDecideur {
  role: 'fondateur' | 'bureau' | 'tete_reseau'
  nom_presume: string
  mode_intro: string
  fait_recent_contexte: string
}

export interface CartographierDecideurInput {
  payload: { club: FicheClub }
  contexte_orchestrer: Record<string, unknown>
}

export interface CartographierDecideurResult {
  resultat: { decideur: MappingDecideur }
  feedback_memoire: { signal: 'positif' | 'negatif'; detail: string }
}

const SYSTEM_PROMPT = `Règles : Cartographier avant tout contact ultérieur — Identifier le mode d'introduction le plus légitime.
Comportement : Veille de contenu publié par le club ou son fondateur. Identification systématique du décideur réel (fondateur, bureau, tête de réseau). Identification du mode d'introduction légitime.
Retourne un objet JSON avec une clé "decideur" contenant : role, nom_presume, mode_intro, fait_recent_contexte.`

export async function cartographier_decideur(input: CartographierDecideurInput): Promise<CartographierDecideurResult> {
  const { club } = input.payload

  const raw = await callLLM(
    SYSTEM_PROMPT,
    `Club à cartographier :
Nom : ${club.nom}
Catégorie : ${club.categorie}
Zone : ${club.zone_geographique}
Taille estimée : ${club.taille} membres
Activité récente : ${club.activite_recente}

Identifie le décideur réel et le meilleur mode d'introduction.`
  )

  const parsed = JSON.parse(raw) as { decideur: MappingDecideur }

  return {
    resultat: { decideur: parsed.decideur },
    feedback_memoire: {
      signal: parsed.decideur?.nom_presume ? 'positif' : 'negatif',
      detail: parsed.decideur?.nom_presume
        ? `Décideur identifié : ${parsed.decideur.nom_presume} (${parsed.decideur.role})`
        : 'Impossible d\'identifier le décideur — données insuffisantes.',
    },
  }
}