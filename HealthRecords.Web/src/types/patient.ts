import { z } from 'zod';
import { BloodTypeEnum, GenderEnum, SexEnum } from './enums';

export const PatientSchema = z.object({
	id: z.number(),
	fullName: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
	dateOfBirth: z.date({ coerce: true }),
	gender: GenderEnum,
	sex: SexEnum,
	weight: z.number(),
	height: z.number(),
	bloodType: BloodTypeEnum,
	generalPractitionerId: z.number().nullable().optional(),
	allergyIds: z.array(z.number()).nullable().optional(),
	emergencyContactIds: z.array(z.number()).nullable().optional(),
	prescriptionIds: z.array(z.number()).nullable().optional(),
	healthRecordIds: z.array(z.number()).nullable().optional(),
});
export type PatientType = z.infer<typeof PatientSchema>;

export const PatientListSchema = z.object({
	patients: z.array(PatientSchema),
	cursor: z.number().nullable().optional(),
});
export type PatientListType = z.infer<typeof PatientListSchema>;

export const CreatePatientSchema = z.object({
	fullName: z.string(),
	address: z.string(),
	phoneNumber: z.string(),
	dateOfBirth: z.date({ coerce: true }),
	gender: GenderEnum,
	sex: SexEnum,
	weight: z.number(),
	height: z.number(),
	bloodType: BloodTypeEnum,
	generalPractitionerId: z.number(),
});
export type CreatePatientType = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = z.object({
	fullName: z.string().optional(),
	address: z.string().optional(),
	phoneNumber: z.string().optional(),
	dateOfBirth: z.date({ coerce: true }).optional(),
	gender: GenderEnum.optional(),
	sex: SexEnum.optional(),
	weight: z.number().optional(),
	height: z.number().optional(),
	bloodType: BloodTypeEnum.optional(),
	generalPractitionerId: z.number().optional(),
});
export type UpdatePatientType = z.infer<typeof UpdatePatientSchema>;
