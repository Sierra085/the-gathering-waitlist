// smooth scroll from any CTA button
document.querySelectorAll(".cta-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector("#waitlist").scrollIntoView({ behavior: "smooth" });
  });
});

// progressive form logic
let currentStep = 1;
const questions = document.querySelectorAll(".question");
const progressBar = document.getElementById("progress");

function nextQuestion() {
  if (currentStep < questions.length) {
    questions[currentStep - 1].classList.remove("active");
    currentStep++;
    if (questions[currentStep - 1]) {
      questions[currentStep - 1].classList.add("active");
      updateProgress();
    }
  }
}

function updateProgress() {
  const percent = ((currentStep - 1) / (questions.length - 1)) * 100;
  progressBar.style.width = percent + "%";
}

// 🧠 Coworking experience logic (fixed)
function handleExperience(select) {
  const value = select.value;
  const details = document.getElementById("experienceDetails");
  const current = document.querySelector(".question.active");

  // reset details visibility
  details.style.display = "none";
  details.classList.remove("active");

  if (value === "2" || value === "3") {
    // show the extra question
    current.classList.remove("active");
    details.style.display = "flex";
    details.classList.add("active");
    currentStep = parseInt(details.dataset.step);
    updateProgress();
  } else if (value === "0" || value === "1") {
    // skip ahead properly
    current.classList.remove("active");
    currentStep += 2; // move to the next relevant question
    if (questions[currentStep - 1]) {
      questions[currentStep - 1].classList.add("active");
      updateProgress();
    }
  }
}

// ⌨️ Allow Enter / Return to act as "Next" or "Submit"
document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  if (!active) return;

  const tag = active.tagName.toLowerCase();
  const isEnter =
    e.key === "Enter" ||
    e.key === "NumpadEnter" ||
    e.keyCode === 13;

  // ignore Enter in textareas
  if (!isEnter || tag === "textarea") return;

  e.preventDefault();

  const current = document.querySelector(".question.active");
  if (!current) return;

  // find button in the current question
  const submitBtn = current.querySelector('button[type="submit"]');
  const nextBtn = current.querySelector('button[type="button"]');

  (submitBtn || nextBtn)?.click();
});

// 🪄 Google Sheets submission
document.getElementById("waitlistForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  await fetch("https://script.google.com/macros/s/AKfycbwRnpf4vDhvsywhLg4NRRwCfg-TMMChvx3N5A8RUg2YvtbSeAVRGGOfGa7H0SINJr2r/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

  alert("✨ Thank you! You're on the waitlist.");
  e.target.reset();
});
