import type { Database } from "bun:sqlite";

export function bootstrapSqliteSchema(sqlite: Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      password_hash text NOT NULL,
      avatar text DEFAULT '' NOT NULL,
      bio text DEFAULT '' NOT NULL,
      role text DEFAULT 'Member' NOT NULL,
      status text DEFAULT 'online' NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

    CREATE TABLE IF NOT EXISTS tasks (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      title text NOT NULL,
      description text DEFAULT '' NOT NULL,
      status text NOT NULL,
      category text NOT NULL,
      priority text NOT NULL,
      due_date text NOT NULL,
      date_label text NOT NULL,
      assignee_id text NOT NULL,
      starred integer DEFAULT false NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON UPDATE no action ON DELETE restrict
    );

    CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      name text NOT NULL,
      progress integer DEFAULT 0 NOT NULL,
      color text NOT NULL,
      tasks_count integer DEFAULT 0 NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      time text NOT NULL,
      read integer DEFAULT false NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
    );
  `);
}
