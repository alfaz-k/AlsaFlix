// Initialize EmailJS with your Public Key
emailjs.init("mvD2uMgAlNwJD727n");

const suggestBtn = document.getElementById("suggest-movie-btn");
const modal = document.getElementById("suggest-modal");
const closeModalBtn = document.getElementById("close-modal");
const suggestForm = document.getElementById("suggest-form");
const suggestBanner = document.getElementById("suggest-banner");

// Open Modal
if (suggestBtn) {
  suggestBtn.addEventListener("click", () => {
    modal.classList.add("show");
  });
}

// Close Modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modal.classList.remove("show");
  });
}

// Close Modal when clicking outside the card
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});

// Handle Form Submission
if (suggestForm) {
  suggestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const movieTitle = document.getElementById("suggest-title").value.trim();
    const userEmail = document.getElementById("suggest-email").value.trim() || "Anonymous";
    const notes = document.getElementById("suggest-notes").value.trim() || "None";
    const submitBtn = document.getElementById("suggest-submit");

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-label").textContent = "Sending...";

    try {
      // Send parameters matching your EmailJS template placeholders
      await emailjs.send("service_3lrp719", "template_tgns3zh", {
        movie_title: movieTitle,
        user_email: userEmail,
        message: notes
      });

      suggestBanner.textContent = "Thank you! Your suggestion has been sent.";
      suggestBanner.className = "form-banner success show";
      suggestForm.reset();

      setTimeout(() => {
        modal.classList.remove("show");
        suggestBanner.className = "form-banner";
      }, 2500);

    } catch (error) {
      console.error("EmailJS Error:", error);
      suggestBanner.textContent = "Failed to send suggestion. Try again later.";
      suggestBanner.className = "form-banner error show";
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-label").textContent = "Send Suggestion";
    }
  });
}
