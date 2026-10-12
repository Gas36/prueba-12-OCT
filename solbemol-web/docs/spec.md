# SolBemol web v2 — spec de marca para el sitio

## Fundamentos
- Color: blanco #FFFFFF · negro #333333 · acento #E07A5F. Nada más.
- Fondos: solo blanco o negro, alternados como teclas. El acento nunca es fondo de sección.
- Acento: botón principal, bloques (superficies rugosas), subrayado de una frase, línea del eyebrow. Texto sobre naranja siempre en #333 (blanco da 2,9:1).
- Tipografía: Jost 500/600 (títulos) + Instrument Sans (texto). Ouma Latin reemplaza --font-display cuando exista.
- Rejilla: 12 columnas dentro de 1180 px; los elementos pueden sangrar al borde del viewport.

## Ritmo de alturas (la regla que organiza todo)
- Nunca tres elementos de la misma altura seguidos. Bloques, teclas, columnas y datos alternan alturas, como teclas vistas de frente.
- Teclas negras que nacen del borde inferior de una sección blanca y se funden con la sección negra siguiente (secciones 2 y 6).
- Chips de instrumentos = teclas altas y bajas alternadas, color opuesto al fondo.

## Formas
- Rectángulos de borde orgánico, dibujados en vector (js/shapes.js): ondulación de 1,4 a 3,2 px, esquinas rectas, leve inclinación en las teclas. Sin filtros de píxeles.
- Botones, bloques, chips, datos y cita usan la misma forma. El botón secundario es el mismo trazo en línea.

## Movimiento
- Un solo gesto: las cosas suben (bloques, chips, datos, teclas), una vez, con retraso escalonado.
- Hover: bloques y chips se hunden 4-10 px, como una tecla.
- prefers-reduced-motion: todo visible y quieto; el video del hero no se reproduce solo.

## Nunca
- Segundo o tercer color de acento. Fondos de color. Pictogramas ilustrados sobre el hero.
- Filtros de desplazamiento (pixelan el borde). Pentagrama. Scroll con efectos largos.

## Estructura
1 Hero (video Mux) · 2 Problema · 3 Solución · 4 Historias · 5 Para tu empresa · 6 Diferenciador · 7 Contacto + footer con logo que sangra.

## Pendientes
- Más testimonios (duplicar un <figure class="voz">).
- Segundo video opcional en la sección 6.
- Conectar el envío real del formulario.
