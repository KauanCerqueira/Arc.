using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arc.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceGroupPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "workspaces",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theme = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    timezone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date_format = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workspaces", x => x.id);
                    table.ForeignKey(
                        name: "FK_workspaces_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "groups",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    workspace_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    icone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    cor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    expandido = table.Column<bool>(type: "boolean", nullable: false),
                    favorito = table.Column<bool>(type: "boolean", nullable: false),
                    arquivado = table.Column<bool>(type: "boolean", nullable: false),
                    posicao = table.Column<int>(type: "integer", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_groups", x => x.id);
                    table.ForeignKey(
                        name: "FK_groups_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    template = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    data = table.Column<string>(type: "TEXT", nullable: false),
                    favorito = table.Column<bool>(type: "boolean", nullable: false),
                    posicao = table.Column<int>(type: "integer", nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pages", x => x.id);
                    table.ForeignKey(
                        name: "FK_pages_groups_group_id",
                        column: x => x.group_id,
                        principalTable: "groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_groups_workspace_id",
                table: "groups",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_groups_workspace_id_posicao",
                table: "groups",
                columns: new[] { "workspace_id", "posicao" });

            migrationBuilder.CreateIndex(
                name: "IX_pages_favorito",
                table: "pages",
                column: "favorito");

            migrationBuilder.CreateIndex(
                name: "IX_pages_group_id",
                table: "pages",
                column: "group_id");

            migrationBuilder.CreateIndex(
                name: "IX_pages_group_id_posicao",
                table: "pages",
                columns: new[] { "group_id", "posicao" });

            migrationBuilder.CreateIndex(
                name: "IX_workspaces_user_id",
                table: "workspaces",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pages");

            migrationBuilder.DropTable(
                name: "groups");

            migrationBuilder.DropTable(
                name: "workspaces");
        }
    }
}
