import { z } from 'zod';
import { RelationshipEnum } from './enums';

export const EmergencyContactSchema = z.object({
	id: z.number(),
	fullName: z.string(),
	relationship: RelationshipEnum,
	phoneNumber: z.string(),
	patientId: z.number(),
});
export type EmergencyContactType = z.infer<typeof EmergencyContactSchema>;

export const EmergencyContactListSchema = z.array(EmergencyContactSchema);
export type EmergencyContactListType = z.infer<typeof EmergencyContactListSchema>;

export const CreateEmergencyContactSchema = z.object({
	fullName: z.string(),
	relationship: RelationshipEnum,
	phoneNumber: z.string(),
});
export type CreateEmergencyContactType = z.infer<typeof CreateEmergencyContactSchema>;

export const UpdateEmergencyContactSchema = z.object({
	fullName: z.string().optional(),
	relationship: RelationshipEnum.optional(),
	phoneNumber: z.string().optional(),
});
export type UpdateEmergencyContactType = z.infer<typeof UpdateEmergencyContactSchema>;
