# Auditoría del proyecto v1 (websolbemol_local)

Fecha: 2026-10-11. El original no se tocó; copia intacta en `_archivo-v1/` (sin .git).

## Se reutiliza
- assets/SVG: logo_blanco, Logo_negro, Logo_footer, Favicon, picto1-3 (revisar cuáles quedan)
- Estructura de contenido y copy (alternativa B), formulario con validación (main.js §5)
- Menú deslizante y header auto-oculto (main.js §1-2), aparición al scroll (§3)
- Video del hero en Mux (playback-id 7Ho8yKt…). Fijar versión de @mux/mux-video

## Se descarta
- Cinta reactiva (main.js desde línea 167, `.wave-edge`, `data-wave-scope`): el elemento gráfico que se retira
- Colores arena (#F2CB8D), salvia (#73B193), índigo (#383A5B), crema (#F3F0DD) y negros #1B1C28 / #0B0B0E
- Sistema "un acento por sección" (accent-salvia, accent-arena…) → un solo acento #E07A5F
- Pictograma del hero (figura con guitarra) y piano-keys.svg actual (se rediseña)

## Duplicado / suelto
- index-figma.html: copia de index.html con animaciones apagadas y el video como imagen (export para Figma). Descartable
- "local 2/": repo git vacío con un README de una línea
- "Claude outputs/": 3 capturas PNG (2,6 MB): sirven de referencia visual, no del sitio
- assets/hero-placeholder.svg: placeholder sin uso

## Decisiones del proyecto nuevo
- Tokens: --blanco #FFFFFF · --negro #333333 · --acento #E07A5F
- Texto sobre naranja en #333 (blanco da 2,9:1)
- README original apunta a migrar a WordPress: confirmar si sigue vigente
