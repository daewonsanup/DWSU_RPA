-- PostgreSQL initialization script
-- Runs once when the container is first created

-- Tighten schema permissions for the application user
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT  ALL ON SCHEMA public TO CURRENT_USER;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
