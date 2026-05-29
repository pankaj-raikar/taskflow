import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar").notNull().default(""),
  bio: text("bio").notNull().default(""),
  role: text("role").notNull().default("Member"),
  status: text("status", { enum: ["online", "offline", "away"] }).notNull().default("online"),
  ...timestamps
});

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status", { enum: ["todo", "in-progress", "done"] }).notNull(),
  category: text("category").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull(),
  dueDate: text("due_date").notNull(),
  dateLabel: text("date_label").notNull(),
  assigneeId: text("assignee_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  ...timestamps
});

export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  progress: integer("progress").notNull().default(0),
  color: text("color").notNull(),
  tasksCount: integer("tasks_count").notNull().default(0),
  ...timestamps
});

export const notifications = sqliteTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  time: text("time").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  ...timestamps
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  projects: many(projects),
  notifications: many(notifications)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  owner: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id]
  })
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  owner: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
