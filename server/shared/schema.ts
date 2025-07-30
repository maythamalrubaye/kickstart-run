import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  athleteName: text("athlete_name").notNull(),
  schoolClub: text("school_club"),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age").notNull(),
  parentEmail: text("parent_email"),
  // Simplified consent - comprehensive agreement accepted during signup
  consentLeaderboard: boolean("consent_leaderboard").default(true), // Auto-consent with opt-out available
  consentDataUse: boolean("consent_data_use").default(true), // Required for service
  optOutPublic: boolean("opt_out_public").default(false), // Can opt-out later in settings
  parentalConsentGiven: boolean("parental_consent_given").default(false), // Required for under-13
  termsAccepted: boolean("terms_accepted").default(true), // Comprehensive agreement accepted
  liabilityWaiverAccepted: boolean("liability_waiver_accepted").default(true), // Liability waiver accepted
  coppaCompliantConsent: boolean("coppa_compliant_consent").default(false), // COPPA consent for under-13
  coppaConsent: boolean("coppa_consent").default(false), // General COPPA consent
  ferpaConsent: boolean("ferpa_consent").default(false), // FERPA consent
  dataProcessingConsent: boolean("data_processing_consent").default(false), // Data processing consent
  marketingConsent: boolean("marketing_consent").default(false), // Marketing consent
  accountStatus: text("account_status").default("active").notNull(), // active, pending_parent_consent, suspended
  trialStartDate: timestamp("trial_start_date").defaultNow(),
  subscriptionActive: boolean("subscription_active").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  yearJoined: integer("year_joined").default(new Date().getFullYear()),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'distance', 'pace', 'endurance'
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").notNull(),
  pointsReward: integer("points_reward").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  targetDistance: decimal("target_distance", { precision: 8, scale: 2 }), // in kilometers
  targetTime: integer("target_time"), // in seconds
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  status: text("status").notNull().default("locked"), // 'locked', 'available', 'in_progress', 'completed'
  activitiesCompleted: integer("activities_completed").default(0),
  attempts: integer("attempts").default(0), // Number of attempts made
  bestTime: integer("best_time"), // in seconds
  bestPace: decimal("best_pace", { precision: 6, scale: 2 }), // min/km
  completedAt: timestamp("completed_at"),
  points: integer("points").default(0),
  yearEarned: integer("year_earned").default(new Date().getFullYear()),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id"),
  distance: decimal("distance", { precision: 8, scale: 2 }).notNull(), // in kilometers
  duration: integer("duration").notNull(), // in seconds
  pace: decimal("pace", { precision: 6, scale: 2 }).notNull(), // min/km
  calories: integer("calories"),
  route: jsonb("route"), // GPS coordinates if available
  aiAnalysis: jsonb("ai_analysis"), // AI coaching suggestions
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'speed_demon', 'consistency_king', 'form_master'
  title: text("title").notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const adventures = pgTable("adventures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(), // 'fantasy', 'space', 'ocean', 'dinosaur', 'magic'
  ageGroup: text("age_group").notNull(), // '6-8', '9-12', '13-18'
  requiredDistance: decimal("required_distance", { precision: 8, scale: 2 }).notNull(), // in kilometers
  rewardType: text("reward_type").notNull(), // 'badge', 'character', 'treasure', 'power'
  rewardData: jsonb("reward_data"), // JSON data for the reward
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAdventures = pgTable("user_adventures", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  adventureId: integer("adventure_id").notNull(),
  status: text("status").notNull().default("locked"), // 'locked', 'available', 'in_progress', 'completed'
  progressDistance: decimal("progress_distance", { precision: 8, scale: 2 }).default("0"),
  completedAt: timestamp("completed_at"),
  rewardsEarned: jsonb("rewards_earned"), // JSON array of earned rewards
});

export const userPerformanceAnalytics = pgTable("user_performance_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  avgCompletionRate: decimal("avg_completion_rate", { precision: 5, scale: 2 }).default("0"), // Percentage 0-100
  avgAttemptCount: decimal("avg_attempt_count", { precision: 4, scale: 2 }).default("1"), // Average attempts per challenge
  recentPerformanceTrend: text("recent_performance_trend").default("stable"), // improving, declining, stable
  preferredDifficulty: text("preferred_difficulty").default("medium"), // easy, medium, hard
  adaptiveLevel: decimal("adaptive_level", { precision: 3, scale: 2 }).default("1.0"), // Current difficulty multiplier
  totalChallengesCompleted: integer("total_challenges_completed").default(0),
  totalChallengesAttempted: integer("total_challenges_attempted").default(0),
  averageCompletionTime: integer("average_completion_time"), // seconds
  lastAnalysisAt: timestamp("last_analysis_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  schoolClub: text("school_club").notNull().unique(),
  totalPoints: integer("total_points").default(0),
  topContributors: jsonb("top_contributors"), // Array of top 10 user IDs and their points
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").notNull(),
  userId: integer("user_id").notNull(),
  totalPoints: integer("total_points").default(0),
  challengesCompleted: integer("challenges_completed").default(0),
  rank: integer("rank").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sharingStreaks = pgTable("sharing_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastShareDate: timestamp("last_share_date"),
  totalShares: integer("total_shares").default(0),
  streakMultiplier: decimal("streak_multiplier", { precision: 3, scale: 2 }).default("1.0"),
  streakPoints: integer("streak_points").default(0),
  milestoneBadges: jsonb("milestone_badges").default([]), // Array of earned streak badges
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shareActivities = pgTable("share_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id"),
  challengeId: integer("challenge_id"),
  platform: text("platform").notNull(), // 'facebook', 'instagram', 'twitter', etc.
  shareType: text("share_type").notNull(), // 'achievement', 'challenge', 'ranking'
  pointsEarned: integer("points_earned").default(10),
  streakDay: integer("streak_day").default(1),
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  userChallenges: many(userChallenges),
  activities: many(activities),
  achievements: many(achievements),
  leaderboardEntries: many(leaderboardEntries),
  userAdventures: many(userAdventures),
  performanceAnalytics: one(userPerformanceAnalytics),
  sharingStreak: one(sharingStreaks),
  shareActivities: many(shareActivities),
}));

export const userPerformanceAnalyticsRelations = relations(userPerformanceAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userPerformanceAnalytics.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
  activities: many(activities),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [activities.challengeId],
    references: [challenges.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const adventuresRelations = relations(adventures, ({ many }) => ({
  userAdventures: many(userAdventures),
}));

export const userAdventuresRelations = relations(userAdventures, ({ one }) => ({
  user: one(users, {
    fields: [userAdventures.userId],
    references: [users.id],
  }),
  adventure: one(adventures, {
    fields: [userAdventures.adventureId],
    references: [adventures.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ many }) => ({
  entries: many(leaderboardEntries),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  leaderboard: one(leaderboards, {
    fields: [leaderboardEntries.leaderboardId],
    references: [leaderboards.id],
  }),
  user: one(users, {
    fields: [leaderboardEntries.userId],
    references: [users.id],
  }),
}));

export const sharingStreaksRelations = relations(sharingStreaks, ({ one }) => ({
  user: one(users, {
    fields: [sharingStreaks.userId],
    references: [users.id],
  }),
}));

export const shareActivitiesRelations = relations(shareActivities, ({ one }) => ({
  user: one(users, {
    fields: [shareActivities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  trialStartDate: true,
  age: true, // We'll calculate age from date of birth
  // termsAccepted handled in form validation
  liabilityWaiverAccepted: true, // Auto-set to true during registration
  consentLeaderboard: true, // Auto-consent with opt-out available
  consentDataUse: true, // Required for service
}).extend({
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 6 && age - 1 <= 18;
    }
    return age >= 6 && age <= 18;
  }, {
    message: "Athlete must be between 6 and 18 years old",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export const insertAdventureSchema = createInsertSchema(adventures).omit({
  id: true,
  createdAt: true,
});

export const insertUserAdventureSchema = createInsertSchema(userAdventures).omit({
  id: true,
  completedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Adventure = typeof adventures.$inferSelect;
export type InsertAdventure = z.infer<typeof insertAdventureSchema>;
export type UserAdventure = typeof userAdventures.$inferSelect;
export type InsertUserAdventure = z.infer<typeof insertUserAdventureSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type UserPerformanceAnalytics = typeof userPerformanceAnalytics.$inferSelect;
export type InsertUserPerformanceAnalytics = z.infer<typeof insertUserPerformanceAnalyticsSchema>;

// Missing schema definitions
export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  completedAt: true,

});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  updatedAt: true,
});

export const insertUserPerformanceAnalyticsSchema = createInsertSchema(userPerformanceAnalytics).omit({
  id: true,
  lastAnalysisAt: true,
  updatedAt: true,
});

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;

// Sharing streak schemas and types
export const insertSharingStreakSchema = createInsertSchema(sharingStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShareActivitySchema = createInsertSchema(shareActivities).omit({
  id: true,
  sharedAt: true,
});

export type SharingStreak = typeof sharingStreaks.$inferSelect;
export type InsertSharingStreak = z.infer<typeof insertSharingStreakSchema>;
export type ShareActivity = typeof shareActivities.$inferSelect;
export type InsertShareActivity = z.infer<typeof insertShareActivitySchema>;
