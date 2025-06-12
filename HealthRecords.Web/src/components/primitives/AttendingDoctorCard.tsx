import React from 'react';
import { Card, Stack, Text, Skeleton, Avatar } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { StaffAPI } from '@/api/staff';

interface AttendingDoctorCardProps {
  staffId: number;
}

const AttendingDoctorCard: React.FC<AttendingDoctorCardProps> = ({ staffId }) => {
  const { data: staff, isLoading, isError } = useQuery({
    queryKey: StaffAPI.query.staffById.queryKey(staffId),
    queryFn: () => StaffAPI.query.staffById.queryFn(staffId),
    staleTime: StaffAPI.query.staffById.staleTime,
  });

  if (isLoading) return <Skeleton height={40} width="100%" radius="md" />;
  if (isError || !staff) return (
    <Card withBorder radius="sm" p="xs" bg="red.1">
      <Text size="xs" c="red.7">Doctor info unavailable</Text>
    </Card>
  );

  return (
    <Card withBorder radius="sm" p="xs">
      <Stack gap={2} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Avatar src={staff.profileImageUrl} alt={staff.fullName} size="lg" radius={0} mr={8} />
        <Stack gap={2}>
          <Text size="xs" fw={700}>Attending Doctor</Text>
          <Text size="xs">Name: {staff.fullName}</Text>
          <Text size="xs">Department: {staff.department}</Text>
          <Text size="xs">Role: {staff.role}</Text>
        </Stack>
      </Stack>
    </Card>
  );
};

export default AttendingDoctorCard;
