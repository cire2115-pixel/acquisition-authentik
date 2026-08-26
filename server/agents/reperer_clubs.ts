// Spec: REPERER_CLUBS.md v1.0.0
import { tavily } from '@tavily/core'
import { callLLM } from '../lib/llm'

export interface FicheClub {
  nom: string
  categorie: 'generaliste_sante' | 'sport_dirigeant' | 'plateforme_b2b' | 'membership_ferme'
  zone_geographique: string
  taille: number
  activite_recente: string
  score_icp: number
  statut: 'GO' | 'NO-GO'
}

export interface RepererClubsInput {
  payload: {
    zone_geographique: string
    type_club?: string
    mots_cles?: string
  }
  contexte_orchestrer: Record<string, unknown>
}

export interface RepererClubsResult {
  resultat: { clubs: FicheClub[] }
  feedback_memoire: { signal: 'positif' | 'negatif'; detail: string }
}

const SYSTEM_PROMPT = `Règles : Priorité aux cercles fermés où les membres se recommandent — Ne jamais traiter APESA ou réseaux d'entraide comme des prospects de ce segment.
Comportement : Catégoriser en 4 types : réseaux généralistes santé/bien-être, clubs sport dirigeants, plateformes B2B sport/bien-être, membership fermé. Champs requis : nom, catégorie, zone géographique, taille estimée, activité récente, score de priorité ICP.
Retourne un objet JSON avec une clé "clubs" contenant un tableau de FicheClub. Pour chaque club : score_icp entre 0 et 100, statut GO si score >= 60 sinon NO-GO.`

export async function reperer_clubs(input: RepererClubsInput): Promise<RepererClubsResult> {
  const { zone_geographique, type_club, mots_cles } = input.payload

  const query = [
    `clubs premium ${type_club ?? 'dirigeants'} ${zone_geographique}`,
    mots_cles ?? 'membership exclusif réseau',
  ].join(' ')

  const client = tavily({ apiKey: process.env.TAVILY_API_KEY! })
  const searchResult = await client.search(query, {
    maxResults: 8,
    searchDepth: 'advanced',
  })

  const context = searchResult.results
    .map((r) => `Titre: ${r.title}\nURL: ${r.url}\nRésumé: ${r.content}`)
    .join('\n\n---\n\n')

  const raw = await callLLM(
    SYSTEM_PROMPT,
    `Zone géographique : ${zone_geographique}\nType recherché : ${type_club ?? 'clubs premium dirigeants'}\n\nRésultats de recherche :\n${context}`
  )

  const parsed = JSON.parse(raw) as { clubs: FicheClub[] }
  const clubs = parsed.clubs ?? []

  const goCount = clubs.filter((c) => c.statut === 'GO').length
  return {
    resultat: { clubs },
    feedback_memoire: {
      signal: goCount > 0 ? 'positif' : 'negatif',
      detail: goCount > 0
        ? `${goCount} club(s) GO identifiés sur ${clubs.length} analysés.`
        : 'Aucun club GO trouvé — affiner les critères de recherche.',
    },
  }
}