import { z } from "zod";

export const SexEnum = z.enum([
	"Male",
	"Female",
	"TransMaleToFemale",
	"TransFemaleToMale",
	"Intersex",
	"Other",
]);
export type SexEnumType = z.infer<typeof SexEnum>;

export const ProcedureCategoryEnum = z.enum([
	"Surgery",
	"BloodAnalysis",
	"DiagnosticImaging",
	"PhysicalExamination",
	"Biopsy",
	"Radiotherapy",
	"Other",
]);
export type ProcedureCategoryEnumType = z.infer<typeof ProcedureCategoryEnum>;

export const IntakeReasonEnum = z.enum([
	"Appointment",
	"FollowUp",
	"Emergency",
	"Transfer",
	"Referral",
	"Other",
]);
export type IntakeReasonEnumType = z.infer<typeof IntakeReasonEnum>;

export const StaffRoleEnum = z.enum(["Doctor", "Nurse", "Viewer"]);
export type StaffRoleEnumType = z.infer<typeof StaffRoleEnum>;

export const DurationUnitEnum = z.enum([
	"Hours",
	"Days",
	"Weeks",
	"Months",
	"Years",
	"Infinity",
]);
export type DurationUnitEnumType = z.infer<typeof DurationUnitEnum>;

export const FrequencyUnitEnum = z.enum([
	"Hourly",
	"Daily",
	"Weekly",
	"Monthly",
]);
export type FrequencyUnitEnumType = z.infer<typeof FrequencyUnitEnum>;

export const DosageUnitEnum = z.enum([
	"Grams",
	"Milligrams",
	"Milliliters",
	"CubicCentimeters",
]);
export type DosageUnitEnumType = z.infer<typeof DosageUnitEnum>;

export const RelationshipEnum = z.enum([
	"Parent",
	"Child",
	"Sibling",
	"Partner",
	"Guardian",
	"Friend",
	"Other",
]);
export type RelationshipEnumType = z.infer<typeof RelationshipEnum>;

export const AllergenSeverityEnum = z.enum(["One", "Two", "Three", "Four", "Five"]);
export type AllergenSeverityEnumType = z.infer<typeof AllergenSeverityEnum>;

export const BloodTypeEnum = z.enum([
	"APositive",
	"ANegative",
	"BPositive",
	"BNegative",
	"OPositive",
	"ONegative",
	"ABPositive",
	"ABNegative",
]);
export type BloodTypeEnumType = z.infer<typeof BloodTypeEnum>;

export const GenderEnum = z.enum(["Male", "Female", "NonBinary", "Other"]);
export type GenderEnumType = z.infer<typeof GenderEnum>;