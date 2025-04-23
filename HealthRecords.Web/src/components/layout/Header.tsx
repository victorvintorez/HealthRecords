import {useMantineColorScheme, AppShell, Flex, Group, Title, ActionIcon, Button, Text} from "@mantine/core";
import {FC} from "react";
import {IconLogin, IconMenu2, IconMoon, IconSun, IconSunMoon, IconX} from "@tabler/icons-react";

interface HeaderProps {
	navbarOpened: boolean;
	toggleNavbar: () => void;
}

const Header: FC<HeaderProps> = ({ navbarOpened, toggleNavbar }) => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme()

	return (
		<AppShell.Header>
			<Flex direction="row" justify="space-between" align="center" px="sm" h={80}>
				<Group>
					<Title order={1} mt="xs" style={{ verticalAlign: "middle" }}>HealthRecords</Title>
				</Group>
				<Group>
					{/* Login/Account button/menu */}
					<Button loading={false} size="lg" variant="subtle" leftSection={<IconLogin/>} onClick={() => null}>
						<Text size="xl">Login/Register</Text>
					</Button>

					{/* Toggle Color Scheme button */}
					<ActionIcon variant="transparent" onClick={toggleColorScheme} size="lg" mr="sm">
						{colorScheme === "dark" ? <IconMoon/> : colorScheme === "light" ? <IconSun/> : <IconSunMoon/>}
					</ActionIcon>

					{/* Toggle Navbar button (mobile only) */}
					<ActionIcon variant="transparent" onClick={toggleNavbar} size="lg" mr="sm" hiddenFrom="lg">
						{navbarOpened ? <IconX/> : <IconMenu2/>}
					</ActionIcon>
				</Group>
			</Flex>
		</AppShell.Header>
	)
}

export default Header;