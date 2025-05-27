import { LoginSchema, type LoginType } from '@ctypes/auth.ts';
import { AuthAPI } from '@api/auth.ts';
import { CustomAnchor } from '@components/primitives/Link.tsx';
import { AuthRouteParams } from '@ctypes/misc';
import {
	Button,
	Center,
	Divider,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

const LoginRouteComponent = () => {
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [passwordVisible, { toggle: togglePasswordVisible }] =
		useDisclosure(false);

	const loginForm = useForm<LoginType>({
		mode: 'uncontrolled',
		initialValues: {
			email: '',
			password: '',
			useCookies: true,
		},
		validate: zodResolver(LoginSchema),
	});

	const loginMutation = useMutation({
		mutationKey: AuthAPI.mutation.login.mutationKey,
		mutationFn: (input: LoginType) => AuthAPI.mutation.login.mutationFn(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: AuthAPI.mutation.login.invalidates,
				refetchType: 'all',
			});
			await navigate({
				to: redirect || '/',
			});
		},
		onError: (error) => {
			notifications.show({
				title: 'Error logging in!',
				message: error.message,
				color: 'red',
				icon: <IconExclamationCircle />,
				withBorder: true,
			});
		},
	});

	return (
		<Center w="100%">
			<Paper
				w="100%"
				style={{ maxWidth: '400px' }}
				shadow="lg"
				radius="md"
				withBorder
			>
				<Stack align="center" w="100%" p="lg">
					<Title order={2}>Login</Title>
					<Divider w="100%" />
					<form
						id="login-form"
						onSubmit={loginForm.onSubmit((values) =>
							loginMutation.mutate(values),
						)}
						style={{ width: '100%' }}
					>
						<Stack>
							<TextInput
								size="md"
								type="email"
								label="Email"
								placeholder="john@example.org"
								{...loginForm.getInputProps('email')}
							/>
							<PasswordInput
								size="md"
								type="password"
								label="Password"
								placeholder="********"
								visible={passwordVisible}
								onVisibilityChange={togglePasswordVisible}
								{...loginForm.getInputProps('password')}
							/>

							<Button
								size="md"
								variant="outline"
								fullWidth
								color="blue"
								loading={loginMutation.isPending}
								type="submit"
							>
								Login
							</Button>
							<Text size="sm" ta="center" mt="sm">
								Don't have an account?{' '}
								<CustomAnchor
									to="/auth/register"
									size="sm"
									search={redirect ? { redirect } : undefined}
								>
									Register here
								</CustomAnchor>
							</Text>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Center>
	);
};

export const Route = createFileRoute('/auth/login')({
	component: LoginRouteComponent,
	validateSearch: zodValidator(AuthRouteParams),
});
