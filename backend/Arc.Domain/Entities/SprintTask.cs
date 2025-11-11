using System;
using System.Collections.Generic;

namespace Arc.Domain.Entities
{
    public enum TaskStatus
    {
        Backlog = 0,
        InProgress = 1,
        Done = 2
    }

    public enum TaskPriority
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Urgent = 3
    }

    public enum TaskType
    {
        Task = 0,
        Bug = 1,
        Feature = 2
    }

    public class SprintTask
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StoryPoints { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public TaskType Type { get; set; }
        public Guid? AssignedTo { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Order { get; set; }

        // Navigation Properties
        public Sprint? Sprint { get; set; }
        public User? AssignedUser { get; set; }
    }
}
