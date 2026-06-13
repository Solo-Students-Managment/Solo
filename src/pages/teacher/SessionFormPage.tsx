import { Navigate } from 'react-router-dom'

export function SessionFormPage() {
  return <Navigate to="/dashboard/sessions?tab=new" replace />
}
