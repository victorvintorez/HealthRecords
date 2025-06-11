import { ContextModalProps, modals } from '@mantine/modals';
import { Button, Stack, TextInput, Title, NumberInput, Select, Group, Checkbox } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePrescriptionSchema, type CreatePrescriptionType } from '@/types/prescription';
import { PrescriptionAPI } from '@/api/prescription';
import { DosageUnitEnum, DurationUnitEnum, FrequencyUnitEnum } from '@ctypes/enums';

interface AddPrescriptionModalProps {
    patientId: number;
}

export const AddPrescriptionModal = (props: ContextModalProps<AddPrescriptionModalProps>) => {
    const queryClient = useQueryClient();
    const { patientId } = props.innerProps;

    const form = useForm<CreatePrescriptionType>({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            dosage: 0,
            dosageUnit: DosageUnitEnum.Values.Milligrams,
            dosagePerKilogram: false,
            frequency: 0,
            frequencyUnit: FrequencyUnitEnum.Values.Daily,
            duration: 0,
            durationUnit: DurationUnitEnum.Values.Days,
        },
        validate: zodResolver(CreatePrescriptionSchema),
    });

    const mutation = useMutation({
        mutationKey: PrescriptionAPI.mutation.createPrescription.mutationKey,
        mutationFn: (input: CreatePrescriptionType) =>
            PrescriptionAPI.mutation.createPrescription.mutationFn(patientId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: PrescriptionAPI.query.prescriptions.queryKey(patientId),
                refetchType: 'all',
            });
            notifications.show({
                title: 'Prescription added!',
                message: 'Prescription has been added to the patient.',
                color: 'green',
                icon: <IconCheck />, withBorder: true,
            });
            modals.close(props.id);
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error adding prescription!',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />, withBorder: true,
            });
        },
    });

    return (
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack>
                <Title order={4}>Add Prescription</Title>
                <TextInput
                    size="md"
                    label="Name"
                    placeholder="Vicodin"
                    required
                    {...form.getInputProps('name')}
                />
                <Group grow>
                    <NumberInput
                        size="md"
                        label="Dosage"
                        placeholder="30"
                        required
                        min={0}
                        {...form.getInputProps('dosage')}
                    />
                    <Select
                        label="Dosage Unit"
                        data={Object.values(DosageUnitEnum.Values)}
                        required
                        {...form.getInputProps('dosageUnit')}
                    />
                    <Checkbox
                        size="md"
                        label="Dosage Per Kilogram"
                        {...form.getInputProps('dosagePerKilogram')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        size="md"
                        label="Frequency"
                        placeholder="4"
                        required
                        min={0}
                        {...form.getInputProps('frequency')}
                    />
                    <Select
                        label="Frequency Unit"
                        data={Object.values(FrequencyUnitEnum.Values)}
                        required
                        {...form.getInputProps('frequencyUnit')}
                    />
                </Group>
                <Group grow>
                    {form.values.durationUnit !== DurationUnitEnum.Values.Infinity && (
                        <NumberInput
                            size="md"
                            label="Duration"
                            placeholder="7"
                            required
                            min={0}
                            {...form.getInputProps('duration')}
                        />
                    )}
                    <Select
                        label="Duration Unit"
                        data={Object.values(DurationUnitEnum.Values)}
                        required
                        {...form.getInputProps('durationUnit')}
                    />
                </Group>
                <Button.Group>
                    <Button
                        size="md"
                        variant="outline"
                        color="red"
                        fullWidth
                        onClick={() => modals.close(props.id)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="md"
                        variant="outline"
                        fullWidth
                        color="green"
                        loading={mutation.isPending}
                        type="submit"
                    >
                        Add
                    </Button>
                </Button.Group>
            </Stack>
        </form>
    );
};

export default AddPrescriptionModal;
