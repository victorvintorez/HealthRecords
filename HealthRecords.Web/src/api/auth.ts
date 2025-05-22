import {
	UnauthorizedError,
	UnexpectedStatusError,
	ValidationError,
} from '@/errors.ts';
import {
	LoginType,
	LoginWith2faRecoveryCodeType,
	LoginWith2faType,
	Manage2faForgetMachineType,
	Manage2faResetRecoveryCodesType,
	Manage2faResetSharedKeyType,
	Manage2faResponseSchema,
	Manage2faResponseType,
	Manage2faType,
	ManageInfoResponseSchema,
	ManageInfoResponseType,
	ManageInfoUpdateEmailType,
	ManageInfoUpdatePasswordType,
} from '@ctypes/auth';

const postLogin = async (input: LoginType): Promise<void> => {
	const res = await fetch('api/v1/auth/login', {
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

const postLoginWith2fa = async (input: LoginWith2faType): Promise<void> => {
	const res = await fetch('api/v1/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			return;
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postLoginWith2faRecoveryCode = async (
	input: LoginWith2faRecoveryCodeType,
): Promise<void> => {
	const res = await fetch('api/v1/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			return;
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postManage2fa = async (
	input: Manage2faType,
): Promise<Manage2faResponseType> => {
	const res = await fetch('api/v1/auth/manage/2fa', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = Manage2faResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postManage2faResetRecoveryCodes = async (
	input: Manage2faResetRecoveryCodesType,
): Promise<Manage2faResponseType> => {
	const res = await fetch('api/v1/auth/manage/2fa', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = Manage2faResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw Error(response.error.message);
			}
		default:
			throw Error(`Unexpected status: ${res.status}`);
	}
};

const postManage2faResetSharedKey = async (
	input: Manage2faResetSharedKeyType,
): Promise<Manage2faResponseType> => {
	const res = await fetch('api/v1/auth/manage/2fa', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = Manage2faResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postManage2faForgetMachine = async (
	input: Manage2faForgetMachineType,
): Promise<Manage2faResponseType> => {
	const res = await fetch('api/v1/auth/manage/2fa', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = Manage2faResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const getManageInfo = async (): Promise<ManageInfoResponseType> => {
	const res = await fetch('api/v1/auth/manage/info', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	switch (res.status) {
		case 200:
			let response = ManageInfoResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postManageInfoUpdateEmail = async (
	input: ManageInfoUpdateEmailType,
): Promise<ManageInfoResponseType> => {
	const res = await fetch('api/v1/auth/manage/info', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = ManageInfoResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postManageInfoUpdatePassword = async (
	input: ManageInfoUpdatePasswordType,
): Promise<ManageInfoResponseType> => {
	const res = await fetch('api/v1/auth/manage/info', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(input),
	});

	switch (res.status) {
		case 200:
			let response = ManageInfoResponseSchema.safeParse(await res.json());
			if (response.success) {
				return response.data;
			} else {
				throw new ValidationError(response.error.message);
			}
		case 401:
			throw new UnauthorizedError();
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

const postLogout = async (): Promise<void> => {
	const res = await fetch('api/v1/auth/logout', {
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
		default:
			throw new UnexpectedStatusError(res.status);
	}
};

export const AuthAPI = {
	mutation: {
		login: {
			mutationKey: ['login'],
			mutationFn: postLogin,
			invalidates: ['auth.user'],
		},
		loginWith2fa: {
			mutationKey: ['loginWith2fa'],
			mutationFn: postLoginWith2fa,
			invalidates: ['auth.user'],
		},
		loginWith2faRecoveryCode: {
			mutationKey: ['loginWith2faRecoveryCode'],
			mutationFn: postLoginWith2faRecoveryCode,
			invalidates: ['auth.user'],
		},
		manage2fa: {
			mutationKey: ['manage2fa'],
			mutationFn: postManage2fa,
			invalidates: ['auth.user'],
		},
		manage2faResetRecoveryCodes: {
			mutationKey: ['manage2faResetRecoveryCodes'],
			mutationFn: postManage2faResetRecoveryCodes,
			invalidates: ['auth.user'],
		},
		manage2faResetSharedKey: {
			mutationKey: ['manage2faResetSharedKey'],
			mutationFn: postManage2faResetSharedKey,
			invalidates: ['auth.user'],
		},
		manage2faForgetMachine: {
			mutationKey: ['manage2faForgetMachine'],
			mutationFn: postManage2faForgetMachine,
			invalidates: ['auth.user'],
		},
		manageInfoUpdateEmail: {
			mutationKey: ['manageInfoUpdateEmail'],
			mutationFn: postManageInfoUpdateEmail,
			invalidates: ['auth.user'],
		},
		manageInfoUpdatePassword: {
			mutationKey: ['manageInfoUpdatePassword'],
			mutationFn: postManageInfoUpdatePassword,
			invalidates: ['auth.user'],
		},
		logout: {
			mutationKey: ['logout'],
			mutationFn: postLogout,
			invalidates: ['auth.user'],
		},
	},
	query: {
		manageInfo: {
			queryKey: ['auth.user'],
			queryFn: getManageInfo,
		},
	},
	infiniteQuery: {},
};
