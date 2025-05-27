import type { HospitalListType, HospitalType } from "@ctypes/hospital.ts";
import { HospitalAPI } from "@api/hospital.ts";
import AddHospitalModal from "@components/modals/AddHospitalModal.tsx";
import {
	Button,
	Combobox,
	InputBase,
	Paper,
	Stack,
	Text,
	useCombobox,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useState } from "react";

interface HospitalInputProps {
	value?: number;
	defaultValue?: number;
	label?: string;
	onChange: (value: number) => void;
	withAddHospital?: boolean;
}

export const HospitalInput = forwardRef<HTMLInputElement, HospitalInputProps>(
	({ value, defaultValue, onChange, withAddHospital = true }, ref) => {
		const [selectedHospital, setSelectedHospital] =
			useState<HospitalType | null>(null);
		const [search, setSearch] = useState("");
		const combobox = useCombobox({
			onDropdownClose: () => {
				combobox.resetSelectedOption();
			},
		});

		const { data: hospitals = [], isLoading } = useQuery<HospitalListType>({
			queryKey: HospitalAPI.query.hospitalAll.queryKey,
			queryFn: HospitalAPI.query.hospitalAll.queryFn,
			staleTime: HospitalAPI.query.hospitalAll.staleTime,
		});

		const filteredHospitals = hospitals.filter((hospital) =>
			hospital.name.toLowerCase().includes(search.toLowerCase()),
		);

		const options = filteredHospitals.map((hospital) => (
			<Combobox.Option value={hospital.id.toString()} key={hospital.id}>
				{hospital.name}
			</Combobox.Option>
		));

		useEffect(() => {
			setSearch(selectedHospital?.name || "");
			if (selectedHospital?.id) {
				onChange(selectedHospital?.id);
			}
		}, [selectedHospital, onChange]);

		return (
			<Stack gap={0}>
				<Text>Hospital</Text>
				<Paper withBorder p="md" mb="xs" radius="md" color="gray">
					{selectedHospital ? (
						<Stack gap="xs">
							<Text fw={700} size="lg">
								{selectedHospital.name}
							</Text>
							<Text size="sm">Address: {selectedHospital.address}</Text>
							<Text size="sm">Phone: {selectedHospital.phoneNumber}</Text>
						</Stack>
					) : (
						<Text c="dimmed" ta="center">
							Select A Hospital
						</Text>
					)}
				</Paper>

				<Combobox
					store={combobox}
					onOptionSubmit={(val) => {
						setSelectedHospital(
							hospitals.find((hospital) => hospital.id.toString() === val) ??
								null,
						);
						combobox.closeDropdown();
					}}
				>
					<Combobox.Target>
						<InputBase
							ref={ref}
							value={value}
							defaultValue={
								defaultValue !== 0
									? hospitals.find((hospital) => hospital.id === defaultValue)
											?.name || undefined
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
							mb={withAddHospital ? "xs" : undefined}
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
								<Combobox.Empty>No hospitals found</Combobox.Empty>
							)}
						</Combobox.Options>
					</Combobox.Dropdown>
				</Combobox>
				{withAddHospital && (
					<Button
						fullWidth
						color="gray"
						onClick={() =>
							modals.open({
								children: <AddHospitalModal />,
								withCloseButton: false,
							})
						}
					>
						Create New Hospital
					</Button>
				)}
			</Stack>
		);
	},
);

HospitalInput.displayName = "HospitalInput";
