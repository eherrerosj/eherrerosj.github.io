(() => {
  const stops = [...document.querySelectorAll(".journey-stop")];
  const cities = [...document.querySelectorAll(".map-city")];
  const cityLabel = document.querySelector("#atlas-city");
  const companyLabel = document.querySelector("#atlas-company");
  if (!stops.length || !cityLabel || !companyLabel) return;
  document.documentElement.classList.add("journey-enhanced");
  let current;
  let scheduled = false;
  function activate(stop) {
    stops.forEach((item) => item.classList.toggle("is-reading", item === stop));
    const places = stop.dataset.places.split(" ");
    cities.forEach((city) =>
      city.classList.toggle("is-active", places.includes(city.dataset.city)),
    );
    cityLabel.textContent = stop.querySelector(".stop-city").textContent;
    companyLabel.textContent = `${stop.querySelector("h3").firstChild.textContent.trim()} · ${stop.querySelector(".stop-date").textContent}`;
  }
  function update() {
    scheduled = false;
    const readingLine = window.innerHeight * 0.3;
    let stop = stops[0];
    for (const candidate of stops) {
      if (candidate.getBoundingClientRect().top <= readingLine)
        stop = candidate;
      else break;
    }
    if (stop === current) return;
    current = stop;
    activate(stop);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  const hover = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 761px)",
  );
  stops.forEach((stop) => {
    const card = stop.querySelector("details");
    const summary = card.querySelector("summary");
    let preview = false;
    stop.addEventListener("pointerenter", () => {
      if (!hover.matches) return;
      activate(stop);
      if (!card.open) {
        preview = true;
        card.open = true;
      }
    });
    stop.addEventListener("pointerleave", () => {
      if (preview && !card.contains(document.activeElement)) card.open = false;
      preview = false;
      current = undefined;
      schedule();
    });
    summary.addEventListener("click", (event) => {
      if (preview) {
        event.preventDefault();
        preview = false;
      }
      activate(stop);
    });
    card.addEventListener("toggle", () => {
      if (card.open) activate(stop);
    });
  });
  update();
})();
