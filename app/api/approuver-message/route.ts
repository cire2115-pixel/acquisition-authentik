import { NextRequest, NextResponse } from 'next/server'
import { appendStore } from '@/server/lib/json-store'

export interface ProspectRecord {
  club_nom: string
  club_categorie: string
  score_icp: number
  decideur_nom: string
  decideur_role: string
  email_contact: string
  linkedin_url: string | null
  message_sujet: string
  message_corps: string
  statut: 'APPROUVE' | 'ENVOYE'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<ProspectRecord, 'statut'>

    if (!body.club_nom || !body.email_contact || !body.message_sujet) {
      return NextResponse.json({ error: 'club_nom, email_contact et message_sujet requis' }, { status: 400 })
    }

    const entry = await appendStore<Omit<ProspectRecord, 'statut'> & { statut: 'APPROUVE' }>('prospects', {
      ...body,
      statut: 'APPROUVE',
    })

    return NextResponse.json({ ok: true, prospect_id: entry.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[approuver-message]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
