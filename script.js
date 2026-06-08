// Build the side navigation from every section that has a title.
const sections = [...document.querySelectorAll("section[data-title]")];
const sideNav = document.querySelector("#sideNav");
const progressFill = document.querySelector("#progressFill");
const heroDocument = document.querySelector(".hero-document");
const backgroundOrbit = document.querySelector(".background-orbit");
const tocPanel = document.querySelector("#tocPanel");
const tocToggle = document.querySelector("#tocToggle");
const parallaxCards = [
  ...document.querySelectorAll(
    ".feature-card, .glass-card, .issue-card, .law-card, .perspective-card, .suggestion-card, .large-quote, .callout, .opinion-card"
  ),
];

const pageImages = {
  "legal-issue": {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Supreme_Court_in_Supreme_Court_of_Canada_2025.JPG",
    alt: "Supreme Court of Canada courtroom",
    credit: "Supreme Court of Canada courtroom, Wikimedia Commons.",
  },
  affected: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Medical_stethoscope.jpg",
    alt: "Medical stethoscope",
    credit: "Medical stethoscope image, Wikimedia Commons.",
  },
  timeline: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Supreme_Court_of_Canada_Building_lobby_2025.JPG",
    alt: "Supreme Court of Canada lobby",
    credit: "Supreme Court of Canada lobby, Wikimedia Commons.",
  },
  legislation: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/US_Department_of_Justice_Scales_Of_Justice.svg",
    alt: "Scales of justice symbol",
    credit: "Scales of justice symbol, Wikimedia Commons.",
  },
  perspectives: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Federal_courtroom_in_the_Supreme_Court_of_Canada.jpg",
    alt: "Federal courtroom inside the Supreme Court of Canada",
    credit: "Federal courtroom in the Supreme Court of Canada, Wikimedia Commons.",
  },
  opinion: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Laennec_stethoscope_from_Sharp%2C_1832_Wellcome_M0018706EB.jpg",
    alt: "Historic stethoscope illustration",
    credit: "Historic stethoscope image, Wellcome Collection via Wikimedia Commons.",
  },
};

const pageTitles = sections.map((section) => section.dataset.title);

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

// Insert image panels into selected pages without changing the research wording.
Object.entries(pageImages).forEach(([id, image]) => {
  const section = document.querySelector(`#${id}`);
  const heading = section?.querySelector(".section-heading");
  if (!section || !heading) return;

  const figure = document.createElement("figure");
  figure.className = "page-visual reveal";
  figure.innerHTML = `
    <img src="${image.src}" alt="${image.alt}" loading="lazy" />
    <figcaption>${image.credit}</figcaption>
  `;
  heading.insertAdjacentElement("afterend", figure);
});

parallaxCards.push(...document.querySelectorAll(".hero-visual, .page-visual"));

// Build the larger table of contents panel.
sections.forEach((section, index) => {
  const link = document.createElement("a");
  link.href = `#${section.id}`;
  link.textContent = section.querySelector("h2")?.textContent || section.dataset.title;
  link.dataset.number = String(index + 1).padStart(2, "0");
  tocPanel.appendChild(link);
});

const tocLinks = [...tocPanel.querySelectorAll("a")];

// Add back/next buttons to every non-hero page.
sections.forEach((section, index) => {
  if (section.querySelector(".page-controls")) return;
  const controls = document.createElement("div");
  controls.className = "page-controls reveal";
  controls.innerHTML = `
    <button class="page-btn prev-page" type="button">Previous page</button>
    <button class="page-btn next-page" type="button">Next page</button>
  `;
  section.appendChild(controls);
});

function showPage(id) {
  const fallbackId = sections[0].id;
  const target = sections.find((section) => section.id === id) || sections[0];
  const targetIndex = sections.indexOf(target);

  sections.forEach((section, index) => {
    const isActive = section === target;
    section.classList.toggle("active-page", isActive);
    section.classList.toggle("section-visible", isActive);

    const prev = section.querySelector(".prev-page");
    const next = section.querySelector(".next-page");
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === sections.length - 1;
  });

  [...navLinks, ...tocLinks].forEach((link) => {
    const linkTarget = link.getAttribute("href") === `#${target.id}`;
    link.classList.toggle("active", linkTarget);
  });

  document.title = `${pageTitles[targetIndex] || "MAID"} | MAID Legal Research`;
  if (location.hash !== `#${target.id}`) {
    history.replaceState(null, "", `#${target.id || fallbackId}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.body.classList.add("page-mode");
showPage(location.hash.replace("#", "") || "intro");

tocToggle?.addEventListener("click", () => {
  const isOpen = tocPanel.classList.toggle("open");
  tocToggle.setAttribute("aria-expanded", String(isOpen));
});

tocPanel?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();
  showPage(link.getAttribute("href").replace("#", ""));
  tocPanel.classList.remove("open");
  tocToggle?.setAttribute("aria-expanded", "false");
});

document.addEventListener("click", (event) => {
  const next = event.target.closest(".next-page");
  const prev = event.target.closest(".prev-page");
  if (!next && !prev) return;

  const current = sections.findIndex((section) => section.classList.contains("active-page"));
  const direction = next ? 1 : -1;
  const target = sections[Math.max(0, Math.min(sections.length - 1, current + direction))];
  if (target) showPage(target.id);
});

window.addEventListener("hashchange", () => {
  showPage(location.hash.replace("#", "") || "intro");
});

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
