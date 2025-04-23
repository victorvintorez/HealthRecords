import {z} from "zod";

export const StaffRoleSchema = z.enum(["Doctor", "Nurse", "Viewer"]);
export type StaffRoleType = z.infer<typeof StaffRoleSchema>;

export const StaffSchema = z.object({
	Id: z.number(),
	FullName: z.string(),
	Department: z.string(),
	Role: StaffRoleSchema,
	HospitalId: z.number(),
	HospitalName: z.string(),
	ProfileImageUrl: z.string(),
})
export type StaffType = z.infer<typeof StaffSchema>;

export const StaffPageSchema = z.object({
	Staff: z.array(StaffSchema),
	Cursor: z.number().optional(),
})
export type StaffPageType = z.infer<typeof StaffPageSchema>;