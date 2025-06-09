import {
	ProcedureListSchema,
	ProcedureListType,
	ProcedureSchema,
	ProcedureType,
	CreateProcedureType,
	UpdateProcedureType,
} from '@ctypes/procedure';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
	APIParseError,
} from '../errors.ts';

const getProcedures = async (
	patientId: number,
	healthRecordId: number
): Promise<ProcedureListType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}/procedure`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = ProcedureListSchema.safeParse(await res.json());
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

const getProcedure = async (
	patientId: number,
	healthRecordId: number,
	procedureId: number
): Promise<ProcedureType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}/procedure/${procedureId}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = ProcedureSchema.safeParse(await res.json());
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

const createProcedure = async (
	patientId: number,
	healthRecordId: number,
	input: CreateProcedureType
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}/procedure`, {
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

const updateProcedure = async (
	patientId: number,
	healthRecordId: number,
	procedureId: number,
	input: UpdateProcedureType
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}/procedure/${procedureId}`, {
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

const deleteProcedure = async (
	patientId: number,
	healthRecordId: number,
	procedureId: number
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}/procedure/${procedureId}`, {
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

export const ProcedureAPI = {
	mutation: {
		createProcedure: {
			mutationKey: ['createProcedure'],
			mutationFn: createProcedure,
			invalidates: (patientId: number, healthRecordId: number) => [
				['procedure', { patientId: patientId.toString(), healthRecordId: healthRecordId.toString() }],
				['procedure', 'all'],
			],
		},
		updateProcedure: {
			mutationKey: ['updateProcedure'],
			mutationFn: updateProcedure,
			invalidates: (patientId: number, healthRecordId: number, procedureId: number) => [
				['procedure', { patientId: patientId.toString(), healthRecordId: healthRecordId.toString(), procedureId: procedureId.toString() }],
				['procedure', { patientId: patientId.toString(), healthRecordId: healthRecordId.toString() }],
				['procedure', 'all'],
			],
		},
		deleteProcedure: {
			mutationKey: ['deleteProcedure'],
			mutationFn: deleteProcedure,
			invalidates: (patientId: number, healthRecordId: number) => [
				['procedure', { patientId: patientId.toString(), healthRecordId: healthRecordId.toString() }],
				['procedure', 'all'],
			],
		},
	},
	query: {
		procedures: {
			queryKey: (patientId: number, healthRecordId: number) => [
				'procedure',
				{ patientId: patientId.toString(), healthRecordId: healthRecordId.toString() },
			],
			queryFn: getProcedures,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
		procedure: {
			queryKey: (patientId: number, healthRecordId: number, procedureId: number) => [
				'procedure',
				{ patientId: patientId.toString(), healthRecordId: healthRecordId.toString(), procedureId: procedureId.toString() },
			],
			queryFn: getProcedure,
			staleTime: Infinity,
		},
	},
};
