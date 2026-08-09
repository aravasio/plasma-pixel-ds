# SPEC — SaldoBar Plasma Pixel (v3)
### Especificación para implementación sin acceso visual

Este archivo es **autosuficiente**. No requiere ver imágenes ni abrir los `.dc.html`. Toda la información visual está expresada como números, fórmulas y árboles de layout.

Si tenés acceso a los `.dc.html` de este bundle: **no los uses como fuente primaria.** Son referencia visual para humanos; su marcado repite las mismas capas muchas veces y es fácil sacar conclusiones equivocadas de él. Este archivo manda. Usá los HTML sólo para desempatar una duda puntual.

---

## 0. Cómo leer este archivo

**Unidades.** Tres sistemas de coordenadas distintos, no los mezcles:

| Superficie | Unidad | Escala |
|---|---|---|
| Barra de menú | pt reales de macOS | 1:1 |
| Popover | pt reales de macOS (ancho 340) | 1:1 |
| Reloj | px del mockup, **pantalla 274 × 334** | **× 1,496** para px reales del Ultra 2 (410 × 502) |

Todo número de la sección *Reloj* está en px de mockup. Multiplicá por 1,496 y redondeá para obtener px reales. Ejemplo: héroe de 46 px → 68,8 → **69 px reales** ≈ 34,5 pt.

**Notación de los árboles de layout.** Indentación = anidamiento. Cada línea es:

```
nombre (propiedades separadas por ·)
```

Abreviaturas: `col` = flex column · `row` = flex row · `pad a b c d` = padding arriba/derecha/abajo/izquierda (o `pad a` si es uniforme) · `gap n` = gap del flex · `abs` = position absolute · `SS n` = Silkscreen 700 a n px · `SSr n` = Silkscreen 400 a n px · `PM n` = IBM Plex Mono a n px · `#fff@55` = `rgba(255,255,255,0.55)` · `→` = el texto literal del elemento.

**Orden de implementación.** Ver `README.md`, sección *Punto de entrada*. Resumen: fuentes → el modificador del Mix → `NewsLabel` → header de saldo → gráfico → resto del popover → sección ntfy → targets de reloj.

---

## 1. Invariantes

Estas siete afirmaciones tienen que ser verdaderas al terminar. Son verificables sin ver la pantalla.

1. **`T = round(altoDelBloque × 1,6)`** para todo elemento con relleno de degradé. `altoDelBloque` = alto de la caja de texto renderizada (para una línea, ≈ el `font-size` con `line-height:1`).
2. **`D = T / 10`** segundos. Sin excepciones. La velocidad del degradé es siempre 10 px/s.
3. **`D ≥ 3,0 s`** siempre. Si la fórmula da menos, el elemento es demasiado chico para llevar el mix: dejalo plano.
4. **El keyframe de un elemento desplaza exactamente `−T`.** Un keyframe que desplaza `−42px` sobre una baldosa de `45px` produce un salto de 3 px por vuelta. Cada valor distinto de `T` necesita su propio keyframe.
5. **Exactamente un elemento por pantalla lleva la capa 3 (inclinación).** Contá: si el número es 0 o ≥ 2, está mal.
6. **Ningún texto de lectura lleva ninguna capa.** Frases, ayuda, etiquetas de formulario, descripciones: color plano.
7. **Con el interruptor de apagado activo, cero animaciones corriendo** y todo dato en `#7FF9FF` plano.

---

## 2. Tokens

### 2.1 Color

```
void          #05000E   fondo de toda superficie
panel         #0B0018   fondo de tarjeta / interior de marco
border        #2A1F44   borde 1px, divisores
borderSoft    #3A2C5E   borde apagado
cyan          #7FF9FF   acento primario · estado normal · fantasma A · always-on
magenta       #FF2D6F   urgente · sombra desplazada · fantasma B
yellow        #FFE600   atención · encabezado de sección · segmento activo
violet        #A56BFF   programado
green         #37F5A0   stop del degradé
orange        #FF8A00   stop del degradé
textPrimary   #E7E2F5   texto de lectura
textSecondary #8E86A8   texto secundario (5,9:1 sobre void)
textTertiary  #5E5580   SÓLO micro-etiquetas en versales. Nunca prosa. (3,0:1)
ultraAction   #FF7A1A   botón lateral del Ultra · fecha en la cara
```

### 2.2 El degradé (una sola definición, se repite idéntica en todos lados)

```
linear-gradient(180deg,
  #FF2D6F   0%,
  #FF8A00  17%,
  #FFE600  34%,
  #37F5A0  50%,
  #7FF9FF  67%,
  #A56BFF  84%,
  #FF2D6F 100%)
```

Primer y último stop iguales ⇒ la baldosa es continua al repetirse. **No cambies los porcentajes**: están calculados para que ningún par adyacente de colores tenga un salto de luminosidad mayor al resto.

### 2.3 Tipografía

```
Silkscreen 700   números · etiquetas · títulos · wordmark
Silkscreen 400   estado quieto de la barra de menú
IBM Plex Mono 400/600   texto corrido · prosa · ayuda
```

Pisos duros: **8 px** en macOS, **8,5 px** en el reloj (mockup) para Silkscreen; **10 px** para Plex Mono.
Silkscreen nunca para prosa.
Ambas son OFL: hay que empaquetar los `.ttf` en el bundle. No hay equivalente del sistema.

Tamaños en uso: `7 · 7,5 · 8 · 8,5 · 9 · 9,5 · 10 · 10,5 · 11 · 20 · 22 · 26 · 28 · 30 · 34 · 36 · 46 · 52`.

### 2.4 Forma

```
border-radius   0 en TODA la UI. Único radio del sistema: el hardware del reloj
                (bisel 68 / pantalla 54 en el mockup) y el popover (12, chrome de macOS).
sombra dura     offset 3–4 px en X e Y · color sólido · blur 0 · SIN opacidad de difuminado
                siempre magenta sobre cian, o magenta sobre blanco
borde chrome    1 px #2A1F44
borde jerárquico 2 px de color, o 2 px con el degradé a la deriva
espaciado       escala de 4: 4 6 7 8 9 10 11 12 14 16 18 20 22 24 26
```

### 2.5 Trama y fondo

```
dither    repeating-conic-gradient(rgba(0,0,0,.60) 0% 25%, transparent 0% 50%)
          background-size 4px 4px  (variantes: 3px fino, 6px grueso)
          va SOBRE el plasma, NUNCA sobre texto chico, se apaga entero en always-on

plasma    3 radiales sobre inset -25%, blur(7px):
            circle at 28% 26% → rgba(43,184,255,.60) → transparent 46%
            circle at 74% 58% → rgba(255,45,111,.55) → transparent 46%
            circle at 46% 92% → rgba(165,107,255,.55) → transparent 46%
          background-size 180% 180%, 170% 170%, 200% 200%
          deriva: 9 s ease-in-out infinite, alternando las 3 posiciones
          en el popover: 2 radiales, blur(8px), 11 s
```

---

## 3. El Mix — algoritmo

Tres capas apiladas en un contenedor `position: relative`. El orden de pintado importa: fantasmas primero (atrás), relleno último (adelante).

```
función mix(texto, tamaño):
    T = round(tamaño × 1.6)          # alto de baldosa
    D = T / 10                        # duración en segundos
    g = max(1, round(tamaño / 16))    # desplazamiento del fantasma

    contenedor:
        position relative
        width fit-content
        si esHéroeDeLaPantalla:
            animación SKEW: skewX 0° → −2.5° → 0°, 3.4 s, ease-in-out, infinite
                            (con translateX 0 → 0.5px → 0 acompañando)

        capa FANTASMA_A (absolute, inset 0):
            texto, color #FF2D6F, opacidad 0.75
            animación: translateX +g → −g → +g, 2.1 s, ease-in-out, infinite

        capa FANTASMA_B (absolute, inset 0):
            texto, color #7FF9FF, opacidad 0.75
            animación: idéntica, con delay −1.05 s (media fase)

        capa RELLENO (relative, en flujo — define el tamaño del contenedor):
            texto
            background-image: EL_DEGRADÉ
            background-size: 100% T
            background-clip: text
            color: transparent
            animación: background-position 0 0 → 0 −T, D segundos, linear, infinite
```

**Puntos donde se rompe si no prestás atención:**

- La capa RELLENO tiene que estar **en flujo** (no absolute); es la que da el tamaño al contenedor. Las dos fantasmas van absolute con `inset: 0`.
- La inclinación va en el **contenedor**, nunca en la misma capa que el relleno. Si ponés dos animaciones que tocan `transform` en el mismo elemento, la segunda gana y la primera se pierde en silencio.
- `width: fit-content` en el contenedor, si no las capas absolutas se estiran al ancho del padre.
- Cada `T` distinto necesita su propio keyframe (invariante 4).

### 3.1 Variante marco

Para bordes, marcos de notificación y CTA primarios: **sólo la capa RELLENO**, aplicada al fondo de un contenedor con `padding: 2px`, con un hijo de fondo sólido adentro.

```
marco:
    padding 2px
    background-image EL_DEGRADÉ · background-size 100% 58 · animación omD58 5.8s linear infinite
    box-shadow 4px 4px 0 <color>     # sin blur
    hijo:
        background <sólido>          # #05000E o #0B0018
        el contenido real
```

`T = 58 / D = 5,8 s` es el valor canónico para marcos, independientemente del tamaño del marco: los marcos no son texto y la regla de 1,6× no aplica.

**Nunca** pongas el degradé como relleno de un botón: el texto pierde contraste cada vez que pasa el magenta.

### 3.2 Variante campo compartido

Para grupos de elementos alineados al mismo borde (barras de gráfico, segmentos):

```
para cada elemento i:
    h_i = alto del elemento
    delay_i = −(((H − h_i) mod T) ÷ T) × D
```

donde `H` = alto del contenedor. Todos los elementos usan el mismo degradé, la misma `background-size: 100% T` y la misma animación; sólo cambia el `animation-delay`. El resultado es un degradé que atraviesa el grupo como una sola lámina.

Si en cambio le das a cada elemento su propio degradé sin delay, las barras cortas quedan todas magenta y las largas todas violetas: el color pasa a codificar la altura, que ya está codificada.

### 3.3 El interruptor de apagado

Un solo booleano derivado en el modelo, verdadero si **cualquiera** de:

- pantalla always-on del reloj
- `accessibilityReduceMotion` activo
- batería baja

Cuando es verdadero: **todas** las capas se apagan. Ningún degradé, ningún fantasma, ninguna inclinación, ninguna animación corriendo. Todo dato que llevaba mix pasa a `#7FF9FF` plano. La trama dither y el plasma también se apagan.

No lo implementes como "atenuar el mix": atenuar las tres capas al 42 % hace que el magenta caiga bajo el piso de contraste y el número desaparezca y reaparezca solo, y encima sigue gastando batería.

---

## 4. Tabla de instancias

Cada elemento del diseño que lleva alguna capa. Verificá contra esta tabla.

| # | Superficie | Elemento | Tam. | T | D | Fantasma | Skew | Nota |
|---|---|---|---|---|---|---|---|---|
| 1 | Barra de menú | `YOU'VE GOT / NEWS` | 7 | 30 | 3,0 s | 1 px | **sí** | bloque de 2 líneas, `line-height 9`, alto 18 |
| 2 | Reloj · banner | `$12.08` | 46 | 72 | 7,2 s | 3 px | **sí** | |
| 3 | Reloj · long look | `$12.08` | 34 | 58 | 5,8 s | 2 px | **sí** | |
| 4 | Reloj · complicación | `$12.08` | 22 | 36 | 3,6 s | 1 px | no | la cara ya tiene su héroe en la hora |
| 5 | Reloj · smart stack | `$12.08` | 30 | 48 | 4,8 s | 2 px | **sí** | |
| 6 | Popover · home | `$12.08` | 20 | 32 | 3,2 s | 1 px | **sí** | |
| 7 | Popover · detalle | `12.08` | 36 | 58 | 5,8 s | 2 px | **sí** | sin `$`, ver §6.1 |
| 8 | Popover · detalle | `3.41` (consumo) | 28 | 45 | 4,5 s | 1 px | no | |
| 9 | Reglas · tarjeta 01 | `$12.08` | 26 | 42 | 4,2 s | 1 px | no | |
| 10 | Reglas · tarjeta 03 | `$2.10` | 26 | 42 | 4,2 s | 1 px | no | |
| 11 | Reglas · tarjeta 04 | `$3.41` | 26 | 42 | 4,2 s | 1 px | no | |
| — | Reglas · tarjeta 02 | `$4.87` | 26 | — | — | — | — | **plano `#FFE600`** — cuando el dato es la alarma, el color es fijo |

Marcos con la variante §3.1 (`T=58 / D=5,8`):

| Superficie | Elemento | Sombra |
|---|---|---|
| Reloj · banner | marco de la alerta | `4px 4px 0 rgba(127,249,255,.85)` |
| Reloj · long look | CTA `RECARGAR` | `4px 4px 0 rgba(255,45,111,.70)` |
| Reloj · cara | marco de la complicación | `4px 4px 0 rgba(255,45,111,.70)` |
| Reloj · smart stack | marco de la tarjeta | `4px 4px 0 rgba(255,45,111,.80)` |
| Popover · home | fila de OpenRouter | `4px 4px 0 rgba(255,45,111,.55)` |
| Popover · detalle | CTA `RECARGAR` | `3px 3px 0 rgba(255,45,111,.60)` |
| Popover · detalle | caja `RELOJ · NTFY` | `4px 4px 0 rgba(255,45,111,.50)` |

Campos compartidos con la variante §3.2:

| Superficie | Barras | H | T | D | Ancho de barra | Gap |
|---|---|---|---|---|---|---|
| Popover · gráfico | 14 | 56 | 58 | 5,8 s | 12 fijo | 8 |
| Reloj · long look | 14 | 38 | 58 | 5,8 s | `flex:1` | 3 |
| Reloj · smart stack | 14 | 32 | 58 | 5,8 s | `flex:1` | 2 |
| Reloj · banner sparkline | 10 | 36 | 58 | 5,8 s | `flex:1` | 4 |
| Reloj · complicación sparkline | 10 | 22 | 36 | 3,6 s | `flex:1` | 2 |

**Datos de las barras** (14 días, el último es hoy):

```
[1.2, 0.4, 2.1, 3.0, 0.9, 1.8, 4.2, 2.6, 0.3, 1.1, 3.4, 2.2, 1.6, 3.41]   máximo de escala: 4.2
alto_i = max(2, round(valor_i / 4.2 × H))
```

Los sparklines de 10 barras usan los últimos 10 valores (índices 4–13).
Días sin dato: barra plana `rgba(255,255,255,.18)`, sin degradé ni animación.

---

## 5. Árboles de layout

### 5.1 Barra de menú (26 pt de alto, el label se alinea a la derecha)

**Estado quieto** (`hasNews == false`):
```
label (col · align center · SSr 6.5 · line-height 9 · color #E7E2F5@40)
├ → "you've got"
└ → "no mail"
```

**Estado con noticias** (`hasNews == true`) — instancia #1 de la tabla:
```
label = mix(bloque, 7)          # bloque = col · align center · SS 7 · line-height 9
  cada capa contiene:
  ├ → "YOU'VE GOT"              # 10 caracteres, el espacio incluido
  └ → "NEWS"
```

### 5.2 Reloj — banner / short look

Pantalla 274 × 334 (mockup). `col`, `overflow hidden`, fondo `#05000E`.

```
pantalla
├ plasma (abs · inset -25% · 3 radiales · blur 7 · 9 s)
├ dither (abs · inset 0 · z 3)
├ header (pad 20 20 0 · row · gap 8 · align center · z 4)
│ ├ marca (14×14 · bg #7FF9FF · shadow 3px 3px 0 #FF2D6F)
│ ├ → "SALDOBAR" (SS 10 · ls .06em · #fff)
│ ├ spacer (flex 1)
│ └ → "14:32" (SS 10 · #fff@55)
├ bloque de saldo (pad 18 20 0 · col · gap 10 · z 4)
│ ├ → "TE QUEDAN" / "YOU HAVE LEFT" (SS 10 · ls .1em · #7FF9FF)
│ ├ héroe = mix("$12.08", 46)          # instancia #2
│ └ → "DE $25.00 · ~3.5 DIAS" (SS 9.5 · line-height 1.9 · #fff@80 · margin-top 4)
├ sparkline (pad 18 20 0 · row · align flex-end · gap 4 · height 36 · z 4)
│ └ 10 barras · campo compartido · min-height 3
├ spacer (flex 1)
└ marco de alerta (margin 0 14 16 · variante §3.1 · shadow cian)
  └ interior (bg #0B0018 · pad 10 12 · col · gap 5)
    ├ fila (row · gap 7 · align center)
    │ ├ punto (8×8 · bg #7FF9FF · opacidad 0.45↔1 en steps(2), 1.4 s)
    │ └ → "DOLAR 12 CONSUMIDO" / "DOLLAR 12 SPENT" (SS 9.5 · #7FF9FF)
    └ → "24 H $3.41 · $3.41/D" (SS 8.5 · line-height 1.8 · #fff@60)
```

El color del punto, del texto del título y de la sombra del marco los define la regla que disparó (§7.2).

### 5.3 Reloj — long look

```
pantalla
├ plasma (2 radiales · blur 9 · estático)
├ dither (z 3)
├ header (pad 18 20 0 · row · gap 7 · align center · z 4)
│ ├ marca (11×11 · bg #7FF9FF)
│ ├ → "SALDOBAR" (SS 9 · #fff)
│ ├ spacer
│ └ → "14:32" (SS 9 · #fff@50)
├ héroe (pad 12 20 0 · z 4) = mix("$12.08", 34)        # instancia #3
├ tabla (pad 14 20 0 · col · gap 7 · SS 9 · z 4)
│ ├ fila (space-between · border-bottom 1px #7FF9FF@25 · pad-bottom 6)
│ │ ├ → "CONSUMO 24 H" / "SPEND 24 H" (#fff@55)   └ → "$3.41" (#fff)
│ ├ fila (igual)
│ │ ├ → "RITMO" / "BURN" (#fff@55)                └ → "$3.41/D" (#fff)
│ └ fila (sin borde)
│   ├ → "SE ACABA" / "RUNS OUT" (#fff@55)         └ → "~3.5 D" (#FFE600)
├ gráfico (pad 14 20 0 · row · align flex-end · gap 3 · height 38 · z 4)
│ └ 14 barras · campo compartido
├ spacer (flex 1)
└ acciones (pad 0 16 16 · col · gap 7 · z 4)
  ├ CTA primario (variante §3.1 · shadow magenta)
  │ └ interior (bg #05000E · pad 9 0 · center · SS 10 · #fff) → "RECARGAR" / "TOP UP"
  └ CTA secundario (border 2px #7FF9FF@45 · pad 9 0 · center · SS 10 · #fff)
    → "SILENCIAR 1 H" / "MUTE 1 H"
```

### 5.4 Reloj — cara Modular + complicación

```
pantalla (col · pad 26 22 22)
├ dither (z 3)
├ fila superior (space-between · SS 9.5 · z 4)
│ ├ → "MAR 9 AGO" (#FF7A1A)      └ → "18°" (#fff@45)
├ hora → "14:32" (SS 52 · line-height 1.1 · #fff · margin-top 14 · z 4 · PLANA, sin mix)
├ → "62 PPM · 8412 PASOS" (SS 8.5 · #fff@42 · margin-top 14 · line-height 1.9 · z 4)
├ spacer (flex 1)
└ complicación (variante §3.1 · shadow magenta · z 4)
  └ interior (bg #05000E@92 · pad 11 12 · col · gap 8)
    ├ fila (row · gap 6 · align center)
    │ ├ → "SALDOBAR" (SS 8.5 · #7FF9FF · ls .06em)
    │ ├ spacer
    │ └ → "$3.41/D" (SS 8.5 · #fff@50)
    └ fila (row · align flex-end · gap 9)
      ├ mix("$12.08", 22) sin skew                  # instancia #4
      └ sparkline (flex 1 · row · align flex-end · gap 2 · height 22 · 10 barras)
```

La hora de la cara es chrome del sistema, no un elemento de SaldoBar: va plana.

### 5.5 Reloj — always-on

Sin plasma, sin dither, sin ninguna animación. Pantalla al 50 % de opacidad global sobre `#000`.

```
pantalla (col · pad 26 22 22 · opacity .5 · bg #000)
├ fila superior (space-between · SS 9.5)
│ ├ → "MAR 9 AGO" (#B0562A)      └ → "18°" (#fff@30)
├ → "14:32" (SS 52 · line-height 1.1 · #fff@82 · margin-top 14)
├ → "62 PPM · 8412 PASOS" (SS 8.5 · #fff@26 · margin-top 14 · line-height 1.9)
├ spacer
└ complicación (border 2px #7FF9FF@45 · pad 11 12 · col · gap 8)
  ├ → "SALDOBAR" (SS 8.5 · #7FF9FF@70 · ls .06em)
  └ → "$12.08" (SS 22 · #7FF9FF · PLANO)
```

### 5.6 Reloj — widget de Smart Stack

```
pantalla (col · pad 24 18 · gap 10)
├ dither (z 3)
├ fila (space-between · SS 8.5 · #fff@45 · z 4)
│ ├ → "SMART STACK"    └ → "14:32"
├ tarjeta (variante §3.1 · shadow magenta .8 · z 4)
│ └ interior (bg linear-gradient(180deg, rgba(43,184,255,.16), rgba(5,0,14,.92)) · pad 14 · col · gap 10)
│   ├ → "SALDOBAR · OPENROUTER" (SS 8 · #7FF9FF · ls .08em)
│   ├ mix("$12.08", 30)                              # instancia #5
│   ├ gráfico (row · align flex-end · gap 2 · height 32 · 14 barras)
│   └ → "$3.41/DIA · ~3.5 DIAS" (SS 8 · line-height 1.9 · #fff@70)
├ tarjeta vecina (bg #fff@5 · border 1px #2A1F44 · pad 14 · SS 8.5 · #fff@30) → "CALENDARIO"
└ spacer
```

### 5.7 Popover — Widgets home (340 pt)

```
popover (340 · bg #05000E · border 1px #2A1F44 · radius 12 · overflow hidden)
├ header (pad 16 16 12 · col · gap 5)
│ ├ → "WIDGETS" (SS 20 · #fff · PLANO)
│ └ → "1 WIDGET · TODO EN VIVO" (PM 10.5 · ls .06em · #5E5580)
├ cuerpo (pad 0 12 12 · col · gap 8)
│ └ fila de OpenRouter (variante §3.1 · shadow magenta .55)
│   └ interior (bg #0B0018 · pad 12 · row · gap 11 · align center)
│     ├ ícono (34×34 · bg #7FF9FF · row · align flex-end · justify center · gap 3 · pad-bottom 9)
│     │ └ 3 barras de 4px en #05000E, alturas 8 / 14 / 11
│     ├ col (flex 1 · gap 5)
│     │ ├ → "OPENROUTER" (SS 8.5 · #7FF9FF · ls .06em)
│     │ ├ mix("$12.08", 20)                          # instancia #6
│     │ └ → "~3.5 días al ritmo actual" (PM 10.5 · #8E86A8)
│     ├ punto (8×8 · bg #FFE600 · steps(2) 1.4 s)    # sólo si hasNews
│     └ → ">" (SS 11 · #7FF9FF)
├ divisor (1px #2A1F44)
└ pie (pad 12 16 · SS 9.5 · #5E5580) → "[Q] SALIR DE SALDOBAR"
```

**Sólo hay una fila.** No agregues placeholders de otras plataformas: Anthropic y Gemini son roadmap del README del repo, no UI.

### 5.8 Popover — detalle de OpenRouter (340 pt)

```
popover (340 · bg #05000E · border 1px #2A1F44 · radius 12 · overflow hidden)
├ volver (pad 10 14 6 · SS 9.5 · #7FF9FF) → "< WIDGETS"
├ header de saldo (relative · overflow hidden · pad 14 16 18)
│ ├ plasma (abs · inset -40% · 2 radiales · blur 8 · 11 s)
│ ├ dither (abs · inset 0 · conic con rgba(5,0,14,.62))
│ └ contenido (relative · col · gap 8)
│   ├ fila de estado (row · gap 7 · align center · SS 8.5 · ls .06em)
│   │ ├ punto (8×8 · bg según estado)   ├ → "CONECTADO" (#fff)
│   │ ├ spacer                          └ → "HACE 14 S" (#fff@50)
│   ├ fila (row · align baseline · gap 10)
│   │ ├ mix("12.08", 36)                            # instancia #7
│   │ └ → "RESTANTES" (SS 9 · #7FF9FF)
│   └ → "DE $25.00 · 24 H $3.41 · ~3.5 D" (SS 8 · line-height 1.9 · #fff@70)
└ cuerpo (pad 0 12 14 · col · gap 12)
  ├ acciones (row · gap 8)
  │ ├ secundario (flex 1 · border 2px #7FF9FF@40 · pad 9 0 · center · SS 9 · #E7E2F5) → "ACTUALIZAR"
  │ └ primario (flex 1 · variante §3.1 · shadow 3px magenta)
  │   └ interior (bg #05000E · pad 7 0 · center · SS 9 · #fff) → "RECARGAR"
  ├ sección CONSUMO (border 1px #2A1F44 · pad 12 · col · gap 11)
  │ ├ → "CONSUMO" (SS 8.5 · ls .1em · #FFE600)
  │ ├ selector (row · gap 4) — 5 segmentos flex 1, center, SS 8, pad 6 0
  │ │   inactivo: border 1px #2A1F44 · #5E5580
  │ │   activo:   bg #FFE600 · #05000E · border 1px #FFE600
  │ │   → "1H" "12H" "24H"(activo) "7D" "30D"
  │ ├ fila (row · align baseline · gap 10)
  │ │ ├ mix("3.41", 28)                             # instancia #8
  │ │ └ → "consumido en 24 h ⏎ ≈ $3.41 por día" (PM 10 · line-height 1.7 · #8E86A8)
  │ ├ gráfico (row · align flex-end · gap 8 · height 56) — 14 barras de 12px, campo compartido
  │ └ eje (row · space-between · SS 7.5 · #5E5580) → "-14 D" · "HOY"
  ├ sección NOTICIAS (border 1px #2A1F44 · pad 12 · col · gap 10)
  │ ├ → "NOTICIAS" (SS 8.5 · ls .1em · #FFE600)
  │ └ 3 filas (row · gap 9 · align center)
  │     no leída: marcador 7×7 sólido #FF2D6F · fila a opacidad 1
  │     leída:    marcador 7×7 border 1px #3A2C5E · fila a opacidad .55
  │     ├ marcador · ├ → "Consumido $12" (PM 11 · #E7E2F5) + " · total $12.92" (#5E5580)
  │     └ → "14 S" (SS 7.5 · #5E5580)
  ├ sección CONEXIÓN (border 1px #2A1F44 · pad 12 · col · gap 11)
  │ ├ → "CONEXIÓN" (SS 8.5 · ls .1em · #FFE600)
  │ ├ fila (row · gap 8)
  │ │ ├ campo (flex 1 · bg #0B0018 · border 1px #2A1F44 · pad 7 9 · PM 11 · ls 1px · #8E86A8) → "••••••••••••"
  │ │ └ botón (bg #7FF9FF · #05000E · SS 8.5 · pad 0 12) → "OK"
  │ ├ fila (row · gap 7 · align center · PM 10 · #7FF9FF)
  │ │ ├ cuadrado (8×8 · bg #7FF9FF)   └ → "Guardada en Keychain"
  │ └ fila (row · gap 8 · align center)
  │   ├ → "Intervalo" (flex 1 · PM 11 · #8E86A8)
  │   └ selector (border 1px #2A1F44 · pad 5 10 · SS 8.5 · #E7E2F5) → "1 MIN ▾"
  └ sección RELOJ · NTFY (variante §3.1 · shadow 4px magenta .5)
    └ interior (bg #05000E · pad 12 · col · gap 11)
      ├ fila (row · gap 8 · align center)
      │ ├ → "RELOJ · NTFY" (flex 1 · SS 8.5 · ls .1em · #7FF9FF)
      │ └ toggle (30×14 · bg #7FF9FF · pad 1 · justify flex-end)
      │   └ perilla (12×12 · bg #05000E)          # cuadrada, sin radio
      ├ fila (row · gap 8 · align center)
      │ ├ campo (flex 1 · bg #0B0018 · border 1px #2A1F44 · pad 7 9 · PM 10.5 · #E7E2F5) → "saldobar-7f3a91"
      │ └ botón (border 1px #2A1F44 · pad 7 9 · SS 8 · #8E86A8) → "QR"
      ├ reglas (col · gap 8) — 4 filas (row · gap 8 · align center)
      │ ├ cuadrado 7×7 #7FF9FF · → "Cada dólar consumido" (flex 1 · PM 10.5 · #E7E2F5)
      │ ├ cuadrado 7×7 #FFE600 · → "Saldo bajo" · → "$5.00" (SS 8 · #8E86A8)
      │ ├ cuadrado 7×7 #FF2D6F · → "Pico de consumo" · → "3×" (SS 8 · #8E86A8)
      │ └ [opacidad .45] cuadrado 7×7 border 1px #3A2C5E · → "Resumen diario" · → "21:00"
      └ CTA (center · SS 9 · bg #FFE600 · #05000E · pad 9 0) → "PROBAR EN EL RELOJ"
```

### 5.9 Tarjetas de las cuatro reglas (referencia de taxonomía, no UI de la app)

Cuatro tarjetas de 224 de ancho, `bg #0B0018 · border 2px <color> · shadow 5px 5px 0 <color a 25-30%> · pad 16 · col · gap 10`:

```
tarjeta
├ → "0N · <NOMBRE>" (SS 8.5 · <color> · ls .08em)
├ número — mix(valor, 26) sin skew, salvo la tarjeta 02 que va plana en #FFE600
├ → "<contexto>" (SS 8 · line-height 1.9 · #fff@65)
└ → "<explicación>" (PM 10.5 · line-height 1.7 · #8E86A8 · border-top 1px #2A1F44 · pad-top 9)
```

Colores por tarjeta: 01 `#7FF9FF` · 02 `#FFE600` · 03 `#FF2D6F` · 04 `#A56BFF`.
Sin inclinación en ninguna: una grilla no tiene héroe.

---

## 6. Copy

### 6.1 Regla de formato de montos

Del código existente (`Models/NewsItem.swift`, `BalanceFormatting.usd`): locale fijo `en_US`, dos decimales, prefijo `$`. Los precios se muestran como `$12.08` sin importar el locale del sistema.

**Excepción heredada**: en el header del popover, el saldo se imprime con `.number.precision(.fractionLength(2))`, **sin el signo `$`** — dice `12.08`, con la palabra `RESTANTES` al lado. En el reloj y en el home sí lleva `$`. No lo "arregles": es intencional y ya está así en `BalanceHeaderView.swift`.

### 6.2 Strings bilingües

El español es primario; el inglés es un toggle. Los strings que cambian:

| ES | EN |
|---|---|
| `TE QUEDAN` | `YOU HAVE LEFT` |
| `DE $25.00 · ~3.5 DIAS` | `OF $25.00 · ~3.5 DAYS` |
| `DOLAR 12 CONSUMIDO` | `DOLLAR 12 SPENT` |
| `CONSUMO 24 H` | `SPEND 24 H` |
| `RITMO` | `BURN` |
| `SE ACABA` | `RUNS OUT` |
| `RECARGAR` | `TOP UP` |
| `SILENCIAR 1 H` | `MUTE 1 H` |
| `$3.41/DIA · ~3.5 DIAS` | `$3.41/DAY · ~3.5 DAYS` |
| `DOLAR ENTERO` | `WHOLE DOLLAR` |
| `SALDO BAJO` | `LOW BALANCE` |
| `PICO` | `SPIKE` |
| `RESUMEN 21:00` | `DAILY 21:00` |
| `TE QUEDAN · DOLAR 12` | `LEFT · DOLLAR 12` |
| `BAJO $5.00 · ~1.4 DIAS` | `UNDER $5.00 · ~1.4 DAYS` |
| `EN 1 H · 3.6× TU MEDIA` | `IN 1 H · 3.6× YOUR AVG` |
| `HOY · +18% VS AYER` | `TODAY · +18% VS YEST.` |

El resto del chrome del popover queda en español (es una app en español).

### 6.3 Datos de ejemplo usados en todo el diseño

```
creditsTotal   25.00
creditsUsed    12.92
creditsLeft    12.08
consumo 24 h    3.41
ritmo           3.41 / día
autonomía      ~3.5 días        # = creditsLeft / ritmo
último dólar   12
noticias       "Consumido $12" / total $12.92 / hace 14 s   (no leída)
               "Consumido $11" / total $11.04 / hace 2 h    (leída)
               "Consumido $10" / total $10.16 / hace 5 h    (leída)
```

---

## 7. Modelo y reglas

### 7.1 Estado nuevo

Lo existente en `AppModel` alcanza para el popover. Para las alertas:

```swift
ntfyEnabled: Bool
ntfyTopic: String            // en Keychain, no UserDefaults: el topic es un secreto de facto
rules: Set<AlertRule>        // .wholeDollar, .lowBalance, .spike, .dailySummary
lowBalanceThreshold: Double  // default 5.00
spikeMultiplier: Double      // default 3.0
dailySummaryHour: Int        // default 21
lastSentAt: Date?
mixDisabled: Bool            // derivado: alwaysOn || reduceMotion || lowPower
```

Generá el topic con alta entropía: `"saldobar-" + 8 hex`. Es público por diseño; decilo en la UI.

### 7.2 Las cuatro reglas

| Regla | Disparo | Color | Rearme |
|---|---|---|---|
| `wholeDollar` | `floor(total_usage)` cruza un entero | `#7FF9FF` | continuo, tope de 8 por poll |
| `lowBalance` | `creditsLeft < threshold` | `#FFE600` | cuando `creditsLeft` vuelve a superar el umbral |
| `spike` | consumo de 1 h > `multiplier ×` promedio diario de 7 d | `#FF2D6F` | no dispara con menos de 3 días de ledger |
| `dailySummary` | reloj, a `dailySummaryHour` | `#A56BFF` | diario |

`wholeDollar` ya está implementada en `AppModel.evaluateDollarAlerts`: reusá la lógica de `lastReportedDollar` y su tope de 8 (con el mensaje agregado "Se consumieron N $ en total" cuando se pasa).

El color de la regla se aplica a: el punto pulsante del banner, el texto del título de la alerta, y la sombra desplazada del marco. **El marco en sí lleva el degradé a la deriva**, no el color de la regla.

---

## 8. Restricciones de plataforma

Leer antes de estimar. Cambian el alcance, no el diseño.

1. **Si las alertas llegan por la app de ntfy, no podés estilar la notificación.** El banner y el long look de §5.2 y §5.3 requieren **una app de iOS con extensión de notificación + una app de watchOS**. Con ntfy solo obtenés texto plano. Decidí esto primero.
2. **Complicación y Smart Stack requieren WidgetKit dentro de una app de watchOS.** No hay atajo.
3. **En WidgetKit no hay animación.** Las instancias #4 y #5 de la tabla se renderizan como **un solo fotograma** del degradé: elegí el desplazamiento que deja el cian arriba del glifo. Las tres capas completas sólo viven en la barra de menú, el popover y la UI de notificación custom.
4. **Presupuesto de refresco de complicaciones**: el saldo se va a ver con retraso. Mostrá siempre la marca de tiempo del dato.
5. **watchOS no permite watch faces de terceros.** §5.4 dibuja una cara como contexto; lo implementable es la complicación dentro de ella.

---

## 9. Implementación en SwiftUI

- **Relleno a la deriva**: `TimelineView(.animation)` + un `VStack` de `LinearGradient` repetidos de alto `T`, con `.offset(y: -(t * 10).truncatingRemainder(dividingBy: T))`, dentro de `.mask(Text(...))`. `foregroundStyle(LinearGradient)` directo **no sirve**: no permite baldosear ni desplazar.
- **Fantasmas**: `ZStack` con dos `Text` de color plano y `.offset(x:)` animado, debajo del `Text` enmascarado.
- **Inclinación**: `.transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(angle), d: 1, tx: 0, ty: 0))`. `rotationEffect` no produce skew.
- **Campo compartido**: pasá el retraso calculado como **fase inicial del `TimelineView`** de cada barra, no como `.animation(.delay)`.
- **Barra de menú**: la app ya usa `NSStatusItem` + `NSHostingView` y `TimelineView(.animation(minimumInterval: 1.0/20.0))` en `NewsLabel`. Reusá ese patrón; 20 fps sobran para 10 px/s. Pausá el `TimelineView` cuando `hasNews == false`.
- **Un solo modificador.** Escribí el mix como `.mixFill(size:)`, `.mixGhost(size:)`, `.mixSkew()` con el interruptor de §3.3 adentro, y que todas las pantallas lo consuman. No lo reimplementes por vista: doce copias del mismo cálculo es cómo se filtra un `T` mal calculado.

---

## 10. Criterios de aceptación

Verificables sin ver la pantalla. Recorrelos al terminar.

1. Para cada uno de los 11 elementos con relleno de la tabla §4: `T == round(size × 1.6)` y `D == T / 10`.
2. Existe un keyframe/animación distinto por cada valor distinto de `T` en uso, y cada uno desplaza exactamente `−T`. Valores en uso: **30, 32, 36, 42, 45, 48, 58, 72**.
3. Ningún `D < 3.0`.
4. Contando por pantalla, los elementos con la capa de inclinación son exactamente: barra de menú 1, banner 1, long look 1, cara 0, always-on 0, smart stack 1, popover home 1, popover detalle 1, grilla de reglas 0.
5. Cada elemento con mix tiene exactamente 3 capas: 2 fantasmas + 1 relleno. Ninguna capa tiene tamaño 0.
6. En cada grupo de barras, todos los elementos comparten el mismo degradé y `background-size`, y tienen **retrasos distintos entre sí** salvo cuando dos barras tienen la misma altura.
7. Ningún botón tiene el degradé como relleno de fondo. Los 7 marcos de §4 lo tienen en un borde de 2 px con interior sólido.
8. Ningún texto en IBM Plex Mono lleva mix.
9. La tarjeta 02 (saldo bajo) tiene el número plano en `#FFE600`.
10. Con `mixDisabled == true`: cero animaciones activas, cero degradés, y todos los datos en `#7FF9FF`.
11. El wordmark de la barra de menú contiene los 10 caracteres de `"YOU'VE GOT"`, con el espacio.
12. Ningún `border-radius` distinto de 0, salvo el popover (12) y el hardware del reloj.
