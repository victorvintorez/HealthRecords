// Boilerplate for Patient Prescriptions component
import React, { useState } from 'react';
import { Card, Stack, Text, ScrollArea, UnstyledButton, Skeleton, NumberInput, Button } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionAPI } from '@/api/prescription';
import type { PrescriptionListType } from '@/types/prescription';
import { modals } from '@mantine/modals';
import { IconPlus, IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { AuthAPI } from '@/api/auth';
import { AdminAPI } from '@/api/admin';
import { notifications } from '@mantine/notifications';

interface PatientPrescriptionsProps {
    patientId: number;
}

const PatientPrescriptions: React.FC<PatientPrescriptionsProps> = ({ patientId }) => {
    const { data: prescriptions = [], isLoading, isError } = useQuery<PrescriptionListType>({
        queryKey: PrescriptionAPI.query.prescriptions.queryKey(patientId),
        queryFn: () => PrescriptionAPI.query.prescriptions.queryFn(patientId),
        staleTime: PrescriptionAPI.query.prescriptions.staleTime,
    });

    const queryClient = useQueryClient();
    const { data: isAdmin } = useQuery({
        queryKey: AuthAPI.query.isAdmin.queryKey,
        queryFn: AuthAPI.query.isAdmin.queryFn,
        staleTime: AuthAPI.query.isAdmin.staleTime,
    });

    const [generateCount, setGenerateCount] = useState<number>(1);

    const generateMutation = useMutation({
        mutationKey: AdminAPI.mutation.generatePrescriptions.mutationKey(patientId),
        mutationFn: async (count: number) => await AdminAPI.mutation.generatePrescriptions.mutationFn({ patientId, count }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: AdminAPI.mutation.generatePrescriptions.invalidates(patientId),
                refetchType: 'all',
            });
            notifications.update({
                id: 'generate-prescriptions',
                title: 'Prescriptions generated!',
                message: `Successfully generated ${generateCount} prescriptions.`,
                color: 'green',
                icon: <IconCheck />, withBorder: true,
            });
        },
        onError: (error: any) => {
            notifications.update({
                id: 'generate-prescriptions',
                title: 'Error generating prescriptions',
                message: error.message,
                color: 'red',
                icon: <IconExclamationCircle />, withBorder: true,
            });
        },
    });

    const handleGenerate = () => {
        notifications.show({
            id: 'generate-prescriptions',
            title: 'Generating Prescriptions',
            message: `Generating ${generateCount} prescriptions...`,
            color: 'blue',
            icon: <IconPlus />, withBorder: true,
        });
        generateMutation.mutate(generateCount);
    };

    if (isError) return <Text c="red">Failed to load prescriptions.</Text>;

    return (
        <ScrollArea type="auto" offsetScrollbars scrollbarSize={8} h={200}>
            <Stack gap="md">
                {isLoading ? (
                    <Skeleton animate height={120} width="100%" radius="md" />
                ) : prescriptions.map((prescription) => (
                    <Card key={prescription.id} withBorder radius="md" shadow="sm" p="md" w="100%" h={120}>
                        <Stack gap="sm">
                            <Text fw={700} size="md">{prescription.name}</Text>
                            <Text size="sm">Dosage: {prescription.dosage} {prescription.dosageUnit}</Text>
                            {prescription.dosagePerKilogram !== null && (
                                <Text size="sm">Per Kg: {prescription.dosagePerKilogram} {prescription.dosageUnit}/kg</Text>
                            )}
                            <Text size="sm">Frequency: {prescription.frequency} {prescription.frequencyUnit}</Text>
                            <Text size="sm">Duration: {prescription.duration} {prescription.durationUnit}</Text>
                        </Stack>
                    </Card>
                ))}
                <Card withBorder radius="md" shadow="sm" w="100%" h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UnstyledButton w="100%" h="100%"
                        onClick={() => modals.openContextModal({
                            modal: 'add-prescription-modal',
                            innerProps: { patientId },
                            withCloseButton: false,
                        })}>
                        <Stack align="center" justify="center" style={{ height: '100%' }}>
                            <IconPlus size={24} />
                            <Text ml={8} size="md">Add Prescription</Text>
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
                                Generate Prescriptions
                            </Button>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </ScrollArea>
    );
};

export default PatientPrescriptions;
