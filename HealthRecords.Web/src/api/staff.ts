import {
	NotFoundError,
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '../errors.ts';
import {
	CreateStaffType,
	StaffPageResponseSchema,
	StaffPageResponseType,
	StaffSchema,
	StaffType,
	UpdateStaffType,
} from '../types/staff.ts';

// Create a staff member and user account
const postCreateStaff = async (input: CreateStaffType): Promise<void> => {
	const body = new FormData();
	body.append('Email', input.email);
	body.append('Password', input.password);
	body.append('FullName', input.fullName);
	body.append('Department', input.department);
	body.append('HospitalId', input.hospitalId.toString());
	body.append('ProfileImage', input.profileImage);

	const res = await fetch('/api/v1/staff', {
		method: 'POST',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		body,
	});

	switch (res.status) {
		case 200:
			return;
		case 400:
			throw new ValidationError(await res.text());
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

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
				throw Error(response.error.message);
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

const getStaffAll = async (page: number): Promise<StaffPageResponseType> => {
	const res = await fetch(`/api/v1/staff?page=${page}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200: {
			const response = StaffPageResponseSchema.safeParse(await res.json());
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
		createStaff: {
			mutationKey: ['createStaff'],
			mutationFn: postCreateStaff,
			invalidates: ['staff', 'self'],
		},
		deleteStaff: {
			mutationKey: ['deleteStaff'],
			mutationFn: deleteStaff,
			invalidates: ['staff', 'self'],
		},
		deleteStaffById: {
			mutationKey: ['deleteStaffById'],
			mutationFn: deleteStaffById,
			invalidates: (id: number) => ['staff', id.toString()],
		},
		updateStaff: {
			mutationKey: ['updateStaff'],
			mutationFn: updateStaff,
			invalidates: ['staff', 'self'],
		},
		updateStaffById: {
			mutationKey: ['updateStaffById'],
			mutationFn: updateStaffById,
			invalidates: (id: number) => ['staff', id.toString()],
		},
	},
	query: {
		staffSelf: {
			queryKey: ['staff', 'self'],
			queryFn: getStaffSelf,
		},
		staffById: {
			queryKey: (id: number) => ['staff', id.toString()],
			queryFn: getStaffById,
		},
	},
	infiniteQuery: {
		staffAll: {
			queryKey: ['staff', 'all'],
			queryFn: getStaffAll,
		},
	},
};
