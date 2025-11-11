using System;
using System.Collections.Generic;

namespace Arc.Domain.Entities
{
    public enum SprintStatus
    {
        Planned = 0,
        Active = 1,
        Completed = 2,
        Cancelled = 3
    }

    public class Sprint
    {
        public Guid Id { get; set; }
        public Guid WorkspaceId { get; set; }
        public Guid PageId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalStoryPoints { get; set; }
        public int CommittedStoryPoints { get; set; }
        public SprintStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation Properties
        public Workspace? Workspace { get; set; }
        public ICollection<SprintTask> Tasks { get; set; } = new List<SprintTask>();
    }
}
