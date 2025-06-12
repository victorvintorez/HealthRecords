import { CreateGeneralPractitionerSchema, type CreateGeneralPractitionerType } from '@/types/generalPractitioner';
import { GeneralPractitionerAPI } from '@/api/generalPractitioner';
import { Button, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const AddGeneralPractitionerModal = (props: ContextModalProps) => {
  const queryClient = useQueryClient();

  const gpForm = useForm<CreateGeneralPractitionerType>({
    mode: 'uncontrolled',
    initialValues: {
      surgeryName: '',
      address: '',
      phoneNumber: '',
      email: undefined,
      website: undefined,
    },
    validate: zodResolver(CreateGeneralPractitionerSchema),
  });

  const createGpMutation = useMutation({
    mutationKey: GeneralPractitionerAPI.mutation.create.mutationKey,
    mutationFn: (input: CreateGeneralPractitionerType) =>
      GeneralPractitionerAPI.mutation.create.mutationFn(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: GeneralPractitionerAPI.mutation.create.invalidates,
        refetchType: 'all',
      });
      notifications.show({
        title: 'General Practitioner created successfully!',
        message: 'The general practitioner has been added to the system.',
        color: 'green',
        icon: <IconCheck />,
        withBorder: true,
      });
      modals.close(props.id);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error creating general practitioner!',
        message: error.message,
        color: 'red',
        icon: <IconExclamationCircle />,
        withBorder: true,
      });
    },
  });

  return (
    <form
      id="add-general-practitioner-form"
      onSubmit={gpForm.onSubmit((values) => createGpMutation.mutate(values))}
    >
      <Stack>
        <Title order={4}>General Practitioner Details</Title>
        <TextInput
          size="md"
          label="Surgery Name"
          placeholder="Sunrise Family Practice"
          required
          {...gpForm.getInputProps('surgeryName')}
        />
        <TextInput
          size="md"
          label="Address"
          placeholder="456 Clinic Ave, City, State"
          required
          {...gpForm.getInputProps('address')}
        />
        <TextInput
          size="md"
          label="Phone Number"
          placeholder="+1 (555) 987-6543"
          required
          {...gpForm.getInputProps('phoneNumber')}
        />
        <TextInput
          size="md"
          label="Email"
          placeholder="(optional)"
          {...gpForm.getInputProps('email')}
        />
        <TextInput
          size="md"
          label="Website"
          placeholder="(optional)"
          {...gpForm.getInputProps('website')}
        />
        <Button.Group>
          <Button
            size="md"
            variant="outline"
            color="red"
            fullWidth
            onClick={() => modals.close(props.id)}
          >
            Cancel!
          </Button>
          <Button
            size="md"
            variant="outline"
            fullWidth
            color="green"
            loading={createGpMutation.isPending}
            type="submit"
          >
            Create!
          </Button>
        </Button.Group>
      </Stack>
    </form>
  );
};

export default AddGeneralPractitionerModal;
