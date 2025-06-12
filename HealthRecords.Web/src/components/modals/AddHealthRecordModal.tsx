import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Button, Stack, TextInput, Title, FileInput, Select, Textarea, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCheck, IconExclamationCircle, IconCalendar } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HealthRecordAPI } from '@/api/healthRecord';
import { CreateHealthRecordSchema, type CreateHealthRecordType } from '@/types/healthRecord';
import { useState } from 'react';
import { HospitalInput } from '@components/primitives/HospitalInput.tsx';
import { StaffInput } from '@components/primitives/StaffInput';
import { IntakeReasonEnum } from '@/types/enums';

// Helper for reasons
const dummyReasons = IntakeReasonEnum.options.map(r => ({ value: r, label: r }));

export const AddHealthRecordModal = (props: ContextModalProps<{ patientId: number }>) => {
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<File[]>([]);

  const form = useForm<CreateHealthRecordType>({
    mode: 'uncontrolled',
    initialValues: {
      date: new Date().toISOString().slice(0, 10),
      reason: IntakeReasonEnum.Values.Other,
      complaint: '',
      notes: '',
      diagnosis: '',
      hospitalId: 1,
      attendingDoctorId: 1,
      files: [],
    },
    validate: zodResolver(CreateHealthRecordSchema),
  });

  const createMutation = useMutation({
    mutationKey: HealthRecordAPI.mutation.createHealthRecord.mutationKey,
    mutationFn: (input: CreateHealthRecordType) =>
      HealthRecordAPI.mutation.createHealthRecord.mutationFn(props.innerProps.patientId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: HealthRecordAPI.mutation.createHealthRecord.invalidates(props.innerProps.patientId),
        refetchType: 'all',
      });
      notifications.show({
        title: 'Health Record created!',
        message: 'The health record has been added.',
        color: 'green',
        icon: <IconCheck />, withBorder: true,
      });
      modals.close(props.id);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error creating health record!',
        message: error.message,
        color: 'red',
        icon: <IconExclamationCircle />, withBorder: true,
      });
    },
  });

  return (
    <form
      id="add-health-record-form"
      onSubmit={form.onSubmit((values) => {
        createMutation.mutate({
          ...values,
        });
      })}
    >
      <Stack>
        <Title order={4}>Add Health Record</Title>
        <DatePickerInput
          size="md"
          label="Date"
          required
          leftSection={<IconCalendar />}
          value={new Date(form.values.date)}
          onChange={date => form.setFieldValue('date', date ? date.toISOString().slice(0, 10) : '')}
        />
        <Select
          label="Reason"
          data={Object.values(IntakeReasonEnum.Values)}
          required
          {...form.getInputProps('reason')}
        />
        <TextInput
          size="md"
          label="Complaint"
          required
          {...form.getInputProps('complaint')}
        />
        <Textarea
          size="md"
          label="Notes"
          {...form.getInputProps('notes')}
        />
        <TextInput
          size="md"
          label="Diagnosis"
          {...form.getInputProps('diagnosis')}
        />
        <HospitalInput
          label="Hospital"
          value={form.values.hospitalId}
          onChange={val => form.setFieldValue('hospitalId', val)}
          withAddHospital={true}
        />
        <StaffInput
          label="Attending Doctor"
          value={form.values.attendingDoctorId}
          onChange={val => form.setFieldValue('attendingDoctorId', val)}
        />
        <FileInput
          label="Attach Files"
          multiple
          value={fileList}
          onChange={setFileList}
        />
        <Group grow>
          <Button
            size="md"
            variant="outline"
            color="red"
            onClick={() => modals.close(props.id)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="outline"
            color="green"
            loading={createMutation.isPending}
            type="submit"
          >
            Create
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AddHealthRecordModal;
