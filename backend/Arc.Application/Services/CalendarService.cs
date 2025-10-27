using System.Text.Json;
using Arc.Application.DTOs.Calendar;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class CalendarService : ICalendarService
{
    private readonly IPageRepository _pageRepository;

    public CalendarService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<CalendarStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var calendar = JsonSerializer.Deserialize<CalendarDataDto>(page.Data)
            ?? new CalendarDataDto();

        var now = DateTime.UtcNow;
        var today = now.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek);
        var weekEnd = weekStart.AddDays(7);
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        var stats = new CalendarStatisticsDto
        {
            TotalEvents = calendar.Events.Count,
            UpcomingEvents = calendar.Events.Count(e => e.StartDate > now),
            PastEvents = calendar.Events.Count(e => e.EndDate < now),
            TodayEvents = calendar.Events.Count(e => e.StartDate.Date == today),
            ThisWeekEvents = calendar.Events.Count(e => e.StartDate >= weekStart && e.StartDate < weekEnd),
            ThisMonthEvents = calendar.Events.Count(e => e.StartDate >= monthStart && e.StartDate < monthEnd),
            EventsByType = new Dictionary<string, int>(),
            EventsByMonth = new Dictionary<string, int>()
        };

        // Contar por tipo
        foreach (var evt in calendar.Events)
        {
            if (!stats.EventsByType.ContainsKey(evt.Type))
            {
                stats.EventsByType[evt.Type] = 0;
            }
            stats.EventsByType[evt.Type]++;
        }

        // Contar por mês
        foreach (var evt in calendar.Events)
        {
            var monthKey = evt.StartDate.ToString("yyyy-MM");
            if (!stats.EventsByMonth.ContainsKey(monthKey))
            {
                stats.EventsByMonth[monthKey] = 0;
            }
            stats.EventsByMonth[monthKey]++;
        }

        // Encontrar dia mais ocupado
        var eventsByDay = calendar.Events
            .GroupBy(e => e.StartDate.Date)
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        if (eventsByDay != null)
        {
            stats.BusiestDay = eventsByDay.Key;
            stats.BusiestDayEventCount = eventsByDay.Count();
        }

        return stats;
    }

    public async Task<byte[]> ExportCalendarAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var calendar = JsonSerializer.Deserialize<CalendarDataDto>(page.Data)
            ?? new CalendarDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(calendar, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            "ics" => ExportToIcs(calendar),
            "csv" => ExportToCsv(calendar),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToIcs(CalendarDataDto calendar)
    {
        var lines = new List<string>
        {
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Arc.//Calendar//EN",
            "CALSCALE:GREGORIAN"
        };

        foreach (var evt in calendar.Events)
        {
            lines.Add("BEGIN:VEVENT");
            lines.Add($"UID:{evt.Id}");
            lines.Add($"DTSTART:{evt.StartDate:yyyyMMddTHHmmssZ}");
            lines.Add($"DTEND:{evt.EndDate:yyyyMMddTHHmmssZ}");
            lines.Add($"SUMMARY:{evt.Title}");
            if (!string.IsNullOrEmpty(evt.Description))
                lines.Add($"DESCRIPTION:{evt.Description}");
            if (!string.IsNullOrEmpty(evt.Location))
                lines.Add($"LOCATION:{evt.Location}");
            lines.Add("END:VEVENT");
        }

        lines.Add("END:VCALENDAR");
        return System.Text.Encoding.UTF8.GetBytes(string.Join("\r\n", lines));
    }

    private byte[] ExportToCsv(CalendarDataDto calendar)
    {
        var lines = new List<string>
        {
            "Title,Description,Start Date,End Date,All Day,Type,Location,Attendees,Tags"
        };

        foreach (var evt in calendar.Events)
        {
            var line = $"{EscapeCsv(evt.Title)}," +
                      $"{EscapeCsv(evt.Description)}," +
                      $"{evt.StartDate:yyyy-MM-dd HH:mm}," +
                      $"{evt.EndDate:yyyy-MM-dd HH:mm}," +
                      $"{evt.AllDay}," +
                      $"{EscapeCsv(evt.Type)}," +
                      $"{EscapeCsv(evt.Location)}," +
                      $"{EscapeCsv(string.Join(";", evt.Attendees))}," +
                      $"{EscapeCsv(string.Join(";", evt.Tags))}";
            lines.Add(line);
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
