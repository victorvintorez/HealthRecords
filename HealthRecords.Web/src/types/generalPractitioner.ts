import { z } from 'zod';

export const GeneralPractitionerSchema = z.object({
	id: z.number(),
	surgeryName: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
	email: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
});
export type GeneralPractitionerType = z.infer<typeof GeneralPractitionerSchema>;

export const GeneralPractitionerListSchema = z.array(GeneralPractitionerSchema);
export type GeneralPractitionerListType = z.infer<typeof GeneralPractitionerListSchema>;

export const CreateGeneralPractitionerSchema = z.object({
	surgeryName: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
	email: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
});
export type CreateGeneralPractitionerType = z.infer<typeof CreateGeneralPractitionerSchema>;

export const UpdateGeneralPractitionerSchema = z.object({
	surgeryName: z.string().optional(),
	address: z.string().optional(),
	phoneNumber: z.string().optional(),
	email: z.string().optional(),
	website: z.string().optional(),
});
export type UpdateGeneralPractitionerType = z.infer<typeof UpdateGeneralPractitionerSchema>;
