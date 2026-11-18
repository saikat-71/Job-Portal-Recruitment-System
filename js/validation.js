document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form");

    for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", function (event) {
            if (!this.checkValidity()) {
                event.preventDefault();
                this.reportValidity();
            }
        });
    }
});
