// Boilerplate for Emergency Contact info component
import React, { useState } from 'react';
import { Card, Stack, Text, Group, ScrollArea, Button, ActionIcon, UnstyledButton, Center, Skeleton, NumberInput } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmergencyContactAPI } from '@/api/emergencyContact';
import type { EmergencyContactListType } from '@/types/emergencyContact';
import { modals } from '@mantine/modals';
import { IconCheck, IconExclamationCircle, IconPlus } from '@tabler/icons-react';
import { AuthAPI } from '@/api/auth';
import { AdminAPI } from '@/api/admin';
import { notifications } from '@mantine/notifications';

interface EmergencyContactInfoProps {
    patientId: number;
}

const EmergencyContactInfo: React.FC<EmergencyContactInfoProps> = ({ patientId }) => {
    const { data: contacts = [], isLoading, isError } = useQuery<EmergencyContactListType>({
        queryKey: EmergencyContactAPI.query.emergencyContacts.queryKey(patientId),
        queryFn: () => EmergencyContactAPI.query.emergencyContacts.queryFn(patientId),
        staleTime: EmergencyContactAPI.query.emergencyContacts.staleTime,
    });

    const [generateCount, setGenerateCount] = useState<number>(1);
    const queryClient = useQueryClient();
    const { data: isAdmin } = useQuery({
        queryKey: AuthAPI.query.isAdmin.queryKey,
        queryFn: AuthAPI.query.isAdmin.queryFn,
        staleTime: AuthAPI.query.isAdmin.staleTime,
    });
    const generateMutation = useMutation({
        mutationKey: AdminAPI.mutation.generateEmergencyContacts.mutationKey(patientId),
        mutationFn: async (count: number) => await AdminAPI.mutation.generateEmergencyContacts.mutationFn({ patientId, count }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: AdminAPI.mutation.generateEmergencyContacts.invalidates(patientId),
                refetchType: 'all',
            });
            notifications.update({
                id: 'generate-contacts',
                title: 'Contacts generated!',
                message: `Successfully generated ${generateCount} emergency contacts.`,
                color: 'green',
                icon: <IconCheck />,
                withBorder: true,
            });
        },
        onError: (error: any) => {
            notifications.update({
                id: 'generate-contacts',
                title: 'Error generating contacts',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />,
                withBorder: true,
            });
        },
    });

    const handleGenerate = () => {
        notifications.show({
            id: 'generate-contacts',
            title: 'Generating Contacts',
            message: `Generating ${generateCount} emergency contacts...`,
            color: 'blue',
            icon: <IconPlus />,
            withBorder: true,
        });
        generateMutation.mutate(generateCount);
    };

    if (isError) return <Text c="red">Failed to load emergency contacts.</Text>;

    return (
        <ScrollArea type="auto" offsetScrollbars scrollbarSize={8} h={200}>
            <Stack gap="md">
                {isLoading ? (
                    <Skeleton animate height={120} width="100%" radius="md" />
                ) : contacts.map((contact) => (
                    <Card key={contact.id} withBorder radius="md" shadow="sm" p="md" w="100%" h={120}>
                        <Stack gap="sm">
                            <Text fw={700} size="md">{contact.fullName}</Text>
                            <Text size="sm">Relationship: {contact.relationship}</Text>
                            <Text size="sm">Phone: {contact.phoneNumber}</Text>
                        </Stack>
                    </Card>
                ))}
                <Card withBorder radius="md" shadow="sm" w="100%" h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UnstyledButton w="100%" h="100%"
                        onClick={() => modals.openContextModal({
                            modal: 'add-emergency-contact-modal',
                            innerProps: { patientId },
                            withCloseButton: false,
                        })} variant="light" color="blue">
                        <Stack align="center" justify="center" style={{ height: '100%' }}>
                            <IconPlus size={24} />
                            <Text ml={8} size="md">Add Emergency Contact</Text>
                        </Stack>
                    </UnstyledButton>
                </Card>
                {isAdmin && (
                    <Card withBorder radius="md" shadow="sm" w="100%" h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stack gap="xs" align="center" mt="xs">
                            <NumberInput
                                min={1}
                                max={10}
                                value={generateCount}
                                onChange={val => setGenerateCount(typeof val === 'number' ? val : 1)}
                                label="Number to generate"
                                style={{ width: 180 }}
                            />
                            <Button
                                onClick={handleGenerate}
                                loading={generateMutation.isPending}
                                fullWidth
                                color="orange"
                                mt={4}
                            >
                                Generate Emergency Contacts
                            </Button>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </ScrollArea>
    );
};

export default EmergencyContactInfo;
