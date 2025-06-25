import Box from '@mui/material/Box'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <Box display={'flex'} className="full-size" flexDirection={'column'}>
            <div className="p-2 flex gap-2 text-lg">
                <img src="/logo.svg" alt="Logo" />
            </div>
            <hr />
            <Outlet />
            {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </Box>
    )
}
