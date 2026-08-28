-- Prospects approuvés par Éric avant envoi
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  club_nom text not null,
  club_categorie text,
  score_icp int,
  decideur_nom text,
  decideur_role text,
  email_contact text,
  linkedin_url text,
  message_sujet text,
  message_corps text,
  statut text default 'APPROUVE' check (statut in ('APPROUVE', 'ENVOYE'))
);

-- Journal de toutes les actions agents
create table if not exists logs_activite (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  action text not null,
  prospect_id text,
  contexte jsonb
);

-- Partenariats (Phase 2)
create table if not exists partenariats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  club_nom text,
  statut text,
  details jsonb
);
