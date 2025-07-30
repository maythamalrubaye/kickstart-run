import { db } from "./db";
import { userChallenges, challenges, activities, userPerformanceAnalytics, users } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface AdaptiveDifficultySettings {
  difficultyMultiplier: number;
  adaptedTargetDistance?: number;
  adaptedTargetTime?: number;
  reasoning: string;
}

export class AdaptiveDifficultyService {
  
  /**
   * Calculate adaptive difficulty for a user challenge based on performance analytics
   */
  async calculateAdaptiveDifficulty(userId: number, challengeId: number): Promise<AdaptiveDifficultySettings> {
    try {
      // Get user's performance analytics
      const userAnalytics = await this.getUserPerformanceAnalytics(userId);
      
      // Get challenge details
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      // Get user's recent challenge history
      const recentChallenges = await this.getRecentChallengeHistory(userId, 10);
      
      // Calculate base difficulty multiplier
      let difficultyMultiplier = 1.0; // Start with base difficulty
      let reasoning = "Base difficulty";

      // Factor 1: Completion Rate Analysis
      const completionRateMultiplier = this.calculateCompletionRateMultiplier(userAnalytics);
      difficultyMultiplier *= completionRateMultiplier.multiplier;
      reasoning += `; ${completionRateMultiplier.reason}`;

      // Factor 2: Performance Trend Analysis  
      const trendMultiplier = this.calculateTrendMultiplier(userAnalytics, recentChallenges);
      difficultyMultiplier *= trendMultiplier.multiplier;
      reasoning += `; ${trendMultiplier.reason}`;

      // Factor 3: Age-based scaling
      try {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user) {
          const ageMultiplier = this.calculateAgeBasedMultiplier(user.age);
          difficultyMultiplier *= ageMultiplier.multiplier;
          reasoning += `; ${ageMultiplier.reason}`;
        }
      } catch (error) {
        console.error("Error getting user for age scaling:", error);
      }

      // Factor 4: Challenge type specific adjustments
      const typeMultiplier = this.calculateChallengeTypeMultiplier(challenge.type, userAnalytics);
      difficultyMultiplier *= typeMultiplier.multiplier;
      reasoning += `; ${typeMultiplier.reason}`;

      // Apply bounds - difficulty should be between 0.5x and 2.0x
      difficultyMultiplier = Math.max(0.5, Math.min(2.0, difficultyMultiplier));

      // Calculate adapted targets
      const adaptedTargets = this.calculateAdaptedTargets(challenge, difficultyMultiplier);

      return {
        difficultyMultiplier: Math.round(difficultyMultiplier * 100) / 100,
        adaptedTargetDistance: adaptedTargets.distance,
        adaptedTargetTime: adaptedTargets.time,
        reasoning: reasoning
      };

    } catch (error) {
      console.error("Error calculating adaptive difficulty:", error);
      // Return base difficulty on error
      return {
        difficultyMultiplier: 1.0,
        adaptedTargetDistance: undefined,
        adaptedTargetTime: undefined,
        reasoning: "Error occurred, using base difficulty"
      };
    }
  }

  /**
   * Get or create user performance analytics (public method)
   */
  async getUserPerformanceAnalytics(userId: number) {
    try {
      let [analytics] = await db
        .select()
        .from(userPerformanceAnalytics)
        .where(eq(userPerformanceAnalytics.userId, userId))
        .limit(1);

      if (!analytics) {
        // Create initial analytics record
        [analytics] = await db
          .insert(userPerformanceAnalytics)
          .values({
            userId: userId,
            avgCompletionRate: "80",
            avgAttemptCount: "1.0", 
            recentPerformanceTrend: "stable",
            adaptiveLevel: "1.0"
          })
          .returning();
      }

      return analytics;
    } catch (error) {
      console.error("Error getting user analytics:", error);
      // Return default analytics
      return {
        avgCompletionRate: "80",
        avgAttemptCount: "1.0", 
        recentPerformanceTrend: "stable",
        adaptiveLevel: "1.0"
      };
    }
  }

  /**
   * Get recent challenge completion history
   */
  private async getRecentChallengeHistory(userId: number, limit: number = 10) {
    try {
      return await db
        .select({
          challengeId: userChallenges.challengeId,
          status: userChallenges.status,
          attempts: userChallenges.attempts,
          completedAt: userChallenges.completedAt,
          challengeType: challenges.type,
          targetDistance: challenges.targetDistance,
          bestTime: userChallenges.bestTime
        })
        .from(userChallenges)
        .innerJoin(challenges, eq(userChallenges.challengeId, challenges.id))
        .where(eq(userChallenges.userId, userId))
        .orderBy(desc(userChallenges.completedAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting challenge history:", error);
      return [];
    }
  }

  /**
   * Calculate difficulty multiplier based on completion rate
   */
  private calculateCompletionRateMultiplier(analytics: any) {
    const completionRate = parseFloat(analytics.avgCompletionRate || "80");
    
    if (completionRate >= 90) {
      return { multiplier: 1.3, reason: "High completion rate - increasing difficulty" };
    } else if (completionRate >= 75) {
      return { multiplier: 1.1, reason: "Good completion rate - slight increase" };
    } else if (completionRate >= 50) {
      return { multiplier: 1.0, reason: "Average completion rate - maintaining difficulty" };
    } else if (completionRate >= 25) {
      return { multiplier: 0.8, reason: "Low completion rate - reducing difficulty" };
    } else {
      return { multiplier: 0.6, reason: "Very low completion rate - significant reduction" };
    }
  }

  /**
   * Calculate difficulty multiplier based on performance trend
   */
  private calculateTrendMultiplier(analytics: any, recentChallenges: any[]) {
    const trend = analytics.recentPerformanceTrend || "stable";
    
    // Also look at recent completion pattern
    const recentCompletions = recentChallenges.filter(c => c.status === 'completed').length;
    const recentAttempts = recentChallenges.length;
    const recentRate = recentAttempts > 0 ? recentCompletions / recentAttempts : 0.8;
    
    if (trend === "improving" || recentRate > 0.8) {
      return { multiplier: 1.2, reason: "Improving performance - progressive difficulty" };
    } else if (trend === "declining" || recentRate < 0.4) {
      return { multiplier: 0.7, reason: "Declining performance - reducing challenge" };
    } else {
      return { multiplier: 1.0, reason: "Stable performance - maintaining progression" };
    }
  }

  /**
   * Calculate age-appropriate difficulty scaling
   */
  private calculateAgeBasedMultiplier(age: number) {
    if (age >= 6 && age <= 8) {
      return { multiplier: 0.7, reason: "Elementary age - gentler progression" };
    } else if (age >= 9 && age <= 12) {
      return { multiplier: 0.9, reason: "Middle school age - moderate progression" };
    } else if (age >= 13 && age <= 18) {
      return { multiplier: 1.1, reason: "High school age - standard progression" };
    } else {
      return { multiplier: 1.0, reason: "Standard age scaling" };
    }
  }

  /**
   * Calculate challenge type specific multipliers
   */
  private calculateChallengeTypeMultiplier(challengeType: string, analytics: any) {
    // Could analyze user's performance in specific challenge types
    switch (challengeType) {
      case 'distance':
        return { multiplier: 1.0, reason: "Standard distance scaling" };
      case 'drill':
        return { multiplier: 0.9, reason: "Drill challenges - technique focus" };
      case 'form':
        return { multiplier: 0.8, reason: "Form challenges - learning emphasis" };
      case 'endurance':
        return { multiplier: 1.1, reason: "Endurance challenges - gradual building" };
      default:
        return { multiplier: 1.0, reason: "Standard challenge scaling" };
    }
  }

  /**
   * Calculate adapted targets based on difficulty multiplier
   */
  private calculateAdaptedTargets(challenge: any, difficultyMultiplier: number) {
    let adaptedDistance = undefined;
    let adaptedTime = undefined;

    if (challenge.targetDistance) {
      adaptedDistance = parseFloat(challenge.targetDistance) * difficultyMultiplier;
      adaptedDistance = Math.round(adaptedDistance * 100) / 100; // Round to 2 decimal places
    }

    if (challenge.targetTime) {
      // For time targets, higher difficulty means LESS time (more challenging)
      adaptedTime = Math.round(challenge.targetTime / difficultyMultiplier);
    }

    return {
      distance: adaptedDistance,
      time: adaptedTime
    };
  }

  /**
   * Update user performance analytics after challenge completion
   */
  async updateUserAnalytics(userId: number, challengeId: number, completed: boolean, attempts: number) {
    try {
      // Get current analytics
      const analytics = await this.getUserPerformanceAnalytics(userId);
      
      // Get completion rate from database or default
      const currentCompletionRate = parseFloat(analytics.avgCompletionRate || "80");
      const currentAvgAttempts = parseFloat(analytics.avgAttemptCount || "1.0");
      
      // Simple completion rate adjustment based on success
      const newCompletionRate = completed ? 
        Math.min(100, currentCompletionRate + 2) : 
        Math.max(0, currentCompletionRate - 5);
      
      const newAvgAttempts = Math.max(1, (currentAvgAttempts + attempts) / 2);
      
      // Determine performance trend
      let trend = "stable";
      if (newCompletionRate > currentCompletionRate + 5) {
        trend = "improving";
      } else if (newCompletionRate < currentCompletionRate - 5) {
        trend = "declining";
      }
      
      // Update the analytics record
      await db
        .update(userPerformanceAnalytics)
        .set({
          avgCompletionRate: newCompletionRate.toString(),
          avgAttemptCount: newAvgAttempts.toFixed(2),
          recentPerformanceTrend: trend,
          updatedAt: new Date()
        })
        .where(eq(userPerformanceAnalytics.userId, userId));

    } catch (error) {
      console.error("Error updating user analytics:", error);
    }
  }
}

export const adaptiveDifficultyService = new AdaptiveDifficultyService();