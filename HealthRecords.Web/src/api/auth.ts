import { RegisterType } from "../types/auth";
import {ApiOptions} from "../types/misc.ts";

const register = async (input: RegisterType): Promise<any> => {
	const res = await fetch('api/v1/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(input)
	})
	switch (res.status) {
		case 200:
			return res.json()
		default:
			throw Error(`Unexpected status: ${res.status}`);
	}
}

export const authApi: ApiOptions = {
	mutation: {
		register: {
			mutationKey: 'register',
			mutationFn: register,
			invalidates: ['auth.user']
		}
	},
	query: {}
}