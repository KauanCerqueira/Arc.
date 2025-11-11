using System;

namespace Arc.Domain.Entities
{
    public class UserStats
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid WorkspaceId { get; set; }
        public int TotalPoints { get; set; }
        public int Experience { get; set; }
        public int Level { get; set; }
        public int TasksCompleted { get; set; }
        public int SprintsCompleted { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastActivityDate { get; set; }
        public double AverageVelocity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation Properties
        public User? User { get; set; }
        public Workspace? Workspace { get; set; }

        public int ExperienceToNextLevel
        {
            get
            {
                var nextLevel = Level + 1;
                var nextLevelExp = nextLevel * nextLevel * 100;
                return nextLevelExp - Experience;
            }
        }
    }
}
