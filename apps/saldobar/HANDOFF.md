# Handoff: SaldoBar — Plasma Pixel + alertas al Apple Watch

## Overview

SaldoBar es una app de barra de menú de macOS que monitorea el consumo de OpenRouter por polling. Este handoff cubre dos cosas:

1. **Un rediseño visual completo** de la UI existente (label de la barra + popover) bajo una dirección llamada **Plasma Pixel**.
2. **Una superficie nueva**: alertas al Apple Watch vía [ntfy](https://ntfy.sh) — banner, long look, complicación rectangular, variante always-on y widget de Smart Stack — más el panel de configuración de alertas dentro del popover.

El corazón del sistema es un mecanismo de tres capas llamado **El Mix**, especificado abajo con sus reglas de escala. Si implementás una sola cosa de este documento, que sea esa sección: todo lo demás es su aplicación.

---

---

## Si quien implementa no puede ver imágenes

Usá **`SPEC.md`** en vez de este archivo. Es la misma información expresada de forma determinista: árboles de layout en texto indentado, el algoritmo del Mix en pseudocódigo, una tabla con las 11 instancias y sus valores exactos, y 12 criterios de aceptación auto-verificables. No requiere abrir ningún HTML.

Este README asume que quien lee puede mirar los prototipos; `SPEC.md` no asume nada.

---

## Punto de entrada

**En este bundle**, leé en este orden:

1. **`README.md`** (este archivo) — es la especificación normativa. Los HTML son la referencia visual.
2. **`SaldoBar Mix System.dc.html`** — el principio de tres capas y sus reglas de escala. Sin esto, el resto no se entiende.
3. **`SaldoBar Watch Alerts v3.dc.html`** — cómo se ve el sistema aplicado a todas las superficies.

**En el codebase**, el punto de entrada es `Sources/SaldoBar/App/SaldoBarApp.swift`:

```
SaldoBarApp.swift              @main · MenuBarExtra(.window)
├── label:   NewsLabel(model:)         → Views/NewsLabel.swift        ← pantalla 1
└── content: WidgetHubView(model:)     → Views/WidgetHubView.swift    ← raíz del popover, 340×880
             ├── WidgetHomeView        → Views/WidgetHomeView.swift   ← pantalla 2a
             └── OpenRouterWidgetView  → Views/OpenRouterWidgetView.swift ← pantalla 2b
                  ├── BalanceHeaderView      → Views/BalanceHeaderView.swift
                  ├── ConsumptionReportView  → Views/ConsumptionReportView.swift
                  └── NewsSectionView        → Views/NewsSectionView.swift
```

Todo el estado sale de `Models/AppModel.swift` (`@Observable`, inyectado como `@Bindable` en cada vista). No hay router ni contenedor de DI: `WidgetHubView` maneja la navegación con un `[WidgetRoute]` propio.

**Orden de trabajo sugerido:**

1. Empaquetá y registrá las cuatro fuentes (bloquea todo lo demás).
2. Escribí el mix como **un solo modificador reutilizable** (algo como `.mixFill(blockHeight:)`, `.mixGhost(size:)`, `.mixSkew()`), con el interruptor de apagado adentro. Todas las pantallas lo consumen; no lo reimplementes por vista.
3. `NewsLabel` — la superficie más chica y la que valida el mecanismo entero.
4. `BalanceHeaderView` → `ConsumptionReportView` (acá entra la fórmula de retraso del gráfico) → `NewsSectionView`.
5. `WidgetHomeView` y el chrome de `OpenRouterWidgetView`.
6. Sección `RELOJ · NTFY` + el estado de reglas en `AppModel` + el cliente de ntfy en `Services/`.
7. Recién ahí, los targets de iOS/watchOS — leé *Restricciones de plataforma* antes de estimarlos.

Los pasos 1 a 5 son un rediseño puro: no tocan el modelo ni los servicios y no cambian ningún comportamiento existente.

---

## Sobre los archivos de diseño

Los `.dc.html` incluidos en este bundle son **referencias de diseño hechas en HTML** — prototipos que muestran la apariencia y el comportamiento buscados. **No son código para copiar a producción.**

La tarea es **recrear estos diseños en el entorno del codebase existente**: SwiftUI sobre macOS 14+, Swift 6.2+, arquitectura ya establecida en `Sources/SaldoBar/` (`@Observable` `AppModel`, vistas en `Views/`, servicios en `Services/`). Las superficies nuevas del reloj requieren targets nuevos (ver *Restricciones de plataforma*).

Los valores de color, tipografía, espaciado y tiempo de este README son normativos. El HTML es la referencia visual; este README es la especificación.

## Fidelidad

**Alta (hi-fi).** Colores, tipografías, tamaños, tiempos y curvas son finales. Recreá la UI con fidelidad de píxel. Donde el diseño y una convención nativa de la plataforma choquen, gana la plataforma en accesibilidad (tamaños de toque, contraste, reduce-motion) y gana el diseño en todo lo demás.

---

## EL MIX — el principio

Tres capas apiladas. Cada una ataca una propiedad distinta y por eso no se pisan. Se aplican **siempre juntas** o **ninguna** (ver *El interruptor*).

### Capa 1 · Relleno

Un degradé vertical de seis tonos que deriva **hacia arriba dentro del glifo** (no detrás).

Stops, en este orden exacto:

| Posición | Color |
|---|---|
| 0 % | `#FF2D6F` |
| 17 % | `#FF8A00` |
| 34 % | `#FFE600` |
| 50 % | `#37F5A0` |
| 67 % | `#7FF9FF` |
| 84 % | `#A56BFF` |
| 100 % | `#FF2D6F` |

El primer y último stop son iguales para que la baldosa sea continua al repetirse.

**Dos reglas de escala, no negociables:**

- **Alto de baldosa `T` = 1,6 × el alto del bloque de texto.** Si la baldosa es más chica que el bloque, el texto vuelve a leerse como arcoíris a franjas y el mecanismo se rompe. Este es el error más fácil de cometer al pasar de 7 px a 46 px.
- **Velocidad constante: 10 px/s.** Es decir, `duración = T / 10`. Nunca por debajo de un ciclo de 3 s: más rápido el ojo lo lee como parpadeo y la barra de menú deja de ser un lugar donde se puede trabajar.

Valores derivados que ya están fijados en el diseño:

| Superficie | Tamaño de tipo | Alto de bloque | `T` | Duración |
|---|---|---|---|---|
| Wordmark de la barra de menú | 7 px | 19 px (2 líneas) | 30 px | 3,0 s |
| Complicación rectangular | 22 px | 22 px | 36 px | 3,6 s |
| Saldo en el popover | 36 px | 36 px | 58 px | 5,8 s |
| Saldo en el reloj (banner) | 46 px | 46 px | 72 px | 7,2 s |

Animación: `background-position` de `0` a `-T` en lineal, infinito.

### Capa 2 · Fantasma

Dos copias del mismo texto, **detrás** de la capa 1, que se cruzan horizontalmente.

- Colores: `#FF2D6F` (magenta) y `#7FF9FF` (cian).
- Opacidad: `0.75` cada una.
- Desplazamiento: **`max(1 px, tamaño de tipo ÷ 16)`**, alternando entre `+d` y `−d`.
- Ciclo: `2.1 s`, `ease-in-out`, infinito. La segunda copia va con `−1.05 s` de retraso (media fase).

El desplazamiento **crece con el tipo**. A 46 px, 1 px fijo desaparece (queda un borde sucio) y el proporcional puro de 6 px produce tres cifras compitiendo — el saldo deja de leerse de un vistazo. `tamaño ÷ 16` es el punto medio verificado: 3 px a 46 px, que es la misma proporción que 1 px sobre 7 px.

### Capa 3 · Geometría

Una inclinación del bloque entero: `skewX` de `−2,5°`, ciclo `3.4 s`, `ease-in-out`, infinito (`0 %` y `100 %` en `0°`, `50 %` en `−2,5°`, con un `translateX` de `0.5 px` acompañando).

**Sólo sobre un elemento por pantalla: el héroe.** Nunca sobre contenedores, tarjetas, filas ni chrome. El movimiento se lee porque hay algo quieto al lado; si vibra todo, no vibra nada.

El héroe por pantalla:

| Pantalla | Héroe |
|---|---|
| Barra de menú | el wordmark `YOU'VE GOT / NEWS` |
| Banner del reloj | el saldo |
| Long look | el saldo |
| Complicación | el saldo |
| Popover | el saldo |
| Always-on | ninguno |

### Por qué funciona

Las tres ideas de origen atacaban capas distintas: el relleno del glifo, el ritmo del color y la geometría. Apiladas no compiten. Los tres ciclos (3,0 / 2,1 / 3,4 s) son primos entre sí, así que el patrón exacto no se repite nunca, pero ninguna capa se mueve rápido.

### Dónde SÍ se aplica

- Números de dato (saldo, consumo).
- El wordmark de la barra.
- **Bordes y marcos**: el degradé va en un marco de 2 px con el fondo sólido adentro.

### Dónde NO se aplica

- **Relleno de botones.** El texto negro sobre el degradé pierde contraste cada vez que pasa el magenta; un botón no puede tener momentos en los que no se lee. Poné el degradé en el borde de 2 px y dejá el fondo sólido.
- **Texto de lectura.** Frases enteras, etiquetas de formulario, ayuda contextual, descripciones de reglas: siempre planas, en `#E7E2F5` o `#8E86A8`. El mix es para datos y marcas, nunca para lo que hay que leer palabra por palabra.

### Grupos de elementos que comparten un borde (el gráfico)

Para un grupo alineado al mismo borde (las 14 barras del gráfico de consumo, los 5 segmentos del selector de ventana), **no** le des a cada elemento su propio degradé: las barras cortas quedan todas magenta y las largas todas violetas, y el color pasa a codificar la altura, que ya está codificada.

Metelos a todos en el mismo sistema de coordenadas con un retraso negativo por elemento:

```
retraso = −(((H − h) mod T) ÷ T) × D
```

- `H` = alto del contenedor (56 px en el gráfico)
- `h` = alto del elemento
- `T` = alto de baldosa (58 px)
- `D` = duración (5,8 s)

El degradé atraviesa el grupo como una sola lámina.

### El interruptor

Tres situaciones piden exactamente lo mismo, así que conviene **un único estado en el modelo** y no tres ramas en la vista:

- Pantalla always-on del reloj
- `accessibilityReduceMotion` activo
- Batería baja

En cualquiera de las tres, **el mix se apaga entero** (no se atenúa): una sola capa plana, cian `#7FF9FF` al 55 % de opacidad, sin fantasma, sin deriva, sin inclinación. Atenuar las tres capas al 42 % hace que el magenta caiga por debajo del piso de contraste y la cifra desaparezca y reaparezca sola, además de seguir gastando batería.

`NewsLabel.swift` ya lee `@Environment(\.accessibilityReduceMotion)`; extendé ese patrón a un solo booleano derivado.

---

## Design tokens

### Color

| Token | Hex | Uso |
|---|---|---|
| `void` | `#05000E` | fondo de todas las superficies |
| `panel` | `#0B0018` | fondo de tarjetas y marcos |
| `border` | `#2A1F44` | borde de 1 px, divisores |
| `borderSoft` | `#3A2C5E` | borde apagado / deshabilitado |
| `cyan` | `#7FF9FF` | acento primario, estado normal, fantasma A |
| `magenta` | `#FF2D6F` | urgente, sombra desplazada, fantasma B |
| `yellow` | `#FFE600` | atención, encabezados de sección, segmento activo |
| `violet` | `#A56BFF` | programado |
| `green` | `#37F5A0` | stop del degradé, scroller |
| `orange` | `#FF8A00` | stop del degradé |
| `textPrimary` | `#E7E2F5` | texto de lectura |
| `textSecondary` | `#8E86A8` | texto secundario (contraste ≈ 5,9:1 sobre void) |
| `textTertiary` | `#5E5580` | **sólo** micro-etiquetas en versales, nunca prosa |
| `ultraAction` | `#FF7A1A` | botón de acción del Ultra, fecha en la cara |

**Semántica del color por regla de alerta** — el color va en el **marco** de la notificación, no en el número (excepto saldo bajo):

| Regla | Color de marco |
|---|---|
| Cada dólar consumido | `#7FF9FF` cian |
| Saldo bajo | `#FFE600` amarillo (y el número también) |
| Pico de consumo | `#FF2D6F` magenta |
| Resumen diario | `#A56BFF` violeta |

**Variante para barra de menú clara** (fondo de pantalla claro — sólo baja la luminosidad, la estructura no cambia):
`#C4004F` · `#A34A00` · `#7A6A00` · `#0A7A4E` · `#0090A8` · `#5B2BC4`

### Tipografía

| Familia | Peso | Uso | Piso |
|---|---|---|---|
| **Silkscreen** | 700 | números, etiquetas, títulos, wordmark | 8 px en Mac · 8,5 px en el reloj |
| **IBM Plex Mono** | 400 / 600 | texto corrido, prosa, ayuda | 10 px |

Ambas son de Google Fonts con licencia OFL. **Hay que empaquetar los `.ttf` en el bundle de la app** (`Sources/SaldoBar/Resources/`, declarados en `Package.swift` como `.process`) y registrarlas — no hay equivalente del sistema en macOS ni watchOS. Silkscreen nunca se usa para prosa: su altura de x hace que cualquier frase larga sea ilegible.

Tamaños en uso: 7 / 8 / 8,5 / 9 / 9,5 / 10 / 11 / 22 / 26 / 30 / 36 / 46 / 52 px.

### Forma y espaciado

- **Radio: 0 en todo.** El único radio del sistema es el del hardware (bisel del reloj). Bordes duros en toda la UI.
- **Sombra desplazada**: `3–4 px` en X e Y, color sólido, **sin blur, sin opacidad de difuminado**. Siempre magenta sobre cian, o magenta sobre blanco.
- **Trama dither**: `repeating-conic-gradient` de 4 px al 55–60 % de negro, encima del plasma. Nunca encima de texto chico. Se apaga entera en always-on.
- **Plasma de fondo**: tres radiales (cian, magenta, violeta) con `blur(7px)`, derivando en 9 s `ease-in-out`.
- Espaciado: escala de 4 px (4 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 26).
- Bordes: 1 px `#2A1F44` para chrome, 2 px de color para elementos con jerarquía.

---

## Pantallas

### 1. Label de la barra de menú — `Views/NewsLabel.swift`

Dos estados, ambos de dos líneas, `fixedSize()`, dentro de un `NSStatusItem` de 26 pt.

**Sin novedades (`hasNews == false`)** — sin cambios respecto de hoy salvo la familia:
`you've got` / `no mail`, Silkscreen 6,5 px, `line-height 9px`, color `rgba(255,255,255,.35)`. (La versión actual usa la fuente redondeada del sistema en 9,5 px, itálica, `tracking 1.2`, opacidad 0,4 — conservala si preferís no cambiar el estado quieto.)

**Con noticias (`hasNews == true`)** — el héroe, con las tres capas:
`YOU'VE GOT` / `NEWS`, Silkscreen 700 a 7 px, `line-height 9.5px`, centrado.
- Capa 1: baldosa 30 px, 3,0 s.
- Capa 2: fantasmas a 1 px, 2,1 s.
- Capa 3: skew de 2,5°, 3,4 s.

⚠️ El string es `YOU'VE GOT` — **diez caracteres, incluido el espacio**. En el diseño el espacio necesita ancho explícito porque es un span vacío; en SwiftUI no hace falta, pero verificá que no se pierda si iterás caracteres.

Debe funcionar sobre barra clara y oscura: usá la paleta clara de arriba cuando `NSApp.effectiveAppearance` sea clara.

### 2. Popover — 340 pt de ancho

Contenedor: fondo `#05000E`, borde 1 px `#2A1F44`, radio 12 (única excepción de radio: es chrome de sistema).

#### 2a. Widgets home — `Views/WidgetHomeView.swift`

- Encabezado: `WIDGETS` Silkscreen 700 20 px, sombra `3px 3px 0 #FF2D6F`. Debajo, `1 WIDGET · TODO EN VIVO` a 10,5 px `#5E5580`, `letter-spacing .06em`. Padding `16/16/12`.
- Fila de OpenRouter: borde 2 px `#7FF9FF`, fondo `linear-gradient(180deg, rgba(43,184,255,.16), rgba(255,45,111,.07))`, sombra `4px 4px 0 rgba(255,45,111,.55)`, padding 12, gap 11.
  - Ícono: cuadrado de 34×34 `#7FF9FF` con tres barras de 4 px en `#05000E` (alturas 8 / 14 / 11, gap 3, alineadas abajo con 9 px de padding).
  - Título `OPENROUTER` Silkscreen 11 px. Subtítulo `Saldo $12.08 · ~3.5 días` en Plex Mono 10,5 px `#8E86A8`.
  - Punto de novedades: 8×8 `#FFE600`, parpadeo `steps(2)` 1,4 s. Sólo si `model.hasNews`.
  - Chevron: `>` Silkscreen 11 px `#7FF9FF`.
- Divisor 1 px `#2A1F44`, y `[Q] SALIR DE SALDOBAR` Silkscreen 9,5 px `#5E5580`, padding `12/16`.

**No agregues filas de otras plataformas.** El home tiene exactamente un widget; Anthropic y Gemini son roadmap, no UI.

#### 2b. Detalle de OpenRouter — `Views/OpenRouterWidgetView.swift`

Orden de secciones idéntico al actual.

- **Volver**: `< WIDGETS` Silkscreen 9,5 px `#7FF9FF`, padding `10/14/6`.
- **Header de saldo** (`BalanceHeaderView`): padding `14/16/18`, con plasma animado (11 s) + trama dither de fondo, recortado.
  - Fila de estado: cuadrado de 8×8 (`#7FF9FF` ok · `#FFE600` esperando key · `#FF2D6F` fallo), `CONECTADO`, y a la derecha `HACE 14 S`. Silkscreen 8,5 px.
  - **Héroe**: `12.08` Silkscreen 700 36 px, las tres capas (baldosa 58 px / 5,8 s; fantasma 3 px; skew). Sin signo `$` — el valor viene de `.number.precision(.fractionLength(2))`, igual que hoy. En rojo si `creditsLeft <= 0`.
  - Al lado, `RESTANTES` Silkscreen 9 px `#7FF9FF`.
  - Pie: `DE $25.00 · 24 H $3.41 · ~3.5 D` Silkscreen 8 px, `line-height 1.9`.
- **Acciones**: dos botones al 50 %. `ACTUALIZAR` con borde 2 px `rgba(127,249,255,.4)`; `RECARGAR` con fondo `#7FF9FF`, texto `#05000E`, sombra `3px 3px 0 #FF2D6F`. Silkscreen 9 px, padding vertical 9.
- **CONSUMO**: caja con borde 1 px `#2A1F44`, padding 12, gap 11. Encabezado Silkscreen 8,5 px `#FFE600`, `letter-spacing .1em`.
  - Selector de 5 segmentos (1H / 12H / 24H / 7D / 30D): cada uno borde 1 px `#2A1F44`, texto `#5E5580`, Silkscreen 8 px, padding vertical 6. El activo: fondo `#FFE600`, texto `#05000E`.
  - Cifra: Silkscreen 700 28 px. Al lado, en Plex Mono 10 px `#8E86A8`: `consumido en 24 h` / `≈ $3.41 por día`.
  - Gráfico: 14 barras de 12 px, gap 8, alto 56, `min-height 3px`. **Campo compartido** con la fórmula de retraso. Días sin dato: plano `rgba(255,255,255,.18)`, sin degradé.
  - Pie de eje: `-14 D` / `HOY` Silkscreen 7,5 px `#5E5580`.
- **NOTICIAS**: filas con marcador de 7×7 (`#FF2D6F` sólido si no leída, borde 1 px `#3A2C5E` si leída; las leídas al 55 % de opacidad). Título en Plex Mono 11 px `#E7E2F5`, detalle en `#5E5580`, tiempo relativo Silkscreen 7,5 px. Máximo 6, igual que hoy.
- **CONEXIÓN**: campo de key (fondo `#0B0018`, borde 1 px `#2A1F44`, padding `7/9`) + botón `OK` cian. Estado `Guardada en Keychain` con cuadrado cian de 8×8. Fila de intervalo con selector `1 MIN ▾`.
- **RELOJ · NTFY** (sección nueva): borde 2 px `#7FF9FF`, sombra `4px 4px 0 rgba(255,45,111,.5)`. Toggle maestro (30×14, cuadrado, sin radio). Campo de topic + botón `QR`. Las cuatro reglas como filas con su cuadrado de color de 7×7 y su parámetro a la derecha. Botón `PROBAR EN EL RELOJ` en `#FFE600`.

### 3. Superficies del Apple Watch — Ultra 2 (49 mm, 410 × 502 px)

Fondo `#05000E` en todas. Plasma + dither salvo donde se indique.

#### 3a. Banner (short look)

- Cabecera: cuadrado de 14×14 `#7FF9FF` con sombra `3px 3px 0 #FF2D6F`, `SALDOBAR` Silkscreen 10 px, hora a la derecha al 55 %.
- Etiqueta `TE QUEDAN` / `YOU HAVE LEFT`, Silkscreen 10 px `#7FF9FF`.
- **Héroe**: `$12.08` Silkscreen 700 46 px, tres capas (baldosa 72 px / 7,2 s, fantasma 3 px, skew).
- Pie: `DE $25.00 · ~3.5 DIAS` Silkscreen 9,5 px al 80 %.
- Sparkline de 10 barras, alto 36, gap 4.
- Marco de regla al pie: borde 2 px del color de la regla, sombra `4px 4px 0` magenta, fondo `#0B0018`. Punto de 8×8 pulsando en `steps(2)` 1,4 s, título Silkscreen 9,5 px en el color de la regla, detalle 8,5 px al 60 %.

#### 3b. Long look

Mismo héroe a 34 px (baldosa 58 px). Tres filas de dato separadas por 1 px `rgba(127,249,255,.25)`: `CONSUMO 24 H` `$3.41` · `RITMO` `$3.41/D` · `SE ACABA` `~3.5 D` (este último en `#FFE600`). Gráfico de 14 barras, alto 38. Dos acciones a lo ancho: `RECARGAR` (fondo cian, sombra magenta) y `SILENCIAR 1 H` (borde 2 px al 45 %). Padding vertical 11 y 9.

#### 3c. Cara Modular + complicación rectangular

Hora `14:32` Silkscreen 700 52 px con doble sombra (`4px 4px 0 #FF2D6F`, `8px 8px 0 rgba(43,184,255,.5)`). Fecha `MAR 9 AGO` en `#FF7A1A`. Complicación al pie: borde 2 px `#7FF9FF`, sombra magenta, con `SALDOBAR` + `$3.41/D` en la fila superior, `$12.08` a 22 px (baldosa 36 px / 3,6 s) y sparkline de 10 barras a la derecha.

#### 3d. Always-on

**El mix apagado.** Pantalla al 42 % global, sin plasma, sin dither, sin animación. Hora al 90 % con una sola sombra magenta al 45 %. Complicación con borde `rgba(127,249,255,.5)` y el saldo plano.

#### 3e. Widget de Smart Stack

Tarjeta con borde 2 px `#7FF9FF`, sombra magenta, fondo `linear-gradient(180deg, rgba(43,184,255,.3), rgba(255,45,111,.16))`. `SALDOBAR · OPENROUTER` 8 px, saldo a 30 px, gráfico de 14 barras alto 32, pie `$3.41/DIA · ~3.5 DIAS`.

---

## Interacciones y comportamiento

- **Navegación del popover**: sin cambios respecto de `WidgetHubView` — un solo nivel, transiciones explícitas (home entra por el borde izquierdo, detalle por el derecho), `.snappy(duration: 0.28)`.
- **Al abrir el detalle**: `model.markAllNewsRead()` en `onAppear`, como hoy. El label de la barra vuelve al estado quieto.
- **Actualizar**: deshabilitado si `resolvedAPIKey == nil` o `state == .polling`.
- **Probar en el reloj**: dispara un POST a ntfy con datos de ejemplo y muestra el resultado inline (éxito/fallo) sin abrir un diálogo.
- **Animaciones**: todas infinitas y desacopladas del ciclo de polling. Ninguna animación debe reiniciarse cuando llega un poll nuevo — si la cifra cambia, usá `contentTransition(.numericText())` como hoy, encima del mix.
- **Reduce motion / always-on / batería baja**: el interruptor descrito arriba.

## Estado

Lo existente en `AppModel` alcanza para el popover. Para las alertas hacen falta:

```
ntfyEnabled: Bool                 // toggle maestro
ntfyTopic: String                 // en Keychain, no en UserDefaults: el topic es un secreto de facto
rules: Set<AlertRule>             // .wholeDollar, .lowBalance, .spike, .dailySummary
lowBalanceThreshold: Double       // default 5.00
spikeMultiplier: Double           // default 3.0, contra el promedio de 7 d
dailySummaryHour: Int             // default 21
lastSentAt: Date?
```

- **Dólar entero**: ya implementada en `evaluateDollarAlerts` — reusá la lógica de `lastReportedDollar` y el tope de 8.
- **Saldo bajo**: se dispara una sola vez por recarga; se rearma cuando `creditsLeft` vuelve a subir por encima del umbral.
- **Pico**: compará la ventana de 1 h contra el promedio diario de 7 d (`ledger.dailySeries`). No dispares si el ledger tiene menos de 3 días de datos.
- **Resumen diario**: el único envío programado; el resto son reactivos al poll.

El topic de ntfy es público por diseño: generá uno de alta entropía (`saldobar-` + 8 hex) y advertilo en la UI.

---

## Restricciones de plataforma (leer antes de estimar)

**Esto es lo que más impacta el alcance:**

1. **Si las alertas llegan a través de la app de ntfy, no podés estilar la notificación.** El banner y el long look de este diseño requieren una **app de iOS con extensión de notificación + una app de watchOS propia**. Con ntfy solo, obtenés el texto y nada más. Decidí esto temprano: o se acepta la notificación de sistema sin estilo (y el diseño del reloj queda para más adelante), o entra en alcance un target de iOS/watchOS y ntfy pasa a ser sólo el transporte.
2. **Las complicaciones y el widget de Smart Stack requieren WidgetKit dentro de una app de watchOS.** No hay atajo.
3. **Las complicaciones tienen presupuesto de refresco limitado.** El saldo se va a ver con retraso; mostrá siempre la marca de tiempo del dato o usá `.privacySensitive()` con un placeholder.
4. **Las animaciones no corren en complicaciones ni en widgets.** El mix ahí es estático: renderizá un solo fotograma del degradé (elegí uno con el cian arriba). Las tres capas completas sólo viven en la barra de menú, el popover y la UI de notificación custom.
5. **watchOS no permite watch faces de terceros.** La cara del diseño es contexto: lo implementable es la complicación dentro de ella.

## Notas de implementación en SwiftUI

- **Deriva del degradé**: `TimelineView(.animation)` + un `VStack` de `LinearGradient` repetidos de alto `T`, con `.offset(y: -(t * 10).truncatingRemainder(dividingBy: T))`, todo dentro de `.mask(Text(...))`. Evitá `foregroundStyle(LinearGradient)` directo: no permite baldosear ni desplazar.
- **Fantasmas**: `ZStack` con dos `Text` de color plano y `.offset(x:)` animado, debajo del `Text` enmascarado.
- **Skew**: `.transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(angle), d: 1, tx: 0, ty: 0))` — `rotationEffect` no sirve.
- **Barras del gráfico**: pasá el retraso calculado como fase inicial al `TimelineView` de cada barra, no como `animation(.delay)`.
- **Barra de menú**: la app ya usa `NSStatusItem` + `NSHostingView` y `TimelineView(.animation(minimumInterval: 1.0/20.0))` en `NewsLabel`. Reusá ese patrón; 20 fps alcanza y de sobra para 10 px/s.
- **Presupuesto**: el label de la barra corre siempre que haya noticias sin leer. Pausá el `TimelineView` cuando `hasNews == false` (ya pasa) y cuando la app esté en batería baja.

## Assets

Ninguno externo. Todos los íconos del diseño están construidos con rectángulos y bordes CSS porque el repo no tiene carpeta de assets. En SwiftUI, reemplazalos por SF Symbols donde exista equivalente (`chart.bar.fill`, `chevron.left`, `chevron.right`, `power`, `arrow.clockwise`, `plus.circle`, `checkmark.circle.fill`) manteniendo el color y el tamaño especificados. El ícono del widget de OpenRouter (cuadrado cian con tres barras) es un elemento de marca: construilo con formas, no con un símbolo.

Fuentes a empaquetar: `Silkscreen-Regular.ttf`, `Silkscreen-Bold.ttf`, `IBMPlexMono-Regular.ttf`, `IBMPlexMono-SemiBold.ttf` (OFL).

## Archivos de este bundle

| Archivo | Qué contiene |
|---|---|
| `SPEC.md` | La especificación determinista y autosuficiente. Para implementar sin ver los prototipos. |
| `SaldoBar Watch Alerts v3.dc.html` | **La versión vigente.** El Mix aplicado a todos los componentes: barra de menú, las cinco superficies del reloj, las cuatro reglas, popover home y detalle. |
| `SaldoBar Mix System.dc.html` | El principio de tres capas y seis experimentos, cada uno con el error al lado de la corrección: escala, fantasma, gráfico, geometría, superficies planas, always-on. |
| `SaldoBar Watch Alerts v2.dc.html` | Plasma Pixel antes del Mix. Útil para ver qué cambió: en v2 los datos llevaban `text-shadow` duro y los gráficos tenían color por barra. |
| `SaldoBar Menu Bar Lab.dc.html` | Doce tratamientos explorados para el label de la barra + la mezcla ganadora en tres intensidades y la prueba sobre barra clara. Contexto de por qué el mix es el que es. |
| `SaldoBar Watch Alerts.dc.html` | Ronda 1: recreación 1:1 de la UI actual (línea de base) más tres direcciones visuales descartadas. |

Los archivos se abren en cualquier navegador. Las animaciones corren en vivo; hay un botón de pausa en cada uno.

## Código fuente de referencia

Los diseños se construyeron leyendo estos archivos del repo. Al implementar, verificá contra ellos:

`App/SaldoBarApp.swift` · `Models/AppModel.swift` · `Models/NewsItem.swift` · `Models/UsageLedger.swift` · `Views/NewsLabel.swift` · `Views/WidgetHubView.swift` · `Views/WidgetHomeView.swift` · `Views/OpenRouterWidgetView.swift` · `Views/BalanceHeaderView.swift` · `Views/ConsumptionReportView.swift` · `Views/NewsSectionView.swift`
