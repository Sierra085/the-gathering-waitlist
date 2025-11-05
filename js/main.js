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
    questions[currentStep - 1].classList.add("active");
    updateProgress();
    // allow pressing Enter to go to the next question
document.addEventListener("keydown", (e) => {
  // only trigger if an input or select is focused
  const active = document.activeElement;
  if (
    (active.tagName === "INPUT" || active.tagName === "SELECT" || active.tagName === "TEXTAREA") &&
    e.key === "Enter"
  ) {
    e.preventDefault();
    // don't trigger on submit button
    const current = document.querySelector(".question.active");
    const btn = current.querySelector("button[type='button']");
    if (btn) btn.click();
  }
  if (!questions[currentStep - 1]) return;
});

  }
}

function updateProgress() {
  const percent = ((currentStep - 1) / (questions.length - 1)) * 100;
  progressBar.style.width = percent + "%";
}

function handleExperience(select) {
  const value = select.value;
  const details = document.getElementById("experienceDetails");
  const current = document.querySelector(".question.active");

  // always clear any visible extra question first
  details.style.display = "none";
  details.classList.remove("active");

  if (value === "2" || value === "3") {
    // show the details question and move focus there
    current.classList.remove("active");
    details.style.display = "flex";
    details.classList.add("active");
    currentStep = parseInt(details.dataset.step);
    updateProgress();
  } else if (value === "0" || value === "1") {
    // skip the details question and jump ahead
    current.classList.remove("active");
    currentStep += 2; // move two steps forward to next logical question
    if (questions[currentStep - 1]) {
      questions[currentStep - 1].classList.add("active");
      updateProgress();
    }
  }
}

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

