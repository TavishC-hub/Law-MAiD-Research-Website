// Build the side navigation from every section that has a title.
const sections = [...document.querySelectorAll("section[data-title]")];
const sideNav = document.querySelector("#sideNav");
const progressFill = document.querySelector("#progressFill");
const heroDocument = document.querySelector(".hero-document");
const backgroundOrbit = document.querySelector(".background-orbit");
const parallaxCards = [
  ...document.querySelectorAll(
    ".feature-card, .glass-card, .issue-card, .law-card, .perspective-card, .suggestion-card, .large-quote, .callout, .opinion-card"
  ),
];

// Add small glowing particles in the background for a dramatic exhibit feel.
if (backgroundOrbit) {
  for (let index = 0; index < 34; index += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${25 + Math.random() * 75}%`;
    spark.style.setProperty("--spark-delay", `${Math.random() * -10}s`);
    spark.style.setProperty("--spark-speed", `${6 + Math.random() * 8}s`);
    spark.style.setProperty("--spark-drift", `${-5 + Math.random() * 10}rem`);
    backgroundOrbit.appendChild(spark);
  }
}

sections.forEach((section) => {
  const link = document.createElement("a");
  link.href = `#${section.id}`;
  link.setAttribute("aria-label", section.dataset.title);
  link.title = section.dataset.title;
  sideNav.appendChild(link);
});

const navLinks = [...document.querySelectorAll(".side-nav a")];

// Reveal cards and headings as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

// Track the mouse so the page lighting and cards respond to movement.
window.addEventListener(
  "pointermove",
  (event) => {
    const x = `${(event.clientX / window.innerWidth) * 100}%`;
    const y = `${(event.clientY / window.innerHeight) * 100}%`;
    document.documentElement.style.setProperty("--mouse-x", x);
    document.documentElement.style.setProperty("--mouse-y", y);
  },
  { passive: true }
);

parallaxCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${y * -8}deg`);
    card.style.setProperty("--tilt-y", `${x * 10}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});

// Mark the current section in the side navigation.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const currentIndex = sections.indexOf(entry.target);
      sections.forEach((section) => {
        section.classList.toggle("section-visible", section === entry.target);
      });
      entry.target.querySelectorAll(".reveal").forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 90, 420)}ms`;
      });
      navLinks.forEach((link, index) => {
        link.classList.toggle("active", index === currentIndex);
      });
    });
  },
  {
    threshold: 0.48,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// Update reading progress and timeline drawing while scrolling.
function updateProgress() {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = documentHeight > 0 ? window.scrollY / documentHeight : 0;
  progressFill.style.height = `${Math.min(scrollRatio * 100, 100)}%`;
  document.documentElement.style.setProperty("--spin-angle", `${scrollRatio * 360}deg`);

  // Give the hero card and major cards a subtle scroll-based depth effect.
  if (heroDocument) {
    const heroShift = Math.min(window.scrollY * 0.12, 86);
    heroDocument.style.setProperty("--float-y", `${heroShift}px`);
    heroDocument.style.setProperty("--float-rotate", `${heroShift * -0.06}deg`);
  }

  parallaxCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const centerDistance = rect.top + rect.height / 2 - window.innerHeight / 2;
    const drift = Math.max(-34, Math.min(34, centerDistance * -0.04));
    card.style.setProperty("--card-drift", `${drift + (index % 2 === 0 ? 3 : -3)}px`);
  });

  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const viewportProgress = 1 - rect.top / (window.innerHeight * 0.8);
    const clampedProgress = Math.max(0, Math.min(viewportProgress, 1));
    timeline.style.setProperty("--timeline-progress", clampedProgress);
  }
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
