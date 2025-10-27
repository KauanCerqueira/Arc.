namespace Arc.Application.DTOs.Wiki;

public class WikiDataDto
{
    public List<WikiPageDto> Pages { get; set; } = new();
    public WikiSettingsDto Settings { get; set; } = new();
}

public class WikiPageDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty; // Markdown content
    public string Slug { get; set; } = string.Empty;
    public string ParentId { get; set; } = string.Empty; // Para hierarquia de páginas
    public int Order { get; set; }
    public List<string> Tags { get; set; } = new();
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<WikiRevisionDto> Revisions { get; set; } = new();
    public bool Published { get; set; } = true;
}

public class WikiRevisionDto
{
    public string Id { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ChangeDescription { get; set; } = string.Empty;
}

public class WikiSettingsDto
{
    public string Theme { get; set; } = "light";
    public bool ShowTableOfContents { get; set; } = true;
    public bool EnableSearch { get; set; } = true;
    public bool TrackRevisions { get; set; } = true;
    public string SidebarPosition { get; set; } = "left"; // left, right
}

public class WikiStatisticsDto
{
    public int TotalPages { get; set; }
    public int PublishedPages { get; set; }
    public int DraftPages { get; set; }
    public int TotalWords { get; set; }
    public int TotalCharacters { get; set; }
    public int TotalRevisions { get; set; }
    public Dictionary<string, int> PagesByTag { get; set; } = new();
    public Dictionary<string, int> PagesByAuthor { get; set; } = new();
    public List<WikiPageSummaryDto> MostRecentPages { get; set; } = new();
    public List<WikiPageSummaryDto> LongestPages { get; set; } = new();
}

public class WikiPageSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class WikiSearchRequestDto
{
    public string Query { get; set; } = string.Empty;
    public bool CaseSensitive { get; set; } = false;
    public bool SearchTitlesOnly { get; set; } = false;
    public List<string> Tags { get; set; } = new();
}

public class WikiSearchResultDto
{
    public string PageId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public double Relevance { get; set; }
}
