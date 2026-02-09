using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInviteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "current_uses",
                table: "workspace_invitations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "workspace_invitations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "max_uses",
                table: "workspace_invitations",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_workspace_invitations_is_active",
                table: "workspace_invitations",
                column: "is_active");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_workspace_invitations_is_active",
                table: "workspace_invitations");

            migrationBuilder.DropColumn(
                name: "current_uses",
                table: "workspace_invitations");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "workspace_invitations");

            migrationBuilder.DropColumn(
                name: "max_uses",
                table: "workspace_invitations");
        }
    }
}
