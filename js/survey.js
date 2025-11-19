document.addEventListener("DOMContentLoaded", () => {

  // progressive form logic
  let currentStep = 1;
  const questions = document.querySelectorAll(".question");
  const progressBar = document.getElementById("progress");

  // expose nextQuestion globally
  window.nextQuestion = function () {
    const current = questions[currentStep - 1];
    
    // Basic validation - check if required fields are filled
    const requiredInputs = current.querySelectorAll('[required]');
    let allFilled = true;
    
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        allFilled = false;
        input.style.borderColor = '#ff6b6b';
      } else {
        input.style.borderColor = '';
      }
    });
    
    if (!allFilled) {
      return;
    }
    
    if (currentStep < questions.length) {
      current.classList.remove("active");
      currentStep++;
      if (questions[currentStep - 1]) {
        questions[currentStep - 1].classList.add("active");
        updateProgress();
      }
    }
  };

  function updateProgress() {
    const percent = ((currentStep - 1) / (questions.length - 1)) * 100;
    progressBar.style.width = percent + "%";
  }

  // Allow Enter key to act as "Next" or "Submit"
  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (!active) return;

    const tag = active.tagName.toLowerCase();
    const isEnter = e.key === "Enter" || e.keyCode === 13;

    // ignore Enter in textareas
    if (!isEnter || tag === "textarea") return;

    e.preventDefault();

    const current = document.querySelector(".question.active");
    if (!current) return;

    const submitBtn = current.querySelector('button[type="submit"]');
    const nextBtn = current.querySelector('button[type="button"]');

    (submitBtn || nextBtn)?.click();
  });

  // Form submission
  document.getElementById("surveyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const current = document.querySelector(".question.active");

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const oldMsg = current.querySelector("#statusMessage");
    if (oldMsg) oldMsg.remove();

    const statusMsg = document.createElement("p");
    statusMsg.id = "statusMessage";
    statusMsg.textContent = "Sending your response, please wait...";
    statusMsg.style.marginTop = "1rem";
    current.appendChild(statusMsg);

    try {
      const formData = new FormData(form);

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwRnpf4vDhvsywhLg4NRRwCfg-TMMChvx3N5A8RUg2YvtbSeAVRGGOfGa7H0SINJr2r/exec",
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.text();
      console.log("Server response:", result);

      if (response.ok) {
        statusMsg.textContent = "✨ Thank you! You're on the waitlist.";
        submitBtn.textContent = "Submitted";
        submitBtn.style.backgroundColor = "#6b8e23";
        
        setTimeout(() => {
          current.classList.remove("active");
          const thankYou = document.getElementById("thankYou");
          if (thankYou) {
            thankYou.classList.add("active");
            currentStep = parseInt(thankYou.dataset.step);
            updateProgress();
          }
        }, 1500);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      statusMsg.textContent = "⚠️ Something went wrong. Please try again later.";
      submitBtn.textContent = "Retry";
      submitBtn.disabled = false;
    }
  });

});
