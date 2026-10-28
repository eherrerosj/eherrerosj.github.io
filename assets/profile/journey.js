(() => {
  if (!("IntersectionObserver" in window)) return;
  const stops = [...document.querySelectorAll(".journey-stop")];
  const cities = [...document.querySelectorAll(".map-city")];
  const links = [...document.querySelectorAll(".journey-nav a")];
  if (!stops.length) return;
  document.documentElement.classList.add("journey-enhanced");
  function activate(stop) {
    const places = stop.dataset.places.split(" ");
    cities.forEach((city) =>
      city.classList.toggle("is-active", places.includes(city.dataset.city)),
    );
    let chapter;
    for (const link of links) {
      const target = document.querySelector(link.getAttribute("href"));
      if (stops.indexOf(target) <= stops.indexOf(stop)) chapter = link;
    }
    links.forEach((link) => {
      link.classList.toggle("is-active", link === chapter);
      if (link === chapter) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  }
  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      const first = [...visible].sort(
        (a, b) =>
          Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.25) -
          Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.25),
      )[0];
      if (first) activate(first);
    },
    { rootMargin: "-15% 0px -35% 0px", threshold: 0 },
  );
  stops.forEach((stop) => observer.observe(stop));
  activate(stops[0]);
})();
