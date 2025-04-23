import {
	Anchor as MantineAnchor,
	type AnchorProps as MantineAnchorProps,
	Button as MantineButton,
	type ButtonProps as MantineButtonProps,
	Menu as MantineMenu,
	type MenuItemProps as MantineMenuItemProps,
	NavLink as MantineNavLink,
	type NavLinkProps as MantineNavLinkProps
} from "@mantine/core";
import {createLink, type LinkComponent} from "@tanstack/react-router";
import React from "react";

// This is a custom Mantine Button component with Tanstack Router integration
type MantineButtonComponentProps = Omit<MantineButtonProps, 'href'>

const MantineButtonComponent = (
	{
		ref,
		...props
	}: MantineButtonComponentProps & {
		ref: React.RefObject<HTMLAnchorElement>;
	}
) => {
	return <MantineButton ref={ref} {...props} component="a"/>;
}

const CreatedLinkButtonComponent = createLink(MantineButtonComponent);

const Button: LinkComponent<typeof MantineButtonComponent> = (
	props
) => {
	return <CreatedLinkButtonComponent preload="intent" {...props} />;
}

// This is a custom Mantine NavLink component with Tanstack Router integration
type MantineNavLinkComponentProps = Omit<MantineNavLinkProps, 'href'>

const MantineNavLinkComponent = (
	{
		ref,
		...props
	}: MantineNavLinkComponentProps & {
		ref: React.RefObject<HTMLAnchorElement>;
	}
) => {
	return <MantineNavLink ref={ref} {...props} component="a"/>;
}

const CreatedNavLinkComponent = createLink(MantineNavLinkComponent);

const NavLink: LinkComponent<typeof MantineNavLinkComponent> = (
	props
) => {
	return <CreatedNavLinkComponent preload="intent" {...props} />;
}

// This is a custom Mantine Anchor component with Tanstack Router integration
type MantineAnchorComponentProps = Omit<MantineAnchorProps, 'href'>

const MantineAnchorComponent = (
	{
		ref,
		...props
	}: MantineAnchorComponentProps & {
		ref: React.RefObject<HTMLAnchorElement>;
	}
) => {
	return <MantineAnchor ref={ref} {...props} component="a"/>;
}

const CreatedAnchorComponent = createLink(MantineAnchorComponent);

const Anchor: LinkComponent<typeof MantineAnchorComponent> = (
	props
) => {
	return <CreatedAnchorComponent preload="intent" {...props} />;
}

// This is a custom Mantine Menu.Item component with Tanstack Router integration
type MantineMenuItemComponentProps = Omit<MantineMenuItemProps, 'href'>

const MantineMenuItemComponent = (
	{
		ref,
		...props
	}: MantineMenuItemComponentProps & {
		ref: React.RefObject<HTMLAnchorElement>;
	}
) => {
	return <MantineMenu.Item ref={ref} {...props} component="a"/>;
}

const CreatedMenuItemComponent = createLink(MantineMenuItemComponent);

const MenuItem: LinkComponent<typeof MantineMenuItemComponent> = (
	props
) => {
	return <CreatedMenuItemComponent preload="intent" {...props} />;
}

export const CustomLinkButton = Button;
export const CustomNavLink = NavLink;
export const CustomAnchor = Anchor;
export const CustomMenuItem = MenuItem;