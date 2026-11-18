let jobs = [
    {
        title: "Frontend Developer",
        company: "Tech Solutions",
        category: "Web Development",
        location: "Dhaka",
        status: "Pending"
    },
    {
        title: "Python Developer",
        company: "Soft BD",
        category: "Software Development",
        location: "Gazipur",
        status: "Approved"
    },
    {
        title: "Data Analyst",
        company: "Data Tech",
        category: "Data Science",
        location: "Dhaka",
        status: "Pending"
    },
    {
        title: "Digital Marketing Executive",
        company: "Creative Agency",
        category: "Digital Marketing",
        location: "Chittagong",
        status: "Rejected"
    },
    {
        title: "Web Designer",
        company: "Web Studio",
        category: "Web Development",
        location: "Dhaka",
        status: "Approved"
    }
];

let table = document.getElementById("jobTable");
let searchInput = document.getElementById("searchInput");

function showJobs(list) {
    table.innerHTML = "";
    table.innerHTML +=
        "<tr>" +
        "<th>Job ID</th>" +
        "<th>Job Title</th>" +
        "<th>Company</th>" +
        "<th>Category</th>" +
        "<th>Location</th>" +
        "<th>Status</th>" +
        "<th>Action</th>" +
        "</tr>";
    for (let i = 0; i < list.length; i++) {
        let index = jobs.indexOf(list[i]);
        table.innerHTML +=
            "<tr>" +
            "<td>" + (index + 101) + "</td>" +
            "<td>" + list[i].title + "</td>" +
            "<td>" + list[i].company + "</td>" +
            "<td>" + list[i].category + "</td>" +
            "<td>" + list[i].location + "</td>" +
            "<td><span class='status " + list[i].status.toLowerCase() + "'>" + list[i].status + "</span></td>" +
            "<td>" +
            "<button class='view-btn' onclick='viewJob(" + index + ")'>View</button>" +
            "<button class='approve-btn' onclick='approveJob(" + index + ")'>Approve</button>" +
            "<button class='reject-btn' onclick='rejectJob(" + index + ")'>Reject</button>" +
            "<button class='delete-btn' onclick='deleteJob(" + index + ")'>Delete</button>" +
            "</td>" +
            "</tr>";
    }
}
showJobs(jobs);

searchInput.addEventListener("keyup", function() {
    let value = searchInput.value.toLowerCase();
    let result = [];
    for (let i = 0; i < jobs.length; i++) {
        if (jobs[i].title.toLowerCase().includes(value) || jobs[i].category.toLowerCase().includes(value)) {
            result.push(jobs[i]);
        }
    }
    showJobs(result);
});

function viewJob(index) {
    alert(
        "Job Title: " + jobs[index].title +
        "\nCompany: " + jobs[index].company +
        "\nCategory: " + jobs[index].category +
        "\nLocation: " + jobs[index].location +
        "\nStatus: " + jobs[index].status
    );
}

function approveJob(index) {
    jobs[index].status = "Approved";
    alert("Job Approved Successfully!");
    showJobs(jobs);
    searchInput.value = "";
}

function rejectJob(index) {
    jobs[index].status = "Rejected";
    alert("Job Rejected Successfully!");
    showJobs(jobs);
    searchInput.value = "";
}

function deleteJob(index) {
    let confirmDelete = confirm("Are you sure you want to delete this job?");
    if (confirmDelete) {
        jobs.splice(index, 1);
        alert("Job Deleted Successfully!");
        showJobs(jobs);
        searchInput.value = "";
    }
}