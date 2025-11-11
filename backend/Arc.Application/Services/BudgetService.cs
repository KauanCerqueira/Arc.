using Arc.Application.DTOs.Budget;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IBudgetPdfService _pdfService;

    public BudgetService(
        IBudgetRepository budgetRepository,
        IWorkspaceRepository workspaceRepository,
        IBudgetPdfService pdfService)
    {
        _budgetRepository = budgetRepository;
        _workspaceRepository = workspaceRepository;
        _pdfService = pdfService;
    }

    public async Task<BudgetResponseDto> CreateBudgetAsync(CreateBudgetDto dto, Guid userId)
    {
        // Validate workspace access
        var workspace = await _workspaceRepository.GetByIdAsync(dto.WorkspaceId);
        if (workspace == null || (!workspace.UserId.Equals(userId) && !await HasWorkspaceAccessAsync(dto.WorkspaceId, userId)))
        {
            throw new UnauthorizedAccessException("Acesso negado ao workspace");
        }

        var budgetNumber = await _budgetRepository.GenerateBudgetNumberAsync(dto.WorkspaceId);

        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            WorkspaceId = dto.WorkspaceId,
            PageId = dto.PageId,
            BudgetNumber = budgetNumber,
            ClientName = dto.ClientName,
            ClientEmail = dto.ClientEmail,
            ClientCompany = dto.ClientCompany,
            ProjectName = dto.ProjectName,
            ProjectDescription = dto.ProjectDescription,
            CalculationType = ParseCalculationType(dto.CalculationType),
            Status = BudgetStatus.Draft,
            Currency = dto.Currency,
            ValidityDays = dto.ValidityDays,
            DiscountPercentage = dto.DiscountPercentage,
            Notes = dto.Notes,
            TermsAndConditions = dto.TermsAndConditions,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(dto.ValidityDays),
            IsActive = true,
            Items = new List<BudgetItem>(),
            Phases = new List<BudgetPhase>()
        };

        // Add items
        var order = 0;
        foreach (var itemDto in dto.Items)
        {
            var item = new BudgetItem
            {
                Id = Guid.NewGuid(),
                BudgetId = budget.Id,
                Name = itemDto.Name,
                Description = itemDto.Description,
                Category = itemDto.Category,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                EstimatedHours = itemDto.EstimatedHours,
                HourlyRate = itemDto.HourlyRate,
                Complexity = ParseComplexity(itemDto.Complexity),
                Order = order++,
                CreatedAt = DateTime.UtcNow
            };
            item.TotalPrice = item.Quantity * item.UnitPrice;
            budget.Items.Add(item);
        }

        // Add phases
        order = 0;
        foreach (var phaseDto in dto.Phases)
        {
            var phase = new BudgetPhase
            {
                Id = Guid.NewGuid(),
                BudgetId = budget.Id,
                Name = phaseDto.Name,
                Description = phaseDto.Description,
                DurationDays = phaseDto.DurationDays,
                Amount = phaseDto.Amount,
                Order = order++,
                CreatedAt = DateTime.UtcNow
            };
            budget.Phases.Add(phase);
        }

        CalculateTotals(budget);

        var createdBudget = await _budgetRepository.CreateAsync(budget);
        return await MapToResponseDto(createdBudget);
    }

    public async Task<BudgetResponseDto> GetBudgetByIdAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        return await MapToResponseDto(budget);
    }

    public async Task<List<BudgetResponseDto>> GetBudgetsByWorkspaceAsync(Guid workspaceId, Guid userId)
    {
        await ValidateAccessAsync(workspaceId, userId);

        var budgets = await _budgetRepository.GetByWorkspaceIdAsync(workspaceId);
        var result = new List<BudgetResponseDto>();

        foreach (var budget in budgets)
        {
            result.Add(await MapToResponseDto(budget));
        }

        return result;
    }

    public async Task<List<BudgetResponseDto>> GetBudgetsByPageAsync(Guid pageId, Guid userId)
    {
        var budgets = await _budgetRepository.GetByPageIdAsync(pageId);
        if (budgets.Count > 0)
        {
            await ValidateAccessAsync(budgets[0].WorkspaceId, userId);
        }

        var result = new List<BudgetResponseDto>();
        foreach (var budget in budgets)
        {
            result.Add(await MapToResponseDto(budget));
        }

        return result;
    }

    public async Task<BudgetResponseDto> UpdateBudgetAsync(Guid budgetId, UpdateBudgetDto dto, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        // Update fields
        if (!string.IsNullOrEmpty(dto.ClientName)) budget.ClientName = dto.ClientName;
        if (!string.IsNullOrEmpty(dto.ClientEmail)) budget.ClientEmail = dto.ClientEmail;
        if (dto.ClientCompany != null) budget.ClientCompany = dto.ClientCompany;
        if (!string.IsNullOrEmpty(dto.ProjectName)) budget.ProjectName = dto.ProjectName;
        if (dto.ProjectDescription != null) budget.ProjectDescription = dto.ProjectDescription;
        if (!string.IsNullOrEmpty(dto.Status)) budget.Status = ParseBudgetStatus(dto.Status);
        if (dto.DiscountPercentage.HasValue) budget.DiscountPercentage = dto.DiscountPercentage.Value;
        if (dto.Notes != null) budget.Notes = dto.Notes;
        if (dto.TermsAndConditions != null) budget.TermsAndConditions = dto.TermsAndConditions;

        // Update items if provided
        if (dto.Items != null)
        {
            // Remove old items
            budget.Items.Clear();

            // Add new items
            var order = 0;
            foreach (var itemDto in dto.Items)
            {
                var item = new BudgetItem
                {
                    Id = Guid.NewGuid(),
                    BudgetId = budget.Id,
                    Name = itemDto.Name,
                    Description = itemDto.Description,
                    Category = itemDto.Category,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    EstimatedHours = itemDto.EstimatedHours,
                    HourlyRate = itemDto.HourlyRate,
                    Complexity = ParseComplexity(itemDto.Complexity),
                    Order = order++,
                    CreatedAt = DateTime.UtcNow
                };
                item.TotalPrice = item.Quantity * item.UnitPrice;
                budget.Items.Add(item);
            }
        }

        // Update phases if provided
        if (dto.Phases != null)
        {
            budget.Phases.Clear();

            var order = 0;
            foreach (var phaseDto in dto.Phases)
            {
                var phase = new BudgetPhase
                {
                    Id = Guid.NewGuid(),
                    BudgetId = budget.Id,
                    Name = phaseDto.Name,
                    Description = phaseDto.Description,
                    DurationDays = phaseDto.DurationDays,
                    Amount = phaseDto.Amount,
                    Order = order++,
                    CreatedAt = DateTime.UtcNow
                };
                budget.Phases.Add(phase);
            }
        }

        CalculateTotals(budget);

        var updatedBudget = await _budgetRepository.UpdateAsync(budget);
        return await MapToResponseDto(updatedBudget);
    }

    public async Task DeleteBudgetAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        await _budgetRepository.DeleteAsync(budgetId);
    }

    public async Task<BudgetResponseDto> SendBudgetAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        budget.Status = BudgetStatus.Sent;
        budget.SentAt = DateTime.UtcNow;

        var updatedBudget = await _budgetRepository.UpdateAsync(budget);
        return await MapToResponseDto(updatedBudget);
    }

    public async Task<BudgetResponseDto> ApproveBudgetAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        budget.Status = BudgetStatus.Approved;
        budget.ApprovedAt = DateTime.UtcNow;

        var updatedBudget = await _budgetRepository.UpdateAsync(budget);
        return await MapToResponseDto(updatedBudget);
    }

    public async Task<BudgetResponseDto> RejectBudgetAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        budget.Status = BudgetStatus.Rejected;

        var updatedBudget = await _budgetRepository.UpdateAsync(budget);
        return await MapToResponseDto(updatedBudget);
    }

    public async Task<QuickCalculationResultDto> QuickCalculateAsync(QuickCalculationDto dto)
    {
        var result = new QuickCalculationResultDto
        {
            Breakdown = new Dictionary<string, decimal>()
        };

        if (dto.CalculationType == "ByFeatures" && dto.Features != null)
        {
            foreach (var feature in dto.Features)
            {
                var amount = feature.EstimatedHours * dto.HourlyRate;
                result.Breakdown[feature.Name] = amount;
                result.TotalAmount += amount;
                result.TotalHours += feature.EstimatedHours;
            }
        }
        else if (dto.CalculationType == "ByHours" && dto.Hours != null)
        {
            result.Breakdown["Frontend"] = dto.Hours.FrontendHours * dto.HourlyRate;
            result.Breakdown["Backend"] = dto.Hours.BackendHours * dto.HourlyRate;
            result.Breakdown["Design"] = dto.Hours.DesignHours * dto.HourlyRate;
            result.Breakdown["Testing"] = dto.Hours.TestingHours * dto.HourlyRate;
            result.Breakdown["Gerenciamento"] = dto.Hours.ProjectManagementHours * dto.HourlyRate;

            result.TotalHours = dto.Hours.FrontendHours + dto.Hours.BackendHours +
                              dto.Hours.DesignHours + dto.Hours.TestingHours +
                              dto.Hours.ProjectManagementHours;
            result.TotalAmount = result.TotalHours * dto.HourlyRate;
        }

        // Add recommendations
        if (result.TotalHours < 40)
        {
            result.Recommendations.Add("Projeto pequeno - considere um pacote fixo");
        }
        else if (result.TotalHours > 200)
        {
            result.Recommendations.Add("Projeto grande - considere dividir em fases");
            result.Recommendations.Add("Recomendamos adicionar 20% de contingência");
        }

        return await Task.FromResult(result);
    }

    public async Task<BudgetResponseDto> RecalculateBudgetAsync(Guid budgetId, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        CalculateTotals(budget);

        var updatedBudget = await _budgetRepository.UpdateAsync(budget);
        return await MapToResponseDto(updatedBudget);
    }

    public async Task<List<BudgetTemplateDto>> GetTemplatesAsync()
    {
        return await Task.FromResult(new List<BudgetTemplateDto>
        {
            new BudgetTemplateDto
            {
                Name = "Website Básico",
                Description = "Template para site institucional básico",
                CalculationType = "ByFeatures",
                DefaultItems = new List<CreateBudgetItemDto>
                {
                    new() { Name = "Design UI/UX", Category = "design", EstimatedHours = 20, HourlyRate = 150, Quantity = 1, UnitPrice = 3000, Complexity = "Medium" },
                    new() { Name = "Desenvolvimento Frontend", Category = "development", EstimatedHours = 40, HourlyRate = 150, Quantity = 1, UnitPrice = 6000, Complexity = "Medium" },
                    new() { Name = "Integração Backend", Category = "development", EstimatedHours = 20, HourlyRate = 150, Quantity = 1, UnitPrice = 3000, Complexity = "Low" },
                    new() { Name = "Testes e QA", Category = "other", EstimatedHours = 10, HourlyRate = 100, Quantity = 1, UnitPrice = 1000, Complexity = "Low" }
                },
                DefaultPhases = new List<CreateBudgetPhaseDto>
                {
                    new() { Name = "Discovery e Planejamento", DurationDays = 7, Amount = 2000 },
                    new() { Name = "Design e Prototipagem", DurationDays = 14, Amount = 3000 },
                    new() { Name = "Desenvolvimento", DurationDays = 30, Amount = 9000 },
                    new() { Name = "Testes e Lançamento", DurationDays = 7, Amount = 1000 }
                },
                DefaultTerms = "Pagamento em 3 parcelas: 30% início, 40% desenvolvimento, 30% entrega."
            }
        });
    }

    public async Task<BudgetResponseDto> CreateFromTemplateAsync(string templateName, Guid workspaceId, Guid pageId, Guid userId)
    {
        var templates = await GetTemplatesAsync();
        var template = templates.FirstOrDefault(t => t.Name == templateName);
        if (template == null)
        {
            throw new KeyNotFoundException("Template não encontrado");
        }

        var dto = new CreateBudgetDto
        {
            WorkspaceId = workspaceId,
            PageId = pageId,
            ClientName = "",
            ClientEmail = "",
            ProjectName = template.Name,
            ProjectDescription = template.Description,
            CalculationType = template.CalculationType,
            Items = template.DefaultItems,
            Phases = template.DefaultPhases,
            TermsAndConditions = template.DefaultTerms
        };

        return await CreateBudgetAsync(dto, userId);
    }

    public async Task<byte[]> GeneratePdfAsync(Guid budgetId, GeneratePdfDto dto, Guid userId)
    {
        var budget = await _budgetRepository.GetByIdWithDetailsAsync(budgetId);
        if (budget == null)
        {
            throw new KeyNotFoundException("Orçamento não encontrado");
        }

        await ValidateAccessAsync(budget.WorkspaceId, userId);

        // Generate PDF using the PDF service
        return await Task.FromResult(_pdfService.GeneratePdf(budget, dto));
    }

    public async Task<Dictionary<string, object>> GetBudgetAnalyticsAsync(Guid workspaceId, Guid userId)
    {
        await ValidateAccessAsync(workspaceId, userId);

        var budgets = await _budgetRepository.GetByWorkspaceIdAsync(workspaceId);

        var analytics = new Dictionary<string, object>
        {
            ["totalBudgets"] = budgets.Count,
            ["totalValue"] = budgets.Sum(b => b.FinalAmount),
            ["averageValue"] = budgets.Count > 0 ? budgets.Average(b => b.FinalAmount) : 0,
            ["approvedCount"] = budgets.Count(b => b.Status == BudgetStatus.Approved),
            ["rejectedCount"] = budgets.Count(b => b.Status == BudgetStatus.Rejected),
            ["pendingCount"] = budgets.Count(b => b.Status == BudgetStatus.Draft || b.Status == BudgetStatus.Sent),
            ["approvalRate"] = budgets.Count > 0 ? (budgets.Count(b => b.Status == BudgetStatus.Approved) * 100.0 / budgets.Count) : 0
        };

        return analytics;
    }

    #region Private Methods

    private void CalculateTotals(Budget budget)
    {
        // Calculate total from items
        budget.TotalAmount = budget.Items.Sum(i => i.TotalPrice);

        // Calculate discount
        budget.DiscountAmount = budget.TotalAmount * (budget.DiscountPercentage / 100);
        budget.SubtotalAfterDiscount = budget.TotalAmount - budget.DiscountAmount;

        // Calculate individual taxes
        budget.ISSAmount = budget.SubtotalAfterDiscount * (budget.ISSPercentage / 100);
        budget.PISAmount = budget.SubtotalAfterDiscount * (budget.PISPercentage / 100);
        budget.COFINSAmount = budget.SubtotalAfterDiscount * (budget.COFINSPercentage / 100);
        budget.IRPFAmount = budget.SubtotalAfterDiscount * (budget.IRPFPercentage / 100);

        // Calculate total tax
        budget.TaxAmount = budget.ISSAmount + budget.PISAmount + budget.COFINSAmount + budget.IRPFAmount;
        budget.TaxPercentage = budget.ISSPercentage + budget.PISPercentage + budget.COFINSPercentage + budget.IRPFPercentage;

        // Calculate final amount
        budget.FinalAmount = budget.SubtotalAfterDiscount + budget.TaxAmount;

        budget.UpdatedAt = DateTime.UtcNow;
    }

    private async Task<BudgetResponseDto> MapToResponseDto(Budget budget)
    {
        var summary = new BudgetSummaryDto
        {
            TotalItems = budget.Items.Count,
            TotalHours = budget.Items.Sum(i => i.EstimatedHours * i.Quantity),
            AverageHourlyRate = budget.Items.Count > 0 ? budget.Items.Average(i => i.HourlyRate) : 0,
            TotalDuration = budget.Phases.Sum(p => p.DurationDays),
            ByCategory = budget.Items.GroupBy(i => i.Category)
                                    .ToDictionary(g => g.Key, g => g.Sum(i => i.TotalPrice)),
            ByComplexity = budget.Items.GroupBy(i => i.Complexity.ToString())
                                      .ToDictionary(g => g.Key, g => g.Count())
        };

        return await Task.FromResult(new BudgetResponseDto
        {
            Id = budget.Id,
            WorkspaceId = budget.WorkspaceId,
            PageId = budget.PageId,
            BudgetNumber = budget.BudgetNumber,
            ClientName = budget.ClientName,
            ClientEmail = budget.ClientEmail,
            ClientCompany = budget.ClientCompany,
            ProjectName = budget.ProjectName,
            ProjectDescription = budget.ProjectDescription,
            CalculationType = budget.CalculationType.ToString(),
            Status = budget.Status.ToString(),
            TotalAmount = budget.TotalAmount,
            DiscountPercentage = budget.DiscountPercentage,
            DiscountAmount = budget.DiscountAmount,
            FinalAmount = budget.FinalAmount,
            Currency = budget.Currency,
            ValidityDays = budget.ValidityDays,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt,
            SentAt = budget.SentAt,
            ApprovedAt = budget.ApprovedAt,
            ExpiresAt = budget.ExpiresAt,
            Notes = budget.Notes,
            TermsAndConditions = budget.TermsAndConditions,
            Items = budget.Items.Select(i => new BudgetItemResponseDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                Category = i.Category,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                EstimatedHours = i.EstimatedHours,
                HourlyRate = i.HourlyRate,
                Complexity = i.Complexity.ToString(),
                Order = i.Order
            }).OrderBy(i => i.Order).ToList(),
            Phases = budget.Phases.Select(p => new BudgetPhaseResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                DurationDays = p.DurationDays,
                Amount = p.Amount,
                Order = p.Order
            }).OrderBy(p => p.Order).ToList(),
            Summary = summary
        });
    }

    private async Task ValidateAccessAsync(Guid workspaceId, Guid userId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null || (!workspace.UserId.Equals(userId) && !await HasWorkspaceAccessAsync(workspaceId, userId)))
        {
            throw new UnauthorizedAccessException("Acesso negado ao workspace");
        }
    }

    private Task<bool> HasWorkspaceAccessAsync(Guid workspaceId, Guid userId)
    {
        // TODO: Implement proper workspace member check
        return Task.FromResult(true);
    }

    private CalculationType ParseCalculationType(string type)
    {
        return type switch
        {
            "ByFeatures" => CalculationType.ByFeatures,
            "ByHours" => CalculationType.ByHours,
            "ByPackage" => CalculationType.ByPackage,
            "ByComplexity" => CalculationType.ByComplexity,
            "Hybrid" => CalculationType.Hybrid,
            _ => CalculationType.ByFeatures
        };
    }

    private BudgetStatus ParseBudgetStatus(string status)
    {
        return status switch
        {
            "Draft" => BudgetStatus.Draft,
            "Sent" => BudgetStatus.Sent,
            "Approved" => BudgetStatus.Approved,
            "Rejected" => BudgetStatus.Rejected,
            "Expired" => BudgetStatus.Expired,
            _ => BudgetStatus.Draft
        };
    }

    private ProjectComplexity ParseComplexity(string complexity)
    {
        return complexity switch
        {
            "Low" => ProjectComplexity.Low,
            "Medium" => ProjectComplexity.Medium,
            "High" => ProjectComplexity.High,
            "VeryHigh" => ProjectComplexity.VeryHigh,
            _ => ProjectComplexity.Medium
        };
    }

    #endregion
}
