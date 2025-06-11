// Boilerplate for Health Records component
import React, { useState } from 'react';
import { Card, Stack, Text, ScrollArea, UnstyledButton, Skeleton, Button, NumberInput } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modals } from '@mantine/modals';
import { IconPlus, IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { AuthAPI } from '@/api/auth';
import { AdminAPI } from '@/api/admin';
import { notifications } from '@mantine/notifications';
import { HealthRecordAPI } from '@/api/healthRecord';
import type { HealthRecordListType } from '@/types/healthRecord';

interface HealthRecordsProps {
  patientId: number;
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ patientId }) => {
  const { data: records = [], isLoading, isError } = useQuery<HealthRecordListType>({
    queryKey: HealthRecordAPI.query.healthRecords.queryKey(patientId),
    queryFn: () => HealthRecordAPI.query.healthRecords.queryFn(patientId),
    staleTime: HealthRecordAPI.query.healthRecords.staleTime,
  });

  const queryClient = useQueryClient();
  const { data: isAdmin } = useQuery({
    queryKey: AuthAPI.query.isAdmin.queryKey,
    queryFn: AuthAPI.query.isAdmin.queryFn,
    staleTime: AuthAPI.query.isAdmin.staleTime,
  });
  const [generateCount, setGenerateCount] = useState<number>(1);
  const generateMutation = useMutation({
    mutationKey: AdminAPI.mutation.generateHealthRecords.mutationKey(patientId),
    mutationFn: async (count: number) => await AdminAPI.mutation.generateHealthRecords.mutationFn({ patientId, count }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: AdminAPI.mutation.generateHealthRecords.invalidates(patientId),
        refetchType: 'all',
      });
      notifications.update({
        id: 'generate-health-records',
        title: 'Health Records generated!',
        message: `Successfully generated ${generateCount} health records.`,
        color: 'green',
        icon: <IconCheck />, withBorder: true,
      });
    },
    onError: (error: any) => {
      notifications.update({
        id: 'generate-health-records',
        title: 'Error generating health records',
        message: error.message,
        color: 'red',
        icon: <IconExclamationCircle />, withBorder: true,
      });
    },
  });

  const handleGenerate = () => {
    notifications.show({
      id: 'generate-health-records',
      title: 'Generating Health Records',
      message: `Generating ${generateCount} health records...`,
      color: 'blue',
      icon: <IconPlus />, withBorder: true,
    });
    generateMutation.mutate(generateCount);
  };

  const openAddHealthRecordModal = () => {
    modals.openContextModal({
      modal: 'add-health-record-modal',
      innerProps: { patientId },
      withCloseButton: false,
    });
  };

  if (isError) return <Text c="red">Failed to load health records.</Text>;

  return (
    <ScrollArea type="auto" offsetScrollbars scrollbarSize={8} h="100%">
      <Stack gap="md">
        {isLoading ? (
          <Skeleton animate height={120} width="100%" radius="md" />
        ) : records.map((record) => (
          <Card key={record.id} withBorder radius="md" shadow="sm" p="md" w="100%" h={120}>
            <Stack gap="sm">
              <Text fw={700} size="md">{record.reason}</Text>
              <Text size="sm">Date: {new Date(record.date).toLocaleDateString()}</Text>
              <Text size="sm">Diagnosis: {record.diagnosis || 'N/A'}</Text>
              <Text size="sm">Notes: {record.notes || 'N/A'}</Text>
            </Stack>
          </Card>
        ))}
        <Card withBorder radius="md" shadow="sm" w="100%" h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UnstyledButton w="100%" h="100%" onClick={openAddHealthRecordModal}>
            <Stack align="center" justify="center" style={{ height: '100%' }}>
              <IconPlus size={24} />
              <Text ml={8} size="md">Add Health Record</Text>
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
                Generate Health Records
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>
    </ScrollArea>
  );
};

export default HealthRecords;
