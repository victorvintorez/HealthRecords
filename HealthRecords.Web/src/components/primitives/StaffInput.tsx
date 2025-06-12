import type { StaffListType, StaffType } from "@/types/staff";
import { StaffAPI } from "@/api/staff";
import {
  Button,
  Combobox,
  InputBase,
  Paper,
  Stack,
  Text,
  useCombobox,
  Avatar,
  Group,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useState } from "react";

interface StaffInputProps {
  value?: number;
  defaultValue?: number;
  label?: string;
  onChange: (value: number) => void;
}

export const StaffInput = forwardRef<HTMLInputElement, StaffInputProps>(
  ({ value, defaultValue, onChange, label = "Staff" }, ref) => {
    const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
    const [search, setSearch] = useState("");
    const combobox = useCombobox({
      onDropdownClose: () => {
        combobox.resetSelectedOption();
      },
    });

    const { data: staff = [], isLoading } = useQuery<StaffListType>({
      queryKey: StaffAPI.query.staffAll.queryKey,
      queryFn: StaffAPI.query.staffAll.queryFn,
      staleTime: StaffAPI.query.staffAll.staleTime,
    });

    const filteredStaff = staff.filter((staff) =>
      staff.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const options = filteredStaff.map((staff) => (
      <Combobox.Option value={staff.id.toString()} key={staff.id}>
        <Group>
          <Avatar src={staff.profileImageUrl} size={24} radius="xl" />
          <span>{staff.fullName} ({staff.role})</span>
        </Group>
      </Combobox.Option>
    ));

    useEffect(() => {
      setSearch(selectedStaff?.fullName || "");
      if (selectedStaff?.id && onChange) {
        onChange(selectedStaff.id);
      }
    }, [selectedStaff, onChange]);

    return (
      <Stack gap={0}>
        <Text>{label}</Text>
        <Paper withBorder p="md" mb="xs" radius="md" color="gray">
          {selectedStaff ? (
            <Stack gap="xs">
              <Group>
                <Avatar src={selectedStaff.profileImageUrl} size={32} radius="xl" />
                <Text fw={700} size="lg">
                  {selectedStaff.fullName}
                </Text>
              </Group>
              <Text size="sm">Department: {selectedStaff.department}</Text>
              <Text size="sm">Role: {selectedStaff.role}</Text>
              <Text size="sm">Hospital: {selectedStaff.hospitalName}</Text>
            </Stack>
          ) : (
            <Text c="dimmed" ta="center">
              Select a Staff Member
            </Text>
          )}
        </Paper>

        <Combobox
          store={combobox}
          onOptionSubmit={(val) => {
            setSelectedStaff(
              staff.find((staff) => staff.id.toString() === val) ?? null
            );
            combobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
              ref={ref}
              value={search}
              defaultValue={
                defaultValue !== 0
                  ? staff.find((staff) => staff.id === defaultValue)?.fullName || undefined
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
                <Combobox.Empty>No staff found</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Stack>
    );
  }
);

StaffInput.displayName = "StaffInput";
