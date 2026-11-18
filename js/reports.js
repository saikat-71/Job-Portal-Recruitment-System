let users = [
    {
        name: "Rahim Ahmed",
        email: "rahim@gmail.com",
        role: "Recruiter",
        status: "Active"
    },
    {
        name: "Aysha Khan",
        email: "aysha@gmail.com",
        role: "Job Seeker",
        status: "Active"
    },
    {
        name: "Karim Hasan",
        email: "karim@gmail.com",
        role: "Recruiter",
        status: "Active"
    },
    {
        name: "Nusrat Jahan",
        email: "nusrat@gmail.com",
        role: "Job Seeker",
        status: "Active"
    }
];

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

let categories = [
    {
        name: "Web Development",
        description: "Website Development",
        status: "Active"
    },
    {
        name: "Software Development",
        description: "Software Development",
        status: "Active"
    },
    {
        name: "Data Science",
        description: "Data Analysis and Science",
        status: "Active"
    },
    {
        name: "Digital Marketing",
        description: "Online Marketing",
        status: "Active"
    }
];

let totalUsers = document.getElementById("totalUsers");
let totalRecruiters = document.getElementById("totalRecruiters");
let totalSeekers = document.getElementById("totalSeekers");
let totalJobs = document.getElementById("totalJobs");
let approvedJobs = document.getElementById("approvedJobs");
let pendingJobs = document.getElementById("pendingJobs");
let rejectedJobs = document.getElementById("rejectedJobs");
let totalCategories = document.getElementById("totalCategories");
let detailsSection = document.getElementById("detailsSection");
let detailsTitle = document.getElementById("detailsTitle");
let detailsTable = document.getElementById("detailsTable");

totalUsers.innerHTML = users.length;

let recruiterCount = 0;
let seekerCount = 0;
for (let i = 0; i < users.length; i++) {
    if (users[i].role === "Recruiter") {
        recruiterCount++;
    }
    if (users[i].role === "Job Seeker") {
        seekerCount++;
    }
}
totalRecruiters.innerHTML = recruiterCount;
totalSeekers.innerHTML = seekerCount;

totalJobs.innerHTML = jobs.length;
let approvedCount = 0;
let pendingCount = 0;
let rejectedCount = 0;
for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].status === "Approved") {
        approvedCount++;
    }
    if (jobs[i].status === "Pending") {
        pendingCount++;
    }
    if (jobs[i].status === "Rejected") {
        rejectedCount++;
    }
}
approvedJobs.innerHTML = approvedCount;
pendingJobs.innerHTML = pendingCount;
rejectedJobs.innerHTML = rejectedCount;
totalCategories.innerHTML = categories.length;

function showDetails(title, list) {
    detailsTitle.innerHTML = title;
    detailsTable.innerHTML = "";
    detailsTable.innerHTML +=
        "<tr>" +
        "<th>Details</th>" +
        "</tr>";

    for (let i = 0; i < list.length; i++) {
        detailsTable.innerHTML +=
            "<tr>" +
            "<td>" + list[i] + "</td>" +
            "</tr>";
    }

    detailsSection.style.display = "block";
    detailsSection.scrollIntoView({
        behavior: "smooth"
    });
}

let reportCards = document.querySelectorAll(".report-card");
for (let i = 0; i < reportCards.length; i++) {
    reportCards[i].addEventListener("click", function() {
        let type = reportCards[i].getAttribute("data-report");
        let result = [];
        let title = "";
        if (type === "users") {
            title = "All Users";
            for (let j = 0; j < users.length; j++) {
                result.push(
                    users[j].name + " - " +
                    users[j].role + " - " +
                    users[j].status
                );
            }
        }

        else if (type === "recruiters") {
            title = "All Recruiters";
            for (let j = 0; j < users.length; j++) {
                if (users[j].role === "Recruiter") {
                    result.push(
                        users[j].name + " - " +
                        users[j].email
                    );
                }
            }
        }

        else if (type === "seekers") {
            title = "All Job Seekers";
            for (let j = 0; j < users.length; j++) {
                if (users[j].role === "Job Seeker") {
                    result.push(
                        users[j].name + " - " +
                        users[j].email
                    );
                }
            }
        }


        else if (type === "jobs") {
            title = "All Job Posts";
            for (let j = 0; j < jobs.length; j++) {
                result.push(
                    jobs[j].title + " - " +
                    jobs[j].company + " - " +
                    jobs[j].status
                );
            }
        }


        else if (type === "approved") {
            title = "Approved Jobs";
            for (let j = 0; j < jobs.length; j++) {
                if (jobs[j].status === "Approved") {
                    result.push(
                        jobs[j].title + " - " +
                        jobs[j].company
                    );
                }
            }
        }

        else if (type === "pending") {
            title = "Pending Jobs";
            for (let j = 0; j < jobs.length; j++) {
                if (jobs[j].status === "Pending") {
                    result.push(
                        jobs[j].title + " - " +
                        jobs[j].company
                    );
                }
            }
        }

        else if (type === "rejected") {
            title = "Rejected Jobs";
            for (let j = 0; j < jobs.length; j++) {
                if (jobs[j].status === "Rejected") {
                    result.push(
                        jobs[j].title + " - " +
                        jobs[j].company
                    );
                }
            }
        }

        else if (type === "categories") {
            title = "All Categories";
            for (let j = 0; j < categories.length; j++) {
                result.push(categories[j].name);
            }
        }
        showDetails(title, result);

        for (let j = 0; j < reportCards.length; j++) {
            reportCards[j].classList.remove("active");
        }
        reportCards[i].classList.add("active");
    });
}