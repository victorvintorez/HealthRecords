import { GeneralPractitionerSchema, GeneralPractitionerListSchema } from '../types/generalPractitioner';
import type {
	CreateGeneralPractitionerType,
	GeneralPractitionerType,
	UpdateGeneralPractitionerType,
} from '../types/generalPractitioner';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '../errors';

export const getGeneralPractitionerAll = async (): Promise<GeneralPractitionerType[]> => {
	const res = await fetch('/api/v1/generalpractitioner', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const response = GeneralPractitionerListSchema.safeParse(await res.json());
			if (response.success) return response.data;
			throw new ValidationError(response.error.message);
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const getGeneralPractitionerById = async (id: number): Promise<GeneralPractitionerType> => {
	const res = await fetch(`/api/v1/generalpractitioner/${id}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const response = GeneralPractitionerSchema.safeParse(await res.json());
			if (response.success) return response.data;
			throw new ValidationError(response.error.message);
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const createGeneralPractitioner = async (input: CreateGeneralPractitionerType): Promise<void> => {
	const res = await fetch('/api/v1/generalpractitioner', {
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

export const updateGeneralPractitioner = async (id: number, input: UpdateGeneralPractitionerType): Promise<void> => {
	const res = await fetch(`/api/v1/generalpractitioner/${id}`, {
		method: 'PUT',
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

export const deleteGeneralPractitionerById = async (id: number): Promise<void> => {
	const res = await fetch(`/api/v1/generalpractitioner/${id}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: return;
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const GeneralPractitionerAPI = {
	mutation: {
		create: {
			mutationKey: ['generalPractitioner', 'create'],
			mutationFn: createGeneralPractitioner,
			invalidates: ['generalPractitioner', 'all'],
		},
		update: {
			mutationKey: ['generalPractitioner', 'update'],
			mutationFn: updateGeneralPractitioner,
			invalidates: ['generalPractitioner', 'all'],
		},
		delete: {
			mutationKey: ['generalPractitioner', 'delete'],
			mutationFn: deleteGeneralPractitionerById,
			invalidates: ['generalPractitioner', 'all'],
		},
	},
	query: {
		getAll: {
			queryKey: ['generalPractitioner', 'all'],
			queryFn: getGeneralPractitionerAll,
			staleTime: 1000 * 60 * 10, // 10 minutes
		},
		getById: {
			queryKey: (id: number) => ['generalPractitioner', id],
			queryFn: getGeneralPractitionerById,
			staleTime: 1000 * 60 * 10, // 10 minutes
		},
	},
	infiniteQuery: {},
};
