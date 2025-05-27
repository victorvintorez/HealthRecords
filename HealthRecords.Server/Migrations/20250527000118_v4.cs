using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthRecords.Server.Migrations
{
    /// <inheritdoc />
    public partial class v4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                table: "FileBlobs",
                newName: "Container");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Container",
                table: "FileBlobs",
                newName: "Url");
        }
    }
}
