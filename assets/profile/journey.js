(() => {
  const stops = [...document.querySelectorAll(".journey-stop")];
  const cities = [...document.querySelectorAll(".map-city")];
  const cityLabel = document.querySelector("#atlas-city");
  const companyLabel = document.querySelector("#atlas-company");
  if (!stops.length || !cityLabel || !companyLabel) return;
  document.documentElement.classList.add("journey-enhanced");
  let current;
  let scheduled = false;
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
    const places = stop.dataset.places.split(" ");
    cities.forEach((city) =>
      city.classList.toggle("is-active", places.includes(city.dataset.city)),
    );
    cityLabel.textContent = stop.querySelector(".stop-city").textContent;
    companyLabel.textContent = `${stop.querySelector("h3").firstChild.textContent.trim()} · ${stop.querySelector(".stop-date").textContent}`;
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();
