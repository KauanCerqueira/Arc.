using Arc.Application.DTOs.Page;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Arc.API.Controllers.Search;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ILogger<SearchController> _logger;

    public SearchController(IPageService pageService, ILogger<SearchController> logger)
    {
        _pageService = pageService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PageWithGroupDto>>> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { message = "Query não pode ser vazia" });

        try
        {
            var userId = GetUserId();
            var results = await _pageService.SearchAsync(userId, query);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar páginas com query: {Query}", query);
            return BadRequest(new { message = ex.Message });
        }
    }
}
