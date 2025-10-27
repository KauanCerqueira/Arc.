namespace Arc.Application.DTOs.Calendar;

public class CalendarDataDto
{
    public List<CalendarEventDto> Events { get; set; } = new();
    public CalendarViewSettings ViewSettings { get; set; } = new();
}

public class CalendarEventDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AllDay { get; set; } = false;
    public string Type { get; set; } = "event"; // event, meeting, deadline, milestone
    public string Color { get; set; } = "#3B82F6";
    public string Location { get; set; } = string.Empty;
    public List<string> Attendees { get; set; } = new();
    public string RecurrenceRule { get; set; } = string.Empty; // RRULE format
    public List<string> Tags { get; set; } = new();
}

public class CalendarViewSettings
{
    public string DefaultView { get; set; } = "month"; // month, week, day, agenda
    public string StartDayOfWeek { get; set; } = "monday";
    public bool ShowWeekNumbers { get; set; } = false;
}

public class CalendarStatisticsDto
{
    public int TotalEvents { get; set; }
    public int UpcomingEvents { get; set; }
    public int PastEvents { get; set; }
    public int TodayEvents { get; set; }
    public int ThisWeekEvents { get; set; }
    public int ThisMonthEvents { get; set; }
    public Dictionary<string, int> EventsByType { get; set; } = new();
    public Dictionary<string, int> EventsByMonth { get; set; } = new();
    public int BusiestDayEventCount { get; set; }
    public DateTime? BusiestDay { get; set; }
}

public class EventFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> Types { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}
