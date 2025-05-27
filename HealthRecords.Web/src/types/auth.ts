import { ImageFileSchema } from '@ctypes/misc.ts';
import { z } from 'zod';

export const RegisterSchema = z
	.object({
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
			.refine(
				(v) => /[0-9]/.test(v),
				'Password must contain at least 1 number.',
			)
			.refine(
				(v) => /[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/.test(v),
				'Password must contain at least 1 special character.',
			),
		confirmPassword: z.string(),
		fullName: z
			.string()
			.min(4, 'Full name must be at least 4 characters long.'),
		department: z.string(),
		hospitalId: z.number(),
		profileImage: ImageFileSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});
export type RegisterType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
	email: z.string(),
	password: z.string(),
	useCookies: z.boolean().refine(() => true), // force useCookies to be true
});
export type LoginType = z.infer<typeof LoginSchema>;
