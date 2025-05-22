import {
	CreateHospitalType,
	HospitalListSchema,
	HospitalListType,
	HospitalSchema,
	HospitalType,
	UpdateHospitalType,
} from '@ctypes/hospital';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '../errors.ts';

const getHospitalAll = async (): Promise<HospitalListType> => {
	const res = await fetch('/api/v1/hospital', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = HospitalListSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
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

const getHospitalById = async (id: number): Promise<HospitalType> => {
	const res = await fetch(`/api/v1/hospital/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = HospitalSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
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

const createHospital = async (input: CreateHospitalType): Promise<void> => {
	const res = await fetch('/api/v1/hospital', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
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
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const deleteHospitalById = async (id: number): Promise<void> => {
	const res = await fetch(`/api/v1/hospital/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
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

const updateHospitalById = async (
	id: number,
	input: UpdateHospitalType,
): Promise<void> => {
	const res = await fetch(`/api/v1/hospital/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
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

export const HospitalAPI = {
	mutation: {
		createHospital: {
			mutationKey: ['createHospital'],
			mutationFn: createHospital,
			invalidates: ['hospital', 'all'],
		},
		deleteHospitalById: {
			mutationKey: ['deleteHospitalById'],
			mutationFn: deleteHospitalById,
			invalidates: (id: number) => [
				['hospital', id.toString()],
				['hospital', 'all'],
			],
		},
		updateHospitalById: {
			mutationKey: ['updateHospitalById'],
			mutationFn: updateHospitalById,
			invalidates: (id: number) => [
				['hospital', id.toString()],
				['hospital', 'all'],
			],
		},
	},
	query: {
		hospitalAll: {
			queryKey: ['hospital', 'all'],
			queryFn: getHospitalAll,
		},
		hospitalById: {
			queryKey: (id: number) => ['hospital', id.toString()],
			queryFn: getHospitalById,
		},
	},
};
