import { Center, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

const UnauthorizedRoute = () => {
  return (
    <Stack align="center" justify="center" style={{ height: '100%' }}>
      <Title order={1} style={{ color: 'red' }}>
        Unauthorized!
      </Title>
      <Title order={2}>
        You do not have permission to access this page.
      </Title>
    </Stack>
  )
}


export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedRoute,
})

