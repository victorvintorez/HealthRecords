import { AuthAPI } from '@api/auth.ts';
import { StaffAPI } from '@api/staff.ts';
import { AppShell, Avatar, Button, Divider, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconChevronRight,
	IconChevronUp,
	IconExclamationCircle,
	IconLogin,
	IconLogout,
	IconSettings,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

const Navigation: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	// Get current user information
	const {
		data: staffData,
		isFetching,
		isError,
	} = useQuery({
		queryKey: StaffAPI.query.staffSelf.queryKey,
		queryFn: StaffAPI.query.staffSelf.queryFn,
		staleTime: StaffAPI.query.staffSelf.staleTime,
		retry: false,
		refetchOnWindowFocus: true,
	});

	const isAuthenticated = !isError && !isFetching && !!staffData;

	// Check if the user is admin
	const { data: isAdmin = false } = useQuery({
		queryKey: AuthAPI.query.isAdmin.queryKey,
		queryFn: AuthAPI.query.isAdmin.queryFn,
		staleTime: AuthAPI.query.isAdmin.staleTime,
		retry: false,
		refetchOnWindowFocus: true,
		enabled: isAuthenticated,
	});

	// Logout mutation
	const logoutMutation = useMutation({
		mutationKey: AuthAPI.mutation.logout.mutationKey,
		mutationFn: AuthAPI.mutation.logout.mutationFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: AuthAPI.mutation.logout.invalidates,
				refetchType: 'all',
			});
			await navigate({ to: '/auth/login' });
		},
		onError: (error) => {
			notifications.show({
				title: 'Error logging out!',
				message: error.message,
				color: 'red',
				icon: <IconExclamationCircle />,
				withBorder: true,
			});
		},
	});

	return (
		<AppShell.Navbar>
			<AppShell.Section grow>Main</AppShell.Section>
			<Divider my="sm" />
			<AppShell.Section>
				{isAuthenticated ? (
					<Menu shadow="md" width={200} position="top" withArrow>
						<Menu.Target>
							<UnstyledButton
								w="100%"
								size="xl"
								p="md"
								style={{
									color: 'var(--mantine-color-text)',
								}}
							>
								<Group>
									<Avatar
											src={staffData.profileImageUrl}
											alt={staffData.fullName}
											variant="transparent"
											radius={0}
											size="lg"
										/>
										<div style={{ flex: 1 }}>
											<Text size="lg">{staffData.fullName}</Text>
											<Text size="sm" c="dimmed">
												{staffData.department}
											</Text>
										</div>
										<IconChevronRight className='mantine-visible-from-md' size={16} />
										<IconChevronUp className='mantine-hidden-from-md' size={16} />
								</Group>
							</UnstyledButton>
						</Menu.Target>

						<Menu.Dropdown>
							{isAdmin && (
								<>
									<Menu.Item
										leftSection={<IconSettings size={14} />}
										onClick={() => navigate({ to: '/admin' })}
									>
										Admin Panel
									</Menu.Item>
									<Menu.Divider />
								</>
							)}
							<Menu.Item
								color="red"
								leftSection={<IconLogout size={14} />}
								onClick={() => logoutMutation.mutate()}
								disabled={logoutMutation.isPending}
							>
								Logout
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				) : (
					<Button
						fullWidth
						loading={isFetching}
						size="lg"
						variant="light"
						radius={0}
						leftSection={<IconLogin />}
						onClick={() =>
							!location.href.includes('auth') &&
							navigate({
								to: '/auth/login',
								search: {
									redirect: location.href,
								},
							})
						}
					>
						<Text size="xl">Login/Register</Text>
					</Button>
				)}
			</AppShell.Section>
		</AppShell.Navbar>
	);
};

export default Navigation;
