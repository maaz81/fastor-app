CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(10) NOT NULL,
    dial_code VARCHAR(4) NOT NULL DEFAULT '+91',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT customers_phone_dial_code_unique UNIQUE (phone, dial_code)
);