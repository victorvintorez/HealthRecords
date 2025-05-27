import { PatientSchema, PatientListSchema } from '../types/patient';
import type { CreatePatientType, PatientListType, PatientType, UpdatePatientType } from '../types/patient';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '../errors';

export const getPatientAll = async (page = 0): Promise<PatientListType> => {
	const res = await fetch(`/api/v1/patient?page=${page}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const response = PatientListSchema.safeParse((await res.json()).patients ?? []);
			if (response.success) return response.data;
			throw new ValidationError(response.error.message);
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const getPatientById = async (id: number): Promise<PatientType> => {
	const res = await fetch(`/api/v1/patient/${id}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const response = PatientSchema.safeParse(await res.json());
			if (response.success) return response.data;
			throw new ValidationError(response.error.message);
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const createPatient = async (input: CreatePatientType, force = false): Promise<void> => {
	const res = await fetch(`/api/v1/patient?force=${force}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	});
	switch (res.status) {
		case 200: return;
		case 400: throw new ValidationError(await res.text());
		case 401: throw new UnauthorizedError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const updatePatientById = async (id: number, input: UpdatePatientType): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	});
	switch (res.status) {
		case 200: return;
		case 400: throw new ValidationError(await res.text());
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const deletePatientById = async (id: number): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${id}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: return;
		case 400: throw new ValidationError(await res.text());
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const PatientAPI = {
	mutation: {
		create: {
			mutationKey: ['patient', 'create'],
			mutationFn: createPatient,
			invalidates: ['patient', 'all'],
		},
		update: {
			mutationKey: ['patient', 'update'],
			mutationFn: updatePatientById,
			invalidates: ['patient', 'all'],
		},
		delete: {
			mutationKey: ['patient', 'delete'],
			mutationFn: deletePatientById,
			invalidates: ['patient', 'all'],
		},
	},
	query: {
		getById: {
			queryKey: (id: number) => ['patient', id],
			queryFn: getPatientById,
			staleTime: 1000 * 60 * 10, // 10 minutes
		},
	},
	infiniteQuery: {
		getAll: {
			queryKey: ['patient', 'all'],
			queryFn: getPatientAll,
			staleTime: 1000 * 60 * 10, // 10 minutes
		},
	},
};
