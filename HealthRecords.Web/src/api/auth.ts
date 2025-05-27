import {
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '@/errors.ts';
import type { LoginType, RegisterType } from '@ctypes/auth';

// Create a staff member and user account
const postRegister = async (input: RegisterType): Promise<void> => {
	const body = new FormData();
	body.append('Email', input.email);
	body.append('Password', input.password);
	body.append('FullName', input.fullName);
	body.append('Department', input.department);
	body.append('HospitalId', input.hospitalId.toString());
	body.append('ProfileImage', input.profileImage);

	const res = await fetch('/api/v1/auth/register', {
		method: 'POST',
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

const postLogin = async (input: LoginType): Promise<void> => {
	const res = await fetch('/api/v1/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			return;
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postLogout = async (): Promise<void> => {
	const res = await fetch('/api/v1/auth/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({}),
	});

	switch (res.status) {
		case 200:
			return;
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const getIsAdmin = async (): Promise<boolean> => {
	const res = await fetch('/api/v1/auth/isAdmin', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200:
			return await res.json();
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

export const AuthAPI = {
	mutation: {
		register: {
			mutationKey: ['register'],
			mutationFn: postRegister,
			invalidates: ['staff', 'self'],
		},
		login: {
			mutationKey: ['login'],
			mutationFn: postLogin,
			invalidates: ['staff', 'self'],
		},
		logout: {
			mutationKey: ['logout'],
			mutationFn: postLogout,
			invalidates: ['staff', 'self'],
		},
	},
	query: {
		isAdmin: {
			queryKey: ['staff', 'self', 'isAdmin'],
			queryFn: getIsAdmin,
			staleTime: 1000 * 60 * 60 * 6, // 6 hours
		},
	},
	infiniteQuery: {},
};
