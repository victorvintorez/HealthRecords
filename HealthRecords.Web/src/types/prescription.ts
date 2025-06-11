import { z } from 'zod';
import { DosageUnitEnum, DurationUnitEnum, FrequencyUnitEnum } from './enums';

export const PrescriptionSchema = z.object({
	id: z.number(),
	name: z.string(),
	dosage: z.number(),
	dosageUnit: DosageUnitEnum,
	dosagePerKilogram: z.boolean(),
	frequency: z.number(),
	frequencyUnit: FrequencyUnitEnum,
	duration: z.number(),
	durationUnit: DurationUnitEnum,
	patientId: z.number(),
});
export type PrescriptionType = z.infer<typeof PrescriptionSchema>;

export const PrescriptionListSchema = z.array(PrescriptionSchema);
export type PrescriptionListType = z.infer<typeof PrescriptionListSchema>;

export const CreatePrescriptionSchema = z.object({
	name: z.string(),
	dosage: z.number(),
	dosageUnit: DosageUnitEnum,
	dosagePerKilogram: z.boolean(),
	frequency: z.number(),
	frequencyUnit: FrequencyUnitEnum,
	duration: z.number(),
	durationUnit: DurationUnitEnum,
});
export type CreatePrescriptionType = z.infer<typeof CreatePrescriptionSchema>;

export const UpdatePrescriptionSchema = z.object({
	name: z.string().optional(),
	dosage: z.number().optional(),
	dosageUnit: DosageUnitEnum.optional(),
	dosagePerKilogram: z.boolean().optional(),
	frequency: z.number().optional(),
	frequencyUnit: FrequencyUnitEnum.optional(),
	duration: z.number().optional(),
	durationUnit: DurationUnitEnum.optional(),
});
export type UpdatePrescriptionType = z.infer<typeof UpdatePrescriptionSchema>;
