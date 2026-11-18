let categories = [
    {
        name: "Software Development",
        description: "Jobs related to software development and programming.",
        status: "Active"
    },
    {
        name: "Web Development",
        description: "Jobs related to website design and development.",
        status: "Active"
    },
    {
        name: "Data Science",
        description: "Jobs related to data analysis and machine learning.",
        status: "Active"
    },
    {
        name: "Digital Marketing",
        description: "Jobs related to online marketing and promotion.",
        status: "Inactive"
    }
];

let table = document.getElementById("categoryTable");
let searchInput = document.getElementById("searchInput");
let form = document.getElementById("categoryForm");
let formBox = document.getElementById("categoryFormBox");
let nameInput = document.getElementById("categoryName");
let descriptionInput = document.getElementById("description");
let statusInput = document.getElementById("status");
let editingIndex = null;

function showCategories(list) {
    table.innerHTML =
        "<tr>" +
        "<th>Category ID</th>" +
        "<th>Category Name</th>" +
        "<th>Description</th>" +
        "<th>Status</th>" +
        "<th>Action</th>" +
        "</tr>";
    for (let i = 0; i < list.length; i++) {
        let index = categories.indexOf(list[i]);
        table.innerHTML +=
            "<tr>" +
            "<td>" + (index + 101) + "</td>" +
            "<td>" + list[i].name + "</td>" +
            "<td>" + list[i].description + "</td>" +
            "<td>" + list[i].status + "</td>" +
            "<td>" +
            "<button class='edit-btn' onclick='editCategory(" + index + ")'>Edit</button>" +
            "<button class='delete-btn' onclick='deleteCategory(" + index + ")'>Delete</button>" +
            "</td>" +
            "</tr>";
    }
}
showCategories(categories);

searchInput.addEventListener("keyup", function () {
    let value = searchInput.value.toLowerCase();
    let result = [];
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].name.toLowerCase().includes(value)) {
            result.push(categories[i]);
        }
    }

    showCategories(result);
});

document.getElementById("showFormBtn").onclick = function () {
    form.reset();
    editingIndex = null;
    document.getElementById("formTitle").innerText = "Add New Category";
    document.getElementById("submitBtn").innerText = "Add Category";
    formBox.classList.remove("hidden");
};

document.getElementById("cancelBtn").onclick = function () {
    form.reset();
    editingIndex = null;
    formBox.classList.add("hidden");
};

form.addEventListener("submit", function (event) {
    event.preventDefault();
    let category = {
        name: nameInput.value,
        description: descriptionInput.value,
        status: statusInput.value
    };

    if (editingIndex == null) {
        categories.push(category);
        alert("Category Added Successfully!");
    }

    else {
        categories[editingIndex] = category;
        alert("Category Updated Successfully!");
    }


    showCategories(categories);
    searchInput.value = "";
    form.reset();
    editingIndex = null;
    formBox.classList.add("hidden");
});


function editCategory(index) {
    editingIndex = index;
    nameInput.value = categories[index].name;
    descriptionInput.value = categories[index].description;
    statusInput.value = categories[index].status;
    document.getElementById("formTitle").innerText = "Edit Category";
    document.getElementById("submitBtn").innerText = "Update Category";
    formBox.classList.remove("hidden");
}

function deleteCategory(index) {
    let answer = confirm("Are you sure you want to delete this category?");
    if (answer == true) {
        categories.splice(index, 1);
        showCategories(categories);
    }
}