using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EgyptianLawyers.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLawyerAvatarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Lawyers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Lawyers");
        }
    }
}
