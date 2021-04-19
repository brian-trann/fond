CREATE TABLE users (
    email TEXT PRIMARY KEY CHECK (position('@' IN email) > 1),
    username VARCHAR(25) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    email_token TEXT,
    token_expiration TEXT
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    raw_recipe TEXT,
    keywords TEXT,
    title TEXT
);

CREATE TABLE user_recipes (
    email TEXT REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
    PRIMARY KEY (email, recipe_id)
);

CREATE TABLE failed_recipes (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE
);