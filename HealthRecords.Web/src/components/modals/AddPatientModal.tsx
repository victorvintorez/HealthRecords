import { CreatePatientSchema, type CreatePatientType } from '@/types/patient';
import { PatientAPI } from '@/api/patient';
import { Button, Stack, TextInput, Title, NumberInput, Select } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GenderEnum, SexEnum, BloodTypeEnum } from '@/types/enums';
import { useState } from 'react';
import { GeneralPractitionerInput } from '@/components/primitives/GeneralPractitionerInput';

export const AddPatientModal = () => {
  const queryClient = useQueryClient();
  const [gpId, setGpId] = useState<number | undefined>(undefined);

  const patientForm = useForm<CreatePatientType>({
    mode: 'uncontrolled',
    initialValues: {
      fullName: '',
      address: '',
      phoneNumber: '',
      dateOfBirth: new Date(Date.now()),
      gender: GenderEnum.Values.Male,
      sex: SexEnum.Values.Male,
      weight: 0,
      height: 0,
      bloodType: BloodTypeEnum.Values.APositive,
      generalPractitionerId: 0,
    },
    validate: zodResolver(CreatePatientSchema),
  });

  const createPatientMutation = useMutation({
    mutationKey: PatientAPI.mutation.create.mutationKey,
    mutationFn: (input: CreatePatientType) =>
      PatientAPI.mutation.create.mutationFn(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PatientAPI.mutation.create.invalidates,
        refetchType: 'all',
      });
      notifications.show({
        title: 'Patient created successfully!',
        message: 'The patient has been added to the system.',
        color: 'green',
        icon: <IconCheck />,
        withBorder: true,
      });
      modals.close('add-patient-modal');
    },
    onError: (error) => {
      notifications.show({
        title: 'Error creating patient!',
        message: error.message,
        color: 'red',
        icon: <IconExclamationCircle />,
        withBorder: true,
      });
    },
  });

  return (
    <form
      id="add-patient-form"
      onSubmit={patientForm.onSubmit((values) =>
        createPatientMutation.mutate({ ...values, generalPractitionerId: gpId ?? 0 })
      )}
    >
      <Stack>
        <Title order={4}>Patient Details</Title>
        <TextInput
          size="md"
          label="Full Name"
          placeholder="Jane Doe"
          required
          {...patientForm.getInputProps('fullName')}
        />
        <TextInput
          size="md"
          label="Address"
          placeholder="123 Main St, City, State"
          required
          {...patientForm.getInputProps('address')}
        />
        <TextInput
          size="md"
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          required
          {...patientForm.getInputProps('phoneNumber')}
        />
        <DatePickerInput
          size="md"
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          required
          leftSection={<IconCalendar />}
          {...patientForm.getInputProps('dateOfBirth')}
        />
        <Select
          label="Gender"
          data={Object.values(GenderEnum.Values)}
          required
          {...patientForm.getInputProps('gender')}
        />
        <Select
          label="Sex"
          data={Object.values(SexEnum.Values)}
          required
          {...patientForm.getInputProps('sex')}
        />
        <NumberInput
          label="Weight (kg)"
          required
          min={0}
          {...patientForm.getInputProps('weight')}
        />
        <NumberInput
          label="Height (cm)"
          required
          min={0}
          {...patientForm.getInputProps('height')}
        />
        <Select
          label="Blood Type"
          data={Object.values(BloodTypeEnum.Values)}
          required
          {...patientForm.getInputProps('bloodType')}
        />
        <GeneralPractitionerInput
          label="General Practitioner"
          onChange={setGpId}
        />
        <Button.Group>
          <Button
            size="md"
            variant="outline"
            color="red"
            fullWidth
            onClick={() => modals.close('add-patient-modal')}
          >
            Cancel!
          </Button>
          <Button
            size="md"
            variant="outline"
            fullWidth
            color="green"
            loading={createPatientMutation.isPending}
            type="submit"
          >
            Create!
          </Button>
        </Button.Group>
      </Stack>
    </form>
  );
};

export default AddPatientModal;
