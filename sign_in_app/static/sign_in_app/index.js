// Day
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

document.addEventListener("DOMContentLoaded", () => {
  const timeElement = document.querySelector(".time");
  const dateElement = document.querySelector(".date");

  function returnDateAndTime() {
    const now = new Date();

    timeElement.textContent = formatTime(now);
    dateElement.textContent = formatDate(now);
  }
  returnDateAndTime();
  setInterval(returnDateAndTime, 1000);

  // First 2 In and OUT buttons
  const signInButton = document.querySelector(".signIn");
  signInButton.addEventListener("click", handleSignIn);

  const signOutButton = document.querySelector(".signOut");
  signOutButton.addEventListener("click", handleSignOut);

  // Buttons inside the modal
  const signInButoons = document.querySelector(".signInButtons");
  const signOutButtons = document.querySelector(".signOutButtons");

  const closeWindowButton = document.getElementById("closeModal");
  closeWindowButton.addEventListener("click", resetNumPad);

  // All the input buttons at the end
  const startShiftInput = document.querySelector(".startShift");
  const startBreakInput = document.querySelector(".startBreak");
  const finishShiftInput = document.querySelector(".finishShift");
  const finishBreakInput = document.querySelector(".finishBreak");

  startShiftInput.addEventListener("click", function (e) {
    e.preventDefault();
    handleFormSubmit(e);
  });
  startBreakInput.addEventListener("click", function (e) {
    e.preventDefault();
    handleFormSubmit(e);
  });

  finishShiftInput.addEventListener("click", function (e) {
    e.preventDefault();
    handleFormSubmit(e);
  });

  finishBreakInput.addEventListener("click", function (e) {
    e.preventDefault();
    handleFormSubmit(e);
  });

  function resetNumPad() {
    const display = document.querySelector("#display");
    display.value = "";
    document
      .querySelectorAll(".num")
      .forEach((button) => (button.disabled = false));

    startShiftInput.disabled = true;
    startBreakInput.disabled = true;
    finishShiftInput.disabled = true;
    finishBreakInput.disabled = true;
  }

  const closeBtn = document.getElementById("closeModal");
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.remove("active");
    closeWebCam();
  });

  const modalOverlay = document.getElementById("modalOverlay");
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
      resetNumPad();
      closeWebCam();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modalOverlay.classList.remove("active");
      resetNumPad();
    }
  });

  function handleSignIn(e) {
    e.preventDefault();

    accessWebCam();
    modalOverlay.classList.add("active");
    document.querySelector(".modal").focus();

    signInButoons.style.display = "block";
    signOutButtons.style.display = "none";
  }

  function handleSignOut(e) {
    e.preventDefault();

    accessWebCam();
    modalOverlay.classList.add("active");
    document.querySelector(".modal").focus();

    signInButoons.style.display = "none";
    signOutButtons.style.display = "block";
  }

  // numPad Functionality
  const numPadButtons = document.querySelectorAll(".numPadButton");
  displayInput = document.querySelector("#display");
  numPadButtons.forEach((button) => {
    button.addEventListener("click", handleNumPadInput);
  });

  function handleNumPadInput(e) {
    e.preventDefault();
    if (displayInput.value.length === 3) {
      document
        .querySelectorAll(".num")
        .forEach((button) => (button.disabled = true));

      startShiftInput.removeAttribute("disabled");
      startBreakInput.removeAttribute("disabled");
      finishShiftInput.removeAttribute("disabled");
      finishBreakInput.removeAttribute("disabled");
    }
    if (e.target.value === "clear") {
      document
        .querySelectorAll(".num")
        .forEach((button) => (button.disabled = false));
      displayInput.value = "";

      startShiftInput.setAttribute("disabled", "true");
      startBreakInput.setAttribute("disabled", "true");
      finishShiftInput.setAttribute("disabled", "true");
      finishBreakInput.setAttribute("disabled", "true");
    } else if (e.target.value === "erase") {
      if (displayInput.value.length <= 4) {
        document
          .querySelectorAll(".num")
          .forEach((button) => (button.disabled = false));

        startShiftInput.setAttribute("disabled", "true");
        startBreakInput.setAttribute("disabled", "true");
        finishShiftInput.setAttribute("disabled", "true");
        finishBreakInput.setAttribute("disabled", "true");
      }
      displayInput.value = displayInput.value.slice(0, -1);
    } else {
      displayInput.value += e.target.value;
    }
  }

  // Camera Access
  let stream = null;
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  function accessWebCam() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = stream;
      })
      .catch((err) => {
        alert("Camera access denied" + err);
      });
  }

  function closeWebCam() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
  }

  // Banner Functionality
  function showNotification(message, isError = true) {
    resetNumPad();
    const banner = document.getElementById("notification-banner");
    const messageSpan = document.getElementById("notification-message");

    banner.style.backgroundColor = isError ? "#f44336" : "#4CAF50"; // red or green
    messageSpan.textContent = message;

    banner.classList.add("show");

    // Clear any previous timeout to avoid stacking
    if (banner.dismissTimeout) {
      clearTimeout(banner.dismissTimeout);
    }

    // Auto-dismiss after 4 seconds
    banner.dismissTimeout = setTimeout(() => {
      banner.classList.remove("show");
    }, 4000);
  }

  // Manual dismiss on click
  document
    .getElementById("close-notification")
    .addEventListener("click", () => {
      document.getElementById("notification-banner").classList.remove("show");
      resetNumPad();
    });

  // Submit the form
  function handleFormSubmit(e) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const formData = new FormData();
      const display = document.querySelector("#display").value;

      formData.append("snapshot", blob, "snapshot.jpg");
      formData.append("userCode", display);
      formData.append("action", e.target.value);

      fetch("/", {
        method: "POST",
        body: formData,
      })
        .then(async (res) => {
          const data = await res.json();

          const errorElement = document.getElementById("error-message");

          if (!res.ok) {
            showNotification(
              data.error || "An unexpected error occurred.",
              true
            );
          } else {
            // Redirect on success
            if (data.redirect) {
              window.location.href = data.redirect;
            } else {
              console.log("Success:", data);
            }
          }
        })
        .catch((err) => {
          document.getElementById("error-message").textContent =
            "A network error occurred.";
          console.error("Error", err);
        });
    }, "image/jpeg");
  }
});

// Format Date and Time

/**
 *
 * @param {Date} date
 */
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }`;
}

/**
 *
 * @param {Date} date
 */
function formatDate(date) {
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const day = date.getDate();

  return `${day} ${month} ${year}`;
}
