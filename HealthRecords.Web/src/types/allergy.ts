import { z } from 'zod';
import { AllergenSeverityEnum } from './enums';

export const AllergySchema = z.object({
	id: z.number(),
	name: z.string(),
	commonName: z.string(),
	severity: AllergenSeverityEnum,
});
export type AllergyType = z.infer<typeof AllergySchema>;

export const AllergyListSchema = z.array(AllergySchema);
export type AllergyListType = z.infer<typeof AllergyListSchema>;

export const CreateAllergySchema = z.object({
	name: z.string(),
	commonName: z.string(),
	severity: AllergenSeverityEnum,
});
export type CreateAllergyType = z.infer<typeof CreateAllergySchema>;

export const UpdateAllergySchema = z.object({
	name: z.string().optional(),
	commonName: z.string().optional(),
	severity: AllergenSeverityEnum.optional(),
});
export type UpdateAllergyType = z.infer<typeof UpdateAllergySchema>;
