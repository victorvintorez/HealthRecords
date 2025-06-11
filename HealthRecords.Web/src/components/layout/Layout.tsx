import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import './Layout.module.css'
import type {FC, PropsWithChildren} from "react";
import {useDisclosure} from "@mantine/hooks";
import {AppShell, MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";
import Header from "./Header.tsx";
import MainContent from "./MainContent.tsx";
import Navigation from "./Navigation.tsx";
import AddGeneralPractitionerModal from '../modals/AddGeneralPractitionerModal.tsx';
import AddHospitalModal from '../modals/AddHospitalModal.tsx';
import AddPatientModal from '../modals/AddPatientModal.tsx';
import AddAllergyModal from '@components/modals/AddAllergyModal.tsx';
import AddEmergencyContactModal from '@components/modals/AddEmergencyContactModal.tsx';
import AddPrescriptionModal from '@components/modals/AddPrescriptionModal.tsx';
import AddHealthRecordModal from '../modals/AddHealthRecordModal.tsx';

const modals = {
	"add-general-pracitioner-modal": AddGeneralPractitionerModal,
	"add-hospital-modal": AddHospitalModal,
	"add-patient-modal": AddPatientModal,
	"add-allergy-modal": AddAllergyModal,
	"add-emergency-contact-modal": AddEmergencyContactModal,
	"add-prescription-modal": AddPrescriptionModal,
	"add-health-record-modal": AddHealthRecordModal,
}

declare module '@mantine/modals' {
	export interface MantineModalsOverride {
		modals: typeof modals;
	}
}

const Layout: FC<PropsWithChildren> = ({ children }) => {
	const [navbarOpened, {toggle: toggleNavbar}] = useDisclosure(false);

	return (
		<MantineProvider defaultColorScheme="auto">
			<Notifications/>
			<ModalsProvider modals={modals}>
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