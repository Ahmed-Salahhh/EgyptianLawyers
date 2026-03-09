using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EgyptianLawyers.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToCityCourtLawyer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Lawyers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Courts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Cities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Lawyers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Courts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Cities");
        }
    }
}
