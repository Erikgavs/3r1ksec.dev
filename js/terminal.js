// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  TERMINAL ANIMADA                                                       ║
// ║                                                                         ║
// ║  Simula una terminal de Linux que "escribe" comandos y muestra output.  ║
// ║  La animación se ejecuta en bucle infinito: escribe toda la secuencia,  ║
// ║  espera 5 segundos y vuelve a empezar desde cero.                       ║
// ║                                                                         ║
// ║  FLUJO GENERAL:                                                         ║
// ║  loop() → limpia terminal → runSequence() → espera 5s → repite         ║
// ║                                                                         ║
// ║  TIPOS DE PASO en la secuencia:                                         ║
// ║  - "prompt"  → escribe un comando letra a letra (efecto typing)         ║
// ║  - "output"  → muestra una línea de resultado de golpe                  ║
// ║  - "pause"   → pausa entre comandos (simula que el usuario "lee")       ║
// ║  - "idle"    → muestra cursor parpadeante y termina la secuencia        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ── SECUENCIA ────────────────────────────────────────────────────────────────
// Array de objetos que define QUÉ se muestra y en qué ORDEN.
// Cada objeto tiene:
//   type  → tipo de paso (prompt | output | pause | idle)
//   cmd   → texto del comando (solo en type: "prompt")
//   text  → texto de salida (solo en type: "output")
//   cls   → clase CSS extra para el color (highlight=rojo, success=verde, accent=amarillo, white=blanco)
//   delay → milisegundos de espera ANTES de ejecutar este paso
const SEQUENCE = [
  // ── Comando 1: whoami ──
  // Simula que el usuario escribe "whoami" y la terminal responde con nombre + rol
  { type: "prompt", cmd: "whoami", delay: 600 },
  { type: "output", text: "Erik Gavilán", cls: "white", delay: 400 },
  {
    type: "output",
    text: "Ciberseguridad & Rust Developer",
    cls: "highlight",    // rojo para destacar el rol
    delay: 100,
  },
  { type: "pause", delay: 800 }, // pausa para que se lea antes del siguiente comando

  // ── Comando 2: cat /etc/stack.conf ──
  // Muestra el stack técnico como si fuera un archivo de configuración
  { type: "prompt", cmd: "cat /etc/stack.conf", delay: 500 },
  { type: "output", text: "lang      = Rust, Python", cls: "", delay: 200 },
  { type: "output", text: "framework = Axum, Flask", cls: "", delay: 150 },
  { type: "output", text: "os        = Arch Linux (btw)", cls: "", delay: 150 },
  { type: "output", text: "wm        = Hyprland", cls: "", delay: 150 },
  {
    type: "output",
    text: "focus     = Offensive Security",
    cls: "highlight",    // rojo porque es el foco principal
    delay: 150,
  },
  { type: "pause", delay: 900 },

  // ── Comando 3: ls ~/projects --active ──
  // Lista los proyectos activos con formato tipo "ls -l"
  { type: "prompt", cmd: "ls ~/projects --active", delay: 500 },
  { type: "output", text: "drwxr-xr-x  scraber/", cls: "accent", delay: 200 },   // amarillo
  { type: "output", text: "drwxr-xr-x  skillhub/", cls: "accent", delay: 150 },  // amarillo
  { type: "pause", delay: 900 },

  // ── Comando 4: cargo build --release ──
  // Simula compilar el portfolio en Rust
  { type: "prompt", cmd: "cargo build --release", delay: 500 },
  { type: "output", text: "Compiling portfolio v1.0.0", cls: "", delay: 300 },
  {
    type: "output",
    text: "Finished `release` profile [optimized]",
    cls: "success",      // verde = compilación exitosa
    delay: 600,
  },
  { type: "pause", delay: 600 },

  // ── Comando 5: clear ──
  // Escribe "clear" y luego limpia la terminal (el JS se encarga de vaciarla)
  { type: "prompt", cmd: "clear", delay: 500 },
  { type: "clear", delay: 400 },
];

// ── REFERENCIA AL DOM ────────────────────────────────────────────────────────
// Es el <div id="terminalBody"> donde se inyectan todas las líneas
const terminalBody = document.getElementById("terminalBody");

// ── FUNCIONES AUXILIARES ─────────────────────────────────────────────────────

/**
 * createLine(className)
 * Crea un <div class="line ..."> y lo añade al cuerpo de la terminal.
 * Cada línea empieza invisible (opacity:0 en CSS) hasta que se llama showLine().
 * El parámetro className permite añadir clases extra como "output highlight".
 */
function createLine(className = "") {
  const div = document.createElement("div");
  div.className = `line ${className}`;
  terminalBody.appendChild(div);
  return div;
}

/**
 * showLine(el)
 * Hace visible una línea añadiendo la clase "visible".
 * Usa requestAnimationFrame para que el navegador procese el cambio de clase
 * en el siguiente frame → esto permite que la transición CSS se active
 * (si añadimos la clase en el mismo frame que creamos el elemento, el
 * navegador no detecta el cambio y la transición no se ve).
 */
/**
 * showLine(el)
 * Hace visible la línea y hace scroll hacia abajo para que siempre
 * se vea la última línea, como en una terminal real.
 */
function showLine(el) {
  requestAnimationFrame(() => {
    el.classList.add("visible");
    terminalBody.scrollTop = terminalBody.scrollHeight;
  });
}

/**
 * sleep(ms)
 * Devuelve una Promise que se resuelve después de `ms` milisegundos.
 * Permite usar "await sleep(500)" para pausar la ejecución de forma limpia
 * dentro de funciones async, en vez de anidar callbacks con setTimeout.
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * typeText(el, text, speed)
 * Simula el efecto de escritura letra a letra dentro de un elemento.
 *
 * LÓGICA:
 * 1. Busca el <span class="cmd"> dentro del elemento (ahí va el texto)
 * 2. Añade la clase "typing" → activa el cursor parpadeante via CSS
 * 3. Recorre cada caracter del texto:
 *    - Lo concatena al contenido del span (aparece en pantalla)
 *    - Espera un tiempo variable: speed + random(0-30)ms
 *      → la variación random hace que parezca escritura humana real,
 *        no una máquina a velocidad constante
 * 4. Al terminar, quita "typing" → el cursor desaparece
 *
 * speed por defecto = 45ms → con el random, cada letra tarda 45-75ms
 * Para "whoami" (6 letras): ~270-450ms de escritura total
 */
async function typeText(el, text, speed = 45) {
  const span = el.querySelector(".cmd") || el;
  span.classList.add("typing");
  for (let i = 0; i < text.length; i++) {
    span.textContent += text[i];
    await sleep(speed + Math.random() * 30);
  }
  span.classList.remove("typing");
}

// ── FUNCIÓN PRINCIPAL: runSequence() ─────────────────────────────────────────
/**
 * Recorre el array SEQUENCE paso a paso y ejecuta cada uno según su tipo.
 * Es async porque usa await para las pausas y el efecto de escritura.
 *
 * FLUJO:
 * Para cada paso del array:
 *
 *   "pause" → simplemente espera step.delay ms y pasa al siguiente paso.
 *             Sirve para dar tiempo al "usuario" a leer el output.
 *
 *   "idle"  → crea una línea con un prompt vacío + cursor parpadeante.
 *             Hace return (termina la función) porque es el último paso.
 *             El cursor queda parpadeando hasta que loop() limpia todo.
 *
 *   "prompt" → simula escribir un comando:
 *     1. Espera step.delay ms (pausa antes de empezar a escribir)
 *     2. Crea una nueva línea <div class="line">
 *     3. Dentro crea <span class="prompt"> → muestra "❯ " via CSS ::before
 *     4. Dentro crea <span class="cmd"> → aquí se escribirá el comando
 *     5. showLine() → hace visible la línea con transición
 *     6. typeText() → escribe el comando letra a letra con cursor
 *     7. Espera 200ms extra → pausa natural antes de mostrar el output
 *
 *   "output" → muestra una línea de resultado de golpe (sin typing):
 *     1. Espera step.delay ms
 *     2. Crea una línea con las clases "output" + la clase de color (cls)
 *     3. Pone el texto directamente (sin animación letra a letra)
 *     4. showLine() → la línea aparece con transición de opacidad
 */
async function runSequence() {
  for (const step of SEQUENCE) {
    if (step.type === "pause") {
      await sleep(step.delay);
      continue;
    }

    if (step.type === "idle") {
      const line = createLine();
      const prompt = document.createElement("span");
      prompt.className = "prompt";
      line.appendChild(prompt);
      const cursor = document.createElement("span");
      cursor.className = "cursor-idle";
      line.appendChild(cursor);
      showLine(line);
      return; // ← termina la secuencia, el cursor queda parpadeando
    }

    //   "clear" → limpia toda la terminal de golpe, como el comando real
    if (step.type === "clear") {
      await sleep(step.delay);
      terminalBody.innerHTML = "";
      continue;
    }

    if (step.type === "prompt") {
      await sleep(step.delay);
      const line = createLine();
      // prompt: el símbolo "❯ " se genera con CSS ::before
      const prompt = document.createElement("span");
      prompt.className = "prompt";
      line.appendChild(prompt);
      // cmd: aquí typeText() escribe el comando letra a letra
      const cmd = document.createElement("span");
      cmd.className = "cmd";
      line.appendChild(cmd);
      showLine(line);
      await typeText(cmd, step.cmd);
      await sleep(200); // pausa natural antes de mostrar el output
      continue;
    }

    if (step.type === "output") {
      await sleep(step.delay);
      // crea la línea con clase "output" + clase de color (highlight, success, etc.)
      const line = createLine(`output ${step.cls || ""}`);
      line.textContent = step.text; // texto completo de golpe (no hay typing)
      showLine(line);
      continue;
    }
  }
}

// ── BUCLE INFINITO ───────────────────────────────────────────────────────────
/**
 * loop()
 * Ejecuta la animación de la terminal en bucle infinito.
 *
 * CICLO:
 * 1. Limpia todo el contenido de la terminal (innerHTML = "")
 * 2. Ejecuta runSequence() → escribe todos los comandos y outputs
 * 3. Cuando runSequence() termina (al llegar a "idle"), el cursor queda parpadeando
 * 4. Espera 5 segundos para que se vea el estado final
 * 5. Vuelve al paso 1 → la terminal se limpia y empieza de nuevo
 *
 * El while(true) nunca bloquea el navegador porque todas las esperas
 * son con await sleep(), que devuelve el control al event loop.
 */
async function loop() {
  while (true) {
    await runSequence();
  }
}

// ── ARRANQUE ─────────────────────────────────────────────────────────────────
// Inicia el bucle nada más cargar el script
loop();
