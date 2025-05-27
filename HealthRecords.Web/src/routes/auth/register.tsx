import { RegisterSchema, RegisterType } from '@ctypes/auth.ts';
import { AuthAPI } from '@api/auth.ts';
import { HospitalInput } from '@components/primitives/HospitalInput.tsx';
import { CustomAnchor } from '@components/primitives/Link.tsx';
import { AuthRouteParams } from '@ctypes/misc';
import {
	Button,
	Center,
	Divider,
	FileInput,
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
import { IconExclamationCircle, IconUpload } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

const RegisterRouteComponent = () => {
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [passwordVisible, { toggle: togglePasswordVisible }] =
		useDisclosure(false);

	const registerForm = useForm<RegisterType>({
		mode: 'uncontrolled',
		initialValues: {
			email: '',
			password: '',
			confirmPassword: '',
			fullName: '',
			department: '',
			hospitalId: 0,
			profileImage: new File([], 'profile.png'),
		},
		validate: zodResolver(RegisterSchema),
	});

	const registerMutation = useMutation({
		mutationKey: AuthAPI.mutation.register.mutationKey,
		mutationFn: (input: RegisterType) =>
			AuthAPI.mutation.register.mutationFn(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: AuthAPI.mutation.register.invalidates,
				refetchType: 'all',
			});
			await navigate({
				to: redirect || '/',
			});
		},
		onError: (error) => {
			notifications.show({
				title: 'Error registering account!',
				message: error.message,
				color: 'red',
				icon: <IconExclamationCircle />,
				withBorder: true,
			});
		},
	});

	return (
		<Center>
			<Paper
				w="100%"
				style={{ maxWidth: '400px' }}
				shadow="lg"
				radius="md"
				withBorder
			>
				<Stack align="center" w="100%" p="lg">
					<Title order={2}>Sign-Up</Title>
					<Divider w="100%" />
					<form
						id="register-form"
						onSubmit={registerForm.onSubmit((values) =>
							registerMutation.mutate(values),
						)}
						style={{ width: '100%' }}
					>
						<Stack>
							<Title order={4}>Account Details</Title>
							<TextInput
								size="md"
								type="email"
								label="Email"
								placeholder="john@example.org"
								{...registerForm.getInputProps('email')}
							/>
							<PasswordInput
								size="md"
								type="password"
								label="Password"
								placeholder="********"
								visible={passwordVisible}
								onVisibilityChange={togglePasswordVisible}
								{...registerForm.getInputProps('password')}
							/>
							<PasswordInput
								size="md"
								type="password"
								label="Confirm Password"
								placeholder="********"
								visible={passwordVisible}
								onVisibilityChange={togglePasswordVisible}
								{...registerForm.getInputProps('confirmPassword')}
							/>

							<Divider w="100%" />
							<Title order={4}>Staff Details</Title>
							<TextInput
								size="md"
								label="Full Name"
								placeholder="John Doe"
								{...registerForm.getInputProps('fullName')}
							/>
							<TextInput
								size="md"
								label="Department"
								placeholder="Cardiology"
								{...registerForm.getInputProps('department')}
							/>
							<HospitalInput
								label="Hospital"
								withAddHospital={false}
								{...registerForm.getInputProps('hospitalId')}
							/>
							<FileInput
								size="md"
								label="Profile Image"
								placeholder="Upload your profile image"
								accept="image/*"
								leftSection={<IconUpload size={14} />}
								{...registerForm.getInputProps('profileImage')}
							/>

							<Button
								size="md"
								variant="outline"
								fullWidth
								color="green"
								loading={registerMutation.isPending}
								type="submit"
							>
								Sign-Up
							</Button>
							<Text size="sm" ta="center" mt="sm">
								Already have an account?{' '}
								<CustomAnchor
									to="/auth/login"
									size="sm"
									search={redirect ? { redirect } : undefined}
								>
									Login here
								</CustomAnchor>
							</Text>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Center>
	);
};

export const Route = createFileRoute('/auth/register')({
	component: RegisterRouteComponent,
	validateSearch: zodValidator(AuthRouteParams),
});
