using System;

namespace Arc.Domain.Entities
{
    public enum AchievementType
    {
        Velocity = 0,
        Points = 1,
        Streak = 2,
        FirstBlood = 3,
        BugHunter = 4,
        TeamPlayer = 5,
        SprintMaster = 6,
        Overachiever = 7,
        Quality = 8,
        Consistency = 9
    }

    public enum AchievementTier
    {
        Bronze = 0,
        Silver = 1,
        Gold = 2,
        Platinum = 3,
        Diamond = 4
    }

    public class UserAchievement
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid WorkspaceId { get; set; }
        public AchievementType Type { get; set; }
        public AchievementTier Tier { get; set; }
        public int CurrentValue { get; set; }
        public int RequiredValue { get; set; }
        public int Progress { get; set; } // 0-100
        public DateTime? UnlockedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        public User? User { get; set; }
        public Workspace? Workspace { get; set; }

        public bool IsUnlocked => UnlockedAt.HasValue;
    }
}
