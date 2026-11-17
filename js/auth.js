/* Form checks and messages for account pages */
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#register-form");
  const loginForm = document.querySelector("#login-form");

  if (registerForm) {
    const password = registerForm.elements.namedItem("password");
    const confirmPassword = registerForm.elements.namedItem("confirm_password");
    const message = document.querySelector("#register-message");

    function checkPasswords() {
      if (confirmPassword.value && password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
      } else {
        confirmPassword.setCustomValidity("");
      }
    }

    password.addEventListener("input", checkPasswords);
    confirmPassword.addEventListener("input", checkPasswords);
    registerForm.addEventListener("submit", event => {
      event.preventDefault();
      checkPasswords();
      if (!registerForm.reportValidity()) return;

      const user = Object.fromEntries(new FormData(registerForm).entries());
      delete user.password;
      delete user.confirm_password;
      user.user_id = String(Date.now());
      user.status = "Pending";

      const savedUsers = JSON.parse(localStorage.getItem("jobPortal:users") || "[]");
      savedUsers.push(user);
      localStorage.setItem("jobPortal:users", JSON.stringify(savedUsers));

      message.dataset.error = "false";
      message.textContent = "Your account has been created.";
    });
  }

  if (loginForm) {
    const message = document.querySelector("#login-message");
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;

      const role = loginForm.elements.namedItem("role").value;
      const dashboardPages = {
        Recruiter: "recruiter/dashboard.html"
      };

      if (dashboardPages[role]) {
        message.dataset.error = "false";
        message.textContent = "Login successful. Opening your dashboard…";
        window.setTimeout(() => {
          window.location.href = dashboardPages[role];
        }, 500);
      } else {
        message.dataset.error = "true";
        message.textContent = "Please select the Recruiter role.";
      }
    });
  }
});
