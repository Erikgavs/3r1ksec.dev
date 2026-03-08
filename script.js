const nameId = document.getElementById('name'); // agarra el h2 del DOM
const optionId = document.querySelectorAll('.options a'); // agarra todos los links del nav
const text = "3r1k"; // texto original para restaurar al final
const characters = "!@#€&01x*!"; // letras para la animación

let running = false; // evita que el hover se dispare varias veces a la vez

// divide el texto en spans, uno por letra, guardando el caracter original en data-char
nameId.innerHTML = text.split('').map(c =>
  `<span data-char="${c}">${c}</span>`
).join('');

// itera cada link, genera spans y añade la animación de hover
optionId.forEach(link => {
  const linkText = link.textContent; // lee el texto del link antes de modificar el HTML

  // divide el texto en spans, uno por letra
  link.innerHTML = linkText.split('').map(c =>
    `<span data-char="${c}">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');

  let linkRunning = false; // semáforo independiente por cada link

  link.addEventListener('mouseenter', () => {
    if (linkRunning) return;
    linkRunning = true;

    const spans = link.querySelectorAll('span');

    spans.forEach((span, i) => {
      if (span.dataset.char === ' ') return; // el espacio no se anima

      let ticks = 0; // cuenta cuántas veces ha corrido el interval para esta letra

      const iv = setInterval(() => {
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.classList.add('glitch');
        ticks++; // suma 1 cada 100ms

        // 3+i significa que cada letra aguanta un tick más que la anterior
        // letra 0 para en tick 4, letra 1 en tick 5... efecto escalonado
        if (ticks > 3 + i) {
          clearInterval(iv); // para el interval de esta letra
          span.textContent = span.dataset.char;
          span.classList.remove('glitch');

          if (i === spans.length - 1) linkRunning = false; // última letra — desbloquea el hover
        }
      }, 100);
    });
  });
});

// escucha cuando el mouse entra al elemento
nameId.addEventListener('mouseenter', () => {
  if (running) return; // si está en funcionamiento, no hace nada

  running = true

  const spans = nameId.querySelectorAll('span'); // agarra todos los spans generados

  // itera cada letra con su índice i
  spans.forEach((span, i) => {
    let ticks = 0; // contador de veces que el interval ha corrido

    const iv = setInterval(() => {
      // reemplaza la letra por un caracter random y añade glow
      span.textContent = characters[Math.floor(Math.random() * characters.length)];
      span.classList.add('glitch');
      ticks++;

      // después de 3+i ticks, restaura la letra original
      if (ticks > 3 + i) {
        clearInterval(iv);
        span.textContent = span.dataset.char; // restaura la letra
        span.classList.remove('glitch');

        // cuando termina la última letra, permite hover de nuevo
        if (i === spans.length - 1) running = false;
      }
    }, 100); // cada 100ms cambia la letra
  });
});
