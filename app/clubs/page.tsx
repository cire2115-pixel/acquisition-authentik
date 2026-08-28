'use client'

import { useState } from 'react'
import {
  Search, MapPin, Tag, Zap, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, BarChart3, Users, Target,
  Send, Clock, AlertCircle, Loader2, Mail, Linkedin,
  X, Edit3,
} from 'lucide-react'

interface ProspectEngage {
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

interface ResultatQualification {
  prospects_engages: ProspectEngage[]
  stats: { total: number; go: number; exclus: number }
}

interface ApprovedInfo {
  prospect_id: string
  email: string
  sujet: string
  corps: string
}

interface ModalState {
  idx: number
  prospect: ProspectEngage
  sujet: string
  corps: string
  email: string
}

const CATEGORIES: Record<string, string> = {
  generaliste_sante: 'Santé / Bien-être',
  sport_dirigeant: 'Sport dirigeants',
  plateforme_b2b: 'Plateforme B2B',
  membership_ferme: 'Membership fermé',
}

const ROLES: Record<string, string> = {
  fondateur: 'Fondateur',
  bureau: 'Bureau',
  tete_reseau: 'Tête de réseau',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80
    ? 'bg-green-100 text-green-700'
    : score >= 60
    ? 'bg-blue-100 text-blue-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      <Target className="w-3 h-3" />
      ICP {score}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-[var(--aa-border)] rounded-xl p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-[var(--aa-text)]">{value}</div>
        <div className="text-xs text-[var(--aa-muted)] mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function ReviewModal({
  modal,
  onClose,
  onConfirm,
  saving,
}: {
  modal: ModalState
  onClose: () => void
  onConfirm: (sujet: string, corps: string, email: string) => void
  saving: boolean
}) {
  const [sujet, setSujet] = useState(modal.sujet)
  const [corps, setCorps] = useState(modal.corps)
  const [email, setEmail] = useState(modal.email)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header modale */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--aa-border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Edit3 className="w-4 h-4 text-[var(--aa-cta)]" />
              <span className="font-semibold text-[var(--aa-text)]">Valider le message</span>
            </div>
            <div className="text-sm text-[var(--aa-muted)]">
              {modal.prospect.club_nom} — {modal.prospect.decideur_nom}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--aa-muted)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps modale */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Email destinataire */}
          <div>
            <label className="block text-xs font-semibold text-[var(--aa-muted)] uppercase tracking-wide mb-1.5">
              <Mail className="w-3 h-3 inline mr-1" />
              Email destinataire *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@club.fr"
              className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent bg-white text-[var(--aa-text)] placeholder:text-slate-400"
            />
            {modal.prospect.linkedin_url && (
              <a
                href={modal.prospect.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-[var(--aa-cta)] hover:underline"
              >
                <Linkedin className="w-3 h-3" />
                Profil LinkedIn
              </a>
            )}
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-xs font-semibold text-[var(--aa-muted)] uppercase tracking-wide mb-1.5">
              Sujet
            </label>
            <input
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent bg-white text-[var(--aa-text)]"
            />
          </div>

          {/* Corps */}
          <div>
            <label className="block text-xs font-semibold text-[var(--aa-muted)] uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              rows={8}
              className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent bg-white text-[var(--aa-text)] leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer modale */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--aa-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--aa-muted)] hover:text-[var(--aa-text)] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(sujet, corps, email)}
            disabled={saving || !email.trim()}
            className="flex items-center gap-2 bg-[var(--aa-cta)] hover:bg-[var(--aa-cta-hover)] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Confirmer</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageCard({
  prospect,
  approved,
  onApprove,
}: {
  prospect: ProspectEngage
  approved: boolean
  onApprove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`border rounded-xl transition-colors duration-200 overflow-hidden ${
        approved ? 'border-green-400 bg-green-50' : 'border-[var(--aa-border)] bg-white'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="mt-0.5">
          <ScoreBadge score={prospect.score_icp} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[var(--aa-text)] truncate">{prospect.club_nom}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-[var(--aa-muted)]">{CATEGORIES[prospect.club_categorie] ?? prospect.club_categorie}</span>
            <span className="text-[var(--aa-border)]">·</span>
            <span className="text-xs text-[var(--aa-muted)] flex items-center gap-1">
              <Users className="w-3 h-3" />
              {prospect.decideur_nom} — {ROLES[prospect.decideur_role] ?? prospect.decideur_role}
            </span>
            {prospect.email_contact && (
              <>
                <span className="text-[var(--aa-border)]">·</span>
                <span className="text-xs text-[var(--aa-cta)] flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {prospect.email_contact}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-[var(--aa-muted)] hover:bg-slate-100 hover:text-[var(--aa-text)] transition-colors duration-150 cursor-pointer"
            aria-label={expanded ? 'Réduire' : 'Voir le message'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onApprove}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer ${
              approved
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-[var(--aa-secondary)] border-[var(--aa-border)] hover:border-[var(--aa-cta)] hover:text-[var(--aa-cta)]'
            }`}
          >
            {approved ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Approuvé</>
            ) : (
              <>Approuver</>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--aa-border)] mx-4 mb-4 pt-3">
          <div className="text-xs font-semibold text-[var(--aa-muted)] uppercase tracking-wide mb-1">Sujet</div>
          <div className="text-sm font-medium text-[var(--aa-text)] mb-3">{prospect.message_sujet}</div>
          <div className="text-xs font-semibold text-[var(--aa-muted)] uppercase tracking-wide mb-1">Message</div>
          <div className="text-sm text-[var(--aa-secondary)] whitespace-pre-wrap leading-relaxed">{prospect.message_corps}</div>
        </div>
      )}
    </div>
  )
}

export default function ClubsPage() {
  const [zone, setZone] = useState('')
  const [typeClub, setTypeClub] = useState('')
  const [motsCles, setMotsCles] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState<ResultatQualification | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [approuves, setApprouves] = useState<Map<number, ApprovedInfo>>(new Map())
  const [modal, setModal] = useState<ModalState | null>(null)
  const [saving, setSaving] = useState(false)

  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)

  async function lancerQualification() {
    if (!zone.trim()) return
    setLoading(true)
    setError(null)
    setResultat(null)
    setApprouves(new Map())
    setSentCount(null)
    try {
      const res = await fetch('/api/qualifier-clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_geographique: zone, type_club: typeClub || undefined, mots_cles: motsCles || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultat(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function openModal(idx: number, prospect: ProspectEngage) {
    const already = approuves.get(idx)
    setModal({
      idx,
      prospect,
      sujet: already?.sujet ?? prospect.message_sujet,
      corps: already?.corps ?? prospect.message_corps,
      email: already?.email ?? prospect.email_contact ?? '',
    })
  }

  async function confirmApproval(sujet: string, corps: string, email: string) {
    if (!modal) return
    setSaving(true)
    try {
      const { prospect, idx } = modal
      const res = await fetch('/api/approuver-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_nom: prospect.club_nom,
          club_categorie: prospect.club_categorie,
          score_icp: prospect.score_icp,
          decideur_nom: prospect.decideur_nom,
          decideur_role: prospect.decideur_role,
          email_contact: email,
          linkedin_url: prospect.linkedin_url,
          message_sujet: sujet,
          message_corps: corps,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setApprouves((prev) => {
        const next = new Map(prev)
        next.set(idx, { prospect_id: data.prospect_id, email, sujet, corps })
        return next
      })
      setModal(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de l\'approbation')
    } finally {
      setSaving(false)
    }
  }

  async function envoyerMessages() {
    const prospect_ids = Array.from(approuves.values()).map((a) => a.prospect_id)
    if (prospect_ids.length === 0) return
    setSending(true)
    try {
      const res = await fetch('/api/envoyer-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSentCount(data.count)
      setApprouves(new Map())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  const validables = resultat?.prospects_engages.filter((p) => p.statut === 'EN_ATTENTE_VALIDATION') ?? []

  return (
    <div className="min-h-screen bg-[var(--aa-bg)]">
      {/* Modal */}
      {modal && (
        <ReviewModal
          modal={modal}
          onClose={() => setModal(null)}
          onConfirm={confirmApproval}
          saving={saving}
        />
      )}

      {/* Top bar */}
      <header className="bg-[var(--aa-primary)] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-sky-400" />
          <span className="font-semibold text-lg tracking-tight">Acquisition Authentik</span>
          <span className="text-slate-400 text-sm ml-2">— Phase 1 · Qualification clubs</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Éric Perez · Opérationnel</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Formulaire */}
        <section className="bg-white border border-[var(--aa-border)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-[var(--aa-cta)]" />
            <h2 className="font-semibold text-[var(--aa-text)]">Lancer une qualification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label htmlFor="zone" className="block text-xs font-medium text-[var(--aa-muted)] mb-1.5">
                <MapPin className="w-3 h-3 inline mr-1" />Zone géographique *
              </label>
              <input
                id="zone"
                type="text"
                placeholder="ex : Paris, Lyon, France"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lancerQualification()}
                className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent transition-colors duration-150 bg-white text-[var(--aa-text)] placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-xs font-medium text-[var(--aa-muted)] mb-1.5">
                <Tag className="w-3 h-3 inline mr-1" />Type de club
              </label>
              <select
                id="type"
                value={typeClub}
                onChange={(e) => setTypeClub(e.target.value)}
                className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent transition-colors duration-150 bg-white text-[var(--aa-text)] cursor-pointer"
              >
                <option value="">Tous types</option>
                <option value="sport dirigeants">Sport dirigeants</option>
                <option value="membership fermé">Membership fermé</option>
                <option value="plateforme B2B">Plateforme B2B</option>
                <option value="généraliste santé bien-être">Santé / Bien-être</option>
              </select>
            </div>

            <div>
              <label htmlFor="mots" className="block text-xs font-medium text-[var(--aa-muted)] mb-1.5">
                <Search className="w-3 h-3 inline mr-1" />Mots-clés
              </label>
              <input
                id="mots"
                type="text"
                placeholder="ex : leadership, transformation"
                value={motsCles}
                onChange={(e) => setMotsCles(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lancerQualification()}
                className="w-full border border-[var(--aa-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--aa-cta)] focus:border-transparent transition-colors duration-150 bg-white text-[var(--aa-text)] placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            onClick={lancerQualification}
            disabled={loading || !zone.trim()}
            className="flex items-center gap-2 bg-[var(--aa-cta)] hover:bg-[var(--aa-cta-hover)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours…</>
            ) : (
              <><Zap className="w-4 h-4" /> Lancer la qualification</>
            )}
          </button>
        </section>

        {/* Erreur */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Confirmation envoi */}
        {sentCount !== null && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {sentCount} message{sentCount > 1 ? 's' : ''} marqué{sentCount > 1 ? 's' : ''} comme envoyé{sentCount > 1 ? 's' : ''} — simulation enregistrée dans les logs.
            </span>
          </div>
        )}

        {/* Stats */}
        {resultat && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Clubs analysés" value={resultat.stats.total} icon={BarChart3} color="bg-slate-100 text-slate-600" />
            <StatCard label="Prospects GO" value={resultat.stats.go} icon={CheckCircle2} color="bg-green-100 text-green-700" />
            <StatCard label="Hors critères" value={resultat.stats.exclus} icon={XCircle} color="bg-slate-100 text-slate-400" />
          </div>
        )}

        {/* Liste messages à valider */}
        {validables.length > 0 && (
          <section className="bg-white border border-[var(--aa-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[var(--aa-cta)]" />
                <h2 className="font-semibold text-[var(--aa-text)]">
                  Messages à valider
                  <span className="ml-2 text-xs font-normal text-[var(--aa-muted)] bg-slate-100 px-2 py-0.5 rounded-full">
                    {validables.length}
                  </span>
                </h2>
              </div>
              <span className="text-xs text-[var(--aa-muted)]">
                Cliquez "Approuver" pour relire et confirmer chaque message avant envoi
              </span>
            </div>

            <div className="space-y-3">
              {validables.map((p, idx) => (
                <MessageCard
                  key={idx}
                  prospect={p}
                  approved={approuves.has(idx)}
                  onApprove={() => openModal(idx, p)}
                />
              ))}
            </div>

            {approuves.size > 0 && (
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-[var(--aa-border)]">
                <span className="text-sm text-[var(--aa-muted)]">
                  {approuves.size} message{approuves.size > 1 ? 's' : ''} prêt{approuves.size > 1 ? 's' : ''} à envoyer
                </span>
                <button
                  onClick={envoyerMessages}
                  disabled={sending}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Envoyer {approuves.size} message{approuves.size > 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* État vide après recherche sans résultats GO */}
        {resultat && validables.length === 0 && !error && (
          <div className="text-center py-12 text-[var(--aa-muted)]">
            <Target className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">Aucun prospect qualifié GO sur cette recherche.</p>
            <p className="text-xs mt-1">Essayez une autre zone ou des mots-clés différents.</p>
          </div>
        )}

      </main>
    </div>
  )
}
