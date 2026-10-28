(() => {
  const stops = [...document.querySelectorAll(".journey-stop")];
  const cities = [...document.querySelectorAll(".map-city")];
  const cityLabel = document.querySelector("#atlas-city");
  const companyLabel = document.querySelector("#atlas-company");
  const timeline = document.querySelector(".journey-timeline");
  const stage = document.querySelector(".deck-stage");
  if (!stops.length || !cityLabel || !companyLabel || !stage) return;
  const desktop = matchMedia(
    "(min-width: 1000px) and (hover: hover) and (pointer: fine)",
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const chapter = document.querySelector(".deck-chapter");
  const count = document.querySelector(".deck-count");
  const previous = document.querySelector(".deck-previous");
  const next = document.querySelector(".deck-next");
  const position = document.querySelector(".deck-position");
  const chapterNames = [
    "Before the boom",
    "Before the boom",
    "Building companies",
    "Building companies",
    "A wider world",
    "Useful to more people",
    "Useful to more people",
    "Useful to more people",
  ];
  document.documentElement.classList.add("journey-enhanced");
  let current = -1;
  let scheduled = false;
  let pointerCard;
  function activate(index) {
    if (index === current) return;
    current = index;
    const stop = stops[index];
    stops.forEach((item, i) => {
      const distance = index - i;
      item.classList.toggle("is-reading", i === index);
      item.style.setProperty(
        "--deck-depth",
        Math.max(0, Math.min(3, distance)),
      );
      item.style.setProperty(
        "--deck-angle",
        distance === 1 ? "-3deg" : distance === 2 ? "3deg" : "0deg",
      );
      item.style.zIndex =
        i === index ? 10 : String(Math.max(0, 5 - Math.abs(distance)));
      if (desktop.matches) {
        item.inert = i !== index;
        item.classList.toggle("is-stacked", distance > 0 && distance < 3);
        if (i !== index) item.querySelector("details").open = false;
      } else {
        item.inert = false;
        item.classList.remove("is-stacked");
      }
    });
    const places = stop.dataset.places.split(" ");
    cities.forEach((city) =>
      city.classList.toggle("is-active", places.includes(city.dataset.city)),
    );
    cityLabel.textContent = stop.querySelector(".stop-city").textContent;
    companyLabel.textContent = `${stop.querySelector("h3").firstChild.textContent.trim()} · ${stop.querySelector(".stop-date").textContent}`;
    chapter.textContent = chapterNames[index];
    count.textContent = `${String(index + 1).padStart(2, "0")} / 08`;
    position.textContent = stop.querySelector(".stop-date").textContent;
    previous.disabled = index === 0;
    next.disabled = index === stops.length - 1;
    timeline.style.setProperty(
      "--deck-progress",
      `${((index + 1) / stops.length) * 100}%`,
    );
  }
  function update() {
    scheduled = false;
    if (desktop.matches) {
      const travel = timeline.offsetHeight - stage.offsetHeight;
      const progress = Math.max(
        0,
        Math.min(1, (30 - timeline.getBoundingClientRect().top) / travel),
      );
      activate(Math.min(stops.length - 1, Math.floor(progress * stops.length)));
    } else {
      let index = 0;
      stops.forEach((stop, i) => {
        if (stop.getBoundingClientRect().top <= innerHeight * 0.3) index = i;
      });
      activate(index);
    }
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }
  function setMode() {
    document.documentElement.classList.toggle("deck-mode", desktop.matches);
    stops.forEach((stop) => {
      stop.inert = false;
      stop.style.zIndex = "";
    });
    current = -1;
    update();
  }
  function go(index) {
    const travel = timeline.offsetHeight - stage.offsetHeight;
    const y =
      scrollY +
      timeline.getBoundingClientRect().top -
      30 +
      ((index + 0.25) / stops.length) * travel;
    window.scrollTo({
      top: y,
      behavior: reduced.matches ? "instant" : "smooth",
    });
  }
  previous.addEventListener("click", () => go(Math.max(0, current - 1)));
  next.addEventListener("click", () =>
    go(Math.min(stops.length - 1, current + 1)),
  );
  stops.forEach((stop, index) => {
    const card = stop.querySelector("details");
    const summary = card.querySelector("summary");
    let preview = false;
    stop.addEventListener("pointerenter", () => {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (desktop.matches && index !== current) return;
      pointerCard = stop;
      if (!desktop.matches) activate(index);
      if (!card.open) {
        preview = true;
        card.open = true;
      }
    });
    stop.addEventListener("pointerleave", () => {
      if (preview && !card.contains(document.activeElement)) card.open = false;
      preview = false;
      pointerCard = null;
    });
    summary.addEventListener("click", (event) => {
      if (preview) {
        event.preventDefault();
        preview = false;
      }
      activate(index);
    });
    card.addEventListener("toggle", () => {
      if (card.open) activate(index);
    });
    card.addEventListener("pointermove", (event) => {
      if (!desktop.matches || reduced.matches || pointerCard !== stop) return;
      const rect = summary.getBoundingClientRect();
      const x = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      const y = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      card.style.setProperty("--tilt-x", `${-y * 3}deg`);
      card.style.setProperty("--tilt-y", `${x * 4}deg`);
    });
    stop.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    current = -1;
    schedule();
  });
  desktop.addEventListener("change", setMode);
  setMode();
})();
