/* Shared page behavior for JobPortal. */
const storagePrefix = "jobPortal:";

function readRecords(collection) {
    try {
        return JSON.parse(localStorage.getItem(storagePrefix + collection) || "[]");
    } catch (error) {
        console.error("Could not read saved records", error);
        return [];
    }
}

function writeRecords(collection, records) {
    localStorage.setItem(storagePrefix + collection, JSON.stringify(records));
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("jobPortal:currentUser") || "null"); }
    catch (error) { return null; }
}

function isRecruiterPage() {
    return window.location.pathname.toLowerCase().includes("/recruiter/");
}

function recruiterJobs() {
    const user = getCurrentUser();
    if (!user) return [];
    return readRecords("job_posts").filter(job => String(job.user_id) === String(user.user_id));
}

function recruiterApplications() {
    const jobIds = recruiterJobs().map(job => String(job.job_id || job.id));
    return readRecords("applications").filter(application => jobIds.includes(String(application.job_id)));
}

function showMessage(form, message, isError = false) {
    let output = form.querySelector(".form-status");
    if (!output) {
        output = document.createElement("p");
        output.className = "form-status";
        output.setAttribute("role", "status");
        output.setAttribute("aria-live", "polite");
        form.append(output);
    }
    output.textContent = message;
    output.dataset.error = String(isError);
}

function collectFormValues(form) {
    const values = {};
    const data = new FormData(form);

    for (const [name, value] of data.entries()) {
        const control = form.elements.namedItem(name);
        if (control && control.type === "password") continue;
        if (value instanceof File) {
            if (value.name) values[name] = value.name;
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(values, name)) {
            values[name] = Array.isArray(values[name]) ? [...values[name], value] : [values[name], value];
        } else {
            values[name] = value;
        }
    }
    return values;
}

function saveRecord(form, uploadedImage) {
    const collection = form.dataset.collection;
    const records = readRecords(collection);
    const record = collectFormValues(form);
    const defaults = JSON.parse(form.dataset.defaults || "{}");
    Object.assign(record, defaults);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.user_id && ["job_posts", "companies", "applicant_reviews"].includes(collection)) {
        record.user_id = currentUser.user_id;
    }

    if (uploadedImage) {
        const imageInput = form.querySelector('input[type="file"]');
        if (imageInput) record[imageInput.name] = uploadedImage;
    }

    if (collection === "users") {
        const currentUser = JSON.parse(localStorage.getItem("jobPortal:currentUser") || "null");
        if (!record.role && currentUser) record.role = currentUser.role;
        if (!record.status && currentUser) record.status = currentUser.status || "Active";
    }

    if (collection === "applications" && !record.applied_date) {
        record.applied_date = new Date().toLocaleDateString();
    }
    const requestedAction = form.querySelector('[name="action"]')?.value;
    if (collection === "applications" && requestedAction === "withdraw") {
        record.application_status = "Withdrawn";
    }
    record.updated_at = new Date().toLocaleString();

    const idField = form.dataset.idField || "id";
    const requestedId = record[idField];
    const matchField = form.dataset.match;
    const matchIndex = matchField && record[matchField]
        ? records.findIndex(item => String(item[matchField]) === String(record[matchField]))
        : -1;
    let existingIndex = requestedId
        ? records.findIndex(item => String(item[idField]) === String(requestedId))
        : matchIndex;
    if (existingIndex >= 0 && isRecruiterPage() && currentUser &&
        String(records[existingIndex].user_id) !== String(currentUser.user_id)) {
        showMessage(form, "You can only edit your own records.", true);
        return;
    }

    if (existingIndex >= 0 && !window.confirm("Are you sure you want to update this information?")) {
        return;
    }

    if (!record[idField]) {
        record[idField] = existingIndex >= 0
            ? records[existingIndex][idField]
            : `${Date.now()}`;
    }

    if (existingIndex >= 0) {
        records[existingIndex] = { ...records[existingIndex], ...record };
    } else {
        records.push(record);
    }

    try {
        writeRecords(collection, records);

        if (collection === "applicant_reviews" && record.application_id) {
            const applications = readRecords("applications");
            const applicationIndex = applications.findIndex(item =>
                String(item.application_id) === String(record.application_id)
            );
            if (applicationIndex >= 0) {
                if (record.shortlist_status === "Shortlisted") {
                    applications[applicationIndex].application_status = "Shortlisted";
                } else if (record.shortlist_status === "Not shortlisted") {
                    applications[applicationIndex].application_status = "Rejected";
                } else if (record.review_status === "Reviewed" &&
                    applications[applicationIndex].application_status === "Submitted") {
                    applications[applicationIndex].application_status = "Reviewed";
                }
                writeRecords("applications", applications);
            }
        }

        if (collection === "users") {
            const currentUser = JSON.parse(localStorage.getItem("jobPortal:currentUser") || "null");
            if (currentUser) {
                localStorage.setItem("jobPortal:currentUser", JSON.stringify({ ...currentUser, ...record }));
            }
        }

        renderDynamicContent();
        renderProfileInformation();
        renderCompanyProfile();
        renderHeaderProfile();
        showMessage(form, "Information saved.");
    } catch (error) {
        showMessage(form, "The record could not be saved.", true);
    }
}

function deleteRecord(form) {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
        return;
    }
    const collection = form.dataset.deleteCollection || form.dataset.collection;
    const key = form.dataset.deleteField || "id";
    const target = collectFormValues(form)[key];

    if (!target) {
        showMessage(form, `Enter the ${key.replaceAll("_", " ")} first.`, true);
        return;
    }

    const records = readRecords(collection);
    const currentUser = getCurrentUser();
    const targetRecord = records.find(item => String(item[key] || item.id) === String(target));
    if (targetRecord && isRecruiterPage() && currentUser && String(targetRecord.user_id) !== String(currentUser.user_id)) {
        showMessage(form, "You can only delete your own records.", true);
        return;
    }
    const filtered = records.filter(item => {
        const matches = String(item[key] || item.id) === String(target);
        if (!matches) return true;
        if (isRecruiterPage() && currentUser) return String(item.user_id) !== String(currentUser.user_id);
        return false;
    });
    if (filtered.length === records.length) {
        showMessage(form, "No matching record was found.", true);
        return;
    }

    writeRecords(collection, filtered);
    renderDynamicContent();
    showMessage(form, "Record removed.");
}

function updateMainNavigation() {
    const nav = document.querySelector(".main-nav");
    if (!nav) return;

    const currentUser = getCurrentUser();
    const oldLogin = nav.querySelector('a[href="login.html"]');
    const oldRegister = nav.querySelector('a[href="register.html"]');

    if (!currentUser) {
        if (oldLogin) oldLogin.hidden = false;
        if (oldRegister) oldRegister.hidden = false;
        return;
    }

    if (oldLogin) oldLogin.remove();
    if (oldRegister) oldRegister.remove();

    const dashboards = {
        Recruiter: "recruiter/dashboard.html",
        "Job Seeker": "job-seeker/dashboard.html",
        "HR Manager": "hr-manager/dashboard.html",
        Admin: "admin/dashboard.html"
    };

    let dashboardLink = nav.querySelector(".account-dashboard-link");
    if (!dashboardLink) {
        dashboardLink = document.createElement("a");
        dashboardLink.className = "nav-button account-dashboard-link";
        nav.append(dashboardLink);
    }
    dashboardLink.href = dashboards[currentUser.role] || "profile.html";
    dashboardLink.textContent = "Dashboard";

    let profileLink = nav.querySelector(".account-profile-link");
    if (!profileLink) {
        profileLink = document.createElement("a");
        profileLink.className = "nav-button account-profile-link";
        profileLink.href = "profile.html";
        profileLink.textContent = "My Profile";
        nav.append(profileLink);
    }

    let logoutLink = nav.querySelector(".account-logout-link");
    if (!logoutLink) {
        logoutLink = document.createElement("a");
        logoutLink.className = "nav-button account-logout-link";
        logoutLink.href = "login.html";
        logoutLink.textContent = "Logout";
        logoutLink.addEventListener("click", event => {
            event.preventDefault();
            if (!window.confirm("Are you sure you want to log out?")) return;
            localStorage.removeItem("jobPortal:currentUser");
            window.location.href = "login.html";
        });
        nav.append(logoutLink);
    }
}

function renderHeaderProfile() {
    const photo = document.querySelector("#header-profile-photo");
    if (!photo) return;

    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem("jobPortal:currentUser") || "null");
    } catch (error) {
        currentUser = null;
    }

    let user = currentUser;
    if (currentUser) {
        const savedUsers = readRecords("users");
        const savedUser = savedUsers.find(item =>
            (currentUser.user_id && item.user_id === currentUser.user_id) ||
            String(item.email || "").toLowerCase() === String(currentUser.email || "").toLowerCase()
        );
        if (savedUser) user = savedUser;
    }

    const name = document.querySelector("#header-profile-name");
    const role = document.querySelector("#header-profile-role");

    if (user) {
        if (name) name.textContent = user.name || "JobPortal User";
        if (role) role.textContent = user.role || "Member";
        if (user.profile_picture && user.profile_picture.startsWith("data:image/")) {
            photo.src = user.profile_picture;
        }
        photo.alt = user.name ? user.name + " profile picture" : "User profile picture";
    } else {
        if (name) name.textContent = "Guest User";
        if (role) role.textContent = "Welcome";
        photo.alt = "Default user picture";
    }
}

function renderProfileInformation() {
    const nameOutput = document.querySelector("#profile-name-view");
    if (!nameOutput) return;

    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem("jobPortal:currentUser") || "null");
    } catch (error) {
        currentUser = null;
    }

    const users = readRecords("users");
    let user = null;

    if (currentUser) {
        user = users.find(savedUser =>
            (currentUser.user_id && savedUser.user_id === currentUser.user_id) ||
            String(savedUser.email || "").toLowerCase() === String(currentUser.email || "").toLowerCase()
        );
    }

    if (!user && currentUser) user = currentUser;
    if (!user) user = {};

    const showValue = (id, value) => {
        const output = document.getElementById(id);
        if (output) output.textContent = value || "Not provided";
    };

    showValue("profile-name-view", user.name || "Your Name");
    showValue("profile-role-view", user.role || "Account role not selected");
    showValue("profile-email-view", user.email || "Email not added yet");
    showValue("profile-gender-view", user.gender);
    showValue("profile-dob-view", user.dob);
    showValue("profile-contact-view", user.contact);
    showValue("profile-address-view", user.address);
    showValue("profile-status-view", user.status);

    const photo = document.querySelector("#profile-photo-view");
    if (photo) {
        photo.src = user.profile_picture && user.profile_picture.startsWith("data:image/")
            ? user.profile_picture
            : "images/profile-placeholder.svg";
    }

    const profileForm = document.querySelector('form[data-collection="users"]');
    if (profileForm) {
        ["user_id", "role", "name", "gender", "dob", "contact", "email", "address"].forEach(name => {
            const field = profileForm.elements.namedItem(name);
            if (field && user[name]) field.value = user[name];
        });
    }
}

function renderCompanyProfile() {
    const summary = document.querySelector("#company-summary");
    const nameOutput = document.querySelector("#company-name-view");
    if (!nameOutput) return;

    const currentUser = getCurrentUser();
    const companies = readRecords("companies");
    let company = null;

    if (currentUser && currentUser.user_id) {
        company = companies.find(item =>
            String(item.user_id) === String(currentUser.user_id)
        );
    }

    // Show only the signed-in recruiter's own saved company.
    nameOutput.textContent = company && company.company_name
        ? company.company_name
        : "No company profile yet";

    const location = document.querySelector("#company-location-view");
    const information = document.querySelector("#company-information-view");
    const contact = document.querySelector("#company-contact-view");

    if (location) {
        location.textContent = company && company.company_location
            ? company.company_location
            : "Create your company profile to add a location.";
    }

    if (information) {
        information.textContent = company && company.company_information
            ? company.company_information
            : "No company information has been added yet.";
    }

    const recruiter = currentUser && readRecords("users").find(item =>
        String(item.user_id) === String(currentUser.user_id)
    );

    if (contact) {
        contact.textContent = recruiter
            ? [recruiter.contact, recruiter.email].filter(Boolean).join(" · ").replace(/\u00C2/g, "").trim() || "Recruiter contact not added yet."
            : "Recruiter contact not available.";
    }

    const logo = document.querySelector("#company-logo-view");
    if (logo) {
        const savedLogo = company && company.company_logo;
        logo.src = savedLogo && savedLogo.startsWith("data:image/")
            ? savedLogo
            : "../images/company-placeholder.svg";
    }

    const form = document.querySelector('form[data-collection="companies"]');
    if (form) {
        ["company_id", "user_id", "company_name", "company_location", "company_information"].forEach(fieldName => {
            const field = form.elements.namedItem(fieldName);
            if (!field) return;
            field.value = company && company[fieldName] ? company[fieldName] : "";
        });

        const userId = form.elements.namedItem("user_id");
        if (userId) userId.value = currentUser ? currentUser.user_id : "";

        const companyId = form.elements.namedItem("company_id");
        if (companyId) companyId.value = company ? company.company_id || "" : "";
    }

    const deleteId = document.querySelector("#delete-company-id");
    if (deleteId) deleteId.value = company ? company.company_id || "" : "";

    // Reveal the company information only after the correct user's data is loaded.
    if (summary) summary.hidden = false;
}

function renderDynamicContent() {
    document.querySelectorAll("[data-record-list]").forEach(list => {
        let records = readRecords(list.dataset.recordList);
        const currentUser = getCurrentUser();
        if (isRecruiterPage() && currentUser && ["job_posts", "companies", "applicant_reviews"].includes(list.dataset.recordList)) {
            records = records.filter(item => String(item.user_id) === String(currentUser.user_id));
        }
        const fields = (list.dataset.fields || "").split(",").filter(Boolean);
        list.replaceChildren();

        if (records.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = fields.length || 1;
            cell.textContent = "No records found.";
            row.append(cell);
            list.append(row);
            return;
        }

        records.forEach(record => {
            const row = document.createElement("tr");
            fields.forEach(field => {
                const cell = document.createElement("td");
                const value = record[field] ?? "";

                if (field === "company_logo" && String(value).startsWith("data:image/")) {
                    const logo = document.createElement("img");
                    logo.src = value;
                    logo.alt = "Company logo";
                    logo.width = 48;
                    logo.height = 48;
                    cell.append(logo);
                } else {
                    cell.textContent = value;
                }
                row.append(cell);
            });
            list.append(row);
        });
    });

    document.querySelectorAll("[data-record-count]").forEach(output => {
        let records = readRecords(output.dataset.recordCount);
        if (isRecruiterPage()) {
            if (output.dataset.recordCount === "job_posts") records = recruiterJobs();
            if (output.dataset.recordCount === "applications") records = recruiterApplications();
            if (output.dataset.recordCount === "applicant_reviews") {
                const user = getCurrentUser();
                records = records.filter(item => String(item.user_id) === String(user?.user_id));
            }
        }
        if (output.dataset.filterField) {
            records = records.filter(item => String(item[output.dataset.filterField]).toLowerCase() === output.dataset.filterValue.toLowerCase());
        }
        output.textContent = records.length;
    });

    document.querySelectorAll("[data-metric]").forEach(output => {
        let records = readRecords(output.dataset.metric);
        if (isRecruiterPage()) {
            if (output.dataset.metric === "job_posts") records = recruiterJobs();
            if (output.dataset.metric === "applications") records = recruiterApplications();
            if (output.dataset.metric === "applicant_reviews") {
                const user = getCurrentUser();
                records = records.filter(item => String(item.user_id) === String(user?.user_id));
            }
        }

        if (output.dataset.filterField) {
            records = records.filter(item => String(item[output.dataset.filterField] || "").toLowerCase() === output.dataset.filterValue.toLowerCase());
        }

        output.textContent = records.length;
    });

    renderApplications();

    updateMainNavigation();
    populateSelectOptions();
    renderJobCards();
    renderCompanyProfile();
    renderHeaderProfile();
}

function renderApplications() {
    document.querySelectorAll("[data-application-list]").forEach(list => {
        const applications = isRecruiterPage() ? recruiterApplications() : readRecords("applications");
        const jobs = readRecords("job_posts");
        const isSummary = list.dataset.applicationList === "summary";
        list.replaceChildren();
        if (applications.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = isSummary ? 3 : 8;
            cell.textContent = "No applications found.";
            row.append(cell); list.append(row); return;
        }
        applications.forEach(application => {
            const job = jobs.find(item => String(item.job_id || item.id) === String(application.job_id));
            const row = document.createElement("tr");
            const values = isSummary
                ? [application.name, job?.title || application.job_id, application.application_status || "Submitted"]
                : [application.application_id, application.name, application.email, job?.title || application.job_id,
                   application.application_status || "Submitted", application.resume_file || "", application.message || ""];
            values.forEach(value => { const cell=document.createElement("td"); cell.textContent=value || ""; row.append(cell); });
            if (!isSummary && isRecruiterPage()) {
                const cell=document.createElement("td");
                const select=document.createElement("select");
                ["Submitted", "Reviewed", "Shortlisted", "Rejected", "Withdrawn"].forEach(status => {
                    const option=document.createElement("option"); option.value=status; option.textContent=status;
                    option.selected=(application.application_status || "Submitted")===status; select.append(option);
                });
                const button=document.createElement("button"); button.type="button"; button.textContent="Update";
                button.addEventListener("click", () => {
                    const all=readRecords("applications");
                    const index=all.findIndex(item => String(item.application_id)===String(application.application_id));
                    if(index<0) return;
                    if (!window.confirm("Are you sure you want to update this application status?")) return;
                    all[index].application_status=select.value;
                    all[index].updated_at=new Date().toLocaleString();
                    writeRecords("applications", all); renderApplications();
                });
                cell.append(select, button); row.append(cell);
            }
            list.append(row);
        });
    });
}

function populateSelectOptions() {
    document.querySelectorAll("select[data-options-collection]").forEach(select => {
        const collection = select.dataset.optionsCollection;
        const labelField = select.dataset.labelField || "name";
        const valueField = select.dataset.valueField || "id";
        const existingValues = new Set([...select.options].map(option => option.value));

        let optionRecords = readRecords(collection);
        if (isRecruiterPage() && ["companies", "job_posts", "applications"].includes(collection)) {
            if (collection === "applications") optionRecords = recruiterApplications();
            else {
                const user = getCurrentUser();
                optionRecords = optionRecords.filter(item => String(item.user_id) === String(user?.user_id));
            }
        }
        optionRecords.forEach(record => {
            const value = record[valueField] || record.id || "";
            if (!value || existingValues.has(value)) return;
            const option = document.createElement("option");
            option.value = value;
            option.textContent = record[labelField] || value;
            select.append(option);
            existingValues.add(value);
        });
    });
}

function renderJobCards() {
    const container = document.querySelector("[data-job-results]");
    if (!container) return;

    container.replaceChildren();
    readRecords("job_posts")
        .filter(record => ["open", "published", "approved"].includes(String(record.status || "").toLowerCase()))
        .forEach(record => {
            const article = document.createElement("article");
            article.dataset.jobCard = "true";
            const title = document.createElement("h3");
            title.textContent = record.title || "Job opening";
            const detail = document.createElement("p");
            detail.textContent = [record.company_id, record.category_id, record.location].filter(Boolean).join(" | ");
            const link = document.createElement("a");
            link.className = "button";
            link.href = `job-details.html?job_id=${encodeURIComponent(record.job_id || record.id || "")}`;
            link.textContent = "View Job Details";
            article.append(title, detail, link);
            container.append(article);
        });
}

function renderJobDetails() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("job_id");
    if (!jobId) return;
    const job = readRecords("job_posts").find(record => String(record.job_id || record.id) === jobId);
    if (!job) return;

    const fields = {
        "job-title-display": job.title,
        "job-company-display": job.company_id,
        "job-category-display": job.category_id,
        "job-location-display": job.location,
        "job-status-display": job.status,
        "job-description-display": job.description,
        "job-requirements-display": job.requirements
    };
    Object.entries(fields).forEach(([id, value]) => {
        const target = document.getElementById(id);
        if (target && value) target.textContent = value;
    });
    const hiddenJobId = document.querySelector('form[data-collection="saved_jobs"] input[name="job_id"]');
    const hiddenTitle = document.querySelector('form[data-collection="saved_jobs"] input[name="title"]');
    if (hiddenJobId) hiddenJobId.value = jobId;
    if (hiddenTitle) hiddenTitle.value = job.title || "Job opening";
}

function prefillApplicationJob() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("job_id");
    const select = document.querySelector('select[name="job_id"][data-options-collection]');
    if (select && jobId) select.value = jobId;
}

function setupPasswordConfirmation() {
    document.querySelectorAll("form").forEach(form => {
        const confirm = form.querySelector('[name="confirm_password"]');
        if (!confirm) return;
        const validate = () => {
            const password = form.querySelector('[name="password"], [name="new_password"]');
            confirm.setCustomValidity(password && confirm.value !== password.value ? "Passwords do not match." : "");
        };
        form.addEventListener("input", validate);
        form.addEventListener("submit", validate);
    });
}

function setupJobSearch() {
    const homeForm = document.querySelector("#job-search-form");

    if (homeForm) {
        const homeInput = homeForm.elements.namedItem("keyword");
        const message = document.querySelector("#search-message");
        const cards = [...document.querySelectorAll(".job-card")];

        const filterHomeJobs = () => {
            const term = homeInput.value.trim().toLowerCase();
            let shown = 0;

            cards.forEach(card => {
                const title = (card.dataset.jobTitle || "").toLowerCase();
                card.hidden = term !== "" && !title.includes(term);
                if (!card.hidden) shown += 1;
            });

            message.textContent = term === ""
                ? ""
                : shown === 0
                    ? "No matching jobs were found."
                    : `${shown} job(s) found.`;
        };

        homeInput.addEventListener("input", filterHomeJobs);
        homeForm.addEventListener("submit", event => {
            event.preventDefault();
            filterHomeJobs();
        });
        filterHomeJobs();
    }

    const form = document.querySelector('[data-action="search-jobs"]');
    if (!form) return;
    const input = form.querySelector('input[type="search"]');
    const locationInput = form.querySelector('[name="location"]');
    const cards = [...document.querySelectorAll("[data-job-card]")];
    const initialTerm = new URLSearchParams(window.location.search).get("keyword") || "";
    if (input && initialTerm) input.value = initialTerm;

    const filter = () => {
        const term = (input?.value || "").trim().toLowerCase();
        const location = (locationInput?.value || "").trim().toLowerCase();
        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const matchesKeyword = term === "" || cardText.includes(term);
            const matchesLocation = location === "" || cardText.includes(location);
            card.hidden = !matchesKeyword || !matchesLocation;
        });
    };
    input?.addEventListener("input", filter);
    form.addEventListener("submit", event => {
        event.preventDefault();
        filter();
        const shown = cards.filter(card => !card.hidden).length;
        showMessage(form, shown ? `${shown} job listing(s) shown.` : "No matching jobs were found.");
    });
    filter();
}

function setupForms() {
    document.querySelectorAll("form[data-action]").forEach(form => {
        form.addEventListener("invalid", event => event.target.classList.add("invalid"), true);
        form.addEventListener("input", event => {
            if (event.target.checkValidity()) event.target.classList.remove("invalid");
        });
        form.addEventListener("submit", event => {
            const action = form.dataset.action;
            if (action === "search-jobs") return;
            event.preventDefault();

            if (action === "save") {
                const intent = event.submitter?.dataset.intent || event.submitter?.textContent.toLowerCase() || "";

                if (intent.includes("remove") || intent.includes("delete")) {
                    deleteRecord(form);
                } else {
                    const imageInput = form.querySelector('input[type="file"]');
                    const imageFile = imageInput && imageInput.files[0];

                    if (imageFile) {
                        if (!imageFile.type.startsWith("image/")) {
                            showMessage(form, "Please choose an image file.", true);
                            return;
                        }
                        if (imageFile.size > 2 * 1024 * 1024) {
                            showMessage(form, "Image size must be 2 MB or less.", true);
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => saveRecord(form, reader.result);
                        reader.onerror = () => showMessage(form, "Could not read the selected image.", true);
                        reader.readAsDataURL(imageFile);
                    } else {
                        saveRecord(form);
                    }
                }
            } else if (action === "delete") {
                deleteRecord(form);
            } else if (action === "login") {
                showMessage(form, "Login successful.");
            } else if (action === "password-reset") {
                const email = form.elements.namedItem("email").value.trim().toLowerCase();
                const newPassword = form.elements.namedItem("new_password").value;
                const confirmPassword = form.elements.namedItem("confirm_password").value;
                if (newPassword !== confirmPassword) { showMessage(form, "New passwords do not match.", true); return; }
                const users = readRecords("users");
                const index = users.findIndex(user => String(user.email).toLowerCase() === email);
                if (index < 0) { showMessage(form, "No account was found with this email address.", true); return; }
                if (!window.confirm("Are you sure you want to reset your password?")) return;
                users[index].password = newPassword;
                writeRecords("users", users);
                showMessage(form, "Password changed. You can now log in."); form.reset();
            } else if (action === "change-password") {
                const currentUser = getCurrentUser();
                const users = readRecords("users");
                const index = users.findIndex(user => currentUser && String(user.user_id) === String(currentUser.user_id));
                const oldPassword = form.elements.namedItem("current_password").value;
                const newPassword = form.elements.namedItem("new_password").value;
                const confirmPassword = form.elements.namedItem("confirm_password").value;
                if (index < 0 || users[index].password !== oldPassword) { showMessage(form, "Current password is incorrect.", true); return; }
                if (newPassword !== confirmPassword) { showMessage(form, "New passwords do not match.", true); return; }
                if (!window.confirm("Are you sure you want to change your password?")) return;
                users[index].password = newPassword; writeRecords("users", users);
                showMessage(form, "Password updated successfully."); form.reset();
            } else if (action === "delete-account") {
                const currentUser = getCurrentUser();
                const email = form.elements.namedItem("email").value.trim().toLowerCase();
                if (!currentUser || email !== String(currentUser.email).toLowerCase()) {
                    showMessage(form, "Enter the email address of your logged-in account.", true); return;
                }
                if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
                const ownedJobIds = readRecords("job_posts")
                    .filter(item => String(item.user_id) === String(currentUser.user_id))
                    .map(item => String(item.job_id || item.id));
                writeRecords("users", readRecords("users").filter(user => String(user.user_id) !== String(currentUser.user_id)));
                ["job_posts", "companies", "applicant_reviews"].forEach(collection => {
                    writeRecords(collection, readRecords(collection).filter(item => String(item.user_id) !== String(currentUser.user_id)));
                });
                writeRecords("applications", readRecords("applications").filter(item => !ownedJobIds.includes(String(item.job_id))));
                localStorage.removeItem("jobPortal:currentUser");
                showMessage(form, "Your account has been deleted. Redirecting to login...");
                window.setTimeout(() => window.location.href = "login.html", 700);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    const path = window.location.pathname.toLowerCase();
    const roleFolders = {
        "/recruiter/": "Recruiter",
        "/job-seeker/": "Job Seeker",
        "/hr-manager/": "HR Manager",
        "/admin/": "Admin"
    };
    const requiredRole = Object.keys(roleFolders).find(folder => path.includes(folder));
    if (requiredRole && (!user || user.role !== roleFolders[requiredRole] || user.status !== "Active")) {
        window.location.href = "../login.html";
        return;
    }
    if (path.endsWith("/profile.html") && !user) {
        window.location.href = "login.html";
        return;
    }
    updateMainNavigation();
    populateSelectOptions();
    renderJobCards();
    renderDynamicContent();
    renderProfileInformation();
    renderCompanyProfile();
    renderHeaderProfile();
    prefillApplicationJob();
    renderJobDetails();
    setupPasswordConfirmation();
    setupJobSearch();
    setupForms();

    const loggedInUser = getCurrentUser();
    if (loggedInUser) {
        ["recruiter-user-id", "reviewer-user-id", "company-user-id"].forEach(id => {
            const field = document.getElementById(id);
            if (field) { field.value = loggedInUser.user_id || ""; field.readOnly = true; }
        });
    }

    document.querySelectorAll(".logout-link").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            if (!window.confirm("Are you sure you want to log out?")) return;
            localStorage.removeItem("jobPortal:currentUser");
            window.location.href = link.href;
        });
    });
});


