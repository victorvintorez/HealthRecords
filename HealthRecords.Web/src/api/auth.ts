import { RegisterType } from "../types/auth";

const register = async (input: RegisterType): Promise<boolean> => {
	const res = await fetch('api/v1/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(input)
	})
	switch (res.status) {
		case 200:
			return true
		default:
			return false
	}
}

export const authApi = {
	mutation: {
		register: {
			key: 'register',
			fn: register,
			invalidates: ['auth.user']
		}
	},
	query: {

	}
}