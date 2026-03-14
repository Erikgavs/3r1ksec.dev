// ── Referencias al DOM ───────────────────────────────────────────────────────
const nameId = document.getElementById("name"); // h2 con el texto "3r1k"
const nameContainer = document.querySelector(".name"); // contenedor del logo + h2

// ── Configuración ────────────────────────────────────────────────────────────
const text = "3r1k"; // texto original del nombre
const characters = "!@#€&01x*!"; // caracteres aleatorios para el efecto scramble

let running = false; // semáforo: evita que la animación del nombre se solape consigo misma

// ── Preparación de spans ─────────────────────────────────────────────────────
// Cada letra del nombre se envuelve en un <span> con data-char para poder
// restaurarla después del scramble. Empiezan ocultas (opacity:0 en CSS).
nameId.innerHTML = text
  .split("")
  .map((c) => `<span data-char="${c}">${c}</span>`)
  .join("");


// ── HOVER ENTER: letras aparecen una a una con scramble ─────────────────────
// Al hacer hover sobre .name (logo), cada letra de "3r1k" aparece de izquierda
// a derecha con un delay escalonado (i * 120ms). Cada letra:
//   1. Se hace visible (opacity 1)
//   2. Muestra caracteres aleatorios durante 3 ticks (~240ms)
//   3. Se fija en su letra real
nameContainer.addEventListener("mouseenter", () => {
  if (running) return; // evita solapamiento
  running = true;

  const spans = nameId.querySelectorAll("span");

  spans.forEach((span, i) => {
    // delay escalonado: letra 0 arranca al instante, letra 1 a los 120ms, etc.
    setTimeout(() => {
      span.style.opacity = "1"; // hace visible la letra

      let ticks = 0;

      // scramble: cada 80ms pone un caracter random con glow
      const iv = setInterval(() => {
        span.textContent =
          characters[Math.floor(Math.random() * characters.length)];
        span.classList.add("glitch");
        ticks++;

        // después de 3 ticks, fija la letra real y quita el glow
        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove("glitch");

          // última letra → desbloquea el semáforo
          if (i === spans.length - 1) running = false;
        }
      }, 80);
    }, i * 120);
  });
});

// ── HOVER LEAVE: letras desaparecen con scramble inverso ────────────────────
// Al salir el cursor, las letras se ocultan de la ÚLTIMA a la PRIMERA.
// reverseI calcula el delay invertido: la última letra arranca primero.
// Cada letra:
//   1. Muestra caracteres aleatorios durante 3 ticks
//   2. Se oculta (opacity 0) al terminar
nameContainer.addEventListener("mouseleave", () => {
  const spans = nameId.querySelectorAll("span");
  const total = spans.length;

  spans.forEach((span, i) => {
    // reverseI: si i=0 (primera letra) → delay más largo (espera a que las demás terminen)
    //           si i=3 (última letra)  → delay 0 (arranca primero)
    const reverseI = total - 1 - i;

    setTimeout(() => {
      let ticks = 0;

      // scramble de salida: misma lógica pero al final oculta la letra
      const iv = setInterval(() => {
        span.textContent =
          characters[Math.floor(Math.random() * characters.length)];
        span.classList.add("glitch");
        ticks++;

        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove("glitch");
          span.style.opacity = "0"; // oculta la letra tras el scramble
        }
      }, 80);
    }, reverseI * 120);
  });

  running = false; // desbloquea para el próximo hover
});

// ── GLITCH AUTOMÁTICO en "Erik Gavilán" ─────────────────────────────────────
(() => {
  const h1 = document.querySelector("article h1");
  if (!h1) return;

  // Envolver cada letra en <span data-char>, preservando <br>
  const raw = h1.innerHTML;
  h1.innerHTML = raw.replace(/(<br\s*\/?>)|(\S)/g, (match, br, ch) => {
    if (br) return br;
    return `<span data-char="${ch}">${ch}</span>`;
  });

  let glitchRunning = false;

  function triggerGlitch() {
    if (glitchRunning) return;
    glitchRunning = true;

    const spans = h1.querySelectorAll("span");

    spans.forEach((span, i) => {
      setTimeout(() => {
        let ticks = 0;
        const iv = setInterval(() => {
          span.textContent =
            characters[Math.floor(Math.random() * characters.length)];
          span.classList.add("glitch");
          ticks++;

          if (ticks > 4) {
            clearInterval(iv);
            span.textContent = span.dataset.char;
            span.classList.remove("glitch");

            if (i === spans.length - 1) glitchRunning = false;
          }
        }, 60);
      }, i * 80);
    });
  }

  // Glitch al cargar + cada 60s
  setTimeout(triggerGlitch, 1500);
  setInterval(triggerGlitch, 30000);
})();
