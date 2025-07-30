import { db } from "./db";
import { sharingStreaks, shareActivities, type InsertSharingStreak, type InsertShareActivity } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class SharingStreakService {
  /**
   * Get or create sharing streak record for user
   */
  async getUserStreak(userId: number) {
    let [streak] = await db.select().from(sharingStreaks).where(eq(sharingStreaks.userId, userId));
    
    if (!streak) {
      // Create initial streak record
      [streak] = await db
        .insert(sharingStreaks)
        .values({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalShares: 0,
          streakMultiplier: 1.0,
          streakPoints: 0,
          milestoneBadges: []
        })
        .returning();
    }
    
    return streak;
  }

  /**
   * Record a share activity and update streak
   */
  async recordShare(userId: number, platform: string, shareType: string, achievementId?: number, challengeId?: number) {
    const now = new Date();
    const streak = await this.getUserStreak(userId);
    
    // Check if user already shared today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayShares = await db.select()
      .from(shareActivities)
      .where(eq(shareActivities.userId, userId))
      .orderBy(desc(shareActivities.sharedAt))
      .limit(1);

    const lastShareToday = todayShares[0] && 
      new Date(todayShares[0].sharedAt).toDateString() === today.toDateString();

    if (lastShareToday) {
      // Already shared today, just record the activity without streak update
      await db.insert(shareActivities).values({
        userId,
        platform,
        shareType,
        achievementId,
        challengeId,
        pointsEarned: 5, // Lower points for additional shares same day
        streakDay: streak.currentStreak
      });
      
      return streak;
    }

    // Calculate new streak
    let newStreak = 1;
    if (streak.lastShareDate) {
      const lastShare = new Date(streak.lastShareDate);
      const daysDiff = Math.floor((now.getTime() - lastShare.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - continue streak
        newStreak = streak.currentStreak + 1;
      } else if (daysDiff > 1) {
        // Streak broken - start over
        newStreak = 1;
      } else {
        // Same day (shouldn't happen with above check, but safety)
        newStreak = streak.currentStreak;
      }
    }

    // Calculate streak multiplier and points (sharing points are separate from GPS ranking points)
    const streakMultiplier = this.calculateStreakMultiplier(newStreak);
    const basePoints = 10;
    const pointsEarned = Math.floor(basePoints * streakMultiplier); // These are sharing streak points only, not ranking points
    
    // Check for new milestone badges
    const newBadges = this.checkMilestoneBadges(newStreak, streak.milestoneBadges as string[]);
    
    // Update streak record
    await db
      .update(sharingStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastShareDate: now,
        totalShares: streak.totalShares + 1,
        streakMultiplier,
        streakPoints: streak.streakPoints + pointsEarned,
        milestoneBadges: newBadges,
        updatedAt: now
      })
      .where(eq(sharingStreaks.userId, userId));

    // Record share activity
    await db.insert(shareActivities).values({
      userId,
      platform,
      shareType,
      achievementId,
      challengeId,
      pointsEarned,
      streakDay: newStreak
    });

    // Return updated streak
    return await this.getUserStreak(userId);
  }

  /**
   * Calculate streak multiplier based on current streak
   */
  private calculateStreakMultiplier(streak: number): number {
    if (streak >= 30) return 3.0; // 30+ days: 3x multiplier
    if (streak >= 14) return 2.5; // 14+ days: 2.5x multiplier
    if (streak >= 7) return 2.0;  // 7+ days: 2x multiplier
    if (streak >= 3) return 1.5;  // 3+ days: 1.5x multiplier
    return 1.0; // 1-2 days: normal multiplier
  }

  /**
   * Check for milestone badges earned
   */
  private checkMilestoneBadges(currentStreak: number, existingBadges: string[]): string[] {
    const milestones = [
      { streak: 3, badge: "🔥 First Streak" },
      { streak: 7, badge: "⚡ Week Warrior" },
      { streak: 14, badge: "💪 Two Week Titan" },
      { streak: 30, badge: "🏆 Month Master" },
      { streak: 50, badge: "🚀 Sharing Superstar" },
      { streak: 100, badge: "👑 Streak Legend" }
    ];

    const newBadges = [...existingBadges];
    
    for (const milestone of milestones) {
      if (currentStreak >= milestone.streak && !newBadges.includes(milestone.badge)) {
        newBadges.push(milestone.badge);
      }
    }
    
    return newBadges;
  }

  /**
   * Get leaderboard of top sharing streaks
   */
  async getStreakLeaderboard(limit: number = 10) {
    return await db
      .select({
        userId: sharingStreaks.userId,
        currentStreak: sharingStreaks.currentStreak,
        longestStreak: sharingStreaks.longestStreak,
        totalShares: sharingStreaks.totalShares,
        streakPoints: sharingStreaks.streakPoints
      })
      .from(sharingStreaks)
      .orderBy(desc(sharingStreaks.currentStreak))
      .limit(limit);
  }

  /**
   * Get sharing activity history for user
   */
  async getUserShareHistory(userId: number, limit: number = 20) {
    return await db
      .select()
      .from(shareActivities)
      .where(eq(shareActivities.userId, userId))
      .orderBy(desc(shareActivities.sharedAt))
      .limit(limit);
  }

  /**
   * Check if streak is at risk (last share > 20 hours ago)
   */
  async isStreakAtRisk(userId: number): Promise<boolean> {
    const streak = await this.getUserStreak(userId);
    
    if (!streak.lastShareDate || streak.currentStreak === 0) {
      return false;
    }

    const now = new Date();
    const lastShare = new Date(streak.lastShareDate);
    const hoursDiff = (now.getTime() - lastShare.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > 20; // At risk if more than 20 hours since last share
  }
}

export const sharingStreakService = new SharingStreakService();