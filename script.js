// Scroll-driven Canadian law book navigation.
const screens = [...document.querySelectorAll(".book-screen")];
const chapterList = document.querySelector("#chapterList");
const pageStatus = document.querySelector("#pageStatus");
const bookCover = document.querySelector("#bookCover");
const bookStage = document.querySelector(".book-stage");

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
let wheelTotal = 0;
let touchStartY = 0;

// One lightweight sheet creates the visible page-flip effect on scroll.
const flipSheet = document.createElement("div");
flipSheet.className = "flip-sheet";
document.body.appendChild(flipSheet);

// Build the clickable contents page as a backup for direct access.
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

function updateStatus() {
  const active = screens[activeIndex];
  pageStatus.textContent = active?.dataset.pageTitle || "Cover";

  document.querySelectorAll(".chapter-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`);
  });
}

function animateFlip(direction) {
  flipSheet.classList.remove("flip-forward", "flip-back");
  void flipSheet.offsetWidth;
  flipSheet.classList.add(direction > 0 ? "flip-forward" : "flip-back");
}

function activateScreen(targetIndex, direction = 1) {
  if (isTurning || targetIndex === activeIndex || !screens[targetIndex]) return;

  isTurning = true;
  animateFlip(direction);

  const current = screens[activeIndex];
  const next = screens[targetIndex];
  current.classList.add(direction > 0 ? "page-exit-left" : "page-exit-right");

  window.setTimeout(() => {
    current.classList.remove("active", "page-exit-left", "page-exit-right");
    next.classList.add("active", direction > 0 ? "page-enter-right" : "page-enter-left");
    activeIndex = targetIndex;
    updateStatus();
    history.replaceState(null, "", `#${next.id}`);

    window.setTimeout(() => {
      next.classList.remove("page-enter-left", "page-enter-right");
      isTurning = false;
    }, 380);
  }, 220);
}

function turnBy(direction) {
  const targetIndex = Math.max(0, Math.min(screens.length - 1, activeIndex + direction));
  activateScreen(targetIndex, direction);
}

function openBook() {
  if (activeIndex !== 0 || isTurning) return;
  bookCover.classList.add("opening");
  window.setTimeout(() => {
    activateScreen(getScreenIndex("contents"), 1);
    bookCover.classList.remove("opening");
  }, 520);
}

function handleScroll(deltaY) {
  if (isTurning) return;

  wheelTotal += deltaY;
  if (Math.abs(wheelTotal) < 80) return;

  const direction = wheelTotal > 0 ? 1 : -1;
  wheelTotal = 0;

  if (activeIndex === 0 && direction > 0) {
    openBook();
  } else {
    turnBy(direction);
  }
}

function canScrollInsidePage(target, deltaY) {
  const page = target.closest?.(".paper-page");
  if (!page) return false;

  const canScroll = page.scrollHeight > page.clientHeight + 2;
  if (!canScroll) return false;

  const atTop = page.scrollTop <= 0;
  const atBottom = page.scrollTop + page.clientHeight >= page.scrollHeight - 2;
  return (deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom);
}

window.addEventListener(
  "wheel",
  (event) => {
    if (canScrollInsidePage(event.target, event.deltaY)) return;
    event.preventDefault();
    handleScroll(event.deltaY);
  },
  { passive: false }
);

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const currentY = event.touches[0]?.clientY || touchStartY;
    const deltaY = touchStartY - currentY;
    if (canScrollInsidePage(event.target, deltaY)) return;
    event.preventDefault();
    handleScroll(deltaY);
    touchStartY = currentY;
  },
  { passive: false }
);

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

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    activeIndex === 0 ? openBook() : turnBy(1);
  }

  if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    turnBy(-1);
  }
});

// Start at a hash-linked chapter if someone shares a direct link.
const initialHash = location.hash.replace("#", "");
const initialIndex = initialHash ? getScreenIndex(initialHash) : 0;
if (initialIndex > 0) {
  screens[0].classList.remove("active");
  activeIndex = initialIndex;
  screens[activeIndex].classList.add("active");
}

bookStage?.focus?.();
updateStatus();
