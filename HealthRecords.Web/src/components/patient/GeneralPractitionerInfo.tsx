// Boilerplate for General Practitioner info component
import React from 'react';
import { Card, Stack, Text, Group, Anchor, Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { GeneralPractitionerAPI } from '@/api/generalPractitioner';
import type { GeneralPractitionerType } from '@/types/generalPractitioner';

interface GeneralPractitionerInfoProps {
  id: number;
}

const GeneralPractitionerInfo: React.FC<GeneralPractitionerInfoProps> = ({ id }) => {
  const { data: gp, isLoading, isError } = useQuery<GeneralPractitionerType>({
    queryKey: GeneralPractitionerAPI.query.getById.queryKey(id),
    queryFn: () => GeneralPractitionerAPI.query.getById.queryFn(id),
    staleTime: GeneralPractitionerAPI.query.getById.staleTime,
  });

  if (isLoading) return <Skeleton animate height={100} width="100%" radius="md" />;
  if (isError || !gp) return <Text c="red">Failed to load General Practitioner info.</Text>;

  return (
      <Stack gap="xs">
        <Text fw={700} size="lg">{gp.surgeryName}</Text>
        <Text size="sm"><b>Address:</b> {gp.address}</Text>
        <Text size="sm"><b>Phone:</b> {gp.phoneNumber}</Text>
        {gp.email && (
          <Text size="sm"><b>Email:</b> <Anchor href={`mailto:${gp.email}`}>{gp.email}</Anchor></Text>
        )}
        {gp.website && (
          <Text size="sm"><b>Website:</b> <Anchor href={gp.website} target="_blank" rel="noopener noreferrer">{gp.website}</Anchor></Text>
        )}
      </Stack>
  );
};

export default GeneralPractitionerInfo;
