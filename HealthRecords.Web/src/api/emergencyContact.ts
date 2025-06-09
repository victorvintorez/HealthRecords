import {
	EmergencyContactListSchema,
	EmergencyContactListType,
	EmergencyContactSchema,
	EmergencyContactType,
	CreateEmergencyContactType,
	UpdateEmergencyContactType,
} from '@ctypes/emergencyContact';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
	APIParseError,
} from '../errors.ts';

const getEmergencyContacts = async (patientId: number): Promise<EmergencyContactListType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/emergencycontact`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = EmergencyContactListSchema.safeParse(await res.json());
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

const getEmergencyContact = async (patientId: number, id: number): Promise<EmergencyContactType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/emergencycontact/${id}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = EmergencyContactSchema.safeParse(await res.json());
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

const createEmergencyContact = async (patientId: number, input: CreateEmergencyContactType): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/emergencycontact`, {
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
		case 500:
			throw new UnexpectedStatusError(res.status);
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const updateEmergencyContact = async (
	patientId: number,
	id: number,
	input: UpdateEmergencyContactType,
): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/emergencycontact/${id}`, {
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
		case 500:
			throw new UnexpectedStatusError(res.status);
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const deleteEmergencyContact = async (patientId: number, id: number): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/emergencycontact/${id}`, {
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
		case 500:
			throw new UnexpectedStatusError(res.status);
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

export const EmergencyContactAPI = {
	mutation: {
		createEmergencyContact: {
			mutationKey: ['createEmergencyContact'],
			mutationFn: createEmergencyContact,
			invalidates: (patientId: number) => [
				['emergencyContact', { patientId: patientId.toString() }],
				['emergencyContact', 'all'],
			],
		},
		updateEmergencyContact: {
			mutationKey: ['updateEmergencyContact'],
			mutationFn: updateEmergencyContact,
			invalidates: (patientId: number, id: number) => [
				['emergencyContact', { patientId: patientId.toString(), id: id.toString() }],
				['emergencyContact', { patientId: patientId.toString() }],
				['emergencyContact', 'all'],
			],
		},
		deleteEmergencyContact: {
			mutationKey: ['deleteEmergencyContact'],
			mutationFn: deleteEmergencyContact,
			invalidates: (patientId: number) => [
				['emergencyContact', { patientId: patientId.toString() }],
				['emergencyContact', 'all'],
			],
		},
	},
	query: {
		emergencyContacts: {
			queryKey: (patientId: number) => ['emergencyContact', { patientId: patientId.toString() }],
			queryFn: getEmergencyContacts,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
		emergencyContact: {
			queryKey: (patientId: number, id: number) => [
				'emergencyContact',
				{ patientId: patientId.toString(), id: id.toString() },
			],
			queryFn: getEmergencyContact,
			staleTime: Infinity,
		},
	},
};
