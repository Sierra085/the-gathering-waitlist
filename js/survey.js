document.addEventListener("DOMContentLoaded", () => {

  // progressive form logic
  let currentStep = 1;
  const questions = document.querySelectorAll(".question");
  const progressBar = document.getElementById("progress");
  const currentStepSpan = document.getElementById("currentStep");
  const totalStepsSpan = document.getElementById("totalSteps");
  
  // Set total steps
  if (totalStepsSpan) {
    totalStepsSpan.textContent = questions.length - 1; // Exclude thank you page
  }

  // expose nextQuestion globally
  window.nextQuestion = function () {
    const current = questions[currentStep - 1];
    
    // Basic validation - check if required fields are filled
    const requiredInputs = current.querySelectorAll('[required]');
    let allFilled = true;
    
    requiredInputs.forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        // For radio/checkbox, check if at least one in the group is checked
        const name = input.name;
        const checked = current.querySelector(`input[name="${name}"]:checked`);
        if (!checked && input.hasAttribute('required')) {
          allFilled = false;
        }
      } else if (!input.value.trim()) {
        allFilled = false;
        input.style.borderColor = '#ff6b6b';
      } else {
        input.style.borderColor = '';
      }
    });
    
    if (!allFilled) {
      alert('Please fill in all required fields before continuing.');
      return;
    }
    
    // Handle conditional navigation for co-working question
    if (current.querySelector('input[name="knows_coworking"]')) {
      const knowsCoworking = current.querySelector('input[name="knows_coworking"]:checked');
      if (knowsCoworking && knowsCoworking.value === 'No') {
        // Skip to Section 4 (question about worries - step 18)
        current.classList.remove("active");
        currentStep = 18;
        questions[currentStep - 1].classList.add("active");
        updateProgress();
        return;
      }
    }
    
    if (currentStep < questions.length) {
      current.classList.remove("active");
      currentStep++;
      if (questions[currentStep - 1]) {
        questions[currentStep - 1].classList.add("active");
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  function updateProgress() {
    const totalQuestions = questions.length - 1; // Exclude thank you page
    const percent = ((currentStep - 1) / totalQuestions) * 100;
    progressBar.style.width = percent + "%";
    if (currentStepSpan) {
      currentStepSpan.textContent = currentStep;
    }
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
        "https://script.google.com/macros/s/AKfycbwmMyJ_v8osQyCKQebIhin3es9OOubTRBCqpRXLZc5oLsQSEueI8gg14bOQK6nEpfZ-/exec",
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
