-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_school varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active' NOT NULL;

-- Create contest-related enums if they don't exist
DO $$ BEGIN
    CREATE TYPE contest_difficulty AS ENUM('Easy', 'Medium', 'Hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contest_status AS ENUM('upcoming', 'active', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create contests table if it doesn't exist
CREATE TABLE IF NOT EXISTS contests (
    id serial PRIMARY KEY NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    difficulty contest_difficulty DEFAULT 'Medium' NOT NULL,
    duration integer NOT NULL,
    status contest_status DEFAULT 'upcoming' NOT NULL,
    start_password varchar(255),
    is_started boolean DEFAULT false NOT NULL,
    started_at timestamp,
    created_by integer NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id serial PRIMARY KEY NOT NULL,
    contest_id integer NOT NULL,
    title varchar(255) NOT NULL,
    description text NOT NULL,
    difficulty contest_difficulty DEFAULT 'Medium' NOT NULL,
    max_points integer DEFAULT 100 NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create contest_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS contest_participants (
    id serial PRIMARY KEY NOT NULL,
    contest_id integer NOT NULL,
    user_id integer NOT NULL,
    has_started boolean DEFAULT false NOT NULL,
    started_at timestamp,
    score integer DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);
