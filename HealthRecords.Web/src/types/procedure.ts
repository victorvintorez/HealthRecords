import { z } from 'zod';

export const ProcedureSchema = z.object({
	id: z.number(),
	name: z.string(),
	category: z.string(),
	notes: z.string().nullable(),
	date: z.string(),
	healthRecordId: z.number(),
	attendingDoctorId: z.number(),
});
export type ProcedureType = z.infer<typeof ProcedureSchema>;

export const ProcedureListSchema = z.array(ProcedureSchema);
export type ProcedureListType = z.infer<typeof ProcedureListSchema>;

export const CreateProcedureSchema = z.object({
	name: z.string(),
	category: z.string(),
	notes: z.string().optional(),
	date: z.string(),
	attendingDoctorId: z.number(),
});
export type CreateProcedureType = z.infer<typeof CreateProcedureSchema>;

export const UpdateProcedureSchema = z.object({
	name: z.string(),
	category: z.string(),
	notes: z.string().optional(),
	date: z.string(),
	attendingDoctorId: z.number(),
});
export type UpdateProcedureType = z.infer<typeof UpdateProcedureSchema>;
