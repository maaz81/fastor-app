CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'COUNSELOR'
        CHECK (role IN ('COUNSELOR', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW'
        CHECK (status IN ('NEW', 'CLAIMED', 'CLOSED')),
    claimed_by UUID REFERENCES employees(id) ON DELETE RESTRICT,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT lead_claim_state_check CHECK (
        (status = 'NEW' AND claimed_by IS NULL AND claimed_at IS NULL)
        OR
        (status = 'CLAIMED' AND claimed_by IS NOT NULL AND claimed_at IS NOT NULL)
        OR
        (status = 'CLOSED')
    )
);

CREATE INDEX IF NOT EXISTS idx_leads_unclaimed_created
    ON leads (created_at DESC)
    WHERE claimed_by IS NULL AND status = 'NEW';

CREATE INDEX IF NOT EXISTS idx_leads_claimed_by_created
    ON leads (claimed_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_status
    ON leads (status);