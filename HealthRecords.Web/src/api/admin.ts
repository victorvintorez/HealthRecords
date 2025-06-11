import {
	FakeResultSchema, FakeResultType,
	GeneratePatientsInputType,
	GenerateGeneralPractitionersInputType,
	GenerateAllergiesInputType,
	GenerateEmergencyContactsInputType,
	GenerateHealthRecordsInputType,
	GenerateHospitalsInputType,
	GeneratePrescriptionsInputType,
	GenerateProceduresInputType,
} from '../types/admin';
import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	APIParseError,
	UnexpectedServerError,
} from '../errors';
import { AdminCountsType, AdminCountsSchema } from '../types/admin';

export const generatePatients = async (input: GeneratePatientsInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/patients?count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateGeneralPractitioners = async (input: GenerateGeneralPractitionersInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/generalpractitioners?count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateAllergies = async (input: GenerateAllergiesInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/allergies?patientId=${input.patientId}&count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateEmergencyContacts = async (input: GenerateEmergencyContactsInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/emergencycontacts?patientId=${input.patientId}&count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateHealthRecords = async (input: GenerateHealthRecordsInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/healthrecords?patientId=${input.patientId}&count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateHospitals = async (input: GenerateHospitalsInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/hospitals?count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generatePrescriptions = async (input: GeneratePrescriptionsInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/prescriptions?patientId=${input.patientId}&count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const generateProcedures = async (input: GenerateProceduresInputType): Promise<FakeResultType> => {
	const res = await fetch(`/api/v1/Admin/generate/procedures?healthRecordId=${input.healthRecordId}&count=${input.count}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	switch (res.status) {
		case 200: {
			const data = await res.json();
			const parsed = FakeResultSchema.safeParse(data);
			if (parsed.success && parsed.data.success) return parsed.data;
			throw new UnexpectedServerError(parsed.error?.message || parsed.data?.message || 'Invalid response');
		}
		case 401: throw new UnauthorizedError();
		case 404: throw new NotFoundError();
		default: throw new UnexpectedStatusError(res.status);
	}
};

export const getAdminCounts = async (): Promise<AdminCountsType> => {
  const res = await fetch('/api/v1/Admin/counts', {
    method: 'GET',
    credentials: 'include',
  });
  if (res.status === 200) {
    const json = await res.json();
    const parsed = AdminCountsSchema.safeParse(json);
    if (parsed.success) return parsed.data;
    throw new UnexpectedServerError(parsed.error?.message || 'Invalid response');
  } else {
    throw new UnexpectedStatusError(res.status);
  }
};

export const AdminAPI = {
	mutation: {
		generatePatients: {
			mutationKey: ['admin', 'generatePatients'],
			mutationFn: generatePatients,
			invalidates: ['patient', 'all'],
		},
		generateGeneralPractitioners: {
			mutationKey: ['admin', 'generateGeneralPractitioners'],
			mutationFn: generateGeneralPractitioners,
			invalidates: ['generalPractitioner', 'all'],
		},
		generateAllergies: {
			mutationKey: (patientId: number) => ['admin', 'generateAllergies', { patientId: patientId.toString() }],
			mutationFn: generateAllergies,
			invalidates: (patientId: number) => ['allergy', { patientId: patientId.toString() }, 'all'],
		},
		generateEmergencyContacts: {
			mutationKey: (patientId: number) => ['admin', 'generateEmergencyContacts', { patientId: patientId.toString() }],
			mutationFn: generateEmergencyContacts,
			invalidates: (patientId: number) => ['emergencyContact', { patientId: patientId.toString() }, 'all'],
		},
		generateHealthRecords: {
			mutationKey: (patientId: number) =>  ['admin', 'generateHealthRecords', { patientId: patientId.toString() }],
			mutationFn: generateHealthRecords,
			invalidates: (patientId: number) => ['healthRecord', { patientId: patientId.toString() }, 'all'],
		},
		generateHospitals: {
			mutationKey: ['admin', 'generateHospitals'],
			mutationFn: generateHospitals,
			invalidates: ['hospital', 'all'],
		},
		generatePrescriptions: {
			mutationKey: (patientId: number) => ['admin', 'generatePrescriptions', { patientId: patientId.toString() }],
			mutationFn: generatePrescriptions,
			invalidates: (patientId: number) => ['prescription', { patientId: patientId.toString() }, 'all'],
		},
		generateProcedures: {
			mutationKey: ['admin', 'generateProcedures'],
			mutationFn: generateProcedures,
			invalidates: ['patient', 'all'],
		},
	},
	query: {
		getAdminCounts: {
			queryKey: ['admin', 'counts'],
			queryFn: getAdminCounts,
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
};
