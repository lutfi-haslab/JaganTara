import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  devices: many(devices),
  dashboards: many(dashboards),
  flows: many(flows),
}));

export const devices = sqliteTable('devices', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  lastSeen: integer('last_seen', { mode: 'timestamp' }),
  status: text('status', { enum: ['online', 'offline', 'error'] }).notNull().default('offline'),
});

export const devicesRelations = relations(devices, ({ one, many }) => ({
  project: one(projects, {
    fields: [devices.projectId],
    references: [projects.id],
  }),
  datastreams: many(datastreams),
}));

export const datastreams = sqliteTable('datastreams', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull().references(() => devices.id),
  key: text('key').notNull(),
  type: text('type', { enum: ['number', 'boolean', 'string'] }).notNull(),
  mode: text('mode', { enum: ['telemetry', 'command', 'hybrid'] }).notNull().default('telemetry'),
});

export const datastreamsRelations = relations(datastreams, ({ one }) => ({
  device: one(devices, {
    fields: [datastreams.deviceId],
    references: [devices.id],
  }),
}));

export const telemetry = sqliteTable('telemetry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deviceId: text('device_id').notNull(),
  datastreamId: text('datastream_id').notNull(),
  value: text('value').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const dashboards = sqliteTable('dashboards', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['web', 'mobile_app'] }).notNull(),
  config: text('config', { mode: 'json' }).notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  publicToken: text('public_token'),
});

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  project: one(projects, {
    fields: [dashboards.projectId],
    references: [projects.id],
  }),
}));

export const flows = sqliteTable('flows', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  config: text('config', { mode: 'json' }).notNull(),
});

export const flowsRelations = relations(flows, ({ one }) => ({
  project: one(projects, {
    fields: [flows.projectId],
    references: [projects.id],
  }),
}));
