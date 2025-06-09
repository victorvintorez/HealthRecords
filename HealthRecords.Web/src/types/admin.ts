import { z } from 'zod';

export const FakeResultSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
});
export type FakeResultType = z.infer<typeof FakeResultSchema>;

export const GeneratePatientsInputSchema = z.object({
  count: z.number().int().min(1).default(1),
});
export type GeneratePatientsInputType = z.infer<typeof GeneratePatientsInputSchema>;

export const GenerateGeneralPractitionersInputSchema = z.object({
  count: z.number().int().min(1).default(1),
});
export type GenerateGeneralPractitionersInputType = z.infer<typeof GenerateGeneralPractitionersInputSchema>;

export const GenerateAllergiesInputSchema = z.object({
  patientId: z.number().int(),
  count: z.number().int().min(1).default(1),
});
export type GenerateAllergiesInputType = z.infer<typeof GenerateAllergiesInputSchema>;

export const GenerateEmergencyContactsInputSchema = z.object({
  patientId: z.number().int(),
  count: z.number().int().min(1).default(1),
});
export type GenerateEmergencyContactsInputType = z.infer<typeof GenerateEmergencyContactsInputSchema>;

export const GenerateHealthRecordsInputSchema = z.object({
  patientId: z.number().int(),
  count: z.number().int().min(1).default(1),
});
export type GenerateHealthRecordsInputType = z.infer<typeof GenerateHealthRecordsInputSchema>;

export const GenerateHospitalsInputSchema = z.object({
  count: z.number().int().min(1).default(1),
});
export type GenerateHospitalsInputType = z.infer<typeof GenerateHospitalsInputSchema>;

export const GeneratePrescriptionsInputSchema = z.object({
  patientId: z.number().int(),
  count: z.number().int().min(1).default(1),
});
export type GeneratePrescriptionsInputType = z.infer<typeof GeneratePrescriptionsInputSchema>;

export const GenerateProceduresInputSchema = z.object({
  healthRecordId: z.number().int(),
  count: z.number().int().min(1).default(1),
});
export type GenerateProceduresInputType = z.infer<typeof GenerateProceduresInputSchema>;

export const AdminCountSchema = z.object({
  tableName: z.string(),
  rowCount: z.number().int(),
  generateFromAdminPanel: z.boolean().default(false),
});
export type AdminCountType = z.infer<typeof AdminCountSchema>;

export const AdminCountsSchema = z.array(AdminCountSchema);
export type AdminCountsType = z.infer<typeof AdminCountsSchema>;
