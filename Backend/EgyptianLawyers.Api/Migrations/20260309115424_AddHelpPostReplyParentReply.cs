using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EgyptianLawyers.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHelpPostReplyParentReply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentReplyId",
                table: "HelpPostReplies",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HelpPostReplies_ParentReplyId",
                table: "HelpPostReplies",
                column: "ParentReplyId");

            migrationBuilder.AddForeignKey(
                name: "FK_HelpPostReplies_HelpPostReplies_ParentReplyId",
                table: "HelpPostReplies",
                column: "ParentReplyId",
                principalTable: "HelpPostReplies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HelpPostReplies_HelpPostReplies_ParentReplyId",
                table: "HelpPostReplies");

            migrationBuilder.DropIndex(
                name: "IX_HelpPostReplies_ParentReplyId",
                table: "HelpPostReplies");

            migrationBuilder.DropColumn(
                name: "ParentReplyId",
                table: "HelpPostReplies");
        }
    }
}
