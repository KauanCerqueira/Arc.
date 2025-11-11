using System;

namespace Arc.Domain.Entities
{
    public enum BadgeType
    {
        Founder = 0,
        Perfectionist = 1,
        Speedrunner = 2,
        NightOwl = 3,
        EarlyBird = 4,
        Marathon = 5,
        Mentor = 6,
        Innovator = 7
    }

    public enum BadgeRarity
    {
        Common = 0,
        Rare = 1,
        Epic = 2,
        Legendary = 3
    }

    public class UserBadge
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid WorkspaceId { get; set; }
        public BadgeType Type { get; set; }
        public BadgeRarity Rarity { get; set; }
        public DateTime EarnedAt { get; set; }

        // Navigation Properties
        public User? User { get; set; }
        public Workspace? Workspace { get; set; }
    }
}
