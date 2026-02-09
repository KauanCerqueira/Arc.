using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixInviteDefaultValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing records to is_active = true
            migrationBuilder.Sql(@"
                UPDATE workspace_invitations
                SET is_active = TRUE
                WHERE is_active = FALSE;
            ");

            // Change default value of is_active to TRUE
            migrationBuilder.Sql(@"
                ALTER TABLE workspace_invitations
                ALTER COLUMN is_active SET DEFAULT TRUE;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert default value to FALSE
            migrationBuilder.Sql(@"
                ALTER TABLE workspace_invitations
                ALTER COLUMN is_active SET DEFAULT FALSE;
            ");
        }
    }
}
