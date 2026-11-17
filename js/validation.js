/* Browser validation helpers for forms. */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("invalid", event => {
            event.target.classList.add("invalid");
        }, true);

        form.addEventListener("input", event => {
            if (event.target.checkValidity()) {
                event.target.classList.remove("invalid");
            }
        });
    });
});

