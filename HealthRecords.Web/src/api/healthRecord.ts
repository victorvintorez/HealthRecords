import {
	HealthRecordListSchema,
	HealthRecordListType,
	HealthRecordSchema,
	HealthRecordType,
	CreateHealthRecordType,
	UpdateHealthRecordType,
} from '@ctypes/healthRecord';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
	APIParseError,
} from '../errors.ts';

const getHealthRecords = async (patientId: number): Promise<HealthRecordListType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = HealthRecordListSchema.safeParse(await res.json());
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

const getHealthRecord = async (patientId: number, healthRecordId: number): Promise<HealthRecordType> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = HealthRecordSchema.safeParse(await res.json());
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

const createHealthRecord = async (patientId: number, input: CreateHealthRecordType): Promise<void> => {
	const body = new FormData();
    body.append('Date', input.date);
    body.append('Reason', input.reason);
    body.append('Complaint', input.complaint);
    if (input.notes) {
        body.append('Notes', input.notes);
    }
    if (input.diagnosis) {
        body.append('Diagnosis', input.diagnosis);
    }
    body.append('HospitalId', input.hospitalId.toString());
    body.append('AttendingDoctorId', input.attendingDoctorId.toString());
    if (input.files) {
        if (Array.isArray(input.files)) {
            input.files.forEach((file: File) => body.append('files', file));
        } else {
            body.append('files', input.files);
        }
    }

	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord`, {
		method: 'POST',
		credentials: 'include',
		body,
	});

	switch (res.status) {
		case 200:
		case 201:
			return;
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const updateHealthRecord = async (
	patientId: number,
	healthRecordId: number,
	input: UpdateHealthRecordType,
): Promise<void> => {
	const body = new FormData();
	if (input.date) body.append('Date', input.date);
    if (input.reason) body.append('Reason', input.reason);
    if (input.complaint) body.append('Complaint', input.complaint);
    if (input.notes) body.append('Notes', input.notes);
    if (input.diagnosis) body.append('Diagnosis', input.diagnosis);
    if (input.hospitalId) body.append('HospitalId', input.hospitalId.toString());
    if (input.attendingDoctorId) body.append('AttendingDoctorId', input.attendingDoctorId.toString());
    if (input.files) {
        if (Array.isArray(input.files)) {
            input.files.forEach((file: File) => body.append('files', file));
        }
        else {
            body.append('files', input.files);
        }
    }

	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}`, {
		method: 'PUT',
		credentials: 'include',
		body,
	});

	switch (res.status) {
		case 200:
			return;
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const deleteHealthRecord = async (patientId: number, healthRecordId: number): Promise<void> => {
	const res = await fetch(`/api/v1/patient/${patientId}/healthrecord/${healthRecordId}`, {
		method: 'DELETE',
		credentials: 'include',
	});

	switch (res.status) {
		case 200:
			return;
		case 404:
			throw new NotFoundError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

export const HealthRecordAPI = {
	mutation: {
		createHealthRecord: {
			mutationKey: ['createHealthRecord'],
			mutationFn: createHealthRecord,
			invalidates: (patientId: number) => [
				['healthRecord', { patientId: patientId.toString() }],
				['healthRecord', 'all'],
			],
		},
		updateHealthRecord: {
			mutationKey: ['updateHealthRecord'],
			mutationFn: updateHealthRecord,
			invalidates: (patientId: number, healthRecordId: number) => [
				['healthRecord', { patientId: patientId.toString(), healthRecordId: healthRecordId.toString() }],
				['healthRecord', { patientId: patientId.toString() }],
				['healthRecord', 'all'],
			],
		},
		deleteHealthRecord: {
			mutationKey: ['deleteHealthRecord'],
			mutationFn: deleteHealthRecord,
			invalidates: (patientId: number) => [
				['healthRecord', { patientId: patientId.toString() }],
				['healthRecord', 'all'],
			],
		},
	},
	query: {
		healthRecords: {
			queryKey: (patientId: number) => ['healthRecord', { patientId: patientId.toString() }],
			queryFn: getHealthRecords,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
		healthRecord: {
			queryKey: (patientId: number, healthRecordId: number) => [
				'healthRecord',
				{ patientId: patientId.toString(), healthRecordId: healthRecordId.toString() },
			],
			queryFn: getHealthRecord,
			staleTime: Infinity,
		},
	},
};
