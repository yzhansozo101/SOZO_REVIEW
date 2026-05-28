import {
  pgTable,
  text,
  uuid,
  integer,
  char,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const diagnoses = pgTable(
  "diagnoses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: text("listing_id").notNull().references(() => listings.id),
    overallScore: integer("overall_score").notNull(),
    grade: char("grade", { length: 1 }).notNull(),
    qualityStatus: text("quality_status").notNull(),
    dimensions: jsonb("dimensions").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    aiReportMd: text("ai_report_md"),
    aiNegativeKw: jsonb("ai_negative_kw"),
    aiTop3: jsonb("ai_top3"),
    aiStatus: text("ai_status").notNull(),
    scrapeStatus: text("scrape_status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    listingIdIdx: index("idx_diagnoses_listing").on(table.listingId, table.createdAt),
  })
);

export const alertsSent = pgTable("alerts_sent", {
  diagnosisId: uuid("diagnosis_id").primaryKey().references(() => diagnoses.id),
  emailTo: text("email_to").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  resendId: text("resend_id"),
});

export type Listing = typeof listings.$inferSelect;
export type DiagnosisRow = typeof diagnoses.$inferSelect;
export type NewDiagnosis = typeof diagnoses.$inferInsert;
