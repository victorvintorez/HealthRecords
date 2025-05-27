import { createFileRoute } from '@tanstack/react-router';

const AdminRoute = () => {
	return <div>Hello "/admin"!</div>;
};

export const Route = createFileRoute('/admin')({
	component: AdminRoute,
});
