import type {
	GeneralPractitionerListType,
	GeneralPractitionerType,
} from "@/types/generalPractitioner";
import { GeneralPractitionerAPI } from "@/api/generalPractitioner";
import {
	Button,
	Combobox,
	InputBase,
	Paper,
	Stack,
	Text,
	useCombobox,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useState } from "react";

interface GeneralPractitionerInputProps {
	value?: number;
	defaultValue?: number;
	label?: string;
	onChange?: (value: number) => void;
}

export const GeneralPractitionerInput = forwardRef<
	HTMLInputElement,
	GeneralPractitionerInputProps
>(({ value, defaultValue, label = "General Practitioner", onChange }, ref) => {
	const [selectedGP, setSelectedGP] = useState<GeneralPractitionerType | null>(
		null,
	);
	const [search, setSearch] = useState("");
	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
		},
	});

	const { data: gps = [], isLoading } = useQuery<GeneralPractitionerListType>({
		queryKey: GeneralPractitionerAPI.query.getAll.queryKey,
		queryFn: GeneralPractitionerAPI.query.getAll.queryFn,
		staleTime: GeneralPractitionerAPI.query.getAll.staleTime,
	});

	const filteredGPs = gps.filter((gp) =>
		gp.surgeryName.toLowerCase().includes(search.toLowerCase()),
	);

	const options = filteredGPs.map((gp) => (
		<Combobox.Option value={gp.id.toString()} key={gp.id}>
			{gp.surgeryName}
		</Combobox.Option>
	));

	useEffect(() => {
		setSearch(selectedGP?.surgeryName || "");
		if (selectedGP?.id && onChange) {
			onChange(selectedGP.id);
		}
	}, [selectedGP, onChange]);

	return (
		<Stack gap={0}>
			<Text>{label}</Text>
			<Paper withBorder p="md" mb="xs" radius="md" color="gray">
				{selectedGP ? (
					<Stack gap="xs">
						<Text fw={700} size="lg">
							{selectedGP.surgeryName}
						</Text>
						<Text size="sm">Address: {selectedGP.address}</Text>
						<Text size="sm">Phone: {selectedGP.phoneNumber}</Text>
						{selectedGP.email && (
							<Text size="sm">Email: {selectedGP.email}</Text>
						)}
						{selectedGP.website && (
							<Text size="sm">Website: {selectedGP.website}</Text>
						)}
					</Stack>
				) : (
					<Text c="dimmed" ta="center">
						Select A General Practitioner
					</Text>
				)}
			</Paper>

			<Combobox
				store={combobox}
				onOptionSubmit={(val) => {
					setSelectedGP(gps.find((gp) => gp.id.toString() === val) ?? null);
					combobox.closeDropdown();
				}}
			>
				<Combobox.Target>
					<InputBase
						ref={ref}
						value={search}
						defaultValue={
							defaultValue !== 0
								? gps.find((gp) => gp.id === defaultValue)?.surgeryName ||
									undefined
								: undefined
						}
						onChange={(event) => {
							setSearch(event.currentTarget.value);
							combobox.openDropdown();
						}}
						onClick={() => combobox.openDropdown()}
						onFocus={() => combobox.openDropdown()}
						rightSection={<Combobox.Chevron />}
						rightSectionPointerEvents="none"
						mb="xs"
					/>
				</Combobox.Target>

				<Combobox.Dropdown>
					<Combobox.Options>
						{isLoading ? (
							<Combobox.Option value="loading" disabled>
								Loading...
							</Combobox.Option>
						) : options.length > 0 ? (
							options
						) : (
							<Combobox.Empty>No general practitioners found</Combobox.Empty>
						)}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
			<Button
				fullWidth
				color="gray"
				onClick={() =>
					openContextModal({
						modal: "add-general-practitioner-modal",
						innerProps: {
							withCloseButton: false,
						}
					})
				}
			>
				Create New General Practitioner
			</Button>
		</Stack>
	);
});

GeneralPractitionerInput.displayName = "GeneralPractitionerInput";
