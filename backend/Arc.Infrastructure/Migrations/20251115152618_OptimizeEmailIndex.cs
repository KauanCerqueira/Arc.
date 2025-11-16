using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeEmailIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Normalize all existing emails to lowercase for consistent querying
            migrationBuilder.Sql("UPDATE users SET email = LOWER(email) WHERE email != LOWER(email);");

            migrationBuilder.CreateTable(
                name: "automation_configurations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: true),
                    automation_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    settings = table.Column<string>(type: "TEXT", nullable: true),
                    last_run_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    next_run_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    items_processed = table.Column<int>(type: "integer", nullable: false),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    metadata = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_automation_configurations", x => x.id);
                    table.ForeignKey(
                        name: "FK_automation_configurations_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_automation_configurations_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_automation_configurations_is_enabled_status",
                table: "automation_configurations",
                columns: new[] { "is_enabled", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_automation_configurations_user_id",
                table: "automation_configurations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_automation_configurations_user_id_workspace_id_automation_t~",
                table: "automation_configurations",
                columns: new[] { "user_id", "workspace_id", "automation_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_automation_configurations_workspace_id",
                table: "automation_configurations",
                column: "workspace_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "automation_configurations");
        }
    }
}
