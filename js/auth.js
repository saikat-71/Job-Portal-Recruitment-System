/* Simple account registration and login for the frontend project. */
document.addEventListener("DOMContentLoaded", () => {
    const usersKey = "jobPortal:users";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(usersKey) || "[]");
        } catch (error) {
            return [];
        }
    }

    function showFormMessage(element, message, isError) {
        if (!element) return;
        element.textContent = message;
        element.dataset.error = String(isError);
    }

    const registerForm = document.querySelector("#register-form");
    console.log("Register form found:", registerForm);

    if (registerForm) {
        const password = registerForm.elements.namedItem("password");
        const confirmPassword = registerForm.elements.namedItem("confirm_password");
        const message = document.querySelector("#register-message");

        function checkPasswords() {
            confirmPassword.setCustomValidity(
                password.value !== confirmPassword.value ? "Passwords do not match." : ""
            );
        }

        password.addEventListener("input", checkPasswords);
        confirmPassword.addEventListener("input", checkPasswords);

        registerForm.addEventListener("submit", event => {
            event.preventDefault();
            checkPasswords();

            if (!registerForm.reportValidity()) return;

            const users = getUsers();
            const email = registerForm.elements.namedItem("email").value.trim().toLowerCase();

            const existingIndex = users.findIndex(user => String(user.email).toLowerCase() === email);
            if (existingIndex >= 0 && users[existingIndex].password) {
                showFormMessage(message, "An account with this email already exists.", true);
                return;
            }

            const user = Object.fromEntries(new FormData(registerForm).entries());
            user.email = email;
            delete user.confirm_password;
            user.user_id = existingIndex >= 0 ? users[existingIndex].user_id : String(Date.now());
            user.status = "Active";
            user.created_at = existingIndex >= 0 ? users[existingIndex].created_at : new Date().toLocaleString();

            // Update old demo accounts that were created before password saving was fixed.
            if (existingIndex >= 0) users[existingIndex] = { ...users[existingIndex], ...user };
            else users.push(user);

            // This is a classroom frontend demo. Real applications must hash passwords on a server.

            try {
                localStorage.setItem(usersKey, JSON.stringify(users));
                showFormMessage(message, "Account created successfully. You can now log in.", false);
                registerForm.reset();
            } catch (error) {
                showFormMessage(message, "Could not save the account. Browser storage may be full.", true);
            }
        });
    }

    const loginForm = document.querySelector("#login-form");

    if (loginForm) {
        const message = document.querySelector("#login-message");

        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            if (!loginForm.reportValidity()) return;

            const email = loginForm.elements.namedItem("email").value.trim().toLowerCase();
            const password = loginForm.elements.namedItem("password").value;
            const role = loginForm.elements.namedItem("role").value;
            const user = getUsers().find(item =>
                String(item.email).toLowerCase() === email &&
                item.password === password &&
                item.role === role
            );

            if (!user) {
                showFormMessage(message, "Email, password or selected role is incorrect.", true);
                return;
            }

            if (user.status && user.status !== "Active") {
                showFormMessage(message, "Your account is not active. Please contact the administrator.", true);
                return;
            }

            const dashboards = {
                Recruiter: "recruiter/dashboard.html",
                "Job Seeker": "job-seeker/dashboard.html",
                "HR Manager": "hr-manager/dashboard.html",
                Admin: "admin/dashboard.html"
            };

            try {
                localStorage.setItem("userName", user.name);
                localStorage.setItem("userEmail", user.email);
                localStorage.setItem("userRole", user.role);
                localStorage.setItem("userGender", user.gender);
                localStorage.setItem("userDOB", user.dob);
                localStorage.setItem("userContact", user.contact);
                localStorage.setItem("userAddress", user.address);
                localStorage.setItem("userStatus", user.status);
                showFormMessage(message, "Login successful. Opening your dashboard...", false);
                window.setTimeout(() => {
                    window.location.href = dashboards[user.role];
                }, 400);
            } catch (error) {
                showFormMessage(message, "Could not start your session. Please try again.", true);
            }
        });
    }
});