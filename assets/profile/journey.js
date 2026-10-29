(() => {
  const stops = [...document.querySelectorAll(".journey-stop")];
  const cities = [...document.querySelectorAll(".map-city")];
  const cityLabel = document.querySelector("#atlas-city");
  const companyLabel = document.querySelector("#atlas-company");
  const atlas = document.querySelector(".atlas-inner");
  const map = document.querySelector(".atlas-map");
  const position = document.querySelector(".atlas-position");
  const next = document.querySelector(".atlas-next");
  if (!stops.length || !atlas || !map) return;

  const mobile = matchMedia("(max-width: 900px)");
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const names = stops.map((stop) =>
    stop.querySelector("h4").firstChild.textContent.trim(),
  );
  let current = -1;
  let scheduled = false;
  document.documentElement.classList.add("journey-enhanced");

  function activate(index) {
    if (index === current) return;
    current = index;
    const stop = stops[index];
    stops.forEach((item, i) =>
      item.classList.toggle("is-reading", i === index),
    );
    const places = stop.dataset.places.split(" ");
    cities.forEach((city) =>
      city.classList.toggle("is-active", places.includes(city.dataset.city)),
    );
    cityLabel.textContent = stop.querySelector(".stop-city").textContent;
    companyLabel.textContent = `${names[index]} · ${stop.querySelector(".stop-date").textContent}`;
    position.textContent = `${String(index + 1).padStart(2, "0")} / ${String(stops.length).padStart(2, "0")}`;
    position.setAttribute(
      "aria-label",
      `Experience ${index + 1} of ${stops.length}`,
    );
    atlas.style.setProperty(
      "--career-progress",
      `${((index + 1) / stops.length) * 100}%`,
    );
    next.hidden = index === stops.length - 1;
    if (!next.hidden) {
      next.href = `#${stops[index + 1].id}`;
      next
        .querySelector("strong")
        .replaceChildren(document.createTextNode(`${names[index + 1]} `));
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↓";
      next.querySelector("strong").append(arrow);
    }
    document.querySelectorAll(".career-overview a").forEach((link) => {
      if (link.hash === `#${stop.closest(".career-chapter").id}`)
        link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  }

  function update() {
    scheduled = false;
    const headerHeight = document.querySelector(".masthead").offsetHeight;
    const readingLine =
      headerHeight +
      (mobile.matches
        ? 180
        : Math.min(220, (innerHeight - headerHeight) * 0.3));
    let index = 0;
    stops.forEach((stop, i) => {
      const marker = stop.previousElementSibling
        ? stop
        : stop.closest(".career-chapter");
      if (marker.getBoundingClientRect().top <= readingLine) index = i;
    });
    activate(index);
  }

  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }

  stops.forEach((stop, index) => {
    const card = stop.querySelector("details");
    const summary = card.querySelector("summary");
    const disclosure = card.querySelector(".card-disclosure");
    let preview = false;
    let timer;
    // Preview only at the explicit disclosure, so reading and scrolling stay stable.
    disclosure.addEventListener("pointerenter", () => {
      if (!hover.matches || card.open) return;
      timer = setTimeout(() => {
        preview = true;
        card.open = true;
        activate(index);
      }, 250);
    });
    disclosure.addEventListener("pointerleave", () => clearTimeout(timer));
    card.addEventListener("pointerleave", () => {
      clearTimeout(timer);
      if (preview && !card.contains(document.activeElement)) card.open = false;
      preview = false;
    });
    summary.addEventListener("click", (event) => {
      clearTimeout(timer);
      if (preview) {
        event.preventDefault();
        preview = false;
      }
      activate(index);
    });
    card.addEventListener("toggle", () => {
      if (card.open) activate(index);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && card.open) {
        card.open = false;
        preview = false;
        summary.focus();
      }
    });
  });

  function setMapMode() {
    map.open = !mobile.matches;
    schedule();
  }
  // Keep a phone's expanded map from obscuring the chapter selected by a link.
  document
    .querySelectorAll(".career-overview a, .career-start, .atlas-next")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (mobile.matches) map.open = false;
      });
    });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  mobile.addEventListener("change", setMapMode);
  setMapMode();
})();
