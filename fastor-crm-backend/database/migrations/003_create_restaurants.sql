CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    image TEXT,
    starting_price NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (starting_price >= 0),
    rating NUMERIC(2, 1)
        CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    delivery_time VARCHAR(50),
    cuisine VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city_active
    ON restaurants (city_id, name)
    WHERE is_active = TRUE;