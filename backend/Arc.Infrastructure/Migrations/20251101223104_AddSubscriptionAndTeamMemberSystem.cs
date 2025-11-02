using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndTeamMemberSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "subscription_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    billing_interval = table.Column<int>(type: "integer", nullable: false),
                    current_period_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    current_period_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cancel_at_period_end = table.Column<bool>(type: "boolean", nullable: false),
                    stripe_customer_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    stripe_subscription_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    stripe_payment_method_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "FK_subscriptions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "team_members",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<int>(type: "integer", nullable: false),
                    custom_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    can_invite_members = table.Column<bool>(type: "boolean", nullable: false),
                    can_remove_members = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_projects = table.Column<bool>(type: "boolean", nullable: false),
                    can_delete_projects = table.Column<bool>(type: "boolean", nullable: false),
                    can_manage_integrations = table.Column<bool>(type: "boolean", nullable: false),
                    can_export_data = table.Column<bool>(type: "boolean", nullable: false),
                    invited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvitedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_members", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_members_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_members_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_subscription_id",
                table: "users",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_stripe_customer_id",
                table: "subscriptions",
                column: "stripe_customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_stripe_subscription_id",
                table: "subscriptions",
                column: "stripe_subscription_id");

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_user_id",
                table: "subscriptions",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_team_members_user_id",
                table: "team_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_members_workspace_id",
                table: "team_members",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_members_workspace_id_user_id",
                table: "team_members",
                columns: new[] { "workspace_id", "user_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "subscriptions");

            migrationBuilder.DropTable(
                name: "team_members");

            migrationBuilder.DropIndex(
                name: "IX_users_subscription_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "subscription_id",
                table: "users");
        }
    }
}
