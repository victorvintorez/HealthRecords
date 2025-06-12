import React from 'react';
import { Card, Stack, Text, Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { HospitalAPI } from '@/api/hospital';

interface HospitalDetailsCardProps {
  hospitalId: number;
}

const HospitalDetailsCard: React.FC<HospitalDetailsCardProps> = ({ hospitalId }) => {
  const { data: hospital, isLoading, isError } = useQuery({
    queryKey: ["hospital", { id: hospitalId.toString() }],
    queryFn: () => HospitalAPI.query.hospitalById.queryFn(hospitalId),
    staleTime: HospitalAPI.query.hospitalById.staleTime,
  });

  if (isLoading) return <Skeleton height={40} width="100%" radius="md" />;
  if (isError || !hospital) return <Card withBorder radius="sm" p="xs" bg="red.1"><Text size="xs" c="red.7">Hospital info unavailable</Text></Card>;

  return (
    <Card withBorder radius="sm" p="xs">
      <Stack gap={2}>
        <Text size="xs" fw={700}>Hospital</Text>
        <Text size="xs">Name: {hospital.name}</Text>
        <Text size="xs">Address: {hospital.address}</Text>
        <Text size="xs">Phone: {hospital.phoneNumber || 'N/A'}</Text>
      </Stack>
    </Card>
  );
};

export default HospitalDetailsCard;
