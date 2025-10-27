using Arc.Application.DTOs.Analytics;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUserRepository _userRepository;
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IPageRepository _pageRepository;

    public AnalyticsService(
        IUserRepository userRepository,
        IWorkspaceRepository workspaceRepository,
        IGroupRepository groupRepository,
        IPageRepository pageRepository)
    {
        _userRepository = userRepository;
        _workspaceRepository = workspaceRepository;
        _groupRepository = groupRepository;
        _pageRepository = pageRepository;
    }

    public async Task<AnalyticsDto> GetAnalyticsAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var totalUsers = users.Count();
        var activeUsers = users.Count(u => u.Ativo);

        // User growth by month
        var userGrowth = users
            .GroupBy(u => new { u.CriadoEm.Year, u.CriadoEm.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new UserGrowthDto
            {
                Month = $"{g.Key.Year}/{g.Key.Month:D2}",
                Count = g.Count()
            })
            .ToList();

        // Profession distribution
        var professionDistribution = users
            .Where(u => !string.IsNullOrEmpty(u.Profissao))
            .GroupBy(u => u.Profissao)
            .OrderByDescending(g => g.Count())
            .Select(g => new ProfessionDistributionDto
            {
                Profissao = g.Key ?? "Não informado",
                Count = g.Count()
            })
            .Take(10)
            .ToList();

        // Source distribution
        var sourceDistribution = users
            .Where(u => !string.IsNullOrEmpty(u.ComoConheceu))
            .GroupBy(u => u.ComoConheceu)
            .OrderByDescending(g => g.Count())
            .Select(g => new SourceDistributionDto
            {
                Source = g.Key ?? "Não informado",
                Count = g.Count()
            })
            .ToList();

        // Recent users (last 10)
        var recentUsers = users
            .OrderByDescending(u => u.CriadoEm)
            .Take(10)
            .Select(u => new RecentUserDto
            {
                Nome = u.Nome,
                Sobrenome = u.Sobrenome,
                Email = u.Email,
                Profissao = u.Profissao,
                ComoConheceu = u.ComoConheceu,
                CriadoEm = u.CriadoEm
            })
            .ToList();

        var totalWorkspaces = (await _workspaceRepository.GetAllAsync()).Count();
        var totalProjects = (await _groupRepository.GetAllAsync()).Count();

        // Template usage analytics
        var pages = await _pageRepository.GetAllAsync();
        var totalPages = pages.Count();

        var templateUsage = pages
            .GroupBy(p => p.Template)
            .OrderByDescending(g => g.Count())
            .Select(g => new TemplateUsageDto
            {
                Template = g.Key,
                Count = g.Count(),
                Percentage = totalPages > 0 ? Math.Round((double)g.Count() / totalPages * 100, 2) : 0
            })
            .ToList();

        return new AnalyticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalWorkspaces = totalWorkspaces,
            TotalProjects = totalProjects,
            TotalPages = totalPages,
            UserGrowth = userGrowth,
            ProfessionDistribution = professionDistribution,
            SourceDistribution = sourceDistribution,
            RecentUsers = recentUsers,
            TemplateUsage = templateUsage
        };
    }
}
