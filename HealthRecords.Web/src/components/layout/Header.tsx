import { CustomAnchor } from '@/components/primitives/Link.tsx';
import Logo from '@assets/patient.png';
import {
	ActionIcon,
	AppShell,
	Button,
	Flex,
	Group,
	Image,
	TextInput,
	Title,
	useMantineColorScheme,
} from '@mantine/core';
import { hasLength, useField } from '@mantine/form';
import {
	IconMenu2,
	IconMoon,
	IconSearch,
	IconSun,
	IconSunMoon,
	IconX,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

interface HeaderProps {
	navbarOpened: boolean;
	toggleNavbar: () => void;
}

const Header: FC<HeaderProps> = ({ navbarOpened, toggleNavbar }) => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const navigate = useNavigate();
	const fullNameSearchField: ReturnType<typeof useField<string>> =
		useField<string>({
			mode: 'controlled',
			initialValue: '',
			validate: (value) =>
				fullNameSearchField.isDirty() ? hasLength({ min: 4 }, '')(value) : null, // Shortest-recorded full names are Ly O and Su O
			validateOnChange: true,
		});

	return (
		<AppShell.Header>
			<Flex
				direction="row"
				justify="space-between"
				align="center"
				px="sm"
				h={80}
			>
				{/* LEFT: Logo and Site Name */}
				<CustomAnchor to="/" variant="transparent" flex="none">
					<Group>
						<Image
							src={Logo}
							w={50}
							h={50}
							style={{
								rotate: '-15deg',
								filter: colorScheme === 'dark' ? 'invert(100%)' : '',
							}}
						/>
						<Title
							order={1}
							mt="xs"
							visibleFrom="md"
							style={{
								verticalAlign: 'middle',
								color: colorScheme === 'dark' ? 'white' : 'black',
							}}
						>
							HealthRecords
						</Title>
					</Group>
				</CustomAnchor>

				{/* CENTER: Searchbar */}
				<TextInput
					{...fullNameSearchField.getInputProps()}
					size="lg"
					w="100%"
					mx="lg"
					style={{ maxWidth: '1080px' }}
					leftSection={<IconSearch />}
					placeholder="Find a patient..."
					rightSection={
						<Button
							variant="filled"
							color="green"
							h="100%"
							disabled={
								!!fullNameSearchField.error || !fullNameSearchField.isDirty()
							}
							onClick={async () => {
								await fullNameSearchField.validate();
								if (!fullNameSearchField.error) {
									const search = fullNameSearchField.getValue();
									fullNameSearchField.reset();
									return navigate({
										to: '/',
										search: {
											fullname: search,
										},
									});
								}
							}}
						>
							Go!
						</Button>
					}
					rightSectionWidth="min-content"
				/>

				<Group flex="none">
					{/* RIGHT: Toggle Color Scheme button */}
					<ActionIcon
						variant="transparent"
						onClick={toggleColorScheme}
						size="lg"
						mr="sm"
					>
						{colorScheme === 'dark' ? (
							<IconMoon />
						) : colorScheme === 'light' ? (
							<IconSun />
						) : (
							<IconSunMoon />
						)}
					</ActionIcon>

					{/* RIGHT: Toggle the Navbar button (mobile only) */}
					<ActionIcon
						variant="transparent"
						onClick={toggleNavbar}
						size="lg"
						mr="sm"
						hiddenFrom="md"
					>
						{navbarOpened ? <IconX /> : <IconMenu2 />}
					</ActionIcon>
				</Group>
			</Flex>
		</AppShell.Header>
	);
};

export default Header;
