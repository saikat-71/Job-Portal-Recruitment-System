var interviewKey = "jobPortal:hr_interviews";
var evaluationKey = "jobPortal:hr_evaluations";
var hiringKey = "jobPortal:hr_hiring";

function checkHRAccess() {
    var role = localStorage.getItem("userRole");

    if (role !== "HR Manager") {
        window.location.href = "../login.html";
        return false;
    }

    return true;
}

function logoutHR() {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userGender");
    localStorage.removeItem("userDOB");
    localStorage.removeItem("userContact");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("userStatus");
    window.location.href = "../login.html";
}

function getRecords(key) {
    var savedData = localStorage.getItem(key);
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            return [];
        }
    }
    return [];
}

function saveRecords(key, records) {
    localStorage.setItem(key, JSON.stringify(records));
}

function showMessage(id, text) {
    var message = document.getElementById(id);
    if (message) {
        message.textContent = text;
    }
}

function safeText(value) {
    var text = String(value || "");
    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/"/g, "&quot;");
    text = text.replace(/'/g, "&#39;");
    return text;
}

function getFormData(form) {
    var data = {};
    var fields = form.elements;
    var i;

    for (i = 0; i < fields.length; i++) {
        if (fields[i].name) {
            data[fields[i].name] = fields[i].value;
        }
    }
    return data;
}

function clearForm(form) {
    form.reset();
    form.elements.namedItem("id").value = "";
}

function saveForm(formId, key, messageId, renderFunction) {
    var form = document.getElementById(formId);
    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var record = getFormData(form);
        var records = getRecords(key);
        var found = false;
        var i;

        if (record.id !== "") {
            for (i = 0; i < records.length; i++) {
                if (String(records[i].id) === String(record.id)) {
                    record.id = records[i].id;
                    records[i] = record;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            record.id = String(new Date().getTime());
            records.push(record);
        }

        saveRecords(key, records);
        clearForm(form);
        showMessage(messageId, "Record saved successfully.");
        renderFunction();
        updateDashboard();
    });

    form.addEventListener("reset", function () {
        setTimeout(function () {
            form.elements.namedItem("id").value = "";
        }, 10);
    });
}

function renderInterviews() {
    var table = document.getElementById("interview-rows");
    if (!table) {
        return;
    }

    var records = getRecords(interviewKey);
    var html = "";
    var i;

    for (i = 0; i < records.length; i++) {
        html += "<tr>";
        html += "<td>" + safeText(records[i].candidate) + "</td>";
        html += "<td>" + safeText(records[i].position) + "</td>";
        html += "<td>" + safeText(records[i].date) + "</td>";
        html += "<td>" + safeText(records[i].time) + "</td>";
        html += "<td>" + safeText(records[i].mode) + "</td>";
        html += "<td>" + safeText(records[i].status) + "</td>";
        html += "<td><button class='hr-small' type='button' data-edit='" + safeText(records[i].id) + "'>Edit</button>";
        html += " <button class='hr-small danger' type='button' data-delete='" + safeText(records[i].id) + "'>Delete</button>";
        if (records[i].status !== "Cancelled") {
            html += " <button class='hr-small danger' type='button' data-cancel='" + safeText(records[i].id) + "'>Cancel</button>";
        }
        html += "</td></tr>";
    }

    if (records.length === 0) {
        html = "<tr><td colspan='7'>No interviews yet.</td></tr>";
    }
    table.innerHTML = html;
}

function renderEvaluations() {
    var table = document.getElementById("evaluation-rows");
    if (!table) {
        return;
    }

    var records = getRecords(evaluationKey);
    var html = "";
    var i;

    for (i = 0; i < records.length; i++) {
        html += "<tr>";
        html += "<td>" + safeText(records[i].candidate) + "</td>";
        html += "<td>" + safeText(records[i].position) + "</td>";
        html += "<td>" + safeText(records[i].rating) + " / 5</td>";
        html += "<td>" + safeText(records[i].result) + "</td>";
        html += "<td>" + safeText(records[i].feedback) + "</td>";
        html += "<td><button class='hr-small' type='button' data-edit='" + safeText(records[i].id) + "'>Edit</button>";
        html += " <button class='hr-small danger' type='button' data-delete='" + safeText(records[i].id) + "'>Delete</button></td>";
        html += "</tr>";
    }

    if (records.length === 0) {
        html = "<tr><td colspan='6'>No evaluations yet.</td></tr>";
    }
    table.innerHTML = html;
}

function renderHiring() {
    var table = document.getElementById("hiring-rows");
    if (!table) {
        return;
    }

    var records = getRecords(hiringKey);
    var html = "";
    var i;

    for (i = 0; i < records.length; i++) {
        html += "<tr>";
        html += "<td>" + safeText(records[i].candidate) + "</td>";
        html += "<td>" + safeText(records[i].position) + "</td>";
        html += "<td>" + safeText(records[i].status) + "</td>";
        html += "<td>" + safeText(records[i].date) + "</td>";
        html += "<td>" + safeText(records[i].notes) + "</td>";
        html += "<td><button class='hr-small' type='button' data-edit='" + safeText(records[i].id) + "'>Edit</button>";
        html += " <button class='hr-small danger' type='button' data-delete='" + safeText(records[i].id) + "'>Delete</button></td>";
        html += "</tr>";
    }

    if (records.length === 0) {
        html = "<tr><td colspan='6'>No hiring records yet.</td></tr>";
    }
    table.innerHTML = html;
}

function handleTableClick(tableId, key, formId, renderFunction, messageId) {
    var table = document.getElementById(tableId);
    if (!table) {
        return;
    }

    table.addEventListener("click", function (event) {
        var button = event.target;
        var recordId = button.getAttribute("data-edit");
        var deleteId = button.getAttribute("data-delete");
        var cancelId = button.getAttribute("data-cancel");
        var records = getRecords(key);
        var i;

        if (recordId) {
            var form = document.getElementById(formId);
            for (i = 0; i < records.length; i++) {
                if (String(records[i].id) === String(recordId)) {
                    var fieldName;
                    for (fieldName in records[i]) {
                        if (form.elements.namedItem(fieldName)) {
                            form.elements.namedItem(fieldName).value = records[i][fieldName];
                        }
                    }
                    form.scrollIntoView();
                    showMessage(messageId, "Update the information and save.");
                    break;
                }
            }
        }

        if (deleteId) {
            if (confirm("Do you want to delete this record?")) {
                var newRecords = [];
                for (i = 0; i < records.length; i++) {
                    if (String(records[i].id) !== String(deleteId)) {
                        newRecords.push(records[i]);
                    }
                }
                saveRecords(key, newRecords);
                renderFunction();
                updateDashboard();
                showMessage(messageId, "Record deleted.");
            }
        }

        if (cancelId) {
            for (i = 0; i < records.length; i++) {
                if (String(records[i].id) === String(cancelId)) {
                    records[i].status = "Cancelled";
                }
            }
            saveRecords(key, records);
            renderFunction();
            updateDashboard();
            showMessage(messageId, "Interview cancelled.");
        }
    });
}

function updateDashboard() {
    var interviews = getRecords(interviewKey);
    var evaluations = getRecords(evaluationKey);
    var hiring = getRecords(hiringKey);
    var scheduled = 0;
    var pending = 0;
    var hired = 0;
    var i;

    for (i = 0; i < interviews.length; i++) {
        if (interviews[i].status === "Scheduled") {
            scheduled++;
        }
    }

    for (i = 0; i < evaluations.length; i++) {
        if (evaluations[i].result === "Pending") {
            pending++;
        }
    }

    for (i = 0; i < hiring.length; i++) {
        if (hiring[i].status === "Hired") {
            hired++;
        }
    }

    var count = document.getElementById("count-interviews");
    if (count) {
        count.textContent = scheduled;
    }
    count = document.getElementById("count-evaluations");
    if (count) {
        count.textContent = pending;
    }
    count = document.getElementById("count-hired");
    if (count) {
        count.textContent = hired;
    }

    var table = document.getElementById("dashboard-interviews");
    if (table) {
        var html = "";
        var today = new Date().toISOString().slice(0, 10);
        var shown = 0;

        for (i = 0; i < interviews.length; i++) {
            if (interviews[i].status === "Scheduled" && interviews[i].date >= today && shown < 5) {
                html += "<tr>";
                html += "<td>" + safeText(interviews[i].candidate) + "</td>";
                html += "<td>" + safeText(interviews[i].position) + "</td>";
                html += "<td>" + safeText(interviews[i].date) + " " + safeText(interviews[i].time) + "</td>";
                html += "<td><a href='interviews.html'>View</a></td>";
                html += "</tr>";
                shown++;
            }
        }

        if (shown === 0) {
            html = "<tr><td colspan='4'>No upcoming interviews.</td></tr>";
        }
        table.innerHTML = html;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (!checkHRAccess()) {
        return;
    }

    saveForm("interview-form", interviewKey, "iv-message", renderInterviews);
    saveForm("evaluation-form", evaluationKey, "ev-message", renderEvaluations);
    saveForm("hiring-form", hiringKey, "hi-message", renderHiring);

    handleTableClick("interview-rows", interviewKey, "interview-form", renderInterviews, "iv-message");
    handleTableClick("evaluation-rows", evaluationKey, "evaluation-form", renderEvaluations, "ev-message");
    handleTableClick("hiring-rows", hiringKey, "hiring-form", renderHiring, "hi-message");

    renderInterviews();
    renderEvaluations();
    renderHiring();
    updateDashboard();

    var logoutLinks = document.querySelectorAll("[data-logout]");
    var i;
    for (i = 0; i < logoutLinks.length; i++) {
        logoutLinks[i].addEventListener("click", function (event) {
            event.preventDefault();

            if (confirm("Are you sure you want to log out?")) {
                logoutHR();
            }
        });
    }
});
