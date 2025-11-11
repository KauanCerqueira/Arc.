using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExpandBudgetWithTaxesAndPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "COFINSAmount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "COFINSPercentage",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ClientAddress",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClientDocument",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClientPhone",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyAddress",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyCNPJ",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyEmail",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyLogoUrl",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyPhone",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyWebsite",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "IRPFAmount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "IRPFPercentage",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ISSAmount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ISSPercentage",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfInstallments",
                table: "budgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "PISAmount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PISPercentage",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentTerms",
                table: "budgets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "SubtotalAfterDiscount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxPercentage",
                table: "budgets",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "BudgetPaymentInstallments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BudgetId = table.Column<Guid>(type: "uuid", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Percentage = table.Column<decimal>(type: "numeric", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    DaysFromStart = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetPaymentInstallments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetPaymentInstallments_budgets_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "budgets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetPaymentInstallments_BudgetId",
                table: "BudgetPaymentInstallments",
                column: "BudgetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BudgetPaymentInstallments");

            migrationBuilder.DropColumn(
                name: "COFINSAmount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "COFINSPercentage",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "ClientAddress",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "ClientDocument",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "ClientPhone",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyAddress",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyCNPJ",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyEmail",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyLogoUrl",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyPhone",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "CompanyWebsite",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "IRPFAmount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "IRPFPercentage",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "ISSAmount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "ISSPercentage",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "NumberOfInstallments",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "PISAmount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "PISPercentage",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "PaymentTerms",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "SubtotalAfterDiscount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "budgets");

            migrationBuilder.DropColumn(
                name: "TaxPercentage",
                table: "budgets");
        }
    }
}
