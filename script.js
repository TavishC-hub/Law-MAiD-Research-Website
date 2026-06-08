// Canadian law book navigation and animation controls.
const screens = [...document.querySelectorAll(".book-screen")];
const chapterList = document.querySelector("#chapterList");
const pageStatus = document.querySelector("#pageStatus");
const bookCover = document.querySelector("#bookCover");
const prevButton = document.querySelector(".prev-page");
const nextButton = document.querySelector(".next-page");

const chapters = screens.filter((screen) => screen.id !== "cover");
const chapterLabels = {
  contents: "Table of Contents",
  "legal-issue": "What is the legal issue?",
  affected: "Who is affected?",
  timeline: "When did it occur?",
  "where-why": "Where + Why",
  legislation: "Legislation and human rights",
  significance: "Legal significance",
  perspectives: "Legal perspectives",
  change: "Change + interrelationships",
  opinion: "Opinion + suggestions",
  references: "References",
};

let activeIndex = 0;
let isTurning = false;

// Build the clickable table of contents inside the book.
chapters.forEach((chapter, index) => {
  const link = document.createElement("a");
  link.href = `#${chapter.id}`;
  link.className = "chapter-link";
  link.dataset.number = String(index).padStart(2, "0");
  link.textContent = chapterLabels[chapter.id] || chapter.dataset.pageTitle;
  chapterList.appendChild(link);
});

function getScreenIndex(id) {
  return Math.max(0, screens.findIndex((screen) => screen.id === id));
}

function updateControls() {
  const active = screens[activeIndex];
  const title = active?.dataset.pageTitle || "Cover";
  pageStatus.textContent = title;
  prevButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === screens.length - 1;

  document.querySelectorAll(".chapter-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`);
  });
}

function activateScreen(targetIndex, direction = 1) {
  if (isTurning || targetIndex === activeIndex || !screens[targetIndex]) return;

  isTurning = true;
  const current = screens[activeIndex];
  const next = screens[targetIndex];
  const leavingClass = direction > 0 ? "page-exit-left" : "page-exit-right";
  const enteringClass = direction > 0 ? "page-enter-right" : "page-enter-left";

  current.classList.add(leavingClass);

  window.setTimeout(() => {
    current.classList.remove("active", leavingClass);
    next.classList.add("active", enteringClass);
    activeIndex = targetIndex;
    updateControls();

    if (location.hash !== `#${next.id}`) {
      history.replaceState(null, "", `#${next.id}`);
    }

    window.setTimeout(() => {
      next.classList.remove(enteringClass);
      isTurning = false;
    }, 720);
  }, 420);
}

function openBook() {
  if (activeIndex !== 0) return;
  bookCover.classList.add("opening");
  window.setTimeout(() => {
    activateScreen(getScreenIndex("contents"), 1);
    bookCover.classList.remove("opening");
  }, 900);
}

bookCover.addEventListener("click", openBook);
bookCover.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openBook();
  }
});

document.addEventListener("click", (event) => {
  const targetButton = event.target.closest("[data-target]");
  const chapterLink = event.target.closest(".chapter-link");

  if (targetButton) {
    activateScreen(getScreenIndex(targetButton.dataset.target), getScreenIndex(targetButton.dataset.target) > activeIndex ? 1 : -1);
  }

  if (chapterLink) {
    event.preventDefault();
    const id = chapterLink.getAttribute("href").replace("#", "");
    const targetIndex = getScreenIndex(id);
    activateScreen(targetIndex, targetIndex > activeIndex ? 1 : -1);
  }
});

prevButton.addEventListener("click", () => {
  activateScreen(Math.max(0, activeIndex - 1), -1);
});

nextButton.addEventListener("click", () => {
  if (activeIndex === 0) {
    openBook();
  } else {
    activateScreen(Math.min(screens.length - 1, activeIndex + 1), 1);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextButton.click();
  }
  if (event.key === "ArrowLeft") {
    prevButton.click();
  }
});

// Make the room lighting follow the pointer for a more cinematic, interactive feel.
window.addEventListener(
  "pointermove",
  (event) => {
    document.documentElement.style.setProperty("--mouse-x", `${(event.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty("--mouse-y", `${(event.clientY / window.innerHeight) * 100}%`);
  },
  { passive: true }
);

// Start at a hash-linked chapter if someone shares a direct link.
const initialHash = location.hash.replace("#", "");
if (initialHash && getScreenIndex(initialHash) > -1) {
  screens[0].classList.remove("active");
  activeIndex = getScreenIndex(initialHash);
  screens[activeIndex].classList.add("active");
}

updateControls();
