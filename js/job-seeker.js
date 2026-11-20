// ---------------- DATA ----------------

// Sample job information
var jobTitles = [
  "Junior Web Developer",
  "UI Design Intern",
  "Data Entry Assistant"
];

var jobDetails = [
  "Company: Bright Software\nLocation: Dhaka\nWork: Build simple websites.",
  "Company: Creative Studio\nLocation: Remote\nWork: Help design website pages.",
  "Company: Office Solutions\nLocation: Chattogram\nWork: Enter and organize data."
];

// Our information is kept in arrays.
var resumes = [];
var applications = [];
var savedJobs = [];

// -1 means no item is being edited or selected.
var editingResume = -1;
var editingApplication = -1;
var selectedJob = -1;


// ---------------- PAGE BUTTONS ----------------

function showPage(pageName) {
  var pages = document.getElementsByClassName("page");

  for (var i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }

  if (pageName == "profile") {
    document.getElementById(pageName).style.display = "flex";
  } else {
    document.getElementById(pageName).style.display = "block";
  }
}


// ---------------- PROFILE ----------------

function changePhoto() {
  var file = document.getElementById("photoFile").files[0];

  if (file) {
    if (file.type.indexOf("image/") == 0) {
      var reader = new FileReader();

      reader.onload = function () {
        document.getElementById("photo").src = reader.result;
        document.getElementById("photo").style.display = "block";
        document.getElementById("photoText").style.display = "none";
      };

      reader.readAsDataURL(file);
    } else {
      alert("Please select an image.");
    }
  }
}

function updateProfile() {
  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("email").value.trim();
  var current = document.getElementById("currentPassword").value;
  var next = document.getElementById("newPassword").value;

  if (name == "" || email == "") {
    alert("Please enter your name and email.");
  } else if (!document.getElementById("email").checkValidity()) {
    alert("Please enter a valid email address.");
  } else if (
    (current == "" && next != "") ||
    (current != "" && next == "")
  ) {
    alert("Fill both password fields, or leave both empty.");
  } else {
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";

    alert("Profile updated for this session. Password changes are demo only.");
  }
}


// ---------------- DASHBOARD ----------------

function showJobDetails() {
  var number = document.getElementById("jobChoice").value;

  document.getElementById("jobDetails").value = jobDetails[number];
}

function startApplication() {
  if (resumes.length == 0) {
    alert("Please create a resume first.");
    showPage("resumes");
  } else {
    clearApplication();

    selectedJob = Number(document.getElementById("jobChoice").value);

    document.getElementById("applicationJob").value =
      jobTitles[selectedJob];

    showPage("applications");
  }
}


// ---------------- RESUMES ----------------

function saveResume() {
  var title = document.getElementById("resumeTitle").value.trim();
  var information =
    document.getElementById("resumeInformation").value.trim();

  var file = document.getElementById("resumeFile").files[0];

  if (title == "" || information == "") {
    alert("Enter a resume title and your information.");
  } else {
    if (editingResume == -1) {
      var resume = {
        title: title,
        information: information,
        file: file || null
      };

      resumes.push(resume);
    } else {
      resumes[editingResume].title = title;
      resumes[editingResume].information = information;

      if (file) {
        resumes[editingResume].file = file;
      }
    }

    clearResume();
    refreshResumes();
    clearApplication();

    alert("Resume saved.");
  }
}

function refreshResumes() {
  var list = document.getElementById("resumeList");
  var applicationList = document.getElementById("applicationResume");

  list.options.length = 0;
  applicationList.options.length = 0;

  if (resumes.length == 0) {
    list.add(new Option("No resumes", ""));
    applicationList.add(new Option("Create a resume first", ""));
  } else {
    for (var i = 0; i < resumes.length; i++) {
      list.add(new Option(resumes[i].title, i));
      applicationList.add(new Option(resumes[i].title, i));
    }
  }

  showResume();
}

function showResume() {
  var number = document.getElementById("resumeList").value;

  document.getElementById("resumeDetails").value = "";

  if (number != "") {
    var resume = resumes[Number(number)];
    var fileText = "No file uploaded";

    if (resume.file) {
      fileText = resume.file.name + "\nSize: " +
        Math.round(resume.file.size / 1024) + " KB";
    }

    document.getElementById("resumeDetails").value =
      "Title: " + resume.title +
      "\n\nInformation: " + resume.information +
      "\n\nFile: " + fileText;
  }
}

function editResume() {
  var number = document.getElementById("resumeList").value;

  if (number == "") {
    alert("Select a resume first.");
  } else {
    editingResume = Number(number);

    document.getElementById("resumeTitle").value =
      resumes[editingResume].title;

    document.getElementById("resumeInformation").value =
      resumes[editingResume].information;

    document.getElementById("resumeFile").value = "";
  }
}

function clearResume() {
  editingResume = -1;

  document.getElementById("resumeTitle").value = "";
  document.getElementById("resumeInformation").value = "";
  document.getElementById("resumeFile").value = "";
}

function deleteResume() {
  var number = document.getElementById("resumeList").value;

  if (number == "") {
    alert("Select a resume first.");
  } else if (confirm("Delete this resume?")) {
    resumes.splice(Number(number), 1);

    clearResume();
    clearApplication();
    refreshResumes();

    alert("Resume deleted. Previously submitted applications are unchanged.");
  }
}


// ---------------- APPLICATIONS ----------------

function submitApplication() {
  var resumeNumber =
    document.getElementById("applicationResume").value;

  var letter = document.getElementById("coverLetter").value.trim();

  if (selectedJob == -1) {
    alert("Choose a job from the Dashboard first.");
  } else if (resumeNumber == "" || letter == "") {
    alert("Select a resume and enter a cover letter.");
  } else {
    var duplicate = false;

    for (var i = 0; i < applications.length; i++) {
      if (
        i != editingApplication &&
        applications[i].jobNumber == selectedJob &&
        applications[i].status != "Withdrawn"
      ) {
        duplicate = true;
      }
    }

    if (duplicate) {
      alert("You already have an active application for this job.");
    } else {
      var resume = resumes[Number(resumeNumber)];

      // Save a copy of the resume information with the application.
      var application = {
        jobNumber: selectedJob,
        resumeTitle: resume.title,
        resumeInformation: resume.information,
        resumeFile: resume.file,
        letter: letter,
        status: "Pending"
      };

      if (editingApplication == -1) {
        applications.push(application);
      } else {
        applications[editingApplication] = application;
      }

      clearApplication();
      refreshApplications();

      alert("Application saved in this demo.");
    }
  }
}

function refreshApplications() {
  var list = document.getElementById("applicationList");

  list.options.length = 0;

  if (applications.length == 0) {
    list.add(new Option("No applications", ""));
  } else {
    for (var i = 0; i < applications.length; i++) {
      var application = applications[i];

      list.add(new Option(
        jobTitles[application.jobNumber] + " - " + application.status,
        i
      ));
    }
  }

  showApplication();
}

function showApplication() {
  var number = document.getElementById("applicationList").value;

  document.getElementById("applicationDetails").value = "";

  if (number != "") {
    var application = applications[Number(number)];

    document.getElementById("applicationDetails").value =
      "Job: " + jobTitles[application.jobNumber] +
      "\nStatus: " + application.status +
      "\nResume: " + application.resumeTitle +
      "\n\nCover Letter:\n" + application.letter;
  }
}

function editApplication() {
  var number = document.getElementById("applicationList").value;

  if (number == "") {
    alert("Select an application first.");
  } else if (applications[Number(number)].status != "Pending") {
    alert("Only pending applications can be edited.");
  } else if (resumes.length == 0) {
    alert("Create a resume first, then edit this application.");
  } else {
    editingApplication = Number(number);

    var application = applications[editingApplication];

    selectedJob = application.jobNumber;

    document.getElementById("applicationJob").value =
      jobTitles[selectedJob];

    document.getElementById("coverLetter").value = application.letter;

    alert("Edit the letter and choose the resume you want to submit.");
  }
}

function withdrawApplication() {
  var number = document.getElementById("applicationList").value;

  if (number == "") {
    alert("Select an application first.");
  } else if (applications[Number(number)].status == "Withdrawn") {
    alert("This application is already withdrawn.");
  } else if (confirm("Withdraw this application?")) {
    applications[Number(number)].status = "Withdrawn";

    clearApplication();
    refreshApplications();
  }
}

function clearApplication() {
  editingApplication = -1;
  selectedJob = -1;

  document.getElementById("applicationJob").value = "";
  document.getElementById("coverLetter").value = "";
}


// ---------------- SAVED JOBS ----------------

function saveJob() {
  var number = Number(document.getElementById("jobChoice").value);
  var found = false;

  for (var i = 0; i < savedJobs.length; i++) {
    if (savedJobs[i].jobNumber == number) {
      found = true;
    }
  }

  if (found) {
    alert("This job is already saved.");
  } else {
    var savedJob = {
      jobNumber: number,
      notes: "",
      priority: "Medium"
    };

    savedJobs.push(savedJob);

    refreshSavedJobs();

    alert("Job saved.");
  }
}

function refreshSavedJobs() {
  var list = document.getElementById("savedList");

  list.options.length = 0;

  if (savedJobs.length == 0) {
    list.add(new Option("No saved jobs", ""));
  } else {
    for (var i = 0; i < savedJobs.length; i++) {
      list.add(new Option(jobTitles[savedJobs[i].jobNumber], i));
    }
  }

  showSavedJob();
}

function showSavedJob() {
  var number = document.getElementById("savedList").value;

  document.getElementById("savedDetails").value = "";
  document.getElementById("savedNotes").value = "";
  document.getElementById("savedPriority").value = "Medium";

  if (number != "") {
    var savedJob = savedJobs[Number(number)];

    document.getElementById("savedDetails").value =
      jobTitles[savedJob.jobNumber] + "\n\n" +
      jobDetails[savedJob.jobNumber];

    document.getElementById("savedNotes").value = savedJob.notes;
    document.getElementById("savedPriority").value = savedJob.priority;
  }
}

function updateSavedJob() {
  var number = document.getElementById("savedList").value;

  if (number == "") {
    alert("Select a saved job first.");
  } else {
    savedJobs[Number(number)].notes =
      document.getElementById("savedNotes").value;

    savedJobs[Number(number)].priority =
      document.getElementById("savedPriority").value;

    alert("Notes and priority updated.");
  }
}

function removeSavedJob() {
  var number = document.getElementById("savedList").value;

  if (number == "") {
    alert("Select a saved job first.");
  } else if (confirm("Remove this saved job?")) {
    savedJobs.splice(Number(number), 1);
    refreshSavedJobs();
  }
}


// ---------------- LOGOUT ----------------

function logout() {
  if (confirm("Log out of this demo?")) {
    document.getElementById("portal").style.display = "none";
    document.getElementById("logoutScreen").style.display = "block";
  }
}

function openPortal() {
  document.getElementById("portal").style.display = "flex";
  document.getElementById("logoutScreen").style.display = "none";

  showPage("profile");
}


// ---------------- STARTING DISPLAY ----------------

showJobDetails();
refreshResumes();
refreshApplications();
refreshSavedJobs();


(function () {
  function setupJobSeekerSession() {
    var role = localStorage.getItem("userRole");

    if (role !== "Job Seeker") {
      window.location.href = "../login.html";
      return;
    }

    var name = localStorage.getItem("userName") || "Job Seeker";
    var email = localStorage.getItem("userEmail") || "";

    var nameField = document.getElementById("name");
    var emailField = document.getElementById("email");
    var headerName = document.getElementById("header-profile-name");
    var headerRole = document.getElementById("header-profile-role");

    if (nameField && !nameField.value) {
      nameField.value = name;
    }
    if (emailField && !emailField.value) {
      emailField.value = email;
    }
    if (headerName) {
      headerName.textContent = name;
    }
    if (headerRole) {
      headerRole.textContent = "Job Seeker";
    }
  }

  var originalLogout = window.logout;

  window.logout = function () {
    if (confirm("Log out of JobPortal?")) {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userGender");
      localStorage.removeItem("userDOB");
      localStorage.removeItem("userContact");
      localStorage.removeItem("userAddress");
      localStorage.removeItem("userStatus");
      window.location.href = "../login.html";
    }
  };

  document.addEventListener("DOMContentLoaded", setupJobSeekerSession);
}());
