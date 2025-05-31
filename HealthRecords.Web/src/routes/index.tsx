import type { PatientType } from '@/types/patient';
import { type MRT_RowVirtualizer, type MRT_ColumnDef, useMantineReactTable, MantineReactTable } from 'mantine-react-table'
import { createFileRoute } from '@tanstack/react-router';
import { CustomLinkButton } from '@/components/primitives/Link';
import { type UIEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PatientAPI } from '@/api/patient';
import { zodValidator } from '@tanstack/zod-adapter';
import { IndexRouteParams } from '@/types/misc';
import { ActionIcon, Affix } from '@mantine/core';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { openContextModal } from '@mantine/modals';

const patientTableColumns: MRT_ColumnDef<PatientType>[] = [
	{
		header: 'Full Name',
		accessorKey: 'fullName'
	},
	{
		header: 'Date of Birth',
		accessorFn: row => new Date(row.dateOfBirth).toDateString(),
	},
	{
		header: 'Gender',
		accessorKey: 'gender',
	},
	{
		header: 'Address',
		accessorKey: 'address'
	},
	{
		header: 'Phone Number',
		accessorKey: 'phoneNumber'
	},
	{
		header: 'Go To Patient Details',
		accessorKey: 'id',
		Cell: ({ cell }) => {
			const patientId = cell.getValue<number>();
			return (
				<CustomLinkButton to="/patient" search={{ id: patientId }} fullWidth variant='outline' rightSection={<IconArrowRight />} >Go To Patient</CustomLinkButton>
			);
		}
	}
]

const Index = () => {
	const { fullname: fullNameSearch } = Route.useSearch();
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

	const { data: patients, fetchNextPage, hasNextPage, isError, isFetching, isLoading } = useInfiniteQuery({
		queryKey: PatientAPI.infiniteQuery.getAll.queryKey,
		queryFn: async ({ pageParam }) => await PatientAPI.infiniteQuery.getAll.queryFn(pageParam),
		initialPageParam: 0,
		refetchOnWindowFocus: false,
		getNextPageParam: (lastPage) => lastPage.cursor,
	})

	const flatPatients = useMemo(
		() => patients?.pages
		.flatMap(page => page.patients)
		.filter(patient => {
			if (!fullNameSearch) return true;
			return patient.fullName.toLowerCase().includes(fullNameSearch.toLowerCase());
		}) ?? [], 
		[patients, fullNameSearch]
	);

	const fetchMore = useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

				if (
					scrollHeight - scrollTop - clientHeight < 400 &&
					!isFetching &&
					hasNextPage
				) {
					fetchNextPage();
				}
			}
		},
		[fetchNextPage, hasNextPage, isFetching]
	)

	useEffect(() => {
		fetchMore(tableContainerRef.current);
	}, [fetchMore]);

	const patientTable = useMantineReactTable({
		columns: patientTableColumns,
		data: flatPatients,
		enablePagination: false,
		enableRowNumbers: false,
		enableRowVirtualization: true,
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
		mantineTableContainerProps: {
			ref: tableContainerRef,
			style: { maxHeight: '100%' },
			onScroll: (event: UIEvent<HTMLDivElement>) => fetchMore(event.target as HTMLDivElement)
		},
		mantineToolbarAlertBannerProps: {
			color: 'red',
			children: 'Error loading patients!',
		},
		state: {
			isLoading,
			showAlertBanner: isError,
			showProgressBars: isFetching,
		},
		rowVirtualizerInstanceRef,
		rowVirtualizerOptions: {
			overscan: 10,
		}
	})

	return (
		<>
			<MantineReactTable table={patientTable} />
			<Affix position={{ bottom: 40, right: 40 }}>
				<ActionIcon
					color="blue"
					variant="filled"
					size="input-xl"
					onClick={() =>
						openContextModal({
							modal: 'add-patient-modal',
							innerProps: {
								withCloseButton: false,
							},
						})
					}
				>
					<IconPlus size={24} />
				</ActionIcon>
			</Affix>
		</>
	);
};

export const Route = createFileRoute('/')({
	component: Index,
	validateSearch: zodValidator(IndexRouteParams)
});
