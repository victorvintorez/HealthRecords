import React from 'react';
import { Card, Stack, Text, Grid, Group, Divider } from '@mantine/core';
import HospitalDetailsCard from '../primitives/HospitalDetailsCard';
import AttendingDoctorCard from '../primitives/AttendingDoctorCard';
import type { HealthRecordListType } from '@/types/healthRecord';

interface HealthRecordCardProps {
  record: HealthRecordListType[number];
}

const HealthRecordCard: React.FC<HealthRecordCardProps> = ({ record }) => (
  <>
    <Text fw={700} size="md" mb={0}>{new Date(record.date).toLocaleDateString()}</Text>
    <Card withBorder radius="md" shadow="sm" p="md" mb="md" w="100%" h="min-content">
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
        <Text fw={700} size="sm" mb={4}>General Information</Text>
        <Card withBorder radius="md" shadow="sm" p="md" w="100%" h="min-content">
          <Stack gap="sm">
            <Text size="sm"><b>Reason:</b> {record.reason}</Text>
            <Text size="sm"><b>Diagnosis:</b> {record.diagnosis || 'N/A'}</Text>
            <Text size="sm"><b>Notes:</b> {record.notes || 'N/A'}</Text>
            {record.fileUrls && record.fileUrls.length > 0 && (
              <Stack gap={2}>
                <Text size="sm"><b>Files:</b></Text>
                <Stack gap={0} pl={8}>
                  {record.fileUrls.map((url, idx) => (
                    <Text size="xs" key={idx} component="a" href={url} target="_blank" rel="noopener noreferrer" c="blue.7" style={{ textDecoration: 'underline' }}>
                      File {idx + 1}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
        <Text fw={700} size="sm" mb={4}>Hospital Details</Text>
        <HospitalDetailsCard hospitalId={record.hospitalId} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
        <Text fw={700} size="sm" mb={4}>Attending Doctor</Text>
        <AttendingDoctorCard staffId={record.attendingDoctorId} />
      </Grid.Col>
    </Grid>
    </Card>
    <Divider w="100%" my="md" />
  </>
);

export default HealthRecordCard;
