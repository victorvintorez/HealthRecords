import { ContextModalProps, modals } from '@mantine/modals';
import { Button, Select, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateEmergencyContactSchema, type CreateEmergencyContactType } from '@/types/emergencyContact';
import { EmergencyContactAPI } from '@/api/emergencyContact';
import { RelationshipEnum } from '@ctypes/enums';

interface AddEmergencyContactModalProps {
    patientId: number;
}

export const AddEmergencyContactModal = (props: ContextModalProps<AddEmergencyContactModalProps>) => {
    const queryClient = useQueryClient();
    const { patientId } = props.innerProps;

    const form = useForm<CreateEmergencyContactType>({
        mode: 'uncontrolled',
        initialValues: {
            fullName: '',
            relationship: RelationshipEnum.Values.Other,
            phoneNumber: '',
        },
        validate: zodResolver(CreateEmergencyContactSchema),
    });

    const mutation = useMutation({
        mutationKey: EmergencyContactAPI.mutation.createEmergencyContact.mutationKey,
        mutationFn: (input: CreateEmergencyContactType) =>
            EmergencyContactAPI.mutation.createEmergencyContact.mutationFn(patientId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: EmergencyContactAPI.query.emergencyContacts.queryKey(patientId),
                refetchType: 'all',
            });
            notifications.show({
                title: 'Contact added!',
                message: 'Emergency contact has been added.',
                color: 'green',
                icon: <IconCheck />, withBorder: true,
            });
            modals.close(props.id);
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error adding contact!',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />, withBorder: true,
            });
        },
    });

    return (
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack>
                <Title order={4}>Add Emergency Contact</Title>
                <TextInput
                    size="md"
                    label="Full Name"
                    placeholder="John Doe"
                    required
                    {...form.getInputProps('fullName')}
                />
                <Select
                    label="Relationship"
                    data={Object.values(RelationshipEnum.Values)}
                    required
                    {...form.getInputProps('relationship')}
                />
                <TextInput
                    size="md"
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    required
                    {...form.getInputProps('phoneNumber')}
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

export default AddEmergencyContactModal;
