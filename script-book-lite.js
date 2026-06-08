// Lightweight Canadian law book navigation.
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

chapters.forEach((chapter, index) => {
  const link = document.createElement("a");
  link.href = `#${chapter.id}`;
  link.className = "chapter-link";
  link.dataset.number = String(index).padStart(2, "0");
  link.textContent = chapterLabels[chapter.id] || chapter.dataset.pageTitle;
  chapterList.appendChild(link);
});

function getScreenIndex(id) {
  return screens.findIndex((screen) => screen.id === id);
}

function updateControls() {
  const active = screens[activeIndex];
  pageStatus.textContent = active?.dataset.pageTitle || "Cover";
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
    history.replaceState(null, "", `#${next.id}`);

    window.setTimeout(() => {
      next.classList.remove(enteringClass);
      isTurning = false;
    }, 380);
  }, 220);
}

function openBook() {
  if (activeIndex !== 0 || isTurning) return;
  bookCover.classList.add("opening");
  window.setTimeout(() => {
    activateScreen(getScreenIndex("contents"), 1);
    bookCover.classList.remove("opening");
  }, 520);
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
    const targetIndex = getScreenIndex(targetButton.dataset.target);
    activateScreen(targetIndex, targetIndex > activeIndex ? 1 : -1);
  }

  if (chapterLink) {
    event.preventDefault();
    const targetIndex = getScreenIndex(chapterLink.getAttribute("href").replace("#", ""));
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

const initialHash = location.hash.replace("#", "");
const initialIndex = initialHash ? getScreenIndex(initialHash) : 0;
if (initialIndex > 0) {
  screens[0].classList.remove("active");
  activeIndex = initialIndex;
  screens[activeIndex].classList.add("active");
}

updateControls();
