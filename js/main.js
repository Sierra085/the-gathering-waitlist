document.addEventListener("DOMContentLoaded", () => {

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

  // expose nextQuestion globally
  window.nextQuestion = function () {
    if (currentStep < questions.length) {
      questions[currentStep - 1].classList.remove("active");
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

  // 🧠 Coworking experience logic (fixed)
  window.handleExperience = function (select) {
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
  };

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

  // 🪄 Google Sheets submission with visual feedback inside the active card
  document.getElementById("waitlistForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const submitBtn = form.querySelector('button[type="submit"]');
    const current = document.querySelector(".question.active");

    // 1️⃣ disable button + show status
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // remove any old message first
    const oldMsg = current.querySelector("#statusMessage");
    if (oldMsg) oldMsg.remove();

    // 2️⃣ show loading text inside active question
    const statusMsg = document.createElement("p");
    statusMsg.id = "statusMessage";
    statusMsg.textContent = "Sending your response, please wait...";
    statusMsg.style.marginTop = "1rem";
    current.appendChild(statusMsg);

    try {
      // ✅ Use FormData instead of JSON for best compatibility
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      
      // Ensure checkbox value is included properly
      const checkbox = form.querySelector('input[name="marketing_consent"]');
      if (checkbox && checkbox.checked) {
        formData.set('marketing_consent', 'Yes');
      } else {
        formData.set('marketing_consent', 'No');
      }

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwRnpf4vDhvsywhLg4NRRwCfg-TMMChvx3N5A8RUg2YvtbSeAVRGGOfGa7H0SINJr2r/exec",
        {
          method: "POST",
          body: formData
        }
      );

      if (response.ok) {
        form.reset();
        statusMsg.textContent = "✨ Thank you! You're on the waitlist.";
        submitBtn.textContent = "Submitted";
        submitBtn.style.backgroundColor = "#6b8e23";
        
        // Show thank you page
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
    } finally {
      // 4️⃣ allow resubmission after short delay
      setTimeout(() => {
        submitBtn.disabled = false;
        if (submitBtn.textContent === "Submitted") {
          submitBtn.textContent = "Join the Waitlist";
        }
      }, 3000);
    }
  });
  
  // smooth scroll through sections with each scroll "step"
  const sections = ["#hero", "#story1", "#story2", "#story3", "#waitlist"];
  let currentSection = 0;
  let isScrolling = false;

  window.addEventListener("wheel", (e) => {
    if (isScrolling) return; // prevent rapid-fire
    isScrolling = true;

    if (e.deltaY > 0 && currentSection < sections.length - 1) {
      currentSection++;
    } else if (e.deltaY < 0 && currentSection > 0) {
      currentSection--;
    }

    document.querySelector(sections[currentSection]).scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => (isScrolling = false), 1000);
  });

  // scroll fade reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll("section").forEach((sec) => observer.observe(sec));


});
