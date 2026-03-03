using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EgyptianLawyers.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReverseCityCourtRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cities_Courts_CourtId",
                table: "Cities");

            migrationBuilder.DropIndex(
                name: "IX_Cities_CourtId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "CourtId",
                table: "Cities");

            migrationBuilder.AddColumn<Guid>(
                name: "CityId",
                table: "Courts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Courts_CityId",
                table: "Courts",
                column: "CityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courts_Cities_CityId",
                table: "Courts",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courts_Cities_CityId",
                table: "Courts");

            migrationBuilder.DropIndex(
                name: "IX_Courts_CityId",
                table: "Courts");

            migrationBuilder.DropColumn(
                name: "CityId",
                table: "Courts");

            migrationBuilder.AddColumn<Guid>(
                name: "CourtId",
                table: "Cities",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Cities_CourtId",
                table: "Cities",
                column: "CourtId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cities_Courts_CourtId",
                table: "Cities",
                column: "CourtId",
                principalTable: "Courts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
