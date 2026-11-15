import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { applyFieldErrors, getErrorMessage } from '@/shared/api/errors'
import {
  LIMITS,
  serviceSchema,
  type ServiceInput,
  type ServiceValues,
} from '@/shared/contract/schemas'
import type { Service } from '@/shared/contract/types'
import { spacing } from '@/shared/theme/theme'
import { Button } from '@/shared/ui/Button'
import { FormTextField } from '@/shared/ui/FormTextField'
import { InlineAlert } from '@/shared/ui/InlineAlert'
import type { ServicePayload } from '../api'

const FIELDS = ['name', 'description', 'price'] as const

interface ServiceFormProps {
  /** Serviço a editar; sem ele o formulário cria um novo. */
  service?: Service
  /** Recebe só os campos alterados quando edita (PATCH parcial). */
  onSubmit: (payload: Partial<ServicePayload>) => Promise<unknown>
  onCancel?: () => void
  submitLabel: string
}

/**
 * Formulário único para criar e editar serviços, com as mesmas regras do contrato (zod
 * partilhado com a web). O preço aceita "15 000,50" e é enviado como string "15000.50".
 */
export function ServiceForm({ service, onSubmit, onCancel, submitLabel }: ServiceFormProps) {
  const form = useForm<ServiceInput, unknown, ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description ?? '',
      // Mostra o preço no formato local ("1500,50"); o schema volta a normalizar para "1500.50".
      price: service?.price.replace('.', ',') ?? '',
    },
  })
  const { errors, isSubmitting, dirtyFields, isDirty } = form.formState
  const description = useWatch({ control: form.control, name: 'description' })

  const submit = form.handleSubmit(async (values) => {
    const payload: Partial<ServicePayload> = service
      ? Object.fromEntries(FIELDS.filter((field) => dirtyFields[field]).map((f) => [f, values[f]]))
      : values
    try {
      await onSubmit(payload)
      if (!service) form.reset()
    } catch (error) {
      if (!applyFieldErrors(error, form.setError, FIELDS)) {
        form.setError('root', { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <View style={styles.form}>
      {errors.root?.message && <InlineAlert tone="danger">{errors.root.message}</InlineAlert>}

      <FormTextField
        control={form.control}
        name="name"
        label="Nome do serviço"
        placeholder="Ex.: Canalização ao domicílio"
        maxLength={LIMITS.service.name.max}
        returnKeyType="next"
        testID="service-name"
      />
      <FormTextField
        control={form.control}
        name="description"
        label="Descrição"
        placeholder="O que está incluído, prazos, zona de atuação…"
        hint={`${description.length}/${LIMITS.service.description.max} caracteres`}
        maxLength={LIMITS.service.description.max}
        multiline
        testID="service-description"
      />
      <FormTextField
        control={form.control}
        name="price"
        label="Preço"
        suffix="Kz"
        placeholder="0,00"
        hint="Até 2 casas decimais. Ex.: 15000 ou 15000,50"
        keyboardType="decimal-pad"
        testID="service-price"
      />

      <View style={styles.actions}>
        <Button
          title={submitLabel}
          icon={service ? 'save-outline' : 'add-circle-outline'}
          loading={isSubmitting}
          disabled={Boolean(service) && !isDirty}
          onPress={() => void submit()}
          testID="service-submit"
        />
        {onCancel && <Button title="Cancelar" variant="outline" onPress={onCancel} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  actions: { gap: spacing.sm },
})
