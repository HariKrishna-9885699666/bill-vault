import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/bills/$id")({
  component: () => <Outlet />,
});
