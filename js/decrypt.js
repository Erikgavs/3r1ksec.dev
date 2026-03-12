// ── Glitch aleatorio periódico para .decrypt-text ────────────────────────────
// Cada 15s, una letra random hace glitch. Luego otra a los 30s, etc.

(() => {
  const chars = "!@#€&01x*!";
  const els = document.querySelectorAll(".decrypt-text");

  els.forEach((el) => {
    const original = el.textContent.trim();

    // Envolver cada letra en un span
    el.innerHTML = original
      .split("")
      .map((c) =>
        c === " " ? " " : `<span data-char="${c}">${c}</span>`
      )
      .join("");

    const spans = el.querySelectorAll("span");
    if (!spans.length) return;

    function glitchBurst() {
      const count = 12 + Math.floor(Math.random() * 10); // 12-21 letras
      const indices = new Set();
      while (indices.size < count && indices.size < spans.length) {
        indices.add(Math.floor(Math.random() * spans.length));
      }

      indices.forEach((idx) => {
        const span = spans[idx];
        const delay = Math.floor(Math.random() * 300);

        setTimeout(() => {
          let ticks = 0;
          const iv = setInterval(() => {
            span.textContent = chars[Math.floor(Math.random() * chars.length)];
            span.classList.add("glitch");
            ticks++;

            if (ticks > 8) {
              clearInterval(iv);
              span.textContent = span.dataset.char;
              span.classList.remove("glitch");
            }
          }, 60);
        }, delay);
      });
    }

    setInterval(glitchBurst, 15000);
  });
})();
