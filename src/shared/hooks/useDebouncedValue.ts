import { useEffect, useState } from 'react'

/** Atrasa um valor (ex.: pesquisa): só pede à API quando o utilizador pára de escrever. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
