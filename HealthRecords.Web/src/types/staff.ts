import { z } from 'zod';
import { ImageFileSchema } from './misc.ts';

export const StaffRoleSchema = z.enum(['Doctor', 'Nurse', 'Viewer']);
export type StaffRoleType = z.infer<typeof StaffRoleSchema>;

export const StaffSchema = z.object({
	id: z.number(),
	fullName: z.string(),
	department: z.string(),
	role: StaffRoleSchema,
	hospitalId: z.number(),
	hospitalName: z.string(),
	profileImageUrl: z.string(),
});
export type StaffType = z.infer<typeof StaffSchema>;

export const StaffPageResponseSchema = z.object({
	staff: z.array(StaffSchema),
	cursor: z.number().optional(),
});
export type StaffPageResponseType = z.infer<typeof StaffPageResponseSchema>;

export const CreateStaffSchema = z.object({
	email: z.string().email('Must be a valid email address.'),
	password: z
		.string()
		.min(6, 'Password must be at least 6 characters.')
		.refine(
			(v) => /[A-Z]/.test(v),
			'Password must contain at least 1 uppercase letter.',
		)
		.refine(
			(v) => /[a-z]/.test(v),
			'Password must contain at least 1 lowercase letter.',
		)
		.refine((v) => /[0-9]/.test(v), 'Password must contain at least 1 number.')
		.refine(
			(v) => /[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/.test(v),
			'Password must contain at least 1 special character.',
		),
	fullName: z.string().min(4, 'Full name must be at least 4 characters long.'),
	department: z.string(),
	hospitalId: z.number(),
	profileImage: ImageFileSchema,
});
export type CreateStaffType = z.infer<typeof CreateStaffSchema>;

export const UpdateStaffSchema = z.object({
	fullName: z.string().optional(),
	department: z.string().optional(),
	role: StaffRoleSchema.optional(),
	hospitalId: z.number().optional(),
	profileImage: ImageFileSchema.optional(),
});
export type UpdateStaffType = z.infer<typeof UpdateStaffSchema>;
