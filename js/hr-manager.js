(() => {
  "use strict";
  const KEYS = {
    interviews: "jobPortal:hr_interviews",
    evaluations: "jobPortal:hr_evaluations",
    hiring: "jobPortal:hr_hiring"
  };
  const read = key => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch (error) { return []; }
  };
  const save = (key, rows) => localStorage.setItem(key, JSON.stringify(rows));
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const values = form => Object.fromEntries(new FormData(form).entries());
  const message = (id, text) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  };
  const buttons = id =>
    `<button class="hr-small" type="button" data-edit="${escapeHTML(id)}">Edit</button>
     <button class="hr-small danger" type="button" data-delete="${escapeHTML(id)}">Delete</button>`;

  function setupForm(formId, key, messageId, render) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const row = values(form);
      const rows = read(key);
      if (row.id) {
        const index = rows.findIndex(item => String(item.id) === String(row.id));
        if (index >= 0) rows[index] = { ...rows[index], ...row };
        else rows.push({ ...row, id: String(Date.now()) });
      } else {
        rows.push({ ...row, id: String(Date.now()) });
      }
      save(key, rows);
      form.reset();
      form.elements.namedItem("id").value = "";
      message(messageId, "Saved successfully.");
      render();
      updateDashboard();
    });
    form.addEventListener("reset", () => {
      setTimeout(() => { form.elements.namedItem("id").value = ""; }, 0);
    });
  }

  function renderInterviews() {
    const body = document.getElementById("interview-rows");
    if (!body) return;
    const rows = read(KEYS.interviews).sort((a,b) =>
      (a.date + a.time).localeCompare(b.date + b.time));
    body.innerHTML = rows.length ? rows.map(row => `
      <tr>
        <td>${escapeHTML(row.candidate)}</td><td>${escapeHTML(row.position)}</td>
        <td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.time)}</td>
        <td>${escapeHTML(row.mode)}</td><td><span class="hr-status">${escapeHTML(row.status)}</span></td>
        <td>${buttons(row.id)}
          ${row.status !== "Cancelled" ? `<button class="hr-small danger" type="button" data-cancel="${escapeHTML(row.id)}">Cancel</button>` : ""}
        </td>
      </tr>`).join("") : '<tr><td colspan="7">No interviews yet.</td></tr>';
  }

  function renderEvaluations() {
    const body = document.getElementById("evaluation-rows");
    if (!body) return;
    const rows = read(KEYS.evaluations);
    body.innerHTML = rows.length ? rows.map(row => `
      <tr><td>${escapeHTML(row.candidate)}</td><td>${escapeHTML(row.position)}</td>
      <td>${escapeHTML(row.rating)} / 5</td><td>${escapeHTML(row.result)}</td>
      <td>${escapeHTML(row.feedback)}</td><td>${buttons(row.id)}</td></tr>`).join("")
      : '<tr><td colspan="6">No evaluations yet.</td></tr>';
  }

  function renderHiring() {
    const body = document.getElementById("hiring-rows");
    if (!body) return;
    const rows = read(KEYS.hiring);
    body.innerHTML = rows.length ? rows.map(row => `
      <tr><td>${escapeHTML(row.candidate)}</td><td>${escapeHTML(row.position)}</td>
      <td><span class="hr-status">${escapeHTML(row.status)}</span></td>
      <td>${escapeHTML(row.date)}</td><td>${escapeHTML(row.notes)}</td>
      <td>${buttons(row.id)}</td></tr>`).join("")
      : '<tr><td colspan="6">No hiring records yet.</td></tr>';
  }

  function setupTable(bodyId, key, formId, render, messageId) {
    const body = document.getElementById(bodyId);
    if (!body) return;
    body.addEventListener("click", event => {
      const edit = event.target.closest("[data-edit]");
      const del = event.target.closest("[data-delete]");
      const cancel = event.target.closest("[data-cancel]");
      const rows = read(key);
      if (edit) {
        const row = rows.find(item => String(item.id) === edit.dataset.edit);
        const form = document.getElementById(formId);
        if (!row || !form) return;
        Object.entries(row).forEach(([name, value]) => {
          if (form.elements.namedItem(name)) form.elements.namedItem(name).value = value;
        });
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        message(messageId, "Record loaded. Edit the information and save.");
      }
      if (del && confirm("Delete this record?")) {
        save(key, rows.filter(item => String(item.id) !== del.dataset.delete));
        render(); updateDashboard(); message(messageId, "Record deleted.");
      }
      if (cancel) {
        const row = rows.find(item => String(item.id) === cancel.dataset.cancel);
        if (row) {
          row.status = "Cancelled";
          save(key, rows); render(); updateDashboard();
          message(messageId, "Interview cancelled.");
        }
      }
    });
  }

  function updateDashboard() {
    const interviews = read(KEYS.interviews);
    const evaluations = read(KEYS.evaluations);
    const hiring = read(KEYS.hiring);
    const countI = document.getElementById("count-interviews");
    const countE = document.getElementById("count-evaluations");
    const countH = document.getElementById("count-hired");
    if (countI) countI.textContent = interviews.filter(x => x.status === "Scheduled").length;
    if (countE) countE.textContent = evaluations.filter(x => x.result === "Pending").length;
    if (countH) countH.textContent = hiring.filter(x => x.status === "Hired").length;

    const table = document.getElementById("dashboard-interviews");
    if (table) {
      const today = new Date().toISOString().slice(0,10);
      const upcoming = interviews.filter(x => x.status === "Scheduled" && x.date >= today)
        .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
      table.innerHTML = upcoming.length ? upcoming.map(x => `
        <tr><td>${escapeHTML(x.candidate)}</td><td>${escapeHTML(x.position)}</td>
        <td>${escapeHTML(x.date)} ${escapeHTML(x.time)}</td>
        <td><a class="hr-back" href="interviews.html">View</a></td></tr>`).join("")
        : '<tr><td colspan="4">No upcoming interviews.</td></tr>';
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupForm("interview-form", KEYS.interviews, "iv-message", renderInterviews);
    setupForm("evaluation-form", KEYS.evaluations, "ev-message", renderEvaluations);
    setupForm("hiring-form", KEYS.hiring, "hi-message", renderHiring);
    setupTable("interview-rows", KEYS.interviews, "interview-form", renderInterviews, "iv-message");
    setupTable("evaluation-rows", KEYS.evaluations, "evaluation-form", renderEvaluations, "ev-message");
    setupTable("hiring-rows", KEYS.hiring, "hiring-form", renderHiring, "hi-message");
    renderInterviews(); renderEvaluations(); renderHiring(); updateDashboard();

    document.querySelectorAll("[data-logout]").forEach(link => {
      link.addEventListener("click", event => {
        if (!confirm("Are you sure you want to log out?")) event.preventDefault();
      });
    });
  });
})();