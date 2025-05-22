import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import {FC, PropsWithChildren} from "react";
import {useDisclosure} from "@mantine/hooks";
import {AppShell, MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";
import Header from "./Header.tsx";
import MainContent from "./MainContent.tsx";
import Navigation from "./Navigation.tsx";

const Layout: FC<PropsWithChildren> = ({ children }) => {
	const [navbarOpened, {toggle: toggleNavbar}] = useDisclosure(false);

	return (
		<MantineProvider defaultColorScheme="auto">
			<Notifications/>
			<ModalsProvider>
				<AppShell withBorder header={{ height: 80 }} navbar={{ width: 300, breakpoint: "md", collapsed: { desktop: false, mobile: !navbarOpened }}}>
					<Header navbarOpened={navbarOpened} toggleNavbar={toggleNavbar}/>
					<Navigation/>
					<MainContent>
						{children}
					</MainContent>
				</AppShell>
			</ModalsProvider>
		</MantineProvider>
	)
}

export default Layout;