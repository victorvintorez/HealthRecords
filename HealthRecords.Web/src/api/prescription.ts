import {
	PrescriptionListSchema,
	PrescriptionListType,
	PrescriptionSchema,
	PrescriptionType,
	CreatePrescriptionType,
	UpdatePrescriptionType,
} from '@ctypes/prescription';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
	APIParseError,
} from '../errors.ts';

const getPrescriptions = async (patientId: number): Promise<PrescriptionListType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/prescription`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = PrescriptionListSchema.safeParse(await res.json());
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

const getPrescription = async (patientId: number, prescriptionId: number): Promise<PrescriptionType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/prescription/${prescriptionId}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = PrescriptionSchema.safeParse(await res.json());
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

const createPrescription = async (patientId: number, input: CreatePrescriptionType): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/prescription`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
		case 201:
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

const updatePrescription = async (
	patientId: number,
	prescriptionId: number,
	input: UpdatePrescriptionType,
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/prescription/${prescriptionId}`, {
		method: 'PUT',
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

const deletePrescription = async (patientId: number, prescriptionId: number): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/prescription/${prescriptionId}`, {
		method: 'DELETE',
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

export const PrescriptionAPI = {
	mutation: {
		createPrescription: {
			mutationKey: ['createPrescription'],
			mutationFn: createPrescription,
			invalidates: (patientId: number) => [
				['prescription', { patientId: patientId.toString() }],
				['prescription', 'all'],
			],
		},
		updatePrescription: {
			mutationKey: ['updatePrescription'],
			mutationFn: updatePrescription,
			invalidates: (patientId: number, prescriptionId: number) => [
				['prescription', { patientId: patientId.toString(), prescriptionId: prescriptionId.toString() }],
				['prescription', { patientId: patientId.toString() }],
				['prescription', 'all'],
			],
		},
		deletePrescription: {
			mutationKey: ['deletePrescription'],
			mutationFn: deletePrescription,
			invalidates: (patientId: number) => [
				['prescription', { patientId: patientId.toString() }],
				['prescription', 'all'],
			],
		},
	},
	query: {
		prescriptions: {
			queryKey: (patientId: number) => ['prescription', { patientId: patientId.toString() }],
			queryFn: getPrescriptions,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
		prescription: {
			queryKey: (patientId: number, prescriptionId: number) => [
				'prescription',
				{ patientId: patientId.toString(), prescriptionId: prescriptionId.toString() },
			],
			queryFn: getPrescription,
			staleTime: Infinity,
		},
	},
};
