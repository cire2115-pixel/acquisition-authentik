// Spec: JOURNALISER_CREER_LIEN.md v1.0.0 — wrapper 5 lignes max
import { journaliser } from './universels/journaliser'

export async function journaliser_creer_lien(
  club_id: string,
  nom_decideur: string,
  fait_recent: string,
  statut_validation: boolean
) {
  return journaliser({
    processus: 'qualifier_clubs',
    event_name: 'CREER_LIEN_DONE',
    ressource_id: club_id,
    payload: { nom_decideur, fait_recent_utilise: fait_recent, statut_validation },
  })
}