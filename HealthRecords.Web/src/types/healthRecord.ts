import { z } from 'zod';
import { FileSchema } from './misc';

export const HealthRecordSchema = z.object({
	id: z.number(),
	date: z.string(),
	reason: z.string(),
	complaint: z.string(),
	notes: z.string().nullable(),
	diagnosis: z.string().nullable(),
	patientId: z.number(),
	hospitalId: z.number(),
	attendingDoctorId: z.number(),
	fileUrls: z.array(z.string()),
});
export type HealthRecordType = z.infer<typeof HealthRecordSchema>;

export const HealthRecordListSchema = z.array(HealthRecordSchema);
export type HealthRecordListType = z.infer<typeof HealthRecordListSchema>;

export const CreateHealthRecordSchema = z.object({
	date: z.string(),
	reason: z.string(),
	complaint: z.string(),
	notes: z.string().optional(),
	diagnosis: z.string().optional(),
	hospitalId: z.number(),
	attendingDoctorId: z.number(),
	files: FileSchema,
});
export type CreateHealthRecordType = z.infer<typeof CreateHealthRecordSchema>;

export const UpdateHealthRecordSchema = z.object({
	date: z.string().optional(),
	reason: z.string().optional(),
	complaint: z.string().optional(),
	notes: z.string().optional(),
	diagnosis: z.string().optional(),
	hospitalId: z.number().optional(),
	attendingDoctorId: z.number().optional(),
	files: FileSchema.optional(),
});
export type UpdateHealthRecordType = z.infer<typeof UpdateHealthRecordSchema>;
