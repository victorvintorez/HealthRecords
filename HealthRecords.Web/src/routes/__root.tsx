import { createRootRouteWithContext, Outlet, useRouter } from "@tanstack/react-router";
import React, { useEffect } from 'react'
import { useQueryErrorResetBoundary, type QueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout.tsx"
import { Button, Center, MantineProvider, Stack } from '@mantine/core'

const TanStackRouterDevtools = process.env.NODE_ENV === 'development' ? React.lazy(() => import('@tanstack/router-devtools').then((res) => ({ default: res.TanStackRouterDevtools }))) : () => null
const TanStackQueryDevtools = process.env.NODE_ENV === 'development' ? React.lazy(() => import('@tanstack/react-query-devtools').then((res) => ({ default: res.ReactQueryDevtools }))) : () => null

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: () => (
        <>
            <Layout>
                <Outlet />
            </Layout>
            <TanStackRouterDevtools position="bottom-right" toggleButtonProps={{ style: { right: "75" } }} />
            <TanStackQueryDevtools buttonPosition="bottom-right" position="bottom" />
        </>
    ),
    errorComponent: ({ error }) => {
        const router = useRouter()
        const queryErrorResetBoundary = useQueryErrorResetBoundary()

        useEffect(() => {
            queryErrorResetBoundary.reset()
        }, [queryErrorResetBoundary])

        return (
            <MantineProvider>
                <Center>
                    <Stack>
                        {error.message}
                        <Button onClick={() => router.invalidate()}>Reload</Button>
                    </Stack>
                </Center>
            </MantineProvider>
        )
    }
})
