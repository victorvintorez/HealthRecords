import { CreateHospitalSchema, CreateHospitalType } from '@ctypes/hospital.ts';
import { HospitalAPI } from '@api/hospital.ts';
import { Button, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const AddHospitalModal = () => {
	const queryClient = useQueryClient();

	const hospitalForm = useForm<CreateHospitalType>({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			address: '',
			phoneNumber: '',
		},
		validate: zodResolver(CreateHospitalSchema),
	});

	const createHospitalMutation = useMutation({
		mutationKey: HospitalAPI.mutation.createHospital.mutationKey,
		mutationFn: (input: CreateHospitalType) =>
			HospitalAPI.mutation.createHospital.mutationFn(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: HospitalAPI.mutation.createHospital.invalidates,
				refetchType: 'all',
			});
			notifications.show({
				title: 'Hospital created successfully!',
				message: 'The hospital has been added to the system.',
				color: 'green',
				icon: <IconCheck />,
				withBorder: true,
			});
			modals.closeAll();
		},
		onError: (error) => {
			notifications.show({
				title: 'Error creating hospital!',
				message: error.message,
				color: 'red',
				icon: <IconExclamationCircle />,
				withBorder: true,
			});
		},
	});

	return (
		<form
			id="add-hospital-form"
			onSubmit={hospitalForm.onSubmit((values) =>
				createHospitalMutation.mutate(values),
			)}
		>
			<Stack>
				<Title order={4}>Hospital Details</Title>
				<TextInput
					size="md"
					label="Hospital Name"
					placeholder="General Hospital"
					required
					{...hospitalForm.getInputProps('name')}
				/>
				<TextInput
					size="md"
					label="Address"
					placeholder="123 Medical Center Dr, City, State"
					required
					{...hospitalForm.getInputProps('address')}
				/>
				<TextInput
					size="md"
					label="Phone Number"
					placeholder="+1 (555) 123-4567"
					required
					{...hospitalForm.getInputProps('phoneNumber')}
				/>

				<Button.Group>
					<Button
						size="md"
						variant="outline"
						color="red"
						fullWidth
						onClick={modals.closeAll}
					>
						Cancel!
					</Button>
					<Button
						size="md"
						variant="outline"
						fullWidth
						color="green"
						loading={createHospitalMutation.isPending}
						type="submit"
					>
						Create!
					</Button>
				</Button.Group>
			</Stack>
		</form>
	);
};

export default AddHospitalModal;
