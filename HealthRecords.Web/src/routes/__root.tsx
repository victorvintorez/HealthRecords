import { Button, Center, MantineProvider, Stack } from '@mantine/core';
import {
	type QueryClient,
	useQueryErrorResetBoundary,
} from '@tanstack/react-query';
import {
	Outlet,
	createRootRouteWithContext,
	redirect,
	useRouter,
} from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { StaffAPI } from '../api/staff.ts';
import Layout from '../components/layout/Layout.tsx';
import { UnauthorizedError } from '../errors.ts';

const TanStackRouterDevtools =
	process.env.NODE_ENV === 'development'
		? React.lazy(() =>
				import('@tanstack/router-devtools').then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			)
		: () => null;
const TanStackQueryDevtools =
	process.env.NODE_ENV === 'development'
		? React.lazy(() =>
				import('@tanstack/react-query-devtools').then((res) => ({
					default: res.ReactQueryDevtools,
				})),
			)
		: () => null;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		component: () => (
			<>
				<Layout>
					<Outlet />
				</Layout>
				<TanStackRouterDevtools
					position="bottom-right"
					toggleButtonProps={{ style: { right: '75' } }}
				/>
				<TanStackQueryDevtools
					buttonPosition="bottom-right"
					position="bottom"
				/>
			</>
		),
		beforeLoad: async ({ context: { queryClient }, location }) => {
			try {
				await queryClient.ensureQueryData({
					queryKey: StaffAPI.query.staffSelf.queryKey,
					queryFn: StaffAPI.query.staffSelf.queryFn,
				});
			} catch (e) {
				if (e instanceof UnauthorizedError && !location.href.includes('auth')) {
					throw redirect({
						to: '/auth/login',
						search: {
							redirect: location.href,
						},
					});
				}
			}
		},
		errorComponent: ({ error }) => {
			const router = useRouter();
			const queryErrorResetBoundary = useQueryErrorResetBoundary();

			useEffect(() => {
				queryErrorResetBoundary.reset();
			}, [queryErrorResetBoundary]);

			return (
				<>
					<MantineProvider>
						<Center>
							<Stack>
								{error.message}
								<Button onClick={() => router.invalidate()}>Reload</Button>
							</Stack>
						</Center>
					</MantineProvider>
					<TanStackRouterDevtools
						position="bottom-right"
						toggleButtonProps={{ style: { right: '75' } }}
					/>
					<TanStackQueryDevtools
						buttonPosition="bottom-right"
						position="bottom"
					/>
				</>
			);
		},
	},
);
