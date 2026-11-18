let currentUser = localStorage.getItem("userRole");
if (currentUser !== "Admin") {
    window.location.href = "../login.html";
}

//log out
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

function disableFields() {
    name.disabled = true;
    email.disabled = true;
    gender.disabled = true;
    dob.disabled = true;
    contact.disabled = true;
    address.disabled = true;
}

function enableFields() {
    name.disabled = false;
    email.disabled = false;
    gender.disabled = false;
    dob.disabled = false;
    contact.disabled = false;
    address.disabled = false;
}

function editModeOff() {
    disableFields();
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
}

if (viewButton) {
    viewButton.onclick = function() {
        loadProfile();
        dashboardContent.style.display = "none";
        profileSection.style.display = "block";
        viewButton.style.display = "none";
        editModeOff();
    };
}

if (editButton) {
    editButton.onclick = function() {
        enableFields();
        editButton.style.display = "none";
        saveButton.style.display = "inline-block";
        cancelButton.style.display = "inline-block";
    };
}

if (cancelButton) {
    cancelButton.onclick = function() {
        loadProfile();
        editModeOff();
    };
}

if (profileForm) {
    profileForm.onsubmit = function(event) {
        event.preventDefault();
        if (email.value.trim() === "") {
            alert("Email cannot be empty.");
            return;
        }
        localStorage.setItem("userName", name.value);
        localStorage.setItem("userEmail", email.value);
        localStorage.setItem("userGender", gender.value);
        localStorage.setItem("userDOB", dob.value);
        localStorage.setItem("userContact", contact.value);
        localStorage.setItem("userAddress", address.value);

        document.getElementById("headerName").textContent = name.value;
        alert("Profile updated successfully!");
        loadProfile();
        editModeOff();
    };
}

if (backButton) {
    backButton.onclick = function() {
        profileSection.style.display = "none";
        dashboardContent.style.display = "block";
        viewButton.style.display = "inline-block";
    };
}

let headerName = document.getElementById("headerName");
if (headerName) {
    headerName.textContent = localStorage.getItem("userName") || "JobPortal User";
}