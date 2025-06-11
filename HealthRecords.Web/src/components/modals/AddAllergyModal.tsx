import { ContextModalProps, modals } from '@mantine/modals';
import { Button, Stack, TextInput, Title, Select } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateAllergySchema, type CreateAllergyType } from '@/types/allergy';
import { AllergyAPI } from '@/api/allergy';
import { AllergenSeverityEnum } from '@ctypes/enums';

interface AddAllergyModalProps {
    patientId: number;
}

export const AddAllergyModal = (props: ContextModalProps<AddAllergyModalProps>) => {
    const queryClient = useQueryClient();
    const { patientId } = props.innerProps;

    const form = useForm<CreateAllergyType>({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            commonName: '',
            severity: AllergenSeverityEnum.Values.One,
        },
        validate: zodResolver(CreateAllergySchema),
    });

    const mutation = useMutation({
        mutationKey: AllergyAPI.mutation.addAllergy.mutationKey,
        mutationFn: (input: CreateAllergyType) =>
            AllergyAPI.mutation.addAllergy.mutationFn(patientId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: AllergyAPI.query.allergies.queryKey(patientId),
                refetchType: 'all',
            });
            notifications.show({
                title: 'Allergy added!',
                message: 'Allergy has been added to the patient.',
                color: 'green',
                icon: <IconCheck />, withBorder: true,
            });
            modals.close(props.id);
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error adding allergy!',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />, withBorder: true,
            });
        },
    });

    return (
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack>
                <Title order={4}>Add Allergy</Title>
                <TextInput
                    size="md"
                    label="Allergy Name"
                    placeholder="Arachis hypogaea"
                    required
                    {...form.getInputProps('name')}
                />
                <TextInput
                    size="md"
                    label="Common Name"
                    placeholder="Peanut"
                    required
                    {...form.getInputProps('commonName')}
                />
                <Select
                    label="Severity"
                    data={Object.values(AllergenSeverityEnum.Values)}
                    required
                    {...form.getInputProps('severity')}
                />
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

export default AddAllergyModal;
