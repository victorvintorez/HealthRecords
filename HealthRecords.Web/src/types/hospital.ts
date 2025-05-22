import { z } from 'zod';

export const HospitalSchema = z.object({
	id: z.number(),
	name: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
});
export type HospitalType = z.infer<typeof HospitalSchema>;

export const HospitalListSchema = z.array(HospitalSchema);
export type HospitalListType = z.infer<typeof HospitalListSchema>;

export const CreateHospitalSchema = z.object({
	name: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
});
export type CreateHospitalType = z.infer<typeof CreateHospitalSchema>;

export const UpdateHospitalSchema = z.object({
	name: z.string().optional(),
	address: z.string().optional(),
	phoneNumber: z.string().optional(),
});
export type UpdateHospitalType = z.infer<typeof UpdateHospitalSchema>;
