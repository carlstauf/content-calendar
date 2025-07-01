import { Navigate } from 'react-router-dom'

// Redirect to sign in page since we now use name-based login
export default function SignUp() {
  return <Navigate to="/signin" replace />
}