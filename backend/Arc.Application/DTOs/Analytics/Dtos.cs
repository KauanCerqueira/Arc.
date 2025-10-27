namespace Arc.Application.DTOs.Analytics;

public class AnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalWorkspaces { get; set; }
    public int TotalProjects { get; set; }
    public int TotalPages { get; set; }
    public List<UserGrowthDto> UserGrowth { get; set; } = new();
    public List<ProfessionDistributionDto> ProfessionDistribution { get; set; } = new();
    public List<SourceDistributionDto> SourceDistribution { get; set; } = new();
    public List<RecentUserDto> RecentUsers { get; set; } = new();
    public List<TemplateUsageDto> TemplateUsage { get; set; } = new();
}

public class UserGrowthDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ProfessionDistributionDto
{
    public string Profissao { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class SourceDistributionDto
{
    public string Source { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RecentUserDto
{
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Profissao { get; set; }
    public string? ComoConheceu { get; set; }
    public DateTime CriadoEm { get; set; }
}

public class TemplateUsageDto
{
    public string Template { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}
