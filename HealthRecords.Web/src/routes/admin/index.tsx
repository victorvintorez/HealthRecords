import { UnauthorizedError } from '@/errors';
import { AuthAPI } from '@api/auth';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button, NumberInput, Stack, Title, Group, Loader, Center, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AdminAPI, getAdminCounts } from '@api/admin';
import type { AdminCountType } from '@ctypes/admin';
import GenCount from '@components/primitives/GenCount'; 
import { type MRT_ColumnDef, useMantineReactTable, MantineReactTable } from 'mantine-react-table';



const AdminIndexRoute = () => {
  const queryClient = useQueryClient();
  const [patientCount, setPatientCount] = useState(1);
  const [gpCount, setGpCount] = useState(1);
  const [hospitalCount, setHospitalCount] = useState(1);

  const { data: counts = [], isLoading, isError, refetch, error, isFetching } = useQuery({
    queryKey: ['admin', 'counts'],
    queryFn: getAdminCounts,
    refetchOnWindowFocus: false,
  });

  // Mutations for generating resources

  const generateGPs = useMutation({
    mutationKey: AdminAPI.mutation.generateGeneralPractitioners.mutationKey,
    mutationFn: AdminAPI.mutation.generateGeneralPractitioners.mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'counts'] });
      queryClient.invalidateQueries({ queryKey: AdminAPI.mutation.generateGeneralPractitioners.invalidates });
      notifications.show({ title: 'General Practitioners generated', message: 'General Practitioners generated', color: 'green' });
      refetch();
    },
    onError: (error: any) => notifications.show({ title: 'Error', message: error.message, color: 'red' }),
  });
  const generateHospitals = useMutation({
    mutationKey: AdminAPI.mutation.generateHospitals.mutationKey,
    mutationFn: AdminAPI.mutation.generateHospitals.mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'counts'] });
      queryClient.invalidateQueries({ queryKey: AdminAPI.mutation.generateHospitals.invalidates });
      notifications.show({ title: 'Hospitals generated', message: 'Hospitals generated', color: 'green' });
      refetch();
    },
    onError: (error: any) => notifications.show({ title: 'Error', message: error.message, color: 'red' }),
  });

  const columns: MRT_ColumnDef<AdminCountType>[] = [
    {
      header: 'Table Name',
      accessorKey: 'tableName',
    },
    {
      header: 'Row Count',
      accessorKey: 'rowCount',
    },
    {
      header: 'Generate',
      accessorKey: 'generateFromAdminPanel',
      Cell: ({ cell }) => {
        if (cell.getValue() === false) {
          return (
            "This cannot be generated from the admin panel."
          )
        } else if (cell.row.original.tableName === 'Patients') {
          return <GenCount tableName={cell.row.original.tableName} genFor={AdminAPI.mutation.generatePatients} />
        } else if (cell.row.original.tableName === 'General Practitioners') {
          return <GenCount tableName={cell.row.original.tableName} genFor={AdminAPI.mutation.generateGeneralPractitioners} />
        } else if (cell.row.original.tableName === 'Hospitals') {
          return <GenCount tableName={cell.row.original.tableName} genFor={AdminAPI.mutation.generateHospitals} />
        } else {
          return (
            "This cannot be generated from the admin panel."
          )
        }
      },
    },
  ]

  const table = useMantineReactTable({
    columns,
    data: counts,
    enablePagination: false,
    enableRowNumbers: false,
    enableRowVirtualization: false,
    enableFilters: false,
    enableSorting: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    mantineTableProps: {
      highlightOnHover: true,
      striped: 'odd',
      withColumnBorders: true,
      withRowBorders: true,
    },
    mantineToolbarAlertBannerProps: isError ? { color: 'red', children: 'Error loading admin counts!' } : undefined,
    state: { isLoading, showAlertBanner: isError, showProgressBars: isFetching },
  });

  if (isLoading) return <Center h="60vh"><Loader size="lg" /></Center>;
  if (isError) return (
    <Center h="60vh">
      <Stack align="center">
        <Title order={3}>Failed to load admin counts</Title>
        <Text>{(error as Error)?.message || 'Unknown error'}</Text>
        <Button onClick={() => refetch()}>Retry</Button>
      </Stack>
    </Center>
  );

  return (
    <MantineReactTable table={table} />
  );
}

export const Route = createFileRoute('/admin/')({
  component: AdminIndexRoute,
  beforeLoad: async ({ context: { queryClient }, location }) => {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: AuthAPI.query.isAdmin.queryKey,
        queryFn: AuthAPI.query.isAdmin.queryFn,
        staleTime: AuthAPI.query.isAdmin.staleTime,
      });

      if (res !== true) {
        throw redirect({
          to: '/unauthorized'
        })
      }
    } catch (e) {
      if (e instanceof UnauthorizedError && !location.href.includes('auth')) {
        throw redirect({
          to: '/auth/login',
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
})
