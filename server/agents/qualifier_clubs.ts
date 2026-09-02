// Spec: QUALIFIER_CLUBS.md v1.0.0 — Orchestrateur Phase 1
import { exclure_apesa } from './exclure_apesa'
import { reperer_clubs, type RepererClubsInput } from './reperer_clubs'
import { cartographier_decideur } from './cartographier_decideur'
import { creer_lien } from './creer_lien'
import { journaliser_creer_lien } from './journaliser_creer_lien'

export interface QualifierClubsInput {
  zone_geographique: string
  type_club?: string
  mots_cles?: string
}

export interface ProspectEngage {
  club_nom: string
  club_categorie: string
  score_icp: number
  decideur_nom: string
  decideur_role: string
  email_contact: string | null
  linkedin_url: string | null
  message_sujet: string
  message_corps: string
  statut: 'EN_ATTENTE_VALIDATION' | 'EXCLU_APESA' | 'HORS_CRITERE'
}

export interface QualifierClubsResult {
  prospects_engages: ProspectEngage[]
  stats: { total: number; go: number; exclus: number }
}

export async function qualifier_clubs(input: QualifierClubsInput): Promise<QualifierClubsResult> {
  const contexte = { processus: 'qualifier_clubs' }

  // Étape 1 — Garde APESA sur les paramètres d'entrée
  const apesaCheck = exclure_apesa({ payload: input as unknown as Record<string, unknown>, contexte_orchestrer: contexte })
  if (apesaCheck.exclu) {
    return { prospects_engages: [], stats: { total: 0, go: 0, exclus: 1 } }
  }

  // Étape 2 — Repérer les clubs
  const repererInput: RepererClubsInput = {
    payload: { zone_geographique: input.zone_geographique, type_club: input.type_club, mots_cles: input.mots_cles },
    contexte_orchestrer: contexte,
  }
  const { resultat: { clubs } } = await reperer_clubs(repererInput)

  const clubsGo = clubs.filter((c) => c.statut === 'GO')
  const prospects: ProspectEngage[] = []

  // Étape 3 & 4 — Pour chaque club GO : cartographier + créer lien
  for (const club of clubsGo) {
    // Garde APESA sur chaque club individuellement
    const clubApesa = exclure_apesa({ payload: club as unknown as Record<string, unknown>, contexte_orchestrer: contexte })
    if (clubApesa.exclu) {
      prospects.push({ club_nom: club.nom, club_categorie: club.categorie, score_icp: club.score_icp, decideur_nom: '', decideur_role: '', email_contact: null, linkedin_url: null, message_sujet: '', message_corps: '', statut: 'EXCLU_APESA' })
      continue
    }

    const { resultat: { decideur } } = await cartographier_decideur({ payload: { club }, contexte_orchestrer: contexte })
    const { resultat: { message, statut } } = await creer_lien({ payload: { club, decideur, relances_count: 0 }, contexte_orchestrer: contexte })

    // Étape 5 — Journaliser
    await journaliser_creer_lien(club.nom, decideur.nom_presume, message.fait_recent_utilise, false)

    prospects.push({
      club_nom: club.nom,
      club_categorie: club.categorie,
      score_icp: club.score_icp,
      decideur_nom: decideur.nom_presume,
      decideur_role: decideur.role,
      email_contact: decideur.email_contact,
      linkedin_url: decideur.linkedin_url,
      message_sujet: message.sujet,
      message_corps: message.corps,
      statut,
    })
  }

  return {
    prospects_engages: prospects,
    stats: { total: clubs.length, go: clubsGo.length, exclus: clubs.length - clubsGo.length },
  }
}