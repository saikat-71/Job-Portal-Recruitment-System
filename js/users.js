let users = [
    {
        name: "Rahim Ahmed",
        email: "rahim@gmail.com",
        password: "123456",
        role: "Recruiter",
        status: "Active"
    },
    {
        name: "Aysha Khan",
        email: "aysha@gmail.com",
        password: "123456",
        role: "Job Seeker",
        status: "Active"
    },
    {
        name: "Tanvir Hasan",
        email: "tanvir@gmail.com",
        password: "123456",
        role: "Job Seeker",
        status: "Inactive"
    },
    {
        name: "Nusrat Jahan",
        email: "nusrat@gmail.com",
        password: "123456",
        role: "Recruiter",
        status: "Active"
    }
];

let table = document.getElementById("usersTable");
let searchInput = document.getElementById("searchInput");
let form = document.getElementById("userForm");
let formBox = document.getElementById("userFormBox");
let nameInput = document.getElementById("name");
let emailInput = document.getElementById("email");
let passwordInput = document.getElementById("password");
let roleInput = document.getElementById("role");
let statusInput = document.getElementById("status");
let editingIndex = null;

function showUsers(list) {
    table.innerHTML =
        "<tr>" +
        "<th>User ID</th>" +
        "<th>Name</th>" +
        "<th>Email</th>" +
        "<th>Role</th>" +
        "<th>Status</th>" +
        "<th>Action</th>" +
        "</tr>";

    for (let i = 0; i < list.length; i++) {
        let index = users.indexOf(list[i]);

        table.innerHTML +=
            "<tr>" +
            "<td>" + (index + 101) + "</td>" +
            "<td>" + list[i].name + "</td>" +
            "<td>" + list[i].email + "</td>" +
            "<td>" + list[i].role + "</td>" +
            "<td>" + list[i].status + "</td>" +
            "<td>" +
            "<button class='edit-btn' onclick='editUser(" + index + ")'>Edit</button>" +
            "<button class='delete-btn' onclick='deleteUser(" + index + ")'>Delete</button>" +
            "</td>" +
            "</tr>";
    }
}
showUsers(users);

searchInput.addEventListener("keyup", function () {
    let value = searchInput.value.toLowerCase();
    let result = [];

    for (let i = 0; i < users.length; i++) {
        if (users[i].name.toLowerCase().includes(value) || users[i].email.toLowerCase().includes(value)) {
            result.push(users[i]);
        }
    }

    showUsers(result);
});

document.getElementById("showFormBtn").onclick = function () {
    form.reset();
    editingIndex = null;
    document.getElementById("formTitle").innerText = "Add New User";
    document.getElementById("submitBtn").innerText = "Add User";
    formBox.classList.remove("hidden");
};

document.getElementById("cancelBtn").onclick = function () {
    form.reset();
    editingIndex = null;
    formBox.classList.add("hidden");
};

form.addEventListener("submit", function (event) {
    event.preventDefault();
    let user = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        role: roleInput.value,
        status: statusInput.value
    };

    if (editingIndex == null) {
        users.push(user);
        alert("User Added Successfully!");
    }

    else {
        users[editingIndex] = user;
        alert("User Updated Successfully!");
    }

    showUsers(users);

    searchInput.value = "";
    form.reset();
    editingIndex = null;
    formBox.classList.add("hidden");
});

function editUser(index) {
    editingIndex = index;
    nameInput.value = users[index].name;
    emailInput.value = users[index].email;
    passwordInput.value = users[index].password;
    roleInput.value = users[index].role;
    statusInput.value = users[index].status;

    document.getElementById("formTitle").innerText = "Edit User";
    document.getElementById("submitBtn").innerText = "Update User";
    formBox.classList.remove("hidden");
}

function deleteUser(index) {
    let answer = confirm("Are you sure you want to delete this user?");
    if (answer == true) {
        users.splice(index, 1);
        showUsers(users);
    }
}