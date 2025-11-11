using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "budgets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    page_id = table.Column<Guid>(type: "uuid", nullable: false),
                    budget_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    client_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    client_email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    client_company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    project_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    project_description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    calculation_type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    final_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    validity_days = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    terms_and_conditions = table.Column<string>(type: "TEXT", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budgets", x => x.id);
                    table.ForeignKey(
                        name: "FK_budgets_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    budget_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    estimated_hours = table.Column<int>(type: "integer", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    complexity = table.Column<int>(type: "integer", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_budget_items_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "budget_phases",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    budget_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budget_phases", x => x.id);
                    table.ForeignKey(
                        name: "FK_budget_phases_budgets_budget_id",
                        column: x => x.budget_id,
                        principalTable: "budgets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_budget_items_budget_id",
                table: "budget_items",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_items_budget_id_order",
                table: "budget_items",
                columns: new[] { "budget_id", "order" });

            migrationBuilder.CreateIndex(
                name: "IX_budget_phases_budget_id",
                table: "budget_phases",
                column: "budget_id");

            migrationBuilder.CreateIndex(
                name: "IX_budget_phases_budget_id_order",
                table: "budget_phases",
                columns: new[] { "budget_id", "order" });

            migrationBuilder.CreateIndex(
                name: "IX_budgets_budget_number",
                table: "budgets",
                column: "budget_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_budgets_page_id",
                table: "budgets",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_workspace_id",
                table: "budgets",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_budgets_workspace_id_status",
                table: "budgets",
                columns: new[] { "workspace_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "budget_items");

            migrationBuilder.DropTable(
                name: "budget_phases");

            migrationBuilder.DropTable(
                name: "budgets");
        }
    }
}
