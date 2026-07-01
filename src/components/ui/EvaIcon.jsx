import { useEffect, useRef } from 'react'
import * as eva from 'eva-icons'

/**
 * <EvaIcon name="home" size={20} fill="currentColor" className="..." />
 * Renderiza um ícone Eva via data-eva + eva.replace().
 * Suporta todos os ícones em: https://akveo.github.io/eva-icons/
 */
export default function EvaIcon({
  name,
  size = 20,
  fill = 'currentColor',
  animation,
  className = '',
  style = {},
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) eva.replace()
  }, [name, fill, size, animation])

  return (
    <i
      ref={ref}
      data-eva={name}
      data-eva-fill={fill}
      data-eva-width={size}
      data-eva-height={size}
      data-eva-animation={animation}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
    />
  )
}
