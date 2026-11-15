import { AuthScreen } from '@/features/auth/components/AuthScreen'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginScreen() {
  return (
    <AuthScreen
      title="Iniciar sessão"
      subtitle="Entre com o seu e-mail ou NIF para contratar ou gerir serviços."
      footerText="Ainda não tem conta?"
      footerLink={{ href: '/register', label: 'Criar conta' }}
    >
      <LoginForm />
    </AuthScreen>
  )
}
