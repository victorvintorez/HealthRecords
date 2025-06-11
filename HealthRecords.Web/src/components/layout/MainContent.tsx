import type {FC, PropsWithChildren} from "react";
import {AppShell, Container, ScrollArea, useComputedColorScheme} from "@mantine/core";


const MainContent: FC<PropsWithChildren> = ({ children }) => {
	const colorScheme = useComputedColorScheme()

	return (
		<AppShell.Main
			style={(theme) => ({
				backgroundColor: colorScheme === "light" ? theme.colors.gray[1] : theme.colors.dark[8],
				//paddingInlineStart: "calc(300px + var(--app-shell-padding))"
				})}>
			<ScrollArea
				style={{
					height: "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"
				}}
			>
				<Container fluid py="md" h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))">
					{children}
				</Container>
			</ScrollArea>
		</AppShell.Main>
	)
}

export default MainContent;