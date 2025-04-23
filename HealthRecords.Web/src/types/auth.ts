import {z} from "zod";

export const RegisterSchema = z.object({
	email: z.string(),
	password: z.string(),
})
export type RegisterType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
	email: z.string(),
	password: z.string(),
	useCookies: z.boolean().refine(v => v), // force useCookies to be true
})
export type LoginType = z.infer<typeof LoginSchema>;

export const LoginWith2faSchema = LoginSchema.extend({
	twoFactorCode: z.string(),
})
export type LoginWith2faType = z.infer<typeof LoginWith2faSchema>;

export const LoginWith2faRecoveryCodeSchema = LoginSchema.extend({
	recoveryCode: z.string(),
})
export type LoginWith2faRecoveryCodeType = z.infer<typeof LoginWith2faRecoveryCodeSchema>;

export const Manage2faSchema = z.object({
	enable: z.boolean(),
	twoFactorCode: z.string(),
})
export type Manage2faType = z.infer<typeof Manage2faSchema>;

export const Manage2faResponseSchema = z.object({
	sharedKey: z.string(),
	recoveryCodesLeft: z.number(),
	recoveryCodes: z.array(z.string()).or(z.null()),
	isTwoFactorEnabled: z.boolean(),
	isMachineRemembered: z.boolean(),
})
export type Manage2faResponseType = z.infer<typeof Manage2faResponseSchema>;

export const Manage2faResetRecoveryCodesSchema = z.object({
	resetRecoveryCodes: z.boolean(),
})
export type Manage2faResetRecoveryCodesType = z.infer<typeof Manage2faResetRecoveryCodesSchema>;

export const Manage2faResetSharedKeySchema = z.object({
	resetSharedKey: z.boolean(),
})
export type Manage2faResetSharedKeyType = z.infer<typeof Manage2faResetSharedKeySchema>;

export const Manage2faForgetMachineSchema = z.object({
	forgetMachine: z.boolean(),
})
export type Manage2faForgetMachineType = z.infer<typeof Manage2faForgetMachineSchema>;

export const ManageInfoUpdateEmailSchema = z.object({
	newEmail: z.string(),
})
export type ManageInfoUpdateEmailType = z.infer<typeof ManageInfoUpdateEmailSchema>;

export const ManageInfoUpdatePasswordSchema = z.object({
	newPassword: z.string(),
	oldPassword: z.string(),
})
export type ManageInfoUpdatePasswordType = z.infer<typeof ManageInfoUpdatePasswordSchema>;