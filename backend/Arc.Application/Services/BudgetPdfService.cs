using Arc.Application.DTOs.Budget;
using Arc.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;

namespace Arc.Application.Services;

public interface IBudgetPdfService
{
    byte[] GeneratePdf(Budget budget, GeneratePdfDto options);
}

public class BudgetPdfService : IBudgetPdfService
{
    public byte[] GeneratePdf(Budget budget, GeneratePdfDto options)
    {
        options ??= new GeneratePdfDto();
        // Set QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;

        // Theme configuration
        var isMonochrome = string.Equals(options.ColorScheme, "monochrome", StringComparison.OrdinalIgnoreCase);
        var primaryColor = isMonochrome ? Colors.Black : Colors.Blue.Darken2;
        var culture = new CultureInfo(string.IsNullOrWhiteSpace(options.Language) ? "pt-BR" : options.Language);

        // Try load company logo
        byte[]? logoBytes = null;
        if (options.IncludeLogo && !string.IsNullOrWhiteSpace(options.CompanyLogoUrl))
        {
            try
            {
                if (options.CompanyLogoUrl.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                {
                    var commaIdx = options.CompanyLogoUrl.IndexOf(',');
                    if (commaIdx > 0)
                    {
                        var base64 = options.CompanyLogoUrl.Substring(commaIdx + 1);
                        logoBytes = Convert.FromBase64String(base64);
                    }
                }
                else
                {
                    using var http = new System.Net.Http.HttpClient();
                    using var resp = http.GetAsync(options.CompanyLogoUrl).GetAwaiter().GetResult();
                    if (resp.IsSuccessStatusCode)
                    {
                        var contentType = resp.Content.Headers.ContentType?.MediaType ?? string.Empty;
                        // QuestPDF works with raster images; skip SVG
                        if (!contentType.Contains("svg"))
                        {
                            logoBytes = resp.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult();
                        }
                    }
                }
            }
            catch
            {
                // ignore logo load failures
            }
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                // Use default system font to avoid missing font issues
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(container => ComposeHeader(container, budget, options, logoBytes, primaryColor));
                page.Content().Element(container => ComposeContent(container, budget, options, primaryColor, culture));
                page.Footer().Element(container => ComposeFooter(container, budget));
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, Budget budget, GeneratePdfDto options, byte[]? logoBytes, string primaryColor)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                if (logoBytes != null && logoBytes.Length > 0)
                {
                    row.ConstantItem(50).Image(logoBytes);
                }
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text(options.CompanyName)
                        .FontSize(24).Bold().FontColor(primaryColor);

                    if (!string.IsNullOrEmpty(options.CompanyAddress))
                        column.Item().Text(options.CompanyAddress).FontSize(9);

                    if (!string.IsNullOrEmpty(options.CompanyPhone))
                        column.Item().Text($"Tel: {options.CompanyPhone}").FontSize(9);

                    if (!string.IsNullOrEmpty(options.CompanyEmail))
                        column.Item().Text($"Email: {options.CompanyEmail}").FontSize(9);

                    if (!string.IsNullOrEmpty(options.CompanyCNPJ))
                        column.Item().Text($"CNPJ: {options.CompanyCNPJ}").FontSize(9);
                });

                row.ConstantItem(120).AlignRight().Column(column =>
                {
                    column.Item().Text("ORÇAMENTO").FontSize(20).Bold();
                    column.Item().Text($"#{budget.BudgetNumber}").FontSize(14).FontColor(Colors.Grey.Darken2);
                    column.Item().PaddingTop(5).Text($"Data: {budget.CreatedAt:dd/MM/yyyy}").FontSize(9);
                    column.Item().Text($"Validade: {budget.ValidityDays} dias").FontSize(9);
                });
            });

            col.Item().PaddingTop(10).LineHorizontal(2).LineColor(primaryColor);
        });
    }

    private void ComposeContent(IContainer container, Budget budget, GeneratePdfDto options, string primaryColor, CultureInfo culture)
    {
        container.PaddingVertical(10).Column(column =>
        {
            // Client Information
            column.Item().Element(c => ComposeClientInfo(c, budget));

            // Project Information
            column.Item().PaddingTop(15).Element(c => ComposeProjectInfo(c, budget));

            // Items Table
            if (options.IncludeItemDetails && (budget.Items != null && budget.Items.Any()))
            {
                column.Item().PaddingTop(15).Element(c => ComposeItemsTable(c, budget, options, culture));
            }

            // Phases
            if (options.IncludePhases && (budget.Phases != null && budget.Phases.Any()))
            {
                column.Item().PaddingTop(15).Element(c => ComposePhasesTable(c, budget, options, culture));
            }

            // Financial Summary
            column.Item().PaddingTop(15).Element(c => ComposeFinancialSummary(c, budget, options, primaryColor, culture));

            // Payment Schedule
            if (options.IncludePaymentSchedule && (budget.PaymentInstallments != null && budget.PaymentInstallments.Any()))
            {
                column.Item().PaddingTop(15).Element(c => ComposePaymentSchedule(c, budget, options, culture));
            }

            // Notes
            if (!string.IsNullOrEmpty(budget.Notes))
            {
                column.Item().PaddingTop(15).Element(c => ComposeNotes(c, budget));
            }

            // Terms and Conditions
            if (options.IncludeTerms && !string.IsNullOrEmpty(budget.TermsAndConditions))
            {
                column.Item().PaddingTop(15).Element(c => ComposeTerms(c, budget));
            }
        });
    }

    private void ComposeClientInfo(IContainer container, Budget budget)
    {
        container.Background(Colors.Grey.Lighten3).Padding(10).Column(column =>
        {
            column.Item().Text("INFORMAÇÕES DO CLIENTE").Bold().FontSize(12);
            column.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text($"Nome: {budget.ClientName}");
                    col.Item().Text($"Email: {budget.ClientEmail}");
                });
                row.RelativeItem().Column(col =>
                {
                    if (!string.IsNullOrEmpty(budget.ClientCompany))
                        col.Item().Text($"Empresa: {budget.ClientCompany}");
                    if (!string.IsNullOrEmpty(budget.ClientDocument))
                        col.Item().Text($"Documento: {budget.ClientDocument}");
                    if (!string.IsNullOrEmpty(budget.ClientPhone))
                        col.Item().Text($"Telefone: {budget.ClientPhone}");
                });
            });
        });
    }

    private void ComposeProjectInfo(IContainer container, Budget budget)
    {
        container.Column(column =>
        {
            column.Item().Text("INFORMAÇÕES DO PROJETO").Bold().FontSize(12);
            column.Item().PaddingTop(5).Text($"Projeto: {budget.ProjectName}").FontSize(11).Bold();

            if (!string.IsNullOrEmpty(budget.ProjectDescription))
            {
                column.Item().PaddingTop(3).Text(budget.ProjectDescription).FontSize(9).LineHeight(1.3f);
            }

            column.Item().PaddingTop(5).Text($"Tipo de Cálculo: {GetCalculationTypeName(budget.CalculationType)}").FontSize(9);
        });
    }

    private void ComposeItemsTable(IContainer container, Budget budget, GeneratePdfDto options, System.Globalization.CultureInfo culture)
    {
        container.Column(column =>
        {
            column.Item().Text("ITENS DO ORÇAMENTO").Bold().FontSize(12);

            column.Item().PaddingTop(5).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(25);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(h => HeaderCellStyle(h)).Text("#").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).Text("Item").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).Text("Categoria").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).AlignRight().Text("Qtd").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).AlignRight().Text("Horas").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).AlignRight().Text("Vlr. Unit.").Bold();
                    header.Cell().Element(h => HeaderCellStyle(h)).AlignRight().Text("Total").Bold();
                });

                // Rows
                var orderedItems = budget.Items.OrderBy(i => i.Order).ToList();
                for (int i = 0; i < orderedItems.Count; i++)
                {
                    var item = orderedItems[i];
                    var index = i + 1;

                    var isAlt = i % 2 == 1;
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).Text(index.ToString());
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).Column(col =>
                    {
                        col.Item().Text(item.Name).FontSize(9).Bold();
                        if (!string.IsNullOrEmpty(item.Description))
                            col.Item().Text(item.Description).FontSize(8).FontColor(Colors.Grey.Darken1);
                    });
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).Text(item.Category).FontSize(8);
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).AlignRight().Text(item.Quantity.ToString());
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).AlignRight().Text(item.EstimatedHours.ToString());
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).AlignRight().Text(FormatCurrency(item.UnitPrice, budget.Currency, culture));
                    table.Cell().Element(c => RowCellStyle(c, isAlt)).AlignRight().Text(FormatCurrency(item.TotalPrice, budget.Currency, culture)).Bold();
                }

                static IContainer HeaderCellStyle(IContainer container) => container.Background(Colors.Grey.Lighten3).Padding(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);

                static IContainer RowCellStyle(IContainer container, bool alt) => container.Padding(5).Background(alt ? Colors.Grey.Lighten4 : Colors.White).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
            });
        });
    }

    private void ComposePhasesTable(IContainer container, Budget budget, GeneratePdfDto options, System.Globalization.CultureInfo culture)
    {
        container.Column(column =>
        {
            column.Item().Text("FASES DO PROJETO").Bold().FontSize(12);

            column.Item().PaddingTop(5).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(25);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("#").Bold();
                    header.Cell().Element(CellStyle).Text("Fase").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Duração").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Valor").Bold();
                });

                // Rows
                var orderedPhases = budget.Phases.OrderBy(p => p.Order).ToList();
                for (int i = 0; i < orderedPhases.Count; i++)
                {
                    var phase = orderedPhases[i];
                    var index = i + 1;

                    table.Cell().Element(CellStyle).Text(index.ToString());
                    table.Cell().Element(CellStyle).Column(col =>
                    {
                        col.Item().Text(phase.Name).FontSize(9).Bold();
                        if (!string.IsNullOrEmpty(phase.Description))
                            col.Item().Text(phase.Description).FontSize(8).FontColor(Colors.Grey.Darken1);
                    });
                    table.Cell().Element(CellStyle).AlignRight().Text($"{phase.DurationDays} dias");
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(phase.Amount, budget.Currency, culture)).Bold();
                }

                static IContainer CellStyle(IContainer container)
                {
                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5);
                }
                static IContainer HeaderCellStyle(IContainer container)
                {
                    return container.Background(Colors.Grey.Lighten3).BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5);
                }
            });
        });
    }

    private void ComposeFinancialSummary(IContainer container, Budget budget, GeneratePdfDto options, string primaryColor, CultureInfo culture)
    {
        container.Column(column =>
        {
            column.Item().Text("RESUMO FINANCEIRO").Bold().FontSize(12);

            column.Item().PaddingTop(5).AlignRight().Column(summary =>
            {
                summary.Item().Row(row =>
                {
                    row.AutoItem().Width(200).Text("Valor Total:");
                    row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.TotalAmount, budget.Currency, culture));
                });

                if (budget.DiscountPercentage > 0)
                {
                    summary.Item().Row(row =>
                    {
                        row.AutoItem().Width(200).Text($"Desconto ({budget.DiscountPercentage}%):");
                        row.AutoItem().Width(100).AlignRight().Text($"- {FormatCurrency(budget.DiscountAmount, budget.Currency, culture)}").FontColor(primaryColor);
                    });

                    summary.Item().Row(row =>
                    {
                        row.AutoItem().Width(200).Text("Subtotal:");
                        row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.SubtotalAfterDiscount, budget.Currency, culture));
                    });
                }

                // Tax Breakdown
                if (options.IncludeTaxBreakdown && budget.TaxPercentage > 0)
                {
                    summary.Item().PaddingTop(5).Row(row =>
                    {
                        row.AutoItem().Width(200).Text("IMPOSTOS:").Bold().FontSize(9);
                    });

                    if (budget.ISSPercentage > 0)
                    {
                        summary.Item().Row(row =>
                        {
                            row.AutoItem().Width(200).Text($"ISS ({budget.ISSPercentage}%):").FontSize(8);
                            row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.ISSAmount, budget.Currency, culture)).FontSize(8);
                        });
                    }

                    if (budget.PISPercentage > 0)
                    {
                        summary.Item().Row(row =>
                        {
                            row.AutoItem().Width(200).Text($"PIS ({budget.PISPercentage}%):").FontSize(8);
                            row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.PISAmount, budget.Currency, culture)).FontSize(8);
                        });
                    }

                    if (budget.COFINSPercentage > 0)
                    {
                        summary.Item().Row(row =>
                        {
                            row.AutoItem().Width(200).Text($"COFINS ({budget.COFINSPercentage}%):").FontSize(8);
                            row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.COFINSAmount, budget.Currency, culture)).FontSize(8);
                        });
                    }

                    if (budget.IRPFPercentage > 0)
                    {
                        summary.Item().Row(row =>
                        {
                            row.AutoItem().Width(200).Text($"IRPF ({budget.IRPFPercentage}%):").FontSize(8);
                            row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.IRPFAmount, budget.Currency, culture)).FontSize(8);
                        });
                    }

                    summary.Item().Row(row =>
                    {
                        row.AutoItem().Width(200).Text($"Total Impostos ({budget.TaxPercentage}%):").Bold();
                        row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.TaxAmount, budget.Currency, culture)).Bold();
                    });
                }

                summary.Item().PaddingTop(10).LineHorizontal(2).LineColor(primaryColor);

                summary.Item().PaddingTop(5).Row(row =>
                {
                    row.AutoItem().Width(200).Text("VALOR FINAL:").Bold().FontSize(14);
                    row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(budget.FinalAmount, budget.Currency, culture)).Bold().FontSize(14).FontColor(primaryColor);
                });

                if (budget.NumberOfInstallments > 1)
                {
                    var installmentAmount = budget.FinalAmount / budget.NumberOfInstallments;
                    summary.Item().Row(row =>
                    {
                        row.AutoItem().Width(200).Text($"Parcelamento:").FontSize(9);
                        row.AutoItem().Width(100).AlignRight().Text($"{budget.NumberOfInstallments}x de {FormatCurrency(installmentAmount, budget.Currency)}").FontSize(9);
                    });
                }
            });
        });
    }

    private void ComposePaymentSchedule(IContainer container, Budget budget, GeneratePdfDto options, CultureInfo culture)
    {
        container.Column(column =>
        {
            column.Item().Text("CRONOGRAMA DE PAGAMENTO").Bold().FontSize(12);

            column.Item().PaddingTop(5).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Parcela").Bold();
                    header.Cell().Element(CellStyle).Text("Descrição").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Vencimento").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Valor").Bold();
                });

                // Rows
                var orderedInstallments = budget.PaymentInstallments.OrderBy(p => p.InstallmentNumber).ToList();
                foreach (var installment in orderedInstallments)
                {
                    table.Cell().Element(CellStyle).Text($"{installment.InstallmentNumber}ª");
                    table.Cell().Element(CellStyle).Text(installment.Description);
                    table.Cell().Element(CellStyle).AlignRight().Text(installment.DueDate.ToString("dd/MM/yyyy"));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(installment.Amount, budget.Currency, culture)).Bold();
                }

                static IContainer CellStyle(IContainer container)
                {
                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5);
                }
            });
        });
    }

    private void ComposeNotes(IContainer container, Budget budget)
    {
        container.Column(column =>
        {
            column.Item().Text("OBSERVAÇÕES").Bold().FontSize(12);
            column.Item().PaddingTop(5).Text(budget.Notes).FontSize(9).LineHeight(1.3f);
        });
    }

    private void ComposeTerms(IContainer container, Budget budget)
    {
        container.Column(column =>
        {
            column.Item().Text("TERMOS E CONDIÇÕES").Bold().FontSize(12);
            column.Item().PaddingTop(5).Text(budget.TermsAndConditions).FontSize(8).LineHeight(1.3f);
        });
    }

    private void ComposeFooter(IContainer container, Budget budget)
    {
        container.AlignCenter().Text(page =>
        {
            page.Span("Este orçamento é válido por ").FontSize(8);
            page.Span($"{budget.ValidityDays} dias").FontSize(8).Bold();
            page.Span($" a partir de {budget.CreatedAt:dd/MM/yyyy}").FontSize(8);

            if (budget.ExpiresAt.HasValue)
            {
                page.Span($" (expira em {budget.ExpiresAt.Value:dd/MM/yyyy})").FontSize(8).FontColor(Colors.Red.Medium);
            }
        });
    }

    private string FormatCurrency(decimal value, string? currency)
    {
        var c = string.IsNullOrWhiteSpace(currency) ? "BRL" : currency.ToUpper();
        return c switch
        {
            "BRL" => $"R$ {value:N2}",
            "USD" => $"$ {value:N2}",
            "EUR" => $"€ {value:N2}",
            _ => $"{c} {value:N2}"
        };
    }

    private string FormatCurrency(decimal value, string? currency, CultureInfo culture)
    {
        var c = string.IsNullOrWhiteSpace(currency) ? "BRL" : currency.ToUpper();
        var formatted = value.ToString("N2", culture);
        return c switch
        {
            "BRL" => $"R$ {formatted}",
            "USD" => $"$ {formatted}",
            "EUR" => $"€ {formatted}",
            _ => $"{c} {formatted}"
        };
    }

    private string GetCalculationTypeName(CalculationType type)
    {
        return type switch
        {
            CalculationType.ByFeatures => "Por Funcionalidades",
            CalculationType.ByHours => "Por Horas",
            CalculationType.ByPackage => "Por Pacote",
            CalculationType.ByComplexity => "Por Complexidade",
            CalculationType.Hybrid => "Híbrido",
            _ => "Não especificado"
        };
    }
}
