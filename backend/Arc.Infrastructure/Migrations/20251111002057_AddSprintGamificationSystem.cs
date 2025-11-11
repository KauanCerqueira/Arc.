using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSprintGamificationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sprints",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    page_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    goal = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_story_points = table.Column<int>(type: "integer", nullable: false),
                    committed_story_points = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sprints", x => x.id);
                    table.ForeignKey(
                        name: "FK_sprints_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_achievements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    tier = table.Column<int>(type: "integer", nullable: false),
                    current_value = table.Column<int>(type: "integer", nullable: false),
                    required_value = table.Column<int>(type: "integer", nullable: false),
                    progress = table.Column<int>(type: "integer", nullable: false),
                    unlocked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_achievements", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_achievements_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_achievements_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_badges",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    rarity = table.Column<int>(type: "integer", nullable: false),
                    earned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_badges", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_badges_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_badges_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_stats",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    total_points = table.Column<int>(type: "integer", nullable: false),
                    experience = table.Column<int>(type: "integer", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false),
                    tasks_completed = table.Column<int>(type: "integer", nullable: false),
                    sprints_completed = table.Column<int>(type: "integer", nullable: false),
                    current_streak = table.Column<int>(type: "integer", nullable: false),
                    longest_streak = table.Column<int>(type: "integer", nullable: false),
                    last_activity_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    average_velocity = table.Column<double>(type: "double precision", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_stats", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_stats_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_stats_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sprint_tasks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sprint_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    story_points = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    assigned_to = table.Column<Guid>(type: "uuid", nullable: true),
                    tags = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sprint_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_sprint_tasks_sprints_sprint_id",
                        column: x => x.sprint_id,
                        principalTable: "sprints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sprint_tasks_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sprint_tasks_assigned_to",
                table: "sprint_tasks",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "IX_sprint_tasks_sprint_id",
                table: "sprint_tasks",
                column: "sprint_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprint_tasks_sprint_id_status",
                table: "sprint_tasks",
                columns: new[] { "sprint_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_sprints_page_id",
                table: "sprints",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_workspace_id",
                table: "sprints",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_workspace_id_status",
                table: "sprints",
                columns: new[] { "workspace_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_user_id",
                table: "user_achievements",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_user_id_workspace_id_type_tier",
                table: "user_achievements",
                columns: new[] { "user_id", "workspace_id", "type", "tier" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_workspace_id",
                table: "user_achievements",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_badges_user_id",
                table: "user_badges",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_badges_user_id_workspace_id_type",
                table: "user_badges",
                columns: new[] { "user_id", "workspace_id", "type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_badges_workspace_id",
                table: "user_badges",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_stats_user_id",
                table: "user_stats",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_stats_user_id_workspace_id",
                table: "user_stats",
                columns: new[] { "user_id", "workspace_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_stats_workspace_id",
                table: "user_stats",
                column: "workspace_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sprint_tasks");

            migrationBuilder.DropTable(
                name: "user_achievements");

            migrationBuilder.DropTable(
                name: "user_badges");

            migrationBuilder.DropTable(
                name: "user_stats");

            migrationBuilder.DropTable(
                name: "sprints");
        }
    }
}
