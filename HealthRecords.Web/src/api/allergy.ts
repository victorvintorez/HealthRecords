import {
	AllergyListSchema,
	AllergyListType,
	AllergySchema,
	AllergyType,
	CreateAllergyType,
	UpdateAllergyType,
} from '@ctypes/allergy';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
	APIParseError,
} from '../errors.ts';

const getAllergies = async (patientId: number): Promise<AllergyListType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/allergy`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = AllergyListSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new APIParseError();
			}
		}
		case 401:
			throw new UnauthorizedError();
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const getAllergy = async (patientId: number, allergyId: number): Promise<AllergyType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/allergy/${allergyId}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = AllergySchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new APIParseError();
			}
		}
		case 401:
			throw new UnauthorizedError();
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const addAllergy = async (patientId: number, input: CreateAllergyType): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/allergy`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			return;
		case 400:
			throw new ValidationError(await res.text());
		case 401:
			throw new UnauthorizedError();
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const deleteAllergy = async (patientId: number, allergyId: number): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/allergy/${allergyId}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200:
			return;
		case 401:
			throw new UnauthorizedError();
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const updateAllergy = async (
	patientId: number,
	allergyId: number,
	input: UpdateAllergyType,
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/allergy/${allergyId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			return;
		case 400:
			throw new ValidationError(await res.text());
		case 401:
			throw new UnauthorizedError();
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

export const AllergyAPI = {
	mutation: {
		addAllergy: {
			mutationKey: ['addAllergy'],
			mutationFn: addAllergy,
			invalidates: (patientId: number) => [
				['allergy', { patientId: patientId.toString() }],
				['allergy', 'all'],
			],
		},
		deleteAllergy: {
			mutationKey: ['deleteAllergy'],
			mutationFn: deleteAllergy,
			invalidates: (patientId: number) => [
				['allergy', { patientId: patientId.toString() }],
				['allergy', 'all'],
			],
		},
		updateAllergy: {
			mutationKey: ['updateAllergy'],
			mutationFn: updateAllergy,
			invalidates: (patientId: number, allergyId: number) => [
				['allergy', { patientId: patientId.toString(), allergyId: allergyId.toString() }],
				['allergy', { patientId: patientId.toString() }],
				['allergy', 'all'],
			],
		},
	},
	query: {
		allergies: {
			queryKey: (patientId: number) => ['allergy', { patientId: patientId.toString() }],
			queryFn: getAllergies,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
		allergy: {
			queryKey: (patientId: number, allergyId: number) => [
				'allergy',
				{ patientId: patientId.toString(), allergyId: allergyId.toString() },
			],
			queryFn: getAllergy,
			staleTime: Infinity,
		},
	},
};
