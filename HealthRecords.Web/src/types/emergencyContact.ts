import { z } from 'zod';

export const EmergencyContactSchema = z.object({
	id: z.number(),
	fullName: z.string(),
	relationship: z.string(), // Enum as string
	phoneNumber: z.string(),
	patientId: z.number(),
});
export type EmergencyContactType = z.infer<typeof EmergencyContactSchema>;

export const EmergencyContactListSchema = z.array(EmergencyContactSchema);
export type EmergencyContactListType = z.infer<typeof EmergencyContactListSchema>;

export const CreateEmergencyContactSchema = z.object({
	fullName: z.string(),
	relationship: z.string(), // Enum as string
	phoneNumber: z.string(),
});
export type CreateEmergencyContactType = z.infer<typeof CreateEmergencyContactSchema>;

export const UpdateEmergencyContactSchema = z.object({
	fullName: z.string().optional(),
	relationship: z.string().optional(),
	phoneNumber: z.string().optional(),
});
export type UpdateEmergencyContactType = z.infer<typeof UpdateEmergencyContactSchema>;
