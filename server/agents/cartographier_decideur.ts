// Spec: CARTOGRAPHIER_DECIDEUR.md v1.0.0
import { tavily } from '@tavily/core'
import { callLLM } from '../lib/llm'
import type { FicheClub } from './reperer_clubs'

export interface MappingDecideur {
  role: 'fondateur' | 'bureau' | 'tete_reseau'
  nom_presume: string
  mode_intro: string
  fait_recent_contexte: string
  email_contact: string | null
  linkedin_url: string | null
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

  const parsed = JSON.parse(raw) as { decideur: Omit<MappingDecideur, 'email_contact' | 'linkedin_url'> }

  // Recherche de contact via Tavily
  let email_contact: string | null = null
  let linkedin_url: string | null = null
  try {
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! })
    const contactSearch = await tavilyClient.search(
      `"${club.nom}" contact email`,
      { maxResults: 3, searchDepth: 'basic' }
    )
    const rawText = contactSearch.results.map((r) => r.content).join(' ')
    const emails = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? []
    email_contact = emails.find((e) => !e.includes('noreply') && !e.includes('example') && !e.includes('sentry')) ?? null
    const li = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/)
    linkedin_url = li ? li[0] : null
  } catch {
    // Contact search is best-effort — ne bloque pas le flow
  }

  const decideur: MappingDecideur = { ...parsed.decideur, email_contact, linkedin_url }

  return {
    resultat: { decideur },
    feedback_memoire: {
      signal: decideur.nom_presume ? 'positif' : 'negatif',
      detail: decideur.nom_presume
        ? `Décideur identifié : ${decideur.nom_presume} (${decideur.role})${email_contact ? ` — email : ${email_contact}` : ''}`
        : 'Impossible d\'identifier le décideur — données insuffisantes.',
    },
  }
}