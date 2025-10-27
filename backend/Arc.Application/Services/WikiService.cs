using System.Text.Json;
using Arc.Application.DTOs.Wiki;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class WikiService : IWikiService
{
    private readonly IPageRepository _pageRepository;

    public WikiService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<WikiStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var wiki = JsonSerializer.Deserialize<WikiDataDto>(page.Data)
            ?? new WikiDataDto();

        var stats = new WikiStatisticsDto
        {
            TotalPages = wiki.Pages.Count,
            PublishedPages = wiki.Pages.Count(p => p.Published),
            DraftPages = wiki.Pages.Count(p => !p.Published),
            TotalRevisions = wiki.Pages.Sum(p => p.Revisions.Count),
            PagesByTag = new Dictionary<string, int>(),
            PagesByAuthor = new Dictionary<string, int>(),
            MostRecentPages = new List<WikiPageSummaryDto>(),
            LongestPages = new List<WikiPageSummaryDto>()
        };

        int totalWords = 0;
        int totalCharacters = 0;

        foreach (var wikiPage in wiki.Pages)
        {
            // Contar palavras e caracteres
            var wordCount = CountWords(wikiPage.Content);
            totalWords += wordCount;
            totalCharacters += wikiPage.Content.Length;

            // Contar por tag
            foreach (var tag in wikiPage.Tags)
            {
                if (!stats.PagesByTag.ContainsKey(tag))
                {
                    stats.PagesByTag[tag] = 0;
                }
                stats.PagesByTag[tag]++;
            }

            // Contar por autor
            if (!string.IsNullOrEmpty(wikiPage.Author))
            {
                if (!stats.PagesByAuthor.ContainsKey(wikiPage.Author))
                {
                    stats.PagesByAuthor[wikiPage.Author] = 0;
                }
                stats.PagesByAuthor[wikiPage.Author]++;
            }
        }

        stats.TotalWords = totalWords;
        stats.TotalCharacters = totalCharacters;

        // Páginas mais recentes
        stats.MostRecentPages = wiki.Pages
            .OrderByDescending(p => p.UpdatedAt)
            .Take(5)
            .Select(p => new WikiPageSummaryDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                WordCount = CountWords(p.Content),
                UpdatedAt = p.UpdatedAt
            })
            .ToList();

        // Páginas mais longas
        stats.LongestPages = wiki.Pages
            .OrderByDescending(p => CountWords(p.Content))
            .Take(5)
            .Select(p => new WikiPageSummaryDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                WordCount = CountWords(p.Content),
                UpdatedAt = p.UpdatedAt
            })
            .ToList();

        return stats;
    }

    public async Task<byte[]> ExportWikiAsync(Guid pageId, Guid userId, string format)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        var wiki = JsonSerializer.Deserialize<WikiDataDto>(page.Data)
            ?? new WikiDataDto();

        return format.ToLower() switch
        {
            "json" => System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(wiki, new JsonSerializerOptions
            {
                WriteIndented = true
            })),
            "md" => ExportToMarkdown(wiki),
            "html" => ExportToHtml(wiki),
            _ => throw new NotSupportedException($"Formato '{format}' não suportado")
        };
    }

    private byte[] ExportToMarkdown(WikiDataDto wiki)
    {
        var lines = new List<string>();

        foreach (var wikiPage in wiki.Pages.OrderBy(p => p.Order))
        {
            lines.Add($"# {wikiPage.Title}");
            lines.Add("");

            if (wikiPage.Tags.Any())
            {
                lines.Add($"**Tags:** {string.Join(", ", wikiPage.Tags)}");
                lines.Add("");
            }

            lines.Add(wikiPage.Content);
            lines.Add("");
            lines.Add("---");
            lines.Add("");
        }

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    private byte[] ExportToHtml(WikiDataDto wiki)
    {
        var html = new List<string>
        {
            "<!DOCTYPE html>",
            "<html>",
            "<head>",
            "    <meta charset=\"UTF-8\">",
            "    <title>Wiki Export</title>",
            "    <style>",
            "        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }",
            "        h1 { color: #333; border-bottom: 2px solid #333; }",
            "        .tags { color: #666; font-size: 0.9em; }",
            "        .page { margin-bottom: 40px; }",
            "    </style>",
            "</head>",
            "<body>"
        };

        foreach (var wikiPage in wiki.Pages.OrderBy(p => p.Order))
        {
            html.Add("    <div class=\"page\">");
            html.Add($"        <h1>{EscapeHtml(wikiPage.Title)}</h1>");

            if (wikiPage.Tags.Any())
            {
                html.Add($"        <p class=\"tags\">Tags: {EscapeHtml(string.Join(", ", wikiPage.Tags))}</p>");
            }

            // Nota: Idealmente, converter markdown para HTML aqui
            html.Add($"        <div class=\"content\">{EscapeHtml(wikiPage.Content)}</div>");
            html.Add("    </div>");
        }

        html.Add("</body>");
        html.Add("</html>");

        return System.Text.Encoding.UTF8.GetBytes(string.Join("\n", html));
    }

    private int CountWords(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return 0;

        return text.Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    private string EscapeHtml(string text)
    {
        if (string.IsNullOrEmpty(text))
            return "";

        return text
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&#39;");
    }
}
