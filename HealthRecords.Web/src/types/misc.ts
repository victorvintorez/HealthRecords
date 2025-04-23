export type ApiOptions = {
	mutation?: {
		[key: string]: {
			mutationKey: string,
			mutationFn: Function,
		}
	},
	query?: {
		[key: string]: {
			queryKey: string,
			queryFn: Function,

		}
	},
	infiniteQuery: {
		[key: string]:
	},
}