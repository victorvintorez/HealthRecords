import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	APIParseError,
} from '../errors.ts';
import {
	StaffListSchema,
	StaffListType,
	StaffSchema,
	StaffType,
	UpdateStaffType,
} from '../types/staff.ts';

const getStaffSelf = async (): Promise<StaffType> => {
	const res = await fetch('/api/v1/staff', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = StaffSchema.safeParse(await res.json());
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

const getStaffAll = async (): Promise<StaffListType> => {
	const res = await fetch(`/api/v1/staff/all`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = StaffListSchema.safeParse(await res.json());
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

const getStaffById = async (id: number): Promise<StaffType> => {
	const res = await fetch(`/api/v1/staff/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = StaffSchema.safeParse(await res.json());
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

const deleteStaff = async (): Promise<void> => {
	const res = await fetch('/api/v1/staff', {
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

const deleteStaffById = async (id: number): Promise<void> => {
	const res = await fetch(`/api/v1/staff/${id}`, {
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

const updateStaff = async (input: UpdateStaffType): Promise<void> => {
	const body = new FormData();
	if (input.fullName) body.append('FullName', input.fullName);
	if (input.department) body.append('Department', input.department);
	if (input.role) body.append('Role', input.role.toString());
	if (input.hospitalId) body.append('HospitalId', input.hospitalId.toString());
	if (input.profileImage) body.append('ProfileImage', input.profileImage);

	const res = await fetch('/api/v1/staff', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		credentials: 'include',
		body,
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

const updateStaffById = async (
	id: number,
	input: UpdateStaffType,
): Promise<void> => {
	const body = new FormData();
	if (input.fullName) body.append('FullName', input.fullName);
	if (input.department) body.append('Department', input.department);
	if (input.role) body.append('Role', input.role.toString());
	if (input.hospitalId) body.append('HospitalId', input.hospitalId.toString());
	if (input.profileImage) body.append('ProfileImage', input.profileImage);

	const res = await fetch(`/api/v1/staff/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		credentials: 'include',
		body,
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

export const StaffAPI = {
	mutation: {
		deleteStaff: {
			mutationKey: ['deleteStaff'],
			mutationFn: deleteStaff,
			invalidates: ['staff', 'self'],
		},
		deleteStaffById: {
			mutationKey: ['deleteStaffById'],
			mutationFn: deleteStaffById,
			invalidates: (id: number) => ['staff', { id: id.toString() }],
		},
		updateStaff: {
			mutationKey: ['updateStaff'],
			mutationFn: updateStaff,
			invalidates: ['staff', 'self'],
		},
		updateStaffById: {
			mutationKey: ['updateStaffById'],
			mutationFn: updateStaffById,
			invalidates: (id: number) => ['staff', { id: id.toString() }],
		},
	},
	query: {
		staffSelf: {
			queryKey: ['staff', 'self'],
			queryFn: getStaffSelf,
			staleTime: 1000 * 60 * 30, // 30 Minutes
		},
		staffById: {
			queryKey: (id: number) => ['staff', { id: id.toString() }],
			queryFn: getStaffById,
			staleTime: Infinity,
		},
		staffAll: {
			queryKey: ['staff', 'all'],
			queryFn: getStaffAll,
			staleTime: Infinity,
		},
	},
};
