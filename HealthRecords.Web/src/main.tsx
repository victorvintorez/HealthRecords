import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {nprogress} from "@mantine/nprogress";

export const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    context: {
        queryClient
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Navigation Progress
router.subscribe('onBeforeLoad', () => nprogress.start())
router.subscribe('onLoad', () => nprogress.complete())

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
)
