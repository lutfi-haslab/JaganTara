import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#080810] text-white selection:bg-purple-500/30">
      <Outlet />
    </div>
  ),
})
