import { 
  users, 
  challenges, 
  userChallenges, 
  activities, 
  achievements, 
  adventures,
  userAdventures,
  leaderboards, 
  leaderboardEntries,
  type User, 
  type InsertUser, 
  type Challenge, 
  type InsertChallenge,
  type UserChallenge,
  type Activity,
  type InsertActivity,
  type Achievement,
  type InsertAchievement,
  type Adventure,
  type InsertAdventure,
  type UserAdventure,
  type InsertUserAdventure,
  type Leaderboard,
  type LeaderboardEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, count, sql, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: number, customerId: string, subscriptionId?: string): Promise<User>;
  updateUserOptOutStatus(userId: number, optOut: boolean): Promise<User>;
  updateUserParentEmail(userId: number, parentEmail: string): Promise<User>;
  updateUserSubscriptionStatus(userId: number, active: boolean): Promise<User>;
  
  // Challenge methods
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge>;
  
  // User Challenge methods
  getUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]>;
  getUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined>;
  updateUserChallengeStatus(userId: number, challengeId: number, status: string, points?: number): Promise<UserChallenge>;
  initializeUserChallenges(userId: number): Promise<void>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: number): Promise<Activity[]>;
  getChallengeActivities(challengeId: number): Promise<Activity[]>;
  
  // Achievement methods
  getUserAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Leaderboard methods
  getOrCreateLeaderboard(schoolClub: string): Promise<Leaderboard>;
  getLeaderboardEntries(leaderboardId: number, limit?: number): Promise<(LeaderboardEntry & { user: User })[]>;
  updateLeaderboardEntry(userId: number, leaderboardId: number): Promise<void>;
  getUserLeaderboardRank(userId: number): Promise<{ rank: number; totalPoints: number; schoolClub: string } | null>;
  getTop10Leaderboard(schoolClub: string): Promise<any[]>;
  getSchoolClubRankings(): Promise<any[]>;
  updateSchoolClubTop10(schoolClub: string): Promise<void>;
  
  // Adventure methods
  getAdventuresForAge(age: number): Promise<Adventure[]>;
  getUserAdventures(userId: number): Promise<(UserAdventure & { adventure: Adventure })[]>;
  createUserAdventure(userAdventure: InsertUserAdventure): Promise<UserAdventure>;
  updateAdventureProgress(userId: number, adventureId: number, distance: number): Promise<UserAdventure>;
  initializeUserAdventures(userId: number, userAge: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { confirmPassword, ...userData } = insertUser;
    // Extract age from dateOfBirth
    const birthYear = parseInt(userData.dateOfBirth.split('-')[0]);
    const age = new Date().getFullYear() - birthYear;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        age: age
      })
      .returning();
    return user;
  }

  async updateUserOptOutStatus(userId: number, optOut: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ optOutPublic: optOut })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserParentEmail(userId: number, parentEmail: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        parentEmail: parentEmail,
        coppaCompliantConsent: true,
        parentalConsentGiven: true
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionStatus(userId: number, active: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ subscriptionActive: active })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserConsentStatus(userId: number, updates: {
    accountStatus?: string;
    coppaCompliantConsent?: boolean;
    parentalConsentGiven?: boolean;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByParentEmail(parentEmail: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.parentEmail, parentEmail));
  }

  async updateUserStripeInfo(userId: number, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: subscriptionId ? true : false
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStripeSubscriptionId(id: number, stripeSubscriptionId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        stripeSubscriptionId,
        subscriptionActive: true,
        trialStartDate: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).where(eq(challenges.isActive, true)).orderBy(asc(challenges.orderIndex));
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge || undefined;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db
      .insert(challenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge> {
    const [updatedChallenge] = await db
      .update(challenges)
      .set(challenge)
      .where(eq(challenges.id, id))
      .returning();
    return updatedChallenge;
  }

  async getUserChallenges(userId: number): Promise<(UserChallenge & { challenge: Challenge })[]> {
    try {
      console.log(`=== STORAGE: Getting challenges for user ${userId} ===`);
      
      // First check if user has any user_challenges records
      const userChallengeCount = await db
        .select({ count: sql`count(*)` })
        .from(userChallenges)
        .where(eq(userChallenges.userId, userId));
      
      console.log(`User ${userId} has ${userChallengeCount[0].count} user challenge records`);
      
      // Use direct JOIN query for better reliability
      const result = await db
        .select({
          id: userChallenges.id,
          userId: userChallenges.userId,
          challengeId: userChallenges.challengeId,
          status: userChallenges.status,
          completedAt: userChallenges.completedAt,
          points: userChallenges.points,
          activitiesCompleted: userChallenges.activitiesCompleted,
          bestTime: userChallenges.bestTime,
          bestPace: userChallenges.bestPace,
          yearEarned: userChallenges.yearEarned,
          challenge: challenges
        })
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(and(
          eq(userChallenges.userId, userId),
          eq(challenges.isActive, true)
        ))
        .orderBy(asc(challenges.orderIndex));

      console.log(`=== STORAGE: Found ${result.length} challenges for user ${userId} ===`);
      if (result.length > 0) {
        console.log(`First challenge: ${result[0].challenge.title} (${result[0].status})`);
      }
      return result as (UserChallenge & { challenge: Challenge })[];
    } catch (error) {
      console.error("Error in getUserChallenges:", error);
      return [];
    }
  }

  async getUserChallenge(userId: number, challengeId: number): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)));
    return userChallenge || undefined;
  }

  async updateUserChallengeStatus(userId: number, challengeId: number, status: string, points?: number): Promise<UserChallenge> {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
      if (points) updateData.points = points;
    }

    const [userChallenge] = await db
      .update(userChallenges)
      .set(updateData)
      .where(and(eq(userChallenges.userId, userId), eq(userChallenges.challengeId, challengeId)))
      .returning();
    return userChallenge;
  }

  async initializeUserChallenges(userId: number): Promise<void> {
    const allChallenges = await this.getChallenges();
    
    // Check which challenges the user already has
    const existingUserChallenges = await db
      .select({ challengeId: userChallenges.challengeId })
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId));
    
    const existingChallengeIds = new Set(existingUserChallenges.map(uc => uc.challengeId));
    
    // Only create challenges that don't already exist
    const newChallengeData = allChallenges
      .filter(challenge => !existingChallengeIds.has(challenge.id))
      .map((challenge, index) => {
        // Make first challenge available, plus all form and drill challenges
        const shouldBeAvailable = index === 0 || challenge.type === 'form' || challenge.type === 'drill';
        return {
          userId,
          challengeId: challenge.id,
          status: shouldBeAvailable ? 'available' : 'locked',
          activitiesCompleted: 0,
          points: 0,
          yearEarned: 2025
        };
      });

    if (newChallengeData.length > 0) {
      await db.insert(userChallenges).values(newChallengeData);
    }
  }

  async autoCompleteDistanceChallenges(userId: number, activityDistanceKm: number): Promise<any[]> {
    // Get all available distance challenges that haven't been completed
    const userDistanceChallenges = await db
      .select({
        userChallenge: userChallenges,
        challenge: challenges
      })
      .from(userChallenges)
      .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(and(
        eq(userChallenges.userId, userId),
        eq(challenges.type, 'distance'),
        or(
          eq(userChallenges.status, 'available'),
          eq(userChallenges.status, 'in_progress')
        )
      ))
      .orderBy(asc(challenges.orderIndex));

    const completedChallenges: any[] = [];
    
    for (const { userChallenge, challenge } of userDistanceChallenges) {
      if (challenge.targetDistance) {
        const targetKm = parseFloat(challenge.targetDistance);
        
        // If this run distance meets or exceeds the challenge target
        if (activityDistanceKm >= targetKm) {
          // Complete the challenge
          await this.updateUserChallengeStatus(
            userId,
            challenge.id,
            'completed',
            challenge.pointsReward || 0
          );

          // Award achievement
          await this.createAchievement({
            userId,
            type: 'distance_milestone',
            title: `${challenge.title} Complete`,
            description: `Completed ${targetKm}km distance challenge - ${challenge.pointsReward || 0} points awarded`
          });

          completedChallenges.push({
            challengeId: challenge.id,
            title: challenge.title,
            distance: targetKm,
            pointsAwarded: challenge.pointsReward
          });

          // Unlock next distance challenge if it exists
          const nextChallenge = await db
            .select()
            .from(challenges)
            .where(and(
              eq(challenges.type, 'distance'),
              eq(challenges.orderIndex, challenge.orderIndex + 1),
              eq(challenges.isActive, true)
            ));

          if (nextChallenge.length > 0) {
            await db
              .update(userChallenges)
              .set({ status: 'available' })
              .where(and(
                eq(userChallenges.userId, userId),
                eq(userChallenges.challengeId, nextChallenge[0].id)
              ));
          }
        }
      }
    }

    return completedChallenges;
  }

  async markChallengeAsDone(userId: number, challengeId: number): Promise<{ success: boolean; message: string }> {
    const userChallenge = await this.getUserChallenge(userId, challengeId);
    if (!userChallenge) {
      return { success: false, message: "Challenge not found" };
    }

    if (userChallenge.status === 'completed') {
      return { success: false, message: "Challenge already completed" };
    }

    if (userChallenge.status === 'locked') {
      return { success: false, message: "Challenge is locked" };
    }

    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return { success: false, message: "Challenge details not found" };
    }

    // Mark as completed manually
    await this.updateUserChallengeStatus(
      userId,
      challengeId,
      'completed',
      challenge.pointsReward || 0
    );

    // Award achievement for manual completion
    await this.createAchievement({
      userId,
      type: 'manual_complete',
      title: `${challenge.title} Done!`,
      description: `Manually marked ${challenge.title} as complete - ${challenge.pointsReward || 0} points awarded`
    });

    return { 
      success: true, 
      message: `${challenge.title} marked as done! Available for sharing.`
    };
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.completedAt));
  }

  async getChallengeActivities(challengeId: number): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.challengeId, challengeId)).orderBy(desc(activities.completedAt));
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.earnedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getOrCreateLeaderboard(schoolClub: string): Promise<Leaderboard> {
    const [existing] = await db.select().from(leaderboards).where(eq(leaderboards.schoolClub, schoolClub));
    
    if (existing) return existing;

    const [newLeaderboard] = await db
      .insert(leaderboards)
      .values({ schoolClub })
      .returning();
    return newLeaderboard;
  }

  async getLeaderboardEntries(leaderboardId: number, limit: number = 10): Promise<(LeaderboardEntry & { user: User })[]> {
    const result = await db
      .select()
      .from(leaderboardEntries)
      .innerJoin(users, eq(leaderboardEntries.userId, users.id))
      .where(eq(leaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(asc(leaderboardEntries.rank))
      .limit(limit);
    
    return result.map(row => ({
      ...row.leaderboard_entries,
      user: row.users
    })) as any;
  }

  async updateLeaderboardEntry(userId: number, leaderboardId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    // Calculate user's total points from completed challenges
    const [result] = await db
      .select({ 
        totalPoints: sql<number>`COALESCE(SUM(${userChallenges.points}), 0)`,
        completedCount: sql<number>`COUNT(CASE WHEN ${userChallenges.status} = 'completed' THEN 1 END)`
      })
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId));

    const totalPoints = Number(result?.totalPoints ?? 0);
    const challengesCompleted = Number(result?.completedCount ?? 0);

    // Check if entry already exists
    const [existingEntry] = await db
      .select()
      .from(leaderboardEntries)
      .where(and(
        eq(leaderboardEntries.leaderboardId, leaderboardId),
        eq(leaderboardEntries.userId, userId)
      ));

    if (existingEntry) {
      // Update existing entry
      await db
        .update(leaderboardEntries)
        .set({
          totalPoints,
          challengesCompleted,
          updatedAt: new Date()
        })
        .where(eq(leaderboardEntries.id, existingEntry.id));
    } else {
      // Create new entry
      await db
        .insert(leaderboardEntries)
        .values({
          leaderboardId,
          userId,
          totalPoints,
          challengesCompleted,
          rank: 0 // Will be updated by recalculateLeaderboardRanks
        });
    }

    // Recalculate ranks for this leaderboard
    await this.recalculateLeaderboardRanks(leaderboardId);
  }

  private async recalculateLeaderboardRanks(leaderboardId: number): Promise<void> {
    const entries = await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(desc(leaderboardEntries.totalPoints), desc(leaderboardEntries.challengesCompleted));

    for (let i = 0; i < entries.length; i++) {
      await db
        .update(leaderboardEntries)
        .set({ rank: i + 1 })
        .where(eq(leaderboardEntries.id, entries[i].id));
    }
  }

  async getUserLeaderboardRank(userId: number): Promise<{ rank: number; totalPoints: number; schoolClub: string } | null> {
    const user = await this.getUser(userId);
    if (!user?.schoolClub) return null;

    const leaderboard = await this.getOrCreateLeaderboard(user.schoolClub);
    
    const [entry] = await db
      .select()
      .from(leaderboardEntries)
      .where(and(
        eq(leaderboardEntries.leaderboardId, leaderboard.id),
        eq(leaderboardEntries.userId, userId)
      ));

    if (!entry) return null;

    return {
      rank: entry.rank || 0,
      totalPoints: entry.totalPoints || 0,
      schoolClub: user.schoolClub
    };
  }





  // Friend challenges for interactive competition
  async createFriendChallenge(challengerId: number, challengedId: number, type: string, targetDistance: number): Promise<any> {
    try {
      const [challenge] = await db
        .insert(userChallenges)
        .values({
          userId: challengerId,
          challengeId: 999, // Special challenge ID for friend challenges
          status: 'available',
          points: 50
        })
        .returning();
      
      return {
        id: challenge.id,
        challengerId,
        challengedId,
        type,
        targetDistance,
        status: 'pending',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Create friend challenge error:', error);
      throw error;
    }
  }

  // Weekly competitions based on age groups
  async getWeeklyCompetitions(userAge: number): Promise<any[]> {
    const ageGroup = userAge <= 8 ? 'elementary' : userAge <= 12 ? 'middle' : 'high';
    const targetDistance = userAge <= 8 ? 1.5 : userAge <= 12 ? 4 : 10;
    
    return [
      {
        id: 1,
        title: `${ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} Weekly Challenge`,
        description: `Run ${targetDistance}km this week to earn bonus points`,
        targetDistance,
        ageGroup,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: Math.floor(Math.random() * 50) + 20,
        bonusPoints: 100,
        icon: userAge <= 8 ? '🌱' : userAge <= 12 ? '🎯' : '🏃‍♂️'
      }
    ];
  }

  // Annual ranking system for fair competition
  async getAnnualRankings(ageGroup: string, year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();
    const ageRanges = {
      'elementary': { min: 6, max: 8 },
      'middle': { min: 9, max: 12 },
      'high': { min: 13, max: 18 }
    };

    const range = ageRanges[ageGroup as keyof typeof ageRanges];
    if (!range) return [];

    try {
      const rankings = await db
        .select({
          userId: users.id,
          athleteName: users.athleteName,
          age: users.age,
          schoolClub: users.schoolClub,
          yearJoined: users.yearJoined,
          totalPoints: sql<number>`COALESCE(SUM(CASE WHEN ${userChallenges.yearEarned} = ${currentYear} THEN ${userChallenges.points} ELSE 0 END), 0)`,
          challengesCompleted: sql<number>`COUNT(CASE WHEN ${userChallenges.status} = 'completed' AND ${userChallenges.yearEarned} = ${currentYear} THEN 1 END)`,
          isNewcomer: sql<boolean>`${users.yearJoined} = ${currentYear}`
        })
        .from(users)
        .leftJoin(userChallenges, eq(users.id, userChallenges.userId))
        .where(and(
          sql`${users.age} >= ${range.min}`,
          sql`${users.age} <= ${range.max}`
        ))
        .groupBy(users.id, users.athleteName, users.age, users.schoolClub, users.yearJoined)
        .orderBy(sql`COALESCE(SUM(CASE WHEN ${userChallenges.yearEarned} = ${currentYear} THEN ${userChallenges.points} ELSE 0 END), 0) DESC`)
        .limit(50);

      return rankings;
    } catch (error) {
      console.error('Annual rankings error:', error);
      return [];
    }
  }

  async getAllTimeRankings(ageGroup: string): Promise<any[]> {
    const ageRanges = {
      'elementary': { min: 6, max: 8 },
      'middle': { min: 9, max: 12 },
      'high': { min: 13, max: 18 }
    };

    const range = ageRanges[ageGroup as keyof typeof ageRanges];
    if (!range) return [];

    try {
      const rankings = await db
        .select({
          userId: users.id,
          athleteName: users.athleteName,
          age: users.age,
          schoolClub: users.schoolClub,
          yearJoined: users.yearJoined,
          totalPoints: sql<number>`COALESCE(SUM(${userChallenges.points}), 0)`,
          challengesCompleted: sql<number>`COUNT(CASE WHEN ${userChallenges.status} = 'completed' THEN 1 END)`,
          yearsActive: sql<number>`${new Date().getFullYear()} - ${users.yearJoined} + 1`
        })
        .from(users)
        .leftJoin(userChallenges, eq(users.id, userChallenges.userId))
        .where(and(
          sql`${users.age} >= ${range.min}`,
          sql`${users.age} <= ${range.max}`
        ))
        .groupBy(users.id, users.athleteName, users.age, users.schoolClub, users.yearJoined)
        .orderBy(sql`COALESCE(SUM(${userChallenges.points}), 0) DESC`)
        .limit(50);

      return rankings;
    } catch (error) {
      console.error('All-time rankings error:', error);
      return [];
    }
  }

  async getSchoolAnnualRankings(year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();
    
    try {
      const schoolRankings = await db
        .select({
          schoolClub: users.schoolClub,
          totalPoints: sql<number>`COALESCE(SUM(CASE WHEN ${userChallenges.yearEarned} = ${currentYear} THEN ${userChallenges.points} ELSE 0 END), 0)`,
          athleteCount: sql<number>`COUNT(DISTINCT ${users.id})`,
          newMembers: sql<number>`COUNT(DISTINCT CASE WHEN ${users.yearJoined} = ${currentYear} THEN ${users.id} END)`
        })
        .from(users)
        .leftJoin(userChallenges, eq(users.id, userChallenges.userId))
        .where(sql`${users.schoolClub} IS NOT NULL AND ${users.schoolClub} != ''`)
        .groupBy(users.schoolClub)
        .orderBy(sql`COALESCE(SUM(CASE WHEN ${userChallenges.yearEarned} = ${currentYear} THEN ${userChallenges.points} ELSE 0 END), 0) DESC`)
        .limit(20);

      return schoolRankings;
    } catch (error) {
      console.error('School annual rankings error:', error);
      return [];
    }
  }

  async getAllSchools(): Promise<string[]> {
    try {
      const schools = await db
        .selectDistinct({
          schoolClub: users.schoolClub
        })
        .from(users)
        .where(sql`${users.schoolClub} IS NOT NULL AND ${users.schoolClub} != ''`)
        .orderBy(users.schoolClub);

      return schools.map(school => school.schoolClub).filter((school): school is string => school !== null);
    } catch (error) {
      console.error('Get all schools error:', error);
      return [];
    }
  }

  // Age Group Rankings - all age groups show rankings
  async getAgeGroupRankings(ageGroup: string): Promise<any[]> {
    const ageRanges = {
      'elementary': { min: 6, max: 8 },
      'middle': { min: 9, max: 12 },
      'high': { min: 13, max: 18 }
    };

    const range = ageRanges[ageGroup as keyof typeof ageRanges];
    if (!range) return [];

    try {
      // Get participant count for this age group
      const ageGroupCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(and(
          sql`${users.age} >= ${range.min}`,
          sql`${users.age} <= ${range.max}`
        ));

      const totalParticipants = ageGroupCount[0]?.count || 0;
      const isActive = true; // Always active - show rankings with any number of participants

      // GPS-only age group rankings: 1 point per kilometer, rounded to 1 decimal
      const result = await db.execute(sql`
        SELECT 
          u.id as userId,
          u.athlete_name as athleteName,
          u.age,
          u.school_club as schoolClub,
          COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) as totalPoints,
          COUNT(a.id) as challengesCompleted,
          ${isActive} as ageGroupActive,
          ${totalParticipants} as totalParticipants
        FROM users u
        LEFT JOIN activities a ON u.id = a.user_id
        WHERE u.age >= ${range.min} AND u.age <= ${range.max}
        GROUP BY u.id, u.athlete_name, u.age, u.school_club
        ORDER BY totalPoints DESC, challengesCompleted DESC, u.athlete_name ASC
        LIMIT 50
      `);

      const rankings = result.rows.map((row: any) => ({
        userId: row.userId,
        athleteName: row.athleteName,
        age: row.age,
        schoolClub: row.schoolClub,
        totalPoints: parseFloat(row.totalPoints) || 0,
        challengesCompleted: parseInt(row.challengesCompleted) || 0,
        ageGroupActive: isActive,
        totalParticipants: totalParticipants
      }));

      return rankings;
    } catch (error) {
      console.error('Age group rankings error:', error);
      return [];
    }
  }

  // Get user's rank among all users
  async getUserRank(userId: number): Promise<any> {
    try {
      // Calculate GPS-only points: distance (km) = points, rounded to 1 decimal
      const result = await db.execute(sql`
        WITH user_points AS (
          SELECT 
            u.id,
            u.athlete_name,
            u.school_club,
            COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) as total_points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) DESC) as rank
          FROM users u
          LEFT JOIN activities a ON u.id = a.user_id
          GROUP BY u.id, u.athlete_name, u.school_club
        )
        SELECT rank, total_points as totalPoints, school_club as schoolClub
        FROM user_points
        WHERE id = ${userId}
      `);
      
      const userRank = result.rows[0] || { rank: 0, totalPoints: 0, schoolClub: 'No School' };
      return {
        rank: parseInt(String(userRank.rank)) || 0,
        totalPoints: parseFloat(String(userRank.totalPoints)) || 0,
        schoolClub: userRank.schoolClub || 'No School'
      };
    } catch (error) {
      console.error('User rank error:', error);
      return { rank: 1, totalPoints: 0, schoolClub: 'No School' };
    }
  }

  // Global Rankings - All users ranked by points (no minimum threshold)
  async getGlobalRankings(): Promise<any[]> {
    try {
      // GPS-only rankings: 1 point per kilometer, rounded to 1 decimal
      const result = await db.execute(sql`
        SELECT 
          u.id as userId,
          u.athlete_name as athleteName,
          u.school_club as schoolClub,
          u.age,
          COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) as totalPoints,
          COUNT(a.id) as activitiesCompleted,
          ROW_NUMBER() OVER (ORDER BY COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) DESC, COUNT(a.id) DESC, u.athlete_name ASC) as overallRank
        FROM users u
        LEFT JOIN activities a ON u.id = a.user_id
        GROUP BY u.id, u.athlete_name, u.school_club, u.age
        ORDER BY totalPoints DESC, activitiesCompleted DESC, u.athlete_name ASC
        LIMIT 100
      `);
      
      return result.rows.map((row: any) => ({
        userId: row.userId,
        athleteName: row.athleteName,
        schoolClub: row.schoolClub,
        age: row.age,
        totalPoints: parseFloat(row.totalPoints) || 0,
        activitiesCompleted: parseInt(row.activitiesCompleted) || 0,
        overallRank: parseInt(row.overallRank) || 0
      }));
    } catch (error) {
      console.error('Global rankings error:', error);
      return [];
    }
  }

  // Top 10 School/Club Ranking System
  async getTop10Leaderboard(schoolClub: string): Promise<any[]> {
    const leaderboard = await this.getOrCreateLeaderboard(schoolClub);
    
    // Get all users from this school/club with their total points
    const schoolUsers = await db
      .select({
        userId: users.id,
        athleteName: users.athleteName,
        totalPoints: sql<number>`COALESCE(SUM(${userChallenges.points}), 0)`.as('totalPoints'),
        challengesCompleted: sql<number>`COUNT(CASE WHEN ${userChallenges.status} = 'completed' THEN 1 END)`.as('challengesCompleted')
      })
      .from(users)
      .leftJoin(userChallenges, eq(users.id, userChallenges.userId))
      .where(eq(users.schoolClub, schoolClub))
      .groupBy(users.id, users.athleteName)
      .orderBy(desc(sql`COALESCE(SUM(${userChallenges.points}), 0)`))
      .limit(10);

    return schoolUsers;
  }

  async getSchoolClubRankings(): Promise<any[]> {
    try {
      // GPS-only school rankings: 1 point per kilometer, rounded to 1 decimal
      const result = await db.execute(sql`
        SELECT 
          u.school_club as schoolClub,
          COALESCE(ROUND(SUM(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) as totalPoints,
          COUNT(DISTINCT u.id) as athleteCount,
          COALESCE(ROUND(AVG(CAST(a.distance AS DECIMAL)) * 10) / 10, 0) as avgPoints,
          TRUE as isActive
        FROM users u
        LEFT JOIN activities a ON u.id = a.user_id
        WHERE u.school_club IS NOT NULL AND u.school_club != ''
        GROUP BY u.school_club
        ORDER BY totalPoints DESC
        LIMIT 25
      `);

      return result.rows.map((row: any) => ({
        schoolClub: row.schoolClub,
        totalPoints: parseFloat(row.totalPoints) || 0,
        athleteCount: parseInt(row.athleteCount) || 0,
        avgPoints: parseFloat(row.avgPoints) || 0,
        isActive: true // All schools shown for motivation
      }));
    } catch (error) {
      console.error('School club rankings error:', error);
      return [];
    }
  }

  async updateSchoolClubTop10(schoolClub: string): Promise<void> {
    // Get top 10 athletes from this school/club
    const top10 = await this.getTop10Leaderboard(schoolClub);
    
    // Calculate total points from top 10
    const totalPoints = top10.reduce((sum, athlete) => sum + athlete.totalPoints, 0);
    
    // Update the leaderboard with top 10 data
    await db
      .update(leaderboards)
      .set({
        totalPoints,
        topContributors: top10,
        lastUpdated: new Date()
      })
      .where(eq(leaderboards.schoolClub, schoolClub));
  }

  // Adventure System Methods
  async getAdventuresForAge(age: number): Promise<Adventure[]> {
    let ageGroup: string;
    if (age >= 6 && age <= 8) {
      ageGroup = "6-8";
    } else if (age >= 9 && age <= 12) {
      ageGroup = "9-12";
    } else {
      ageGroup = "13-18";
    }

    return await db
      .select()
      .from(adventures)
      .where(and(
        eq(adventures.ageGroup, ageGroup),
        eq(adventures.isActive, true)
      ))
      .orderBy(asc(adventures.orderIndex));
  }

  async getUserAdventures(userId: number): Promise<(UserAdventure & { adventure: Adventure })[]> {
    const result = await db
      .select()
      .from(userAdventures)
      .innerJoin(adventures, eq(userAdventures.adventureId, adventures.id))
      .where(eq(userAdventures.userId, userId))
      .orderBy(asc(adventures.orderIndex));
    
    return result.map(row => ({
      ...row.user_adventures,
      adventure: row.adventures
    })) as any;
  }

  async createUserAdventure(userAdventure: InsertUserAdventure): Promise<UserAdventure> {
    const [created] = await db
      .insert(userAdventures)
      .values(userAdventure)
      .returning();
    return created;
  }

  async updateAdventureProgress(userId: number, adventureId: number, distance: number): Promise<UserAdventure> {
    // Get current progress
    const [current] = await db
      .select()
      .from(userAdventures)
      .where(and(
        eq(userAdventures.userId, userId),
        eq(userAdventures.adventureId, adventureId)
      ));

    if (!current) {
      throw new Error("User adventure not found");
    }

    const newProgress = parseFloat(current.progressDistance || "0") + distance;
    const [adventure] = await db
      .select()
      .from(adventures)
      .where(eq(adventures.id, adventureId));

    // Check if adventure is completed
    const isCompleted = newProgress >= parseFloat(adventure.requiredDistance);
    
    const [updated] = await db
      .update(userAdventures)
      .set({
        progressDistance: newProgress.toString(),
        status: isCompleted ? "completed" : "in_progress",
        completedAt: isCompleted ? new Date() : null,
        rewardsEarned: isCompleted ? adventure.rewardData : current.rewardsEarned
      })
      .where(and(
        eq(userAdventures.userId, userId),
        eq(userAdventures.adventureId, adventureId)
      ))
      .returning();

    return updated;
  }

  async initializeUserAdventures(userId: number, userAge: number): Promise<void> {
    const availableAdventures = await this.getAdventuresForAge(userAge);
    
    for (const adventure of availableAdventures) {
      const [existing] = await db
        .select()
        .from(userAdventures)
        .where(and(
          eq(userAdventures.userId, userId),
          eq(userAdventures.adventureId, adventure.id)
        ));

      if (!existing) {
        await this.createUserAdventure({
          userId,
          adventureId: adventure.id,
          status: adventure.orderIndex === 1 ? "available" : "locked",
          progressDistance: "0"
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
