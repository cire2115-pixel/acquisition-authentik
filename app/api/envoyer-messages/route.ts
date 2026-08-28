import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/server/lib/supabase'
import { journaliser } from '@/server/agents/universels/journaliser'

export async function POST(req: NextRequest) {
  try {
    const { prospect_ids } = await req.json() as { prospect_ids: string[] }

    if (!Array.isArray(prospect_ids) || prospect_ids.length === 0) {
      return NextResponse.json({ error: 'prospect_ids requis (tableau non vide)' }, { status: 400 })
    }

    // Récupérer les prospects APPROUVE correspondants
    const { data: prospects, error } = await supabase
      .from('prospects')
      .select('*')
      .in('id', prospect_ids)
      .eq('statut', 'APPROUVE')

    if (error) throw new Error(error.message)
    if (!prospects || prospects.length === 0) {
      return NextResponse.json({ ok: true, count: 0 })
    }

    // Passer tous en ENVOYE en une requête
    const { error: updateError } = await supabase
      .from('prospects')
      .update({ statut: 'ENVOYE' })
      .in('id', prospect_ids)
      .eq('statut', 'APPROUVE')

    if (updateError) throw new Error(updateError.message)

    // Journaliser chaque envoi simulé
    for (const p of prospects) {
      await journaliser({
        processus: 'envoyer_messages',
        event_name: 'ENVOYE_SIMULE',
        ressource_type: 'prospect',
        ressource_id: p.club_nom,
        payload: {
          decideur_nom: p.decideur_nom,
          email_contact: p.email_contact,
          message_sujet: p.message_sujet,
          simulation: true,
        },
      })
    }

    return NextResponse.json({ ok: true, count: prospects.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[envoyer-messages]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
