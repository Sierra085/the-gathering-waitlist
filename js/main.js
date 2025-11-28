document.addEventListener("DOMContentLoaded", () => {

  // Smooth scroll from any CTA button to waitlist form
  document.querySelectorAll(".cta-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const waitlistSection = document.getElementById("waitlist");
      if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Populate age datalist (18-80)
  const ageList = document.getElementById("ageList");
  if (ageList) {
    for (let i = 18; i <= 80; i++) {
      const option = document.createElement("option");
      option.value = i;
      ageList.appendChild(option);
    }
  }

  // Populate country datalist
  const countryList = document.getElementById("countryList");
  if (countryList) {
    const countries = [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
      "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
      "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
      "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
      "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
      "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
      "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
      "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
      "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
      "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
      "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
      "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
      "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
      "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
      "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
      "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
      "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
      "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
      "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      countryList.appendChild(option);
    });
  }

  // Progressive form logic
  let currentStep = 1;
  const questions = document.querySelectorAll(".question");
  const progressBar = document.getElementById("progress");
  const totalSteps = 24; // Total steps excluding thank you page

  // Expose nextQuestion globally
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
    const percent = ((currentStep - 1) / totalSteps) * 100;
    progressBar.style.width = percent + "%";
  }

  // Virtual coworking branching logic
  window.branchYes = function () {
    // If Yes, proceed to question 15 (understanding)
    setTimeout(() => {
      questions[currentStep - 1].classList.remove("active");
      currentStep = 15;
      questions[currentStep - 1].classList.add("active");
      updateProgress();
    }, 300);
  };

  window.branchNo = function () {
    // If No, skip to question 20 (worries)
    setTimeout(() => {
      questions[currentStep - 1].classList.remove("active");
      currentStep = 20;
      questions[currentStep - 1].classList.add("active");
      updateProgress();
    }, 300);
  };

  // Checkbox limit (max 3 selections)
  function limitCheckboxes(groupId, maxSelections) {
    const group = document.getElementById(groupId);
    if (!group) return;

    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const checkedCount = group.querySelectorAll('input[type="checkbox"]:checked').length;
        if (checkedCount > maxSelections) {
          checkbox.checked = false;
          alert(`You can select up to ${maxSelections} options only.`);
        }
      });
    });
  }

  limitCheckboxes("needsGroup", 3);
  limitCheckboxes("tasksGroup", 3);

  // Allow Enter / Return to act as "Next" or "Submit"
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

  // Google Sheets submission with visual feedback inside the active card
  document.getElementById("waitlistForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const current = document.querySelector(".question.active");

    // disable button + show status
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // remove any old message first
    const oldMsg = current.querySelector("#statusMessage");
    if (oldMsg) oldMsg.remove();

    // show loading text inside active question
    const statusMsg = document.createElement("p");
    statusMsg.id = "statusMessage";
    statusMsg.textContent = "Sending your response, please wait...";
    statusMsg.style.marginTop = "1rem";
    current.appendChild(statusMsg);

    try {
      // Use FormData from the form directly
      const formData = new FormData(form);

      // YOUR ENDPOINT WILL GO HERE
      const response = await fetch(
        "YOUR_GOOGLE_SHEETS_ENDPOINT_URL",
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
        
        // Show thank you page
        setTimeout(() => {
          current.classList.remove("active");
          const thankYou = document.getElementById("thankYou");
          if (thankYou) {
            thankYou.classList.add("active");
            currentStep = 25;
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
