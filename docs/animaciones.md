# Documentación de Animaciones — 3r1ksec.dev

## Índice

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Terminal animada (terminal.js)](#terminal-animada-terminaljs)
3. [Efecto glitch del logo y nav (script.js)](#efecto-glitch-del-logo-y-nav-scriptjs)
4. [CSS: animaciones y efectos visuales](#css-animaciones-y-efectos-visuales)
5. [Glitch automático en "Erik Gavilán"](#glitch-automático-en-erik-gavilán-scriptjs)

---

## Estructura del proyecto

```
3r1ksec.dev/
├── index.html          ← HTML principal
├── script.js           ← Efecto glitch del logo "3r1k" y links del nav
├── terminal.js         ← Animación de la terminal falsa
├── styles/
│   └── styles.css      ← Todos los estilos (base, nav, hero, terminal, responsive)
├── assets/
│   └── spartan_logo-removebg-preview.png  ← Logo del casco espartano
└── docs/
    └── animaciones.md  ← Este archivo
```

---

## Terminal animada (terminal.js)

### Concepto

Simula una terminal de Linux que "escribe" comandos y muestra output automáticamente.
Se ejecuta en **bucle infinito**: escribe toda la secuencia, ejecuta `clear` y vuelve a empezar.

### Flujo general

```
loop()  →  runSequence()  →  recorre SEQUENCE paso a paso  →  al llegar a "clear" limpia todo  →  vuelve a runSequence()
```

### 1. La secuencia (SEQUENCE)

```js
const SEQUENCE = [
  { type: "prompt", cmd: "whoami", delay: 600 },
  { type: "output", text: "Erik Gavilán", cls: "white", delay: 400 },
  { type: "pause", delay: 800 },
  ...
  { type: "clear", delay: 400 },
];
```

Es un **array de objetos**. Cada objeto es una instrucción que le dice al código qué hacer. Se recorren en orden, de arriba a abajo.

**Propiedades de cada objeto:**

| Propiedad | Para qué sirve | Ejemplo |
|-----------|----------------|---------|
| `type` | Tipo de acción | `"prompt"`, `"output"`, `"pause"`, `"clear"` |
| `cmd` | Texto del comando (solo en `prompt`) | `"whoami"` |
| `text` | Texto de salida (solo en `output`) | `"Erik Gavilán"` |
| `cls` | Clase CSS para el color (solo en `output`) | `"highlight"` (rojo), `"success"` (verde), `"accent"` (amarillo) |
| `delay` | Milisegundos de espera ANTES de ejecutar | `600` → espera 0.6s antes de actuar |

**Tipos de paso:**

- **`"prompt"`** → Escribe un comando letra a letra con efecto typing
- **`"output"`** → Muestra una línea de resultado de golpe (sin typing)
- **`"pause"`** → Espera un tiempo (simula que el "usuario" lee el output)
- **`"clear"`** → Limpia toda la terminal (como el comando `clear` real)

### 2. Funciones auxiliares

#### `createLine(className)`

```js
function createLine(className = "") {
  const div = document.createElement("div");
  div.className = `line ${className}`;
  terminalBody.appendChild(div);
  return div;
}
```

**Qué hace:** Crea un `<div>` y lo mete dentro de la terminal.

**Lógica:**
1. `document.createElement("div")` → crea un div vacío en memoria
2. `div.className = 'line output highlight'` → le pone las clases CSS
3. `terminalBody.appendChild(div)` → lo inserta al final del cuerpo de la terminal
4. `return div` → devuelve el elemento para que otras funciones lo usen

**Ejemplo de resultado en el DOM:**
```html
<div class="line output highlight"></div>
```

Cada línea empieza **invisible** porque en CSS `.line` tiene `opacity: 0`.

#### `showLine(el)`

```js
function showLine(el) {
  requestAnimationFrame(() => {
    el.classList.add("visible");
    terminalBody.scrollTop = terminalBody.scrollHeight;
  });
}
```

**Qué hace:** Hace visible una línea y scrollea hacia abajo.

**Lógica:**
1. `requestAnimationFrame(callback)` → ejecuta el callback en el **siguiente frame de renderizado**
2. Dentro del callback:
   - `el.classList.add("visible")` → añade la clase que activa `opacity: 1` con transición CSS
   - `terminalBody.scrollTop = terminalBody.scrollHeight` → fuerza el scroll al fondo

**¿Por qué `requestAnimationFrame`?**

Si añadimos `"visible"` en el mismo instante que creamos el elemento, el navegador no detecta cambio alguno (para él, el elemento "siempre" tuvo esa clase). La transición CSS necesita:
1. Frame 1: el navegador renderiza el elemento con `opacity: 0`
2. Frame 2: detecta el cambio a `opacity: 1` → activa la transición

`requestAnimationFrame` garantiza que el paso 2 ocurra en un frame distinto al paso 1.

#### `sleep(ms)`

```js
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
```

**Qué hace:** Pausa la ejecución durante `ms` milisegundos.

**Lógica:**
- Crea una `Promise` (un "contenedor" que representa un valor futuro)
- Dentro pone un `setTimeout` que resuelve la Promise después de `ms` milisegundos
- `r` es la función `resolve` — al llamarla, la Promise se completa
- Al usar `await sleep(500)`, la función async se pausa 500ms y luego continúa

**Sin sleep (callback hell):**
```js
setTimeout(() => {
  // hacer algo
  setTimeout(() => {
    // hacer otra cosa
    setTimeout(() => {
      // y otra más...
    }, 300);
  }, 200);
}, 500);
```

**Con sleep (limpio):**
```js
await sleep(500);
// hacer algo
await sleep(200);
// hacer otra cosa
await sleep(300);
// y otra más
```

### 3. typeText() — El efecto de escritura

```js
async function typeText(el, text, speed = 45) {
  const span = el.querySelector(".cmd") || el;
  span.classList.add("typing");
  for (let i = 0; i < text.length; i++) {
    span.textContent += text[i];
    await sleep(speed + Math.random() * 30);
  }
  span.classList.remove("typing");
}
```

**Qué hace:** Escribe texto caracter a caracter, simulando que alguien teclea.

**Lógica paso a paso:**

1. **Buscar el span destino:**
   ```js
   const span = el.querySelector(".cmd") || el;
   ```
   Busca `<span class="cmd">` dentro de la línea. Ahí es donde va el texto.

2. **Activar cursor:**
   ```js
   span.classList.add("typing");
   ```
   En CSS, `.cmd.typing` tiene `border-right-color: #c81e32` → aparece una rayita roja a la derecha simulando un cursor.

3. **Bucle de escritura:**
   ```js
   for (let i = 0; i < text.length; i++) {
     span.textContent += text[i];
     await sleep(speed + Math.random() * 30);
   }
   ```

   Para el texto `"whoami"`:
   | Iteración | `text[i]` | `span.textContent` | Espera (aprox) |
   |-----------|-----------|--------------------|--------------  |
   | 0 | `"w"` | `"w"` | 52ms |
   | 1 | `"h"` | `"wh"` | 68ms |
   | 2 | `"o"` | `"who"` | 47ms |
   | 3 | `"a"` | `"whoa"` | 61ms |
   | 4 | `"m"` | `"whoam"` | 49ms |
   | 5 | `"i"` | `"whoami"` | 73ms |

   **¿Por qué `Math.random() * 30`?**
   - `speed` = 45ms (velocidad base)
   - `Math.random()` devuelve un número entre 0 y 1 (ej: 0.73)
   - `0.73 * 30` = 21.9ms
   - Total: 45 + 21.9 = **66.9ms** para esa letra
   - Cada letra tarda entre **45ms y 75ms**
   - La variación hace que parezca escritura humana (no una máquina a velocidad constante)

4. **Quitar cursor:**
   ```js
   span.classList.remove("typing");
   ```
   El comando ya está escrito → el cursor desaparece.

### 4. runSequence() — La función que orquesta todo

```js
async function runSequence() {
  for (const step of SEQUENCE) {
    // maneja cada tipo de paso...
  }
}
```

**Qué hace:** Recorre el array SEQUENCE y ejecuta cada paso según su tipo.

**Para cada tipo:**

#### Tipo `"pause"`
```js
if (step.type === "pause") {
  await sleep(step.delay);
  continue;
}
```
Simplemente espera y pasa al siguiente paso. Simula el tiempo que un usuario tardaría en leer el output.

#### Tipo `"clear"`
```js
if (step.type === "clear") {
  await sleep(step.delay);
  terminalBody.innerHTML = "";
  continue;
}
```
Espera un momento y luego borra TODO el contenido de la terminal. `innerHTML = ""` elimina todos los `<div class="line">` que se habían creado.

#### Tipo `"prompt"`
```js
if (step.type === "prompt") {
  await sleep(step.delay);       // 1. espera antes de empezar
  const line = createLine();      // 2. crea una línea nueva
  const prompt = ...              // 3. crea <span class="prompt"> (muestra "❯ ")
  const cmd = ...                 // 4. crea <span class="cmd"> (aquí va el texto)
  line.appendChild(prompt);       // 5. mete el prompt en la línea
  line.appendChild(cmd);          // 6. mete el cmd en la línea
  showLine(line);                 // 7. hace visible la línea
  await typeText(cmd, step.cmd);  // 8. escribe el comando letra a letra
  await sleep(200);               // 9. pausa antes del output
  continue;
}
```

**Resultado en el DOM:**
```html
<div class="line visible">
  <span class="prompt"></span>     ← CSS ::before añade "❯ "
  <span class="cmd">whoami</span>  ← typeText escribió esto
</div>
```

**Línea de tiempo para `{ type: "prompt", cmd: "whoami", delay: 600 }`:**
```
0ms      → empieza
600ms    → sleep(delay) termina, se crea la línea
600ms    → showLine() hace visible la línea (transición 0.3s)
600ms    → typeText() empieza a escribir "whoami"
~950ms   → typeText() termina (~350ms para 6 letras)
~1150ms  → sleep(200) termina, pasa al siguiente paso
```

#### Tipo `"output"`
```js
if (step.type === "output") {
  await sleep(step.delay);
  const line = createLine(`output ${step.cls || ""}`);
  line.textContent = step.text;  // texto de golpe, sin typing
  showLine(line);
  continue;
}
```

A diferencia de `"prompt"`, el texto aparece de golpe (no letra a letra). Solo tiene la transición CSS de opacidad (fade in).

### 5. loop() — El bucle infinito

```js
async function loop() {
  while (true) {
    await runSequence();
  }
}
loop();
```

**Qué hace:** Ejecuta la secuencia infinitamente.

**Flujo:**
1. `runSequence()` recorre toda la SEQUENCE
2. Al llegar a `"clear"`, borra la terminal y el `for` termina
3. `runSequence()` retorna → `loop()` vuelve al `while(true)` y llama `runSequence()` otra vez
4. La terminal empieza desde cero

**¿Por qué `while(true)` no bloquea el navegador?**
Porque nunca ejecuta código de forma continua. Todas las esperas son con `await sleep()`, que devuelve el control al event loop del navegador. El navegador puede seguir renderizando, respondiendo a clics, etc.

### Línea de tiempo completa de un ciclo

```
0.0s    ❯ whoami                    ← typing (0.6s delay + ~0.35s escritura)
~1.4s   Erik Gavilán                ← output instantáneo
~1.5s   Ciberseguridad & Rust...    ← output instantáneo
~2.3s   (pausa 800ms)
~2.8s   ❯ cat /etc/stack.conf      ← typing
~4.0s   lang      = Rust, Python    ← outputs van apareciendo
~4.2s   framework = Axum, Flask
~4.35s  os        = Arch Linux...
~4.5s   wm        = Hyprland
~4.65s  focus     = Offensive...
~5.55s  (pausa 900ms)
~6.05s  ❯ ls ~/projects --active   ← typing
~7.5s   drwxr-xr-x  scraber/       ← outputs
~7.65s  drwxr-xr-x  skillhub/
~8.55s  (pausa 900ms)
~9.05s  ❯ cargo build --release    ← typing
~10.5s  Compiling portfolio...
~11.1s  Finished `release`...
~11.7s  (pausa 600ms)
~12.2s  ❯ clear                    ← typing
~12.6s  (terminal se limpia)
~12.6s  → VUELVE A EMPEZAR
```

---

## Efecto glitch del logo y nav (script.js)

### Concepto

Cuando el cursor pasa sobre el logo espartano, las letras "3r1k" aparecen una a una con un efecto de scramble (caracteres aleatorios que se resuelven en la letra real). Al salir el cursor, desaparecen en orden inverso. Los links del nav tienen un efecto similar.

### 1. Preparación: dividir texto en spans

```js
nameId.innerHTML = text.split('').map(c =>
  `<span data-char="${c}">${c}</span>`
).join('');
```

**Qué hace:** Convierte `"3r1k"` en 4 `<span>` individuales.

**Paso a paso:**
1. `"3r1k".split('')` → `["3", "r", "1", "k"]`
2. `.map(c => ...)` → transforma cada letra en un string HTML:
   - `"3"` → `'<span data-char="3">3</span>'`
   - `"r"` → `'<span data-char="r">r</span>'`
   - etc.
3. `.join('')` → junta los 4 strings en uno solo
4. `nameId.innerHTML = ...` → reemplaza el contenido del h2

**Resultado en el DOM:**
```html
<h2 id="name">
  <span data-char="3">3</span>
  <span data-char="r">r</span>
  <span data-char="1">1</span>
  <span data-char="k">k</span>
</h2>
```

**¿Por qué `data-char`?** Para guardar la letra original. Durante el scramble, `textContent` cambia a caracteres random, así que necesitamos recordar cuál era la letra real para restaurarla después.

**¿Por qué empiezan invisibles?** En CSS, `#name span { opacity: 0 }`. El JS controla cuándo aparecen.

### 2. Hover enter: letras aparecen con scramble

```js
nameContainer.addEventListener('mouseenter', () => {
  if (running) return;
  running = true;

  const spans = nameId.querySelectorAll('span');

  spans.forEach((span, i) => {
    setTimeout(() => {
      span.style.opacity = '1';
      let ticks = 0;

      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch');
        ticks++;

        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');
          if (i === spans.length - 1) running = false;
        }
      }, 80);
    }, i * 120);
  });
});
```

**Lógica del efecto, desglosada:**

#### Semáforo (`running`)
```js
if (running) return;
running = true;
```
Evita que si mueves el cursor rápido dentro y fuera, la animación se lance varias veces encima de sí misma. Mientras `running = true`, cualquier nuevo `mouseenter` se ignora.

#### Delay escalonado (`setTimeout`)
```js
spans.forEach((span, i) => {
  setTimeout(() => {
    // animación de esta letra...
  }, i * 120);
});
```

| Letra | `i` | Delay (`i * 120`) | Empieza a... |
|-------|-----|-------------------|--------------|
| "3"   | 0   | 0ms               | Inmediato    |
| "r"   | 1   | 120ms             | 0.12s        |
| "1"   | 2   | 240ms             | 0.24s        |
| "k"   | 3   | 360ms             | 0.36s        |

Esto crea el efecto de que las letras aparecen **de izquierda a derecha**, una después de otra.

#### Scramble de cada letra (`setInterval`)
```js
span.style.opacity = '1';  // la letra se hace visible
let ticks = 0;

const iv = setInterval(() => {
  // cada 80ms: poner caracter random + glow rojo
  span.textContent = characters[Math.floor(Math.random() * characters.length)];
  span.classList.add('glitch');
  ticks++;

  if (ticks > 3) {
    clearInterval(iv);                        // parar el interval
    span.textContent = span.dataset.char;     // poner letra real
    span.classList.remove('glitch');           // quitar glow
  }
}, 80);
```

Para una letra (ej: "3"):
| Tick | Tiempo | textContent | Glow |
|------|--------|-------------|------|
| 1    | 80ms   | `"@"`       | sí   |
| 2    | 160ms  | `"0"`       | sí   |
| 3    | 240ms  | `"#"`       | sí   |
| fin  | 240ms  | `"3"`       | no   |

La letra muestra 3 caracteres aleatorios (de `"!@#€&01x*!"`) con glow rojo, y luego se fija en la letra real.

**`Math.floor(Math.random() * characters.length)`** → genera un índice aleatorio:
- `Math.random()` → número entre 0 y 1 (ej: 0.73)
- `* characters.length` → 0.73 * 10 = 7.3
- `Math.floor()` → 7 (redondea hacia abajo)
- `characters[7]` → `"x"` (el caracter en posición 7)

#### Línea de tiempo completa del hover enter

```
0ms     → "3" se hace visible, empieza scramble
80ms    → "3" muestra caracter random 1
120ms   → "r" se hace visible, empieza scramble
160ms   → "3" muestra caracter random 2
200ms   → "r" muestra caracter random 1
240ms   → "3" muestra caracter random 3 → SE FIJA EN "3"
         → "1" se hace visible, empieza scramble
280ms   → "r" muestra caracter random 2
320ms   → "r" muestra caracter random 3 → SE FIJA EN "r"
         → "1" muestra caracter random 1
360ms   → "k" se hace visible, empieza scramble
...
~600ms  → "k" se fija → running = false
```

### 3. Hover leave: letras desaparecen en orden inverso

```js
nameContainer.addEventListener('mouseleave', () => {
  const spans = nameId.querySelectorAll('span');
  const total = spans.length;  // 4

  spans.forEach((span, i) => {
    const reverseI = total - 1 - i;

    setTimeout(() => {
      let ticks = 0;
      const iv = setInterval(() => {
        span.textContent = characters[...];
        span.classList.add('glitch');
        ticks++;
        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');
          span.style.opacity = '0';  // ← OCULTA la letra
        }
      }, 80);
    }, reverseI * 120);
  });

  running = false;
});
```

**La clave es `reverseI`:**

| Letra | `i` | `reverseI = 3 - i` | Delay (`reverseI * 120`) |
|-------|-----|---------------------|--------------------------|
| "3"   | 0   | 3                   | 360ms (última en irse)   |
| "r"   | 1   | 2                   | 240ms                    |
| "1"   | 2   | 1                   | 120ms                    |
| "k"   | 3   | 0                   | 0ms (primera en irse)    |

"k" empieza su scramble inmediatamente, "1" a los 120ms, "r" a los 240ms, "3" a los 360ms. El efecto es que las letras **desaparecen de derecha a izquierda**.

La única diferencia con el enter es que al final se añade `span.style.opacity = '0'` para ocultar la letra después del scramble.

### 4. Links del nav

Los links usan la misma lógica que el nombre pero más simple:
- Los spans son siempre visibles (no empiezan con `opacity: 0`)
- El scramble usa `3 + i` ticks en vez de solo 3 → efecto escalonado sin `setTimeout`
- No hay hover leave con scramble inverso

```
Letra 0 → para en tick 4  (3 + 0 = 3, ticks > 3)
Letra 1 → para en tick 5  (3 + 1 = 4, ticks > 4)
Letra 2 → para en tick 6  (3 + 2 = 5, ticks > 5)
...
```

Esto crea un efecto cascada: la primera letra se fija antes que la segunda, que se fija antes que la tercera, etc.

---

## CSS: animaciones y efectos visuales

### Cuadrícula del fondo

```css
background-image:
    linear-gradient(rgba(160, 0, 0, 0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(160, 0, 0, 0.25) 1px, transparent 1px);
background-size: 50px 50px;
```

Dos gradientes superpuestos:
- El primero crea líneas **horizontales** (1px roja, luego transparente)
- El segundo (con `90deg`) crea líneas **verticales**
- `background-size: 50px 50px` = cada celda mide 50x50 píxeles
- `0.25` de opacidad = sutil, no distrae

### Gradiente animado del subtítulo

```css
article h2 {
    background: linear-gradient(90deg, #7a0000, #7a0000, #ff0000, #7a0000, #7a0000);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientMove 3s linear infinite;
}
```

Truco: el texto es transparente y el fondo (gradiente) se ve a través de él:
1. `background-clip: text` → el fondo solo se muestra donde hay texto
2. `text-fill-color: transparent` → el texto es invisible, mostrando el fondo
3. `background-size: 200%` → el gradiente es el doble de ancho que el texto
4. `animation: gradientMove` → desplaza el fondo de derecha a izquierda
5. El resultado: una "ola" roja brillante que se mueve por el texto

### Glow pulsante del borde de la terminal

```css
@keyframes borderGlow {
    0%, 100% { border-color: rgba(200, 30, 50, 0.2); }
    50% { border-color: rgba(200, 30, 50, 0.45); }
}
```

El borde alterna entre opacidad 0.2 y 0.45 cada 4 segundos. Efecto sutil de "respiración".

### Scanlines CRT

```css
.terminal-body::after {
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.03) 2px,
        rgba(0, 0, 0, 0.03) 4px
    );
    pointer-events: none;
}
```

Overlay invisible de líneas horizontales muy tenues (3% de opacidad). Simula las líneas de un monitor CRT antiguo. `pointer-events: none` asegura que no bloquea clics.

### Transición de las líneas

```css
.line {
    opacity: 0;
    transform: translateY(4px);
}

.line.visible {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s ease, transform 0.3s ease;
}
```

Cada línea empieza invisible y desplazada 4px hacia abajo. Al añadir `.visible`, sube a su posición y aparece en 0.3s. Efecto de "subir y aparecer".

---

## Botón chitchat — Efecto glitch de descifrado (projects.css)

### Concepto

Al hacer hover sobre el botón "Saber más", un pseudo-elemento (`::before`) tapa el texto con caracteres random que se van "borrando", revelando el texto original. Simula un descifrado de terminal.

### Estructura HTML

```html
<button class="card-btn">
  <span>Saber más</span>
</button>
```

Solo un `<button>` con un `<span>` dentro. El CSS genera el `::before` automáticamente.

### Piezas clave del CSS

#### 1. El `span` es relativo

```css
.card-btn span {
    position: relative;
    background: inherit;
}
```

- `position: relative` → permite que el `::before` se posicione encima
- `background: inherit` → hereda el fondo del botón (importante para tapar el texto)

#### 2. El `::before` es el que hace la magia

```css
.card-btn span::before {
    position: absolute;
    content: "";
    background: inherit;
}
```

- `position: absolute` → se superpone al texto del `span`
- `content: ""` → vacío por defecto, no se ve nada
- `background: inherit` → mismo fondo que el botón → **tapa el texto real**

### Cómo funciona la animación

Al hacer hover, se dispara `@keyframes chitchat` sobre el `::before`:

```css
.card-btn:hover span::before {
    animation: chitchat linear both 1.2s;
}
```

La animación cambia el `content` del `::before` a lo largo de 1.2 segundos:

#### Fase 1 — Ruido creciente (0%–50%)

El `::before` empieza a la izquierda del span (posición por defecto). Va mostrando caracteres random que crecen en cantidad:

```
Tiempo    content       Chars    Lo que ves en pantalla
───────────────────────────────────────────────────────
  0%      "#"           1        #aber más
  5%      "."           1        .aber más
 10%      "^{"          2        ^{ber más
 15%      "-!"          2        -!ber más
 20%      "#$_"         3        #$_er más
 25%      "№:0"         4        №:0r más
 30%      "#{+."        4        #{+. más
 35%      "@}-?"        4        @}-? más
 40%      "?{4@%"       5        ?{4@%más      ← máximo ruido
 45%      "=.,^!"       5        =.,^!más
 50%      "?2@%"        4        ?2@%más
```

El `::before` tapa las primeras letras porque:
- Tiene `position: absolute` (encima del texto)
- Tiene `background: inherit` (mismo color de fondo → las letras tapadas no se ven)
- Su `content` muestra los caracteres random en su lugar

#### Fase 2 — Revelación (60%–100%)

A partir del 60%, aparece `right: 0`. Esto mueve el `::before` a la **derecha** del span:

```
Tiempo    content       right    Lo que ves en pantalla
───────────────────────────────────────────────────────
 60%      "?{%:%"       0        Saber?{%:%
 65%      "|{f[4"       0        Sabe|{f[4
 70%      "{4%0%"       0        Sab{4%0%
 75%      "'1_0<"       0        Sab'1_0<
 80%      "{0%"         0        Saber{0%
 85%      "]>'"         0        Saber]>'
 90%      "4"           0        Saber má4
 95%      "2"           0        Saber má2
100%      ""            0        Saber más        ← limpio
```

Los caracteres se reducen (5→1→0) mientras se desplazan a la derecha, "revelando" el texto original de izquierda a derecha.

### Diagrama visual del flujo completo

```
ESTADO NORMAL (sin hover)
┌────────────────────┐
│                    │
│    Saber más       │  ← texto visible en gris, ::before vacío
│                    │
└────────────────────┘

HOVER → animación empieza (0%–50%)
┌────────────────────┐
│                    │
│    #$_er más       │  ← ::before tapa desde la izquierda
│    ?{4@%más        │  ← ruido crece hasta 5 chars
│                    │
└────────────────────┘

HOVER → revelación (60%–100%)
┌────────────────────┐
│                    │
│    Saber?{%:%      │  ← ::before salta a la derecha (right:0)
│    Saber]>'        │  ← chars se reducen
│    Saber más       │  ← content="" → texto limpio en rojo
│                    │
└────────────────────┘

HOVER END → vuelve al estado normal
```

### ¿Por qué `background: inherit` es clave?

Sin `background: inherit`, el `::before` sería transparente y veríamos **ambos**: el texto real Y los caracteres random superpuestos. Con `inherit`, el pseudo-elemento tiene el mismo fondo que el botón, así que actúa como una "máscara" que tapa el texto que hay debajo.

### Hover adicional del botón

```css
.card-btn:hover {
    background: #252525;
    border-color: #ff000040;
}

.card-btn:hover span {
    color: #ff3333;
}
```

Además del efecto chitchat:
- El fondo se aclara ligeramente (`#1a1a1a` → `#252525`)
- El borde se tiñe de rojo
- El texto pasa de gris a rojo

---

## Glitch automático en "Erik Gavilán" (script.js)

### Concepto

El `<h1>` del hero ("Erik Gavilán") ejecuta un efecto glitch automáticamente: una vez al cargar la página y después cada 60 segundos. Reutiliza `characters` y la clase `.glitch` del proyecto.

### Preparación: spans con `data-char`

```js
const h1 = document.querySelector('article h1');
h1.innerHTML = raw.replace(/(<br\s*\/?>)|(\S)/g, (match, br, ch) => {
  if (br) return br;
  return `<span data-char="${ch}">${ch}</span>`;
});
```

**Qué hace:** Envuelve cada letra del h1 en un `<span data-char="X">`, preservando los `<br>`.

**La regex `/(<br\s*\/?>)|(\S)/g`** captura dos cosas:
- `(<br\s*\/?>)` → cualquier `<br>`, `<br/>` o `<br />` — se deja intacto
- `(\S)` → cualquier carácter no-espacio — se envuelve en span

**Resultado en el DOM:**
```html
<h1>
  <span data-char="E">E</span><span data-char="r">r</span>...<span data-char="k">k</span>
  <br />
  <span data-char="G">G</span><span data-char="a">a</span>...<span data-char="n">n</span>
</h1>
```

### La función `triggerGlitch()`

```js
function triggerGlitch() {
  if (glitchRunning) return;
  glitchRunning = true;

  const spans = h1.querySelectorAll('span');

  spans.forEach((span, i) => {
    setTimeout(() => {
      let ticks = 0;
      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch');
        ticks++;

        if (ticks > 4) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');
          if (i === spans.length - 1) glitchRunning = false;
        }
      }, 60);
    }, i * 80);
  });
}
```

**Lógica:**

1. **Semáforo** (`glitchRunning`): evita que se solape consigo misma si el intervalo se dispara durante una animación en curso.

2. **Delay escalonado** (`i * 80ms`): cada letra empieza su scramble 80ms después de la anterior.

   | Letra | `i` | Delay | Empieza a... |
   |-------|-----|-------|--------------|
   | "E"   | 0   | 0ms   | Inmediato    |
   | "r"   | 1   | 80ms  | 0.08s        |
   | "i"   | 2   | 160ms | 0.16s        |
   | "k"   | 3   | 240ms | 0.24s        |
   | "G"   | 4   | 320ms | 0.32s        |
   | ...   | ... | ...   | ...          |
   | "n"   | 12  | 960ms | 0.96s        |

3. **Scramble por letra** (`setInterval` a 60ms): cada letra muestra ~4 caracteres aleatorios en rojo (clase `.glitch`) y luego restaura el carácter original.

   Para la letra "E":
   | Tick | Tiempo | textContent | Glow rojo |
   |------|--------|-------------|-----------|
   | 1    | 60ms   | `"@"`       | sí        |
   | 2    | 120ms  | `"0"`       | sí        |
   | 3    | 180ms  | `"€"`       | sí        |
   | 4    | 240ms  | `"!"`       | sí        |
   | fin  | 240ms  | `"E"`       | no        |

4. **Desbloqueo**: cuando la última letra (`i === spans.length - 1`) termina su scramble, `glitchRunning` vuelve a `false`.

### Disparo automático

```js
setTimeout(triggerGlitch, 500);     // al cargar, con 500ms de delay
setInterval(triggerGlitch, 60000);  // luego cada 60 segundos
```

- **`setTimeout(triggerGlitch, 500)`**: espera medio segundo tras cargar la página para que el usuario vea el efecto de entrada.
- **`setInterval(triggerGlitch, 60000)`**: repite cada 60 segundos indefinidamente.

### CSS asociado

```css
article h1 span.glitch {
    color: red;
    text-shadow: 0 0 8px red;
}
```

Misma estética que el glitch del logo y nav: texto rojo con glow.

### Línea de tiempo de un ciclo completo

```
0ms      → "E" empieza scramble
60ms     → "E" → "@" (rojo)
80ms     → "r" empieza scramble
120ms    → "E" → "0" (rojo), "r" → "#" (rojo)
160ms    → "i" empieza scramble
180ms    → "E" → "€" (rojo)
240ms    → "E" → SE FIJA EN "E", "k" empieza scramble
...
~1200ms  → "n" (última letra) se fija → glitchRunning = false
```

Duración total: ~1.2 segundos para las 13 letras (12 × 80ms de delay + ~240ms de scramble).
