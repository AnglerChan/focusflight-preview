const count = document.querySelector(".download-count");
const sequence = count.closest("main");
const value = count.querySelector(".download-count-value");
const readable = document.createElement("span");
readable.className = "motion-readable";
value.before(readable);
value.setAttribute("aria-hidden", "true");

const format = new Intl.NumberFormat("en-US");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const easing = getComputedStyle(count).getPropertyValue("--button-press").trim();
let total = 3_500_000 + Math.floor(Math.random() * 501) - 250;
let visible = false;
let timer;

function nextInterval() {
  return 900 + Math.random() * 1700;
}

let nextUpdate = performance.now() + nextInterval();

function render(animate) {
  const digits = format.format(total);
  const previous = readable.textContent;
  readable.textContent = digits;

  if (value.childElementCount !== digits.length) {
    value.replaceChildren(...Array.from(digits, character => {
      const column = document.createElement("span");
      if (character !== ",") column.className = "download-count-digit";
      column.textContent = character;
      return column;
    }));
    return;
  }

  for (const [index, character] of [...digits].entries()) {
    const column = value.children[index];
    if (!animate || reducedMotion.matches) {
      if (column.childElementCount || previous[index] !== character) column.textContent = character;
      continue;
    }
    if (previous[index] === character) continue;

    const oldDigit = document.createElement("span");
    oldDigit.textContent = previous[index];
    const newDigit = document.createElement("span");
    newDigit.textContent = character;
    column.replaceChildren(oldDigit, newDigit);
    const timing = { duration: 450, easing };
    oldDigit.animate([
      { transform: "translateY(0)", opacity: 1, filter: "blur(0px)" },
      { transform: "translateY(-100%)", opacity: 0, filter: "blur(.16em)" },
    ], timing).onfinish = () => oldDigit.remove();
    newDigit.animate([
      { transform: "translateY(100%)", opacity: 0, filter: "blur(.16em)" },
      { transform: "translateY(0)", opacity: 1, filter: "blur(0px)" },
    ], timing);
  }
}

function update() {
  clearTimeout(timer);
  if (!visible || document.hidden) return;
  if (sequence.matches("[data-window-flight], [data-gift-descent]")) {
    if (value.getAnimations({ subtree: true }).length) render(false);
    return;
  }
  const now = performance.now();
  if (now >= nextUpdate) {
    const missed = Math.floor((now - nextUpdate) / 2200);
    total += missed + 1 + Math.floor(Math.random() ** 2 * 4);
    render(missed === 0);
    nextUpdate = now + nextInterval();
  }
  timer = setTimeout(update, nextUpdate - now);
}

render(false);
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  update();
}).observe(count);
new MutationObserver(update).observe(sequence, {
  attributeFilter: ["data-window-flight", "data-gift-descent"],
});
document.addEventListener("visibilitychange", update);
