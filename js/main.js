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
  }
}

function updateProgress() {
  const percent = ((currentStep - 1) / (questions.length - 1)) * 100;
  progressBar.style.width = percent + "%";
}

function handleExperience(select) {
  const value = select.value;
  const details = document.getElementById("experienceDetails");
  if (value === "2" || value === "3") {
    details.style.display = "flex";
  } else {
    details.style.display = "none";
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

