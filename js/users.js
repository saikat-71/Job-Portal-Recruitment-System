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
        let row = table.insertRow();
        row.innerHTML =
            "<td>" + (index + 101) + "</td>" +
            "<td>" + list[i].name + "</td>" +
            "<td>" + list[i].email + "</td>" +
            "<td>" + list[i].role + "</td>" +
            "<td>" + list[i].status + "</td>" +
            "<td>" +
                "<a href='edit-user.html?index=" + index + "' class='edit-btn'>Edit</a>" +
                "<button class='delete-btn' data-index= '" + index + "' >Delete</button>" +
            "</td>";
    }
}
showUsers(users);

let searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", function() {
    let value = searchInput.value.toLowerCase();
    let filteredUsers = [];
    for (let i = 0; i < users.length; i++) {
        if (
            users[i].name.toLowerCase().includes(value) ||
            users[i].email.toLowerCase().includes(value)
        ) {
            filteredUsers.push(users[i]);
        }
    }
    showUsers(filteredUsers);
});

table.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        let index = event.target.getAttribute("data-index");
        let confirmDelete = confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            users.splice(index, 1);
            showUsers(users);
        }
    }
});