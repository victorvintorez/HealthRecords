export type ApiOptions = {
	mutation?: {
		[key: string]: {
			mutationKey: string,
			mutationFn: Function,
			invalidates?: string[],
		}
	},
	query?: {
		[key: string]: {
			queryKey: string,
			queryFn: Function,

		}
	},
	infiniteQuery?: {
		[key: string]: {
			queryKey: string,
			queryFn: Function,
		}
	},
}