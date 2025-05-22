import { HospitalAPI } from '@api/hospital.ts';
import { HospitalType } from '@ctypes/hospital';
import {
	Box,
	Combobox,
	InputBase,
	Paper,
	Stack,
	Text,
	useCombobox,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, FocusEvent, forwardRef, useState } from 'react';

interface HospitalInputProps {
	value?: number;
	defaultValue?: number;
	onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
	error?: string;
}

export const HospitalInput = forwardRef<>(
	(props, ref) => {
		const [search, setSearch] = useState('');
		const combobox = useCombobox({
			onDropdownClose: () => {
				combobox.resetSelectedOption();
				setSearch('');
			},
		});

		const { data: hospitals, isLoading } = useQuery({
			...HospitalAPI.query.hospitalAll,
		});

		const filteredHospitals = hospitals.filter((hospital) =>
			hospital.name.toLowerCase().includes(search.toLowerCase()),
		);

		// Find the selected hospital based on the value
		const selectedHospital = hospitals.find(
			(hospital) => hospital.id === value,
		);

		const options = filteredHospitals.map((hospital) => (
			<Combobox.Option value={hospital.id.toString()} key={hospital.id}>
				{hospital.name}
			</Combobox.Option>
		));

		return (
			<Stack gap="xs">
				<Paper
					withBorder
					p="md"
					radius="md"
					bg={selectedHospital ? 'white' : 'var(--mantine-color-gray-0)'}
				>
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
						onChange(Number(val));
						combobox.closeDropdown();
					}}
					disabled={disabled}
				>
					<Combobox.Target>
						<InputBase
							ref={ref}
							label={label}
							placeholder={placeholder}
							value={selectedHospital?.name || ''}
							onChange={(event) => {
								setSearch(event.currentTarget.value);
								combobox.openDropdown();
								if (event.currentTarget.value === '') {
									onChange(null);
								}
							}}
							onClick={() => combobox.openDropdown()}
							onFocus={() => combobox.openDropdown()}
							rightSection={<Combobox.Chevron />}
							rightSectionPointerEvents="none"
							error={error}
							required={required}
							disabled={disabled}
						/>
					</Combobox.Target>

					<Combobox.Dropdown>
						<Combobox.Search
							value={search}
							onChange={(event) => setSearch(event.currentTarget.value)}
							placeholder="Search hospitals..."
						/>
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
			</Stack>
		);
	},
);

HospitalInput.displayName = 'HospitalInput';

import { Combobox as MantineCombobox, type ComboboxProps as MantineComboboxProps } from '@mantine/core';

type MantineComboboxComponentProps = Omit<MantineComboboxProps, 'store' | 'onOptionSubmit'>


