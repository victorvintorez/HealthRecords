import { createFileRoute } from '@tanstack/react-router'

const Index = () => <div>Hello "/"!</div>;

export const Route = createFileRoute('/')({
  component: Index,
})


