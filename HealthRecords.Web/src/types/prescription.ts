import { z } from 'zod';

export const PrescriptionSchema = z.object({
	id: z.number(),
	name: z.string(),
	dosage: z.number(),
	dosageUnit: z.string(),
	dosagePerKilogram: z.number().nullable(),
	frequency: z.number(),
	frequencyUnit: z.string(),
	duration: z.number(),
	durationUnit: z.string(),
	patientId: z.number(),
});
export type PrescriptionType = z.infer<typeof PrescriptionSchema>;

export const PrescriptionListSchema = z.array(PrescriptionSchema);
export type PrescriptionListType = z.infer<typeof PrescriptionListSchema>;

export const CreatePrescriptionSchema = z.object({
	name: z.string(),
	dosage: z.number(),
	dosageUnit: z.string(),
	dosagePerKilogram: z.number().nullable().optional(),
	frequency: z.number(),
	frequencyUnit: z.string(),
	duration: z.number(),
	durationUnit: z.string(),
});
export type CreatePrescriptionType = z.infer<typeof CreatePrescriptionSchema>;

export const UpdatePrescriptionSchema = z.object({
	name: z.string().optional(),
	dosage: z.number().optional(),
	dosageUnit: z.string().optional(),
	dosagePerKilogram: z.number().nullable().optional(),
	frequency: z.number().optional(),
	frequencyUnit: z.string().optional(),
	duration: z.number().optional(),
	durationUnit: z.string().optional(),
});
export type UpdatePrescriptionType = z.infer<typeof UpdatePrescriptionSchema>;
