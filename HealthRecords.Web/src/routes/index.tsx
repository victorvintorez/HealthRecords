import { createFileRoute } from '@tanstack/react-router';

const Index = () => {
	return <div>Hello "/"!</div>;
};

export const Route = createFileRoute('/')({
	component: Index,
});
