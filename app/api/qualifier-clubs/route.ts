import { NextRequest, NextResponse } from 'next/server'
import { qualifier_clubs } from '@/server/agents/qualifier_clubs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { zone_geographique, type_club, mots_cles } = body

    if (!zone_geographique) {
      return NextResponse.json({ error: 'zone_geographique requis' }, { status: 400 })
    }

    const result = await qualifier_clubs({ zone_geographique, type_club, mots_cles })
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[qualifier-clubs]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
