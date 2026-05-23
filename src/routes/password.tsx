import { createFileRoute } from '@tanstack/react-router'
import { PasswordPage } from '@/components/Common/PasswordPage'

export const Route = createFileRoute('/password')({
  component: PasswordPage,
})
