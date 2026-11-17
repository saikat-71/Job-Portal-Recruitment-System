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

function saveRecord(form) {
    const collection = form.dataset.collection;
    const records = readRecords(collection);
    const record = collectFormValues(form);
    const defaults = JSON.parse(form.dataset.defaults || "{}");
    Object.assign(record, defaults);

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
        ? records.findIndex(item => item[matchField] === record[matchField])
        : -1;
    const existingIndex = requestedId
        ? records.findIndex(item => String(item[idField]) === String(requestedId))
        : matchIndex;

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
        renderDynamicContent();
        showMessage(form, "Record saved.");
    } catch (error) {
        showMessage(form, "The record could not be saved.", true);
    }
}

function deleteRecord(form) {
    const collection = form.dataset.deleteCollection || form.dataset.collection;
    const key = form.dataset.deleteField || "id";
    const target = collectFormValues(form)[key];

    if (!target) {
        showMessage(form, `Enter the ${key.replaceAll("_", " ")} first.`, true);
        return;
    }

    const records = readRecords(collection);
    const filtered = records.filter(item => String(item[key] || item.id) !== String(target));
    if (filtered.length === records.length) {
        showMessage(form, "No matching record was found.", true);
        return;
    }

    writeRecords(collection, filtered);
    renderDynamicContent();
    showMessage(form, "Record removed.");
}

function renderDynamicContent() {
    document.querySelectorAll("[data-record-list]").forEach(list => {
        const records = readRecords(list.dataset.recordList);
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
                cell.textContent = record[field] ?? "";
                row.append(cell);
            });
            list.append(row);
        });
    });

    document.querySelectorAll("[data-record-count]").forEach(output => {
        let records = readRecords(output.dataset.recordCount);
        if (output.dataset.filterField) {
            records = records.filter(item => String(item[output.dataset.filterField]).toLowerCase() === output.dataset.filterValue.toLowerCase());
        }
        output.textContent = records.length;
    });

    document.querySelectorAll("[data-metric]").forEach(output => {
        let records = readRecords(output.dataset.metric);

        if (output.dataset.filterField) {
            records = records.filter(item => String(item[output.dataset.filterField] || "").toLowerCase() === output.dataset.filterValue.toLowerCase());
        }

        output.textContent = records.length;
    });

    renderApplications();

    populateSelectOptions();
    renderJobCards();
}

function renderApplications() {
    document.querySelectorAll("[data-application-list]").forEach(list => {
        const applications = readRecords("applications");
        const jobs = readRecords("job_posts");
        const isSummary = list.dataset.applicationList === "summary";
        list.replaceChildren();

        if (applications.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = isSummary ? 3 : 7;
            cell.textContent = "No applications found.";
            row.append(cell);
            list.append(row);
            return;
        }

        applications.forEach(application => {
            const job = jobs.find(item => String(item.job_id || item.id) === String(application.job_id));
            const row = document.createElement("tr");
            const values = isSummary
                ? [application.name, job?.title || application.job_id, application.application_status || "Submitted"]
                : [application.application_id, application.name, application.email, job?.title || application.job_id,
                    application.application_status || "Submitted", application.resume_file || "", application.message || ""];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value || "";
                row.append(cell);
            });

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

        readRecords(collection).forEach(record => {
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
                if (intent.includes("remove") || intent.includes("delete")) deleteRecord(form);
                else saveRecord(form);
            } else if (action === "delete") {
                deleteRecord(form);
            } else if (action === "login") {
                showMessage(form, "Login successful.");
            } else if (action === "password-reset") {
                showMessage(form, "Password reset request received.");
            } else if (action === "change-password") {
                showMessage(form, "Password updated.");
            } else if (action === "delete-account") {
                const email = collectFormValues(form).email;
                const users = readRecords("users");
                const remainingUsers = users.filter(user => String(user.email).toLowerCase() !== String(email || "").toLowerCase());

                if (remainingUsers.length === users.length) {
                    showMessage(form, "No account matched that email address.", true);
                    return;
                }

                writeRecords("users", remainingUsers);
                showMessage(form, "Account deleted.");
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateSelectOptions();
    renderJobCards();
    renderDynamicContent();
    prefillApplicationJob();
    renderJobDetails();
    setupPasswordConfirmation();
    setupJobSearch();
    setupForms();
});


