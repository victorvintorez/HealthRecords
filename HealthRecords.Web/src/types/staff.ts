import { z } from 'zod';
import { ImageFileSchema } from './misc.ts';
import { StaffRoleEnum } from './enums.ts';

export const StaffSchema = z.object({
	id: z.number(),
	fullName: z.string(),
	department: z.string(),
	role: StaffRoleEnum,
	hospitalId: z.number(),
	hospitalName: z.string(),
	profileImageUrl: z.string(),
});
export type StaffType = z.infer<typeof StaffSchema>;

export const StaffListSchema = z.array(StaffSchema);
export type StaffListType = z.infer<typeof StaffListSchema>;

export const UpdateStaffSchema = z.object({
	fullName: z.string().optional(),
	department: z.string().optional(),
	role: StaffRoleEnum.optional(),
	hospitalId: z.number().optional(),
	profileImage: ImageFileSchema.optional(),
});
export type UpdateStaffType = z.infer<typeof UpdateStaffSchema>;
