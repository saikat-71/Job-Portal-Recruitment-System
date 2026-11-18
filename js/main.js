var recruiterDemo = {
    name: "Md Sobahan Hasan Saikat",
    role: "Recruiter",
    email: "md.shsaikat71@gmail.com",
    password: "saikat35",
    gender: "Male",
    dob: "2 February 2004",
    contact: "01751-027271",
    address: "Bashundhara R/A, Dhaka",
    status: "Active",
    company: {
        id: "C-101",
        name: "TechNova Solutions Ltd.",
        location: "Bashundhara R/A, Dhaka",
        information: "TechNova Solutions Ltd. is a growing technology company focused on software, data and digital solutions.",
        contact: "Md Sobahan Hasan Saikat - 01751-027271"
    },
    jobs: [
        {
            id: "JOB-101",
            title: "Junior Software Developer",
            category: "Software Development",
            location: "Dhaka",
            status: "Open",
            description: "Build and maintain web applications with the development team.",
            requirements: "HTML, CSS, JavaScript and basic programming knowledge."
        },
        {
            id: "JOB-102",
            title: "Data Analyst",
            category: "Data Analytics",
            location: "Dhaka",
            status: "Open",
            description: "Prepare reports and analyze business data for better decisions.",
            requirements: "Excel, SQL, Power BI and basic statistics."
        },
        {
            id: "JOB-103",
            title: "UI/UX Design Intern",
            category: "Design",
            location: "Remote",
            status: "Closed",
            description: "Support the design team with user interface and user experience tasks.",
            requirements: "Basic Figma knowledge and an interest in UI/UX design."
        }
    ],
    applicants: [
        { id: "APP-201", name: "Ayesha Rahman", email: "ayesha@example.com", job: "Junior Software Developer", status: "Shortlisted", resume: "Ayesha-Rahman-CV.pdf", message: "I am interested in the software developer position." },
        { id: "APP-202", name: "Tanvir Ahmed", email: "tanvir@example.com", job: "Data Analyst", status: "Under Review", resume: "Tanvir-Ahmed-CV.pdf", message: "Please consider my application for the Data Analyst role." },
        { id: "APP-203", name: "Nusrat Jahan", email: "nusrat@example.com", job: "Junior Software Developer", status: "Pending", resume: "Nusrat-Jahan-CV.pdf", message: "I would love to join your development team." },
        { id: "APP-204", name: "Rakib Hasan", email: "rakib@example.com", job: "Data Analyst", status: "Shortlisted", resume: "Rakib-Hasan-CV.pdf", message: "My background matches the requirements of this role." },
        { id: "APP-205", name: "Sadia Islam", email: "sadia@example.com", job: "UI/UX Design Intern", status: "Rejected", resume: "Sadia-Islam-CV.pdf", message: "I am applying for the UI/UX internship opportunity." },
        { id: "APP-206", name: "Fahim Chowdhury", email: "fahim@example.com", job: "Junior Software Developer", status: "Under Review", resume: "Fahim-Chowdhury-CV.pdf", message: "I have attached my CV for your review." }
    ]
};

function showFormMessage(form, message) {
    var output = form.querySelector(".form-message, .form-status");

    if (!output) {
        output = document.createElement("p");
        output.className = "form-message";
        form.appendChild(output);
    }

    output.textContent = message;
}

function checkPasswordMatch(form) {
    var password = form.querySelector('[name="password"], [name="new_password"]');
    var confirmPassword = form.querySelector('[name="confirm_password"]');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
        return false;
    }

    if (confirmPassword) {
        confirmPassword.setCustomValidity("");
    }

    return true;
}

function setupPasswordForms() {
    var forms = document.querySelectorAll("form");

    for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("input", function () {
            checkPasswordMatch(this);
        });
    }
}

function setupJobSearch() {
    var searchForm = document.getElementById("job-search-form");

    if (!searchForm) {
        return;
    }

    var searchInput = document.getElementById("job-keyword");
    var jobCards = document.querySelectorAll(".job-card");
    var message = document.getElementById("search-message");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var keyword = searchInput.value.toLowerCase().trim();
        var visibleJobs = 0;

        for (var i = 0; i < jobCards.length; i++) {
            var jobText = jobCards[i].textContent.toLowerCase();

            if (keyword === "" || jobText.indexOf(keyword) !== -1) {
                jobCards[i].style.display = "block";
                visibleJobs++;
            } else {
                jobCards[i].style.display = "none";
            }
        }

        if (message) {
            if (visibleJobs === 0) {
                message.textContent = "No matching jobs were found.";
            } else {
                message.textContent = visibleJobs + " job(s) found.";
            }
        }
    });
}

function isRecruiterDemo() {
    return new URLSearchParams(window.location.search).get("demo") === "recruiter";
}

function addDemoQueryToLinks() {
    if (!isRecruiterDemo()) {
        return;
    }

    var links = document.querySelectorAll("a[href]");

    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute("href");

        if (!href || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0 || href.indexOf("http") === 0) {
            continue;
        }

        if (href.indexOf("login.html") !== -1 || href.indexOf("logout") !== -1) {
            continue;
        }

        if (href.indexOf("demo=recruiter") === -1) {
            var separator = href.indexOf("?") === -1 ? "?" : "&";
            links[i].setAttribute("href", href + separator + "demo=recruiter");
        }
    }
}

function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function setValue(id, value) {
    var element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

function setupDemoHeader() {
    if (!isRecruiterDemo()) {
        return;
    }

    setText("header-profile-name", recruiterDemo.name);
    setText("header-profile-role", recruiterDemo.role);
}

function setupDemoDashboard() {
    if (!isRecruiterDemo() || !document.querySelector(".metric-grid")) {
        return;
    }

    var metrics = document.querySelectorAll(".metric-value");

    if (metrics.length >= 3) {
        metrics[0].textContent = recruiterDemo.jobs.length;
        metrics[1].textContent = recruiterDemo.applicants.length;

        var shortlisted = 0;
        for (var i = 0; i < recruiterDemo.applicants.length; i++) {
            if (recruiterDemo.applicants[i].status === "Shortlisted") {
                shortlisted++;
            }
        }
        metrics[2].textContent = shortlisted;
    }

    var tableBody = document.querySelector(".dashboard-section table tbody");
    if (tableBody) {
        tableBody.innerHTML = "";

        for (var j = 0; j < 4 && j < recruiterDemo.applicants.length; j++) {
            var applicant = recruiterDemo.applicants[j];
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + applicant.name + "</td>" +
                "<td>" + applicant.job + "</td>" +
                "<td>" + applicant.status + "</td>";
            tableBody.appendChild(row);
        }
    }
}

function setupDemoJobs() {
    if (!isRecruiterDemo() || !document.getElementById("job-post-list-heading")) {
        return;
    }

    setValue("recruiter-user-id", "REC-001");

    var companySelect = document.getElementById("company-id");
    if (companySelect && companySelect.tagName === "SELECT") {
        companySelect.innerHTML = "<option value=\"" + recruiterDemo.company.id + "\">" + recruiterDemo.company.name + "</option>";
    }

    var categorySelect = document.getElementById("category-id");
    if (categorySelect) {
        categorySelect.innerHTML = "";
        var categories = ["Software Development", "Data Analytics", "Design"];
        for (var i = 0; i < categories.length; i++) {
            var categoryOption = document.createElement("option");
            categoryOption.value = categories[i];
            categoryOption.textContent = categories[i];
            categorySelect.appendChild(categoryOption);
        }
    }

    var tableBody = document.querySelector("#job-post-list-heading + .table-wrap table tbody");
    if (!tableBody) {
        tableBody = document.querySelector(".table-panel table tbody");
    }

    if (tableBody) {
        tableBody.innerHTML = "";
        for (var j = 0; j < recruiterDemo.jobs.length; j++) {
            var job = recruiterDemo.jobs[j];
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + job.id + "</td>" +
                "<td>" + job.title + "</td>" +
                "<td>" + recruiterDemo.company.id + "</td>" +
                "<td>" + job.category + "</td>" +
                "<td>" + job.location + "</td>" +
                "<td>" + job.status + "</td>" +
                "<td>" + job.description + "</td>" +
                "<td>" + job.requirements + "</td>";
            tableBody.appendChild(row);
        }
    }

    var jobForm = document.querySelector("#job-post-form-heading");
    if (jobForm) {
        var form = jobForm.closest("section").querySelector("form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                showFormMessage(form, "Job post saved successfully.");
            });
        }
    }

    var deleteForm = document.querySelector("#delete-job-id");
    if (deleteForm) {
        var deleteJobForm = deleteForm.closest("form");
        deleteJobForm.addEventListener("submit", function (event) {
            event.preventDefault();
            showFormMessage(deleteJobForm, "Job post deleted successfully.");
        });
    }
}

function setupDemoApplicants() {
    if (!isRecruiterDemo() || !document.getElementById("application-list-heading")) {
        return;
    }

    setValue("reviewer-user-id", "REC-001");

    var applicationSelect = document.getElementById("application-id");
    if (applicationSelect) {
        applicationSelect.innerHTML = "<option value=\"\">Select an application</option>";
        for (var i = 0; i < recruiterDemo.applicants.length; i++) {
            var option = document.createElement("option");
            option.value = recruiterDemo.applicants[i].id;
            option.textContent = recruiterDemo.applicants[i].id + " - " + recruiterDemo.applicants[i].name;
            applicationSelect.appendChild(option);
        }
    }

    var applicationTable = document.querySelector("#application-list-heading + p + .table-wrap table tbody");
    if (!applicationTable) {
        applicationTable = document.querySelector(".table-panel table tbody");
    }

    if (applicationTable) {
        applicationTable.innerHTML = "";
        for (var j = 0; j < recruiterDemo.applicants.length; j++) {
            var applicant = recruiterDemo.applicants[j];
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + applicant.id + "</td>" +
                "<td>" + applicant.name + "</td>" +
                "<td>" + applicant.email + "</td>" +
                "<td>" + applicant.job + "</td>" +
                "<td><select class=\"demo-status-select\"><option>Pending</option><option>Under Review</option><option>Shortlisted</option><option>Rejected</option></select></td>" +
                "<td>" + applicant.resume + "</td>" +
                "<td>" + applicant.message + "</td>" +
                "<td><button type=\"button\" class=\"demo-update-button\">Update</button></td>";
            applicationTable.appendChild(row);

            var statusSelect = row.querySelector(".demo-status-select");
            statusSelect.value = applicant.status === "Shortlisted" ? "Shortlisted" : applicant.status === "Rejected" ? "Rejected" : applicant.status === "Under Review" ? "Under Review" : "Pending";
        }
    }

    var updateButtons = document.querySelectorAll(".demo-update-button");
    for (var k = 0; k < updateButtons.length; k++) {
        updateButtons[k].addEventListener("click", function () {
            var row = this.closest("tr");
            var select = row.querySelector(".demo-status-select");
            row.cells[4].textContent = select.value;
            showFormMessage(document.querySelector("#review-form-heading").closest("section").querySelector("form"), "Application status updated successfully.");
        });
    }
}

function setupDemoCompany() {
    if (!isRecruiterDemo() || !document.getElementById("company-summary")) {
        return;
    }

    var summary = document.getElementById("company-summary");
    summary.hidden = false;
    setText("company-name-view", recruiterDemo.company.name);
    setText("company-location-view", recruiterDemo.company.location);
    setText("company-information-view", recruiterDemo.company.information);
    setText("company-contact-view", recruiterDemo.company.contact);
    setText("company-id", recruiterDemo.company.id);
    setText("company-user-id", "REC-001");

    var companyName = document.getElementById("company-name");
    var companyLocation = document.getElementById("company-location");
    var companyInformation = document.getElementById("company-information");
    if (companyName) companyName.value = recruiterDemo.company.name;
    if (companyLocation) companyLocation.value = recruiterDemo.company.location;
    if (companyInformation) companyInformation.value = recruiterDemo.company.information;

    var companyForm = document.querySelector("#company-edit form");
    if (companyForm) {
        companyForm.addEventListener("submit", function (event) {
            event.preventDefault();
            setText("company-name-view", companyName.value);
            setText("company-location-view", companyLocation.value);
            setText("company-information-view", companyInformation.value);
            showFormMessage(companyForm, "Company profile saved successfully.");
        });
    }

    var deleteCompanyForm = document.querySelector("#company-delete form");
    if (deleteCompanyForm) {
        deleteCompanyForm.addEventListener("submit", function (event) {
            event.preventDefault();
            setText("company-name-view", "No company profile yet");
            setText("company-location-view", "Create your company profile to add a location.");
            setText("company-information-view", "No company information has been added yet.");
            setText("company-contact-view", "Recruiter contact will appear here.");
            showFormMessage(deleteCompanyForm, "Company profile deleted successfully.");
        });
    }
}

function setupDemoProfile() {
    if (!isRecruiterDemo() || !document.getElementById("profile-summary-title")) {
        return;
    }

    setText("profile-name-view", recruiterDemo.name);
    setText("profile-role-view", recruiterDemo.role);
    setText("profile-email-view", recruiterDemo.email);
    setText("profile-gender-view", recruiterDemo.gender);
    setText("profile-dob-view", recruiterDemo.dob);
    setText("profile-contact-view", recruiterDemo.contact);
    setText("profile-address-view", recruiterDemo.address);
    setText("profile-status-view", recruiterDemo.status);

    setValue("profile-user-id", "REC-001");
    setValue("profile-role", recruiterDemo.role);

    var name = document.getElementById("profile-name");
    var gender = document.getElementById("profile-gender");
    var dob = document.getElementById("profile-dob");
    var contact = document.getElementById("profile-contact");
    var email = document.getElementById("profile-email");
    var address = document.getElementById("profile-address");

    if (name) name.value = recruiterDemo.name;
    if (gender) gender.value = recruiterDemo.gender;
    if (dob) dob.value = "2004-02-02";
    if (contact) contact.value = recruiterDemo.contact;
    if (email) email.value = recruiterDemo.email;
    if (address) address.value = recruiterDemo.address;

    var profileForm = document.querySelector("#profile-update form");
    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            setText("profile-name-view", name.value);
            setText("profile-email-view", email.value);
            setText("profile-contact-view", contact.value);
            setText("profile-address-view", address.value);
            showFormMessage(profileForm, "Profile changes saved successfully.");
        });
    }
}

function setupDemoLogin() {
    var loginForm = document.getElementById("login-form");
    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = document.getElementById("login-email").value.trim();
        var password = document.getElementById("login-password").value;
        var role = document.getElementById("login-role").value;
        var message = document.getElementById("login-message");

        if (email === recruiterDemo.email && password === recruiterDemo.password && role === recruiterDemo.role) {
            window.location.href = "recruiter/dashboard.html?demo=recruiter";
            return;
        }

        if (role === "Recruiter") {
            window.location.href = "recruiter/dashboard.html";
            return;
        }

        var dashboardPages = {
            "Admin": "admin/dashboard.html",
            "Job Seeker": "job-seeker/dashboard.html",
            "HR Manager": "hr-manager/dashboard.html"
        };

        if (dashboardPages[role]) {
            window.location.href = dashboardPages[role];
        } else if (message) {
            message.textContent = "Please select your account role.";
        }
    });
}

function setupForms() {
    var forms = document.querySelectorAll("form");

    for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", function (event) {
            if (this.id === "login-form") {
                return;
            }

            event.preventDefault();

            if (!checkPasswordMatch(this)) {
                showFormMessage(this, "Please make sure both passwords match.");
                return;
            }

            if (this.id === "job-search-form") {
                return;
            }

            if (this.id === "register-form") {
                showFormMessage(this, "Registration form submitted successfully.");
            } else {
                showFormMessage(this, "Form submitted successfully.");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setupPasswordForms();
    setupJobSearch();
    setupDemoLogin();
    setupForms();
    setupDemoHeader();
    setupDemoDashboard();
    setupDemoJobs();
    setupDemoApplicants();
    setupDemoCompany();
    setupDemoProfile();
    addDemoQueryToLinks();
});
