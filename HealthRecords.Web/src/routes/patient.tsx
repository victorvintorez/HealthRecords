import { NotFoundError } from '@/errors';
import { PatientRouteParams } from '@/types/misc';
import { PatientAPI } from '@api/patient';
import { Card, Center, Divider, Grid, Skeleton, Stack, Title, Text, Flex } from '@mantine/core';
import { createFileRoute, notFound } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter';
import EmergencyContactInfo from '@components/patient/EmergencyContactInfo';
import GeneralPractitionerInfo from '@components/patient/GeneralPractitionerInfo';
import HealthRecords from '@components/patient/HealthRecords';
import PatientAllergies from '@components/patient/PatientAllergies';
import PatientPrescriptions from '@components/patient/PatientPrescriptions';
import { PatientType } from '@ctypes/patient';
import { useQuery } from '@tanstack/react-query';

const PatientRoute = () => {
  const { id: patientId } = Route.useSearch();

  const { data: patient, isLoading } = useQuery<PatientType>({
    queryKey: PatientAPI.query.getById.queryKey(patientId),
    queryFn: () => PatientAPI.query.getById.queryFn(patientId),
    staleTime: PatientAPI.query.getById.staleTime,
  });

  return (
    <Flex direction="column" gap={0} style={{ height: '100%' }}>
      {isLoading ? (
        <Center>
          <Skeleton animate height={40} w="80%" radius="md" />
        </Center>
      ) : (
        <Title order={1} ta="center" mt="xs" style={{ marginBottom: 0 }}>
          {patient?.fullName}
        </Title>
      )}
      <Divider mb="xs" />
      <Grid styles={{
        root: {
          height: '100%',
        },
        inner: {
          height: '100%',
        }
      }}>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }} h={250}>
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>General Info</Title>
            </Card.Section>
            {isLoading ? (
              <Stack gap="xs">
                <Skeleton animate height={20} width="80%" radius="md" />
                <Skeleton animate height={20} width="60%" radius="md" />
                <Skeleton animate height={20} width="90%" radius="md" />
                <Skeleton animate height={20} width="70%" radius="md" />
              </Stack>
            ) : (
              <Stack gap="xs">
                <Text size="sm"><b>Address:</b> {patient?.address}</Text>
                <Text size="sm"><b>Phone:</b> {patient?.phoneNumber}</Text>
                <Text size="sm"><b>Date of Birth:</b> {patient?.dateOfBirth.toLocaleDateString()}</Text>
                <Text size="sm"><b>Height:</b> {patient?.height}cm</Text>
                <Text size="sm"><b>Blood Type:</b> {patient?.bloodType}</Text>
              </Stack>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }} h={250}>
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>General Practitioner</Title>
            </Card.Section>
            {isLoading || !patient ? (
              <Stack gap="xs">
                <Skeleton animate height={20} width="100%" radius="md" />
                <Skeleton animate height={20} width="100%" radius="md" />
                <Skeleton animate height={20} width="100%" radius="md" />
                <Skeleton animate height={20} width="100%" radius="md" />
              </Stack>
            ) : (
              <GeneralPractitionerInfo id={patient.generalPractitionerId} />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} h={250}>
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>Emergency Contacts</Title>
            </Card.Section>
            <EmergencyContactInfo patientId={patientId} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} h={250}>
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>Allergies</Title>
            </Card.Section>
            <PatientAllergies patientId={patientId} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} h={250}>
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>Prescriptions</Title>
            </Card.Section>
            <PatientPrescriptions patientId={patientId} />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12 }} h="calc(100% - calc(2 * calc(15.625rem * var(--mantine-scale))))">
          <Card withBorder radius="md" shadow="sm" p="md" h="100%">
            <Card.Section withBorder inheritPadding py="xs" mb="xs">
              <Title order={3} fw={600}>Health Records</Title>
            </Card.Section>
            <HealthRecords patientId={patientId} />
          </Card>
        </Grid.Col>
      </Grid>
    </Flex>
  );
}

export const Route = createFileRoute('/patient')({
  component: PatientRoute,
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps: { id }, context: { queryClient } }) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: PatientAPI.query.getById.queryKey(id),
        queryFn: () => PatientAPI.query.getById.queryFn(id),
        staleTime: PatientAPI.query.getById.staleTime,
      });
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw notFound();
      }
    }
  },
  validateSearch: zodValidator(PatientRouteParams),
  notFoundComponent: () => {
    <Stack align="center" justify="center" style={{ height: '100%' }}>
      <Title order={1} style={{ color: 'red' }}>
        Not Found!
      </Title>
      <Title order={2}>
        The requested patient could not be found.
      </Title>
    </Stack>
  }
})
