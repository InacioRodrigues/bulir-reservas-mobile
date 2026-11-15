import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { TextField, type TextFieldProps } from './TextField'

interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  'value' | 'error'
> {
  // O 3.º genérico é o tipo transformado pelo zod (output); aqui só interessam os inputs.
  control: Control<T, any, any>
  name: Path<T>
}

/**
 * Liga um TextField ao React Hook Form. Em React Native não há `register()` sobre inputs
 * nativos como na web: usamos o `Controller`, que passa value/onChangeText/onBlur e o erro.
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          ref={field.ref}
          value={field.value as string}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  )
}
