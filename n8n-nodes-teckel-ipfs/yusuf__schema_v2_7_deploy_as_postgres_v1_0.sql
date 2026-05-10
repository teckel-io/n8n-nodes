-- =============================================================================
-- yusuf__schema_v2_7_deploy_as_postgres_v1_0.sql
--
-- Postgres-superuser-runnable variant of teckel__db_schema_v2_7.sql.
-- Same DDL inside one BEGIN/COMMIT block + verification queries; written
-- this way so it can be run via pgAdmin connected as postgres without
-- the teckel_api password loop that has bitten previous deploys
-- (v2.4 / v2.5 / v2.6).
--
-- WHAT IT DOES (v2.7, Phase 16.1 MVP, 9 May 2026)
-- -----------------------------------------------
-- Adds one new table: teckel.agent_conversations
--
-- See teckel__db_schema_v2_7.sql for the full design rationale + column
-- comments. This file is the deployable artefact only.
--
-- Idempotent. Re-run safe.
--
-- DEPENDS ON: schema v2.0 baseline (teckel schema + teckel_api role
-- already exist).
-- PAIRS WITH: teckel__db_functions_v2_2_patch_15.sql (defines
-- teckel.record_conversation which writes to this table).
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS teckel.agent_conversations (
    record_id          BIGSERIAL PRIMARY KEY,
    agent_id           TEXT        NOT NULL,
    conversation_id    TEXT,
    agent_purpose      TEXT,
    started_at         TIMESTAMPTZ,
    ended_at           TIMESTAMPTZ,
    duration_s         INTEGER,
    transcript         JSONB,
    tool_calls         JSONB,
    outcome            TEXT,
    raw_payload        JSONB       NOT NULL,
    redaction_status   TEXT        NOT NULL DEFAULT 'raw',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teckel.agent_conversations IS
    'Voice-agent conversation telemetry log. One row per ended ElevenLabs conversation; written by da.process_conversation_telemetry from Yusuf''s post-call webhook. v2.7 (9 May 2026, Phase 16.1 MVP).';

COMMENT ON COLUMN teckel.agent_conversations.record_id IS
    'BIGINT primary key. Future findings + proposed_patches tables FK to this.';
COMMENT ON COLUMN teckel.agent_conversations.agent_id IS
    'ElevenLabs agent_id (e.g. agent_1101kjxef656e4frrdgkmr3bn5ct for the dental Benedict).';
COMMENT ON COLUMN teckel.agent_conversations.conversation_id IS
    'ElevenLabs conversation_id. UNIQUE (partial, NULLs allowed) so webhook retries upsert via ON CONFLICT in record_conversation.';
COMMENT ON COLUMN teckel.agent_conversations.agent_purpose IS
    'Yusuf''s denormalised agentPurpose flag — currently always ''document_analyser'' here, but future Brenda telemetry will land alongside.';
COMMENT ON COLUMN teckel.agent_conversations.transcript IS
    'Canonical transcript array extracted from the raw payload (turns with role + content). Source of truth for ad-hoc analysis prompts.';
COMMENT ON COLUMN teckel.agent_conversations.tool_calls IS
    'Canonical tool-call array extracted from the raw payload (tool name + args + result + timestamp). Drives drift / fabrication detection in 16.2.';
COMMENT ON COLUMN teckel.agent_conversations.outcome IS
    'Nullable; populated later by Phase 16.2 classifier or ad-hoc human note. Intended values: clean / dropped / fabrication_suspected / data_integrity_violation / user_confused / ambiguous. NO CHECK constraint — values may shift when 16.2 lands.';
COMMENT ON COLUMN teckel.agent_conversations.raw_payload IS
    'Full data dict from ElevenLabs post-call webhook (request_body[''data'']). Defensive: source of truth if extraction missed a field.';
COMMENT ON COLUMN teckel.agent_conversations.redaction_status IS
    '''raw'' (default — MVP stores raw transcripts; redaction at analysis-time per Steven directive 9 May 2026) or ''redacted'' (set later when Phase 16.1.e comprehensive PII redaction ships).';

CREATE UNIQUE INDEX IF NOT EXISTS ux_agent_conversations_conversation_id
    ON teckel.agent_conversations (conversation_id)
    WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_agent_conversations_agent_created
    ON teckel.agent_conversations (agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_agent_conversations_purpose_created
    ON teckel.agent_conversations (agent_purpose, created_at DESC);

-- Restore ownership / permissions (running as postgres superuser; the
-- table is owned by postgres on creation, so we re-assign to teckel_api
-- to match every other table in the schema).
ALTER TABLE teckel.agent_conversations OWNER TO teckel_api;
ALTER SEQUENCE teckel.agent_conversations_record_id_seq OWNER TO teckel_api;

GRANT SELECT, INSERT, UPDATE ON teckel.agent_conversations TO teckel_api;
GRANT USAGE, SELECT ON SEQUENCE teckel.agent_conversations_record_id_seq TO teckel_api;

COMMIT;

-- ---------------------------------------------------------------------------
-- Verification queries
-- ---------------------------------------------------------------------------

-- (1) Table exists?
SELECT 'agent_conversations exists?' AS check, COUNT(*)::INTEGER AS result
FROM information_schema.tables
WHERE table_schema = 'teckel' AND table_name = 'agent_conversations';

-- (2) Owner is teckel_api?
SELECT 'table owner' AS check, tableowner
FROM pg_tables
WHERE schemaname = 'teckel' AND tablename = 'agent_conversations';

-- (3) Index count (expect 4 entries: PK + ux_conversation_id + 2 x ix_*):
SELECT 'agent_conversations indexes' AS check, COUNT(*)::INTEGER AS result
FROM pg_indexes
WHERE schemaname = 'teckel' AND tablename = 'agent_conversations';

-- (4) Permissions for teckel_api (expect 3 rows: SELECT, INSERT, UPDATE):
SELECT privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'teckel_api'
  AND table_schema = 'teckel'
  AND table_name = 'agent_conversations'
ORDER BY privilege_type;

-- (5) Sequence ownership + grants:
SELECT 'sequence owner' AS check, pg_get_userbyid(c.relowner) AS owner
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'teckel'
  AND c.relname = 'agent_conversations_record_id_seq';
