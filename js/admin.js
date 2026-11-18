let currentUser = localStorage.getItem("userRole");
if (currentUser !== "Admin") {
    window.location.href = "../login.html";
}

let logoutLink = document.querySelector(".sidebar a[href='../login.html']");

if (logoutLink) {
    logoutLink.onclick = function(event) {
        event.preventDefault();

        alert("You have logged out!");

        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userGender");
        localStorage.removeItem("userDOB");
        localStorage.removeItem("userContact");
        localStorage.removeItem("userAddress");
        localStorage.removeItem("userStatus");

        window.location.href = "../login.html";
    };
}


// Profile Elements

let viewButton = document.getElementById("viewProfileBtn");
let dashboardContent = document.getElementById("dashboardContent");
let profileSection = document.getElementById("profileSection");

let editButton = document.getElementById("editProfileBtn");
let saveButton = document.getElementById("saveProfileBtn");
let cancelButton = document.getElementById("cancelProfileBtn");
let backButton = document.getElementById("backDashboardBtn");

let profileForm = document.getElementById("adminProfileForm");

let name = document.getElementById("profileName");
let email = document.getElementById("profileEmail");
let role = document.getElementById("profileRole");
let gender = document.getElementById("profileGender");
let dob = document.getElementById("profileDOB");
let contact = document.getElementById("profileContact");
let address = document.getElementById("profileAddress");
let status = document.getElementById("profileStatus");


// Load Profile Information

function loadProfile() {

    name.value = localStorage.getItem("userName") || "";
    email.value = localStorage.getItem("userEmail") || "";
    role.value = localStorage.getItem("userRole") || "";
    gender.value = localStorage.getItem("userGender") || "";
    dob.value = localStorage.getItem("userDOB") || "";
    contact.value = localStorage.getItem("userContact") || "";
    address.value = localStorage.getItem("userAddress") || "";
    status.value = localStorage.getItem("userStatus") || "";

}


// Disable Profile Fields

function disableFields() {

    name.disabled = true;
    email.disabled = true;
    gender.disabled = true;
    dob.disabled = true;
    contact.disabled = true;
    address.disabled = true;

}


// Enable Profile Fields

function enableFields() {

    name.disabled = false;
    email.disabled = false;
    gender.disabled = false;
    dob.disabled = false;
    contact.disabled = false;
    address.disabled = false;

}


// Edit Mode Off

function editModeOff() {

    disableFields();

    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

}


// View Profile Button

if (viewButton) {

    viewButton.onclick = function() {

        loadProfile();

        dashboardContent.style.display = "none";
        profileSection.style.display = "block";
        viewButton.style.display = "none";

        editModeOff();

    };

}


// Edit Profile Button

if (editButton) {

    editButton.onclick = function() {

        enableFields();

        editButton.style.display = "none";
        saveButton.style.display = "inline-block";
        cancelButton.style.display = "inline-block";

    };

}


// Cancel Button

if (cancelButton) {

    cancelButton.onclick = function() {

        loadProfile();

        editModeOff();

    };

}


// Save Profile Information

if (profileForm) {

    profileForm.onsubmit = function(event) {

        event.preventDefault();

        let oldEmail = localStorage.getItem("userEmail");
        let newEmail = email.value.trim().toLowerCase();

        if (newEmail === "") {
            alert("Email cannot be empty.");
            return;
        }

        try {

            let users = JSON.parse(localStorage.getItem("jobPortal:users") || "[]");

            // Check whether another account already uses this email.

            for (let i = 0; i < users.length; i++) {

                if (
                    String(users[i].email).toLowerCase() === newEmail &&
                    String(users[i].email).toLowerCase() !== String(oldEmail).toLowerCase()
                ) {
                    alert("This email is already used by another account.");
                    return;
                }

            }

            // Update registered user information.

            for (let i = 0; i < users.length; i++) {

                if (
                    String(users[i].email).toLowerCase() === String(oldEmail).toLowerCase() &&
                    users[i].role === "Admin"
                ) {

                    users[i].name = name.value;
                    users[i].email = newEmail;
                    users[i].gender = gender.value;
                    users[i].dob = dob.value;
                    users[i].contact = contact.value;
                    users[i].address = address.value;

                }

            }

            localStorage.setItem("jobPortal:users", JSON.stringify(users));

            // Update current login information.

            localStorage.setItem("userName", name.value);
            localStorage.setItem("userEmail", newEmail);
            localStorage.setItem("userGender", gender.value);
            localStorage.setItem("userDOB", dob.value);
            localStorage.setItem("userContact", contact.value);
            localStorage.setItem("userAddress", address.value);

            // Update header name.

            document.getElementById("headerName").textContent = name.value;

            alert("Profile updated successfully!");

            loadProfile();

            editModeOff();

        } catch (error) {

            alert("Could not update profile. Please try again.");

        }

    };

}


// Back to Dashboard Button

if (backButton) {

    backButton.onclick = function() {

        profileSection.style.display = "none";
        dashboardContent.style.display = "block";
        viewButton.style.display = "inline-block";

    };

}


// Show Name in Header

let headerName = document.getElementById("headerName");

if (headerName) {

    headerName.textContent = localStorage.getItem("userName") || "JobPortal User";

}
