// ── Referencias al DOM ───────────────────────────────────────────────────────
const nameId = document.getElementById('name');          // h2 con el texto "3r1k"
const optionId = document.querySelectorAll('.options a'); // todos los links del nav
const nameContainer = document.querySelector('.name');    // contenedor del logo + h2

// ── Configuración ────────────────────────────────────────────────────────────
const text = "3r1k";              // texto original del nombre
const characters = "!@#€&01x*!";  // caracteres aleatorios para el efecto scramble

let running = false; // semáforo: evita que la animación del nombre se solape consigo misma

// ── Preparación de spans ─────────────────────────────────────────────────────
// Cada letra del nombre se envuelve en un <span> con data-char para poder
// restaurarla después del scramble. Empiezan ocultas (opacity:0 en CSS).
nameId.innerHTML = text.split('').map(c =>
  `<span data-char="${c}">${c}</span>`
).join('');

// ── Animación de los links del nav ──────────────────────────────────────────
// Mismo concepto: dividir en spans y animar al hover.
optionId.forEach(link => {
  const linkText = link.textContent;

  // genera spans individuales por letra (espacios → &nbsp; para que no colapsen)
  link.innerHTML = linkText.split('').map(c =>
    `<span data-char="${c}">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');

  let linkRunning = false; // semáforo independiente por cada link

  link.addEventListener('mouseenter', () => {
    if (linkRunning) return; // si ya está animando, ignora
    linkRunning = true;

    const spans = link.querySelectorAll('span');

    spans.forEach((span, i) => {
      if (span.dataset.char === ' ') return; // los espacios no se animan

      let ticks = 0;

      // cada 100ms cambia la letra por un caracter random
      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch'); // añade glow rojo

        ticks++;

        // 3 + i → efecto escalonado: letra 0 para en tick 4, letra 1 en tick 5...
        if (ticks > 3 + i) {
          clearInterval(iv);
          span.textContent = span.dataset.char; // restaura la letra real
          span.classList.remove('glitch');

          // última letra → desbloquea para permitir nuevo hover
          if (i === spans.length - 1) linkRunning = false;
        }
      }, 100);
    });
  });
});

// ── HOVER ENTER: letras aparecen una a una con scramble ─────────────────────
// Al hacer hover sobre .name (logo), cada letra de "3r1k" aparece de izquierda
// a derecha con un delay escalonado (i * 120ms). Cada letra:
//   1. Se hace visible (opacity 1)
//   2. Muestra caracteres aleatorios durante 3 ticks (~240ms)
//   3. Se fija en su letra real
nameContainer.addEventListener('mouseenter', () => {
  if (running) return; // evita solapamiento
  running = true;

  const spans = nameId.querySelectorAll('span');

  spans.forEach((span, i) => {
    // delay escalonado: letra 0 arranca al instante, letra 1 a los 120ms, etc.
    setTimeout(() => {
      span.style.opacity = '1'; // hace visible la letra

      let ticks = 0;

      // scramble: cada 80ms pone un caracter random con glow
      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch');
        ticks++;

        // después de 3 ticks, fija la letra real y quita el glow
        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');

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
nameContainer.addEventListener('mouseleave', () => {
  const spans = nameId.querySelectorAll('span');
  const total = spans.length;

  spans.forEach((span, i) => {
    // reverseI: si i=0 (primera letra) → delay más largo (espera a que las demás terminen)
    //           si i=3 (última letra)  → delay 0 (arranca primero)
    const reverseI = total - 1 - i;

    setTimeout(() => {
      let ticks = 0;

      // scramble de salida: misma lógica pero al final oculta la letra
      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch');
        ticks++;

        if (ticks > 3) {
          clearInterval(iv);
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');
          span.style.opacity = '0'; // oculta la letra tras el scramble
        }
      }, 80);
    }, reverseI * 120);
  });

  running = false; // desbloquea para el próximo hover
});
