import { CreateStaffSchema, CreateStaffType } from '@/types/staff.ts';
import { HospitalAPI } from '@api/hospital.ts';
import { StaffAPI } from '@api/staff.ts';
import { AuthRouteParams } from '@ctypes/misc';
import {
	Button,
	Center,
	Divider,
	FileInput,
	NumberInput,
	Paper,
	Stack,
	TextInput,
	Title,
	useCombobox,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconExclamationCircle, IconUpload } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

const RegisterRouteComponent = () => {
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
		},
	});
	const { data: hospitals, isLoading } = useQuery({
		queryKey: HospitalAPI.query.hospitalAll.queryKey,
		queryFn: HospitalAPI.query.hospitalAll.queryFn,
	});

	const registerForm = useForm<CreateStaffType>({
		mode: 'uncontrolled',
		initialValues: {
			email: '',
			password: '',
			fullName: '',
			department: '',
			hospitalId: 0,
			profileImage: new File([], 'profile.png'),
		},
		validate: zodResolver(CreateStaffSchema),
	});

	const registerMutation = useMutation({
		mutationKey: StaffAPI.mutation.createStaff.mutationKey,
		mutationFn: (input: CreateStaffType) =>
			StaffAPI.mutation.createStaff.mutationFn(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: StaffAPI.mutation.createStaff.invalidates,
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
			<Paper w="max-content" shadow="lg" radius="md" withBorder>
				<Stack align="center" w="100%" p="lg">
					<Title order={2}>Sign-Up</Title>
					<Divider w="100%" />
					<form
						id="register-form"
						onSubmit={registerForm.onSubmit((values) =>
							registerMutation.mutate(values),
						)}
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
							<TextInput
								size="md"
								type="password"
								label="Password"
								placeholder="********"
								{...registerForm.getInputProps('password')}
							/>

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
							<NumberInput
								size="md"
								label="Hospital ID"
								placeholder="1"
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
