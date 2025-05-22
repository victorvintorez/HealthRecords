using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthRecords.Server.Migrations
{
    /// <inheritdoc />
    public partial class v3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reason",
                table: "Prescriptions");

            migrationBuilder.AddColumn<int>(
                name: "HospitalId",
                table: "HealthRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HealthRecords_HospitalId",
                table: "HealthRecords",
                column: "HospitalId");

            migrationBuilder.AddForeignKey(
                name: "FK_HealthRecords_Hospitals_HospitalId",
                table: "HealthRecords",
                column: "HospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HealthRecords_Hospitals_HospitalId",
                table: "HealthRecords");

            migrationBuilder.DropIndex(
                name: "IX_HealthRecords_HospitalId",
                table: "HealthRecords");

            migrationBuilder.DropColumn(
                name: "HospitalId",
                table: "HealthRecords");

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "Prescriptions",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }
    }
}
