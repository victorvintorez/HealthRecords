import { AppShell, Button, Divider, Text } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

const Navigation: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<AppShell.Navbar>
			<AppShell.Section grow>Main</AppShell.Section>
			<Divider my="sm" />
			<AppShell.Section>
				<Button
					fullWidth
					loading={false}
					size="lg"
					variant="light"
					radius={0}
					leftSection={<IconLogin />}
					onClick={() =>
						!location.href.includes('auth') &&
						navigate({
							to: '/auth/login',
							search: {
								redirect: location.href,
							},
						})
					}
				>
					<Text size="xl">Login/Register</Text>
				</Button>
			</AppShell.Section>
		</AppShell.Navbar>
	);
};

export default Navigation;
