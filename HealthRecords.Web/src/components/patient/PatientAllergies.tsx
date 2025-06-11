// Boilerplate for Patient Allergies component
import React, { useState } from 'react';
import { Card, Stack, Text, ScrollArea, Button, UnstyledButton, Skeleton, NumberInput } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AllergyAPI } from '@/api/allergy';
import type { AllergyListType } from '@/types/allergy';
import { modals } from '@mantine/modals';
import { IconPlus, IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { AuthAPI } from '@/api/auth';
import { AdminAPI } from '@/api/admin';
import { notifications } from '@mantine/notifications';

interface PatientAllergiesProps {
    patientId: number;
}

const PatientAllergies: React.FC<PatientAllergiesProps> = ({ patientId }) => {
    const { data: allergies = [], isLoading, isError } = useQuery<AllergyListType>({
        queryKey: AllergyAPI.query.allergies.queryKey(patientId),
        queryFn: () => AllergyAPI.query.allergies.queryFn(patientId),
        staleTime: AllergyAPI.query.allergies.staleTime,
    });

    const queryClient = useQueryClient();
    const { data: isAdmin } = useQuery({
        queryKey: AuthAPI.query.isAdmin.queryKey,
        queryFn: AuthAPI.query.isAdmin.queryFn,
        staleTime: AuthAPI.query.isAdmin.staleTime,
    });

    const [generateCount, setGenerateCount] = useState<number>(1);

    const generateMutation = useMutation({
        mutationKey: AdminAPI.mutation.generateAllergies.mutationKey(patientId),
        mutationFn: async (count: number) => await AdminAPI.mutation.generateAllergies.mutationFn({ patientId, count }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: AdminAPI.mutation.generateAllergies.invalidates(patientId),
                refetchType: 'all',
            });
            notifications.update({
                id: 'generate-allergies',
                title: 'Allergies generated!',
                message: `Successfully generated ${generateCount} allergies.`,
                color: 'green',
                icon: <IconCheck />, withBorder: true,
            });
        },
        onError: (error: any) => {
            notifications.update({
                id: 'generate-allergies',
                title: 'Error generating allergies',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />,
                withBorder: true,
            });
        },
    });

    const handleGenerate = () => {
        notifications.show({
            id: 'generate-allergies',
            title: 'Generating Allergies',
            message: `Generating ${generateCount} allergies...`,
            color: 'blue',
            icon: <IconPlus />,
            withBorder: true,
        });
        generateMutation.mutate(generateCount);
    };

    if (isError) return <Text c="red">Failed to load allergies.</Text>;

    return (
        <ScrollArea type="auto" offsetScrollbars scrollbarSize={8} h={200}>
            <Stack gap="md">
                {isLoading ? (
                    <Skeleton animate height={120} width="100%" radius="md" />
                ) : allergies.map((allergy) => (
                    <Card key={allergy.id} withBorder radius="md" shadow="sm" p="md" w="100%" h={120}>
                        <Stack gap="sm">
                            <Text fw={700} size="md">{allergy.name}</Text>
                            <Text size="sm">Common Name: {allergy.commonName}</Text>
                            <Text size="sm">Severity: {allergy.severity}</Text>
                        </Stack>
                    </Card>
                ))}
                <Card withBorder radius="md" shadow="sm" w="100%" h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UnstyledButton w="100%" h="100%"
                        onClick={() => modals.openContextModal({
                            modal: 'add-allergy-modal',
                            innerProps: { patientId },
                            withCloseButton: false,
                        })}>
                        <Stack align="center" justify="center" style={{ height: '100%' }}>
                            <IconPlus size={24} />
                            <Text ml={8} size="md">Add Allergy</Text>
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
                                Generate Allergies
                            </Button>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </ScrollArea>
    );
};

export default PatientAllergies;
