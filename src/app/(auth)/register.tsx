import { AuthScreen } from '@/features/auth/components/AuthScreen'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterScreen() {
  return (
    <AuthScreen
      title="Criar conta"
      subtitle="Escolha se quer contratar serviços ou oferecê-los."
      footerText="Já tem conta?"
      footerLink={{ href: '/login', label: 'Iniciar sessão' }}
    >
      <RegisterForm />
    </AuthScreen>
  )
}
