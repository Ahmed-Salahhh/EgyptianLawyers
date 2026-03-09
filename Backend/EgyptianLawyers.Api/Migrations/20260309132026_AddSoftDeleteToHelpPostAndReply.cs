using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EgyptianLawyers.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToHelpPostAndReply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "HelpPosts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "HelpPostReplies",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "HelpPosts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "HelpPostReplies");
        }
    }
}
