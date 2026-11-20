function getLoginAccounts() {
    return [
        {
            name: "Admin",
            email: "mahi@gmail.com",
            password: "12345678",
            role: "Admin",
            status: "Active"
        },
        {
            name: "Md Sobahan Hasan Saikat",
            email: "md.shsaikat71@gmail.com",
            password: "saikat35",
            role: "Recruiter",
            status: "Active"
        },
        {
            name: "Rahim Ahmed",
            email: "rahim@gmail.com",
            password: "123456",
            role: "Recruiter",
            status: "Active"
        },
        {
            name: "Nusrat Jahan",
            email: "nusrat@gmail.com",
            password: "123456",
            role: "Recruiter",
            status: "Active"
        },
        {
            name: "HR Manager",
            email: "hr@gmail.com",
            password: "123456",
            role: "HR Manager",
            status: "Active"
        }
    ];
}

function saveLoginSession(user) {
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userGender", "");
    localStorage.setItem("userDOB", "");
    localStorage.setItem("userContact", "");
    localStorage.setItem("userAddress", "");
    localStorage.setItem("userStatus", user.status);
}

function getDashboardPath(role) {
    var pages = {
        "Admin": "admin/dashboard.html",
        "Recruiter": "recruiter/dashboard.html",
        "Job Seeker": "job-seeker/dashboard.html",
        "HR Manager": "hr-manager/dashboard.html"
    };

    return pages[role] || "";
}

function setupLogin() {
    var loginForm = document.getElementById("login-form");
    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = document.getElementById("login-email").value.trim().toLowerCase();
        var password = document.getElementById("login-password").value;
        var role = document.getElementById("login-role").value;
        var message = document.getElementById("login-message");
        var accounts = getLoginAccounts();
        var matchedUser = null;
        var i;

        if (!role) {
            message.textContent = "Please select your account role.";
            return;
        }

        // Job Seeker and HR Manager do not use pre-stored demo accounts.
        // Any valid email and password can start a session for these roles.
        if (role === "Job Seeker" || role === "HR Manager") {
            if (email && password.length >= 6) {
                matchedUser = {
                    name: role,
                    email: email,
                    password: password,
                    role: role,
                    status: "Active"
                };
            }
        } else {
            for (i = 0; i < accounts.length; i++) {
                if (accounts[i].email.toLowerCase() === email &&
                    accounts[i].password === password &&
                    accounts[i].role === role) {
                    matchedUser = accounts[i];
                    break;
                }
            }
        }

        if (!matchedUser) {
            message.textContent = "Invalid email, password, or account role.";
            return;
        }

        if (matchedUser.status !== "Active") {
            message.textContent = "This account is inactive.";
            return;
        }

        saveLoginSession(matchedUser);

        // Keep the existing recruiter demo account connected to its demo data.
        var dashboard = getDashboardPath(matchedUser.role);
        if (matchedUser.email.toLowerCase() === "md.shsaikat71@gmail.com" &&
            matchedUser.password === "saikat35" &&
            matchedUser.role === "Recruiter") {
            dashboard += "?demo=recruiter";
        }

        if (dashboard) {
            window.location.href = dashboard;
        }
    });
}

function setupForms() {
    var forms = document.querySelectorAll("form");

    for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", function (event) {
            if (!this.checkValidity()) {
                event.preventDefault();
                this.reportValidity();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setupLogin();
    setupForms();
});
