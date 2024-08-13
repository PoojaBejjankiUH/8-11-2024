// Retrieve stored data or set defaults
let academicMaps = JSON.parse(localStorage.getItem('academicMaps')) || { programs: [] };
let programs = academicMaps.programs.map(p => p.name);
const courseList = JSON.parse(localStorage.getItem('courseList')) ?? [];
const electivesList = JSON.parse(localStorage.getItem('electivesList')) ?? {};
function setViewMode(view) {
    if (view === 'student') {
        // Hide Admin tab
        document.getElementById('homeTab').style.display = 'none';

        // Hide create program inputs and buttons
        document.getElementById('programInputContainer').style.display = 'none';

        // Hide select year and course add panel
        document.getElementById('course-add-container').style.display = 'none';

        // Hide delete action buttons and make everything read-only
        document.querySelectorAll('.btn-danger, .btn-sm').forEach(button => button.style.display = 'none');
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.id !== 'viewMode') {  // Exclude the viewMode dropdown from being disabled
                input.disabled = true;
            }
        });

        // Hide program delete buttons
        document.querySelectorAll('.program-delete-btn').forEach(button => button.style.display = 'none');
        
    } else if (view === 'admin') {
        // Show Admin tab
        document.getElementById('homeTab').style.display = 'block';

        // Show create program inputs and buttons
        document.getElementById('programInputContainer').style.display = 'flex';

        // Show select year and course add panel
        document.getElementById('course-add-container').style.display = 'block';

        // Show delete action buttons and enable input fields
        document.querySelectorAll('.btn-danger, .btn-sm').forEach(button => button.style.display = 'inline-block');
        document.querySelectorAll('input, select, textarea').forEach(input => input.disabled = false);

        // Show program delete buttons
        document.querySelectorAll('.program-delete-btn').forEach(button => button.style.display = 'inline-block');
    }
}

// Add event listener to change the view when the user selects a different option
document.addEventListener('DOMContentLoaded', function () {
    fetchPrograms(); // Fetch and display programs first
    const viewModeSelect = document.getElementById('viewMode');

    viewModeSelect.addEventListener('change', function () {
        const selectedView = this.value;
        if (selectedView) {
            setViewMode(selectedView);
        }
    });
});


// Function to display program navigation
function displayProgramNavigation() {
    const programTabs = document.getElementById('programTabs');
    const programTabsContent = document.getElementById('programTabsContent');
    programTabs.innerHTML = '';
    programTabsContent.innerHTML = '';
    programs.forEach((program, index) => {
        // Create tab
        const tab = document.createElement('li');
        tab.className = 'nav-item d-flex align-items-center';
        tab.innerHTML = `
            <a class="nav-link ${index === 0 ? 'active' : ''}" id="tab-${index}" data-toggle="tab" href="#content-${index}" role="tab" aria-controls="content-${index}" aria-selected="${index === 0 ? 'true' : 'false'}">${program}</a>
            <button class="btn btn-danger btn-sm ml-2 program-delete-btn" onclick="deleteProgram('${program}')">X</button>
        `;
        tab.querySelector('a').addEventListener('click', () => {
            setTimeout(function () {
                window.displayAcademicMap();
            }, 1000);
        });

        programTabs.appendChild(tab);
    
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
        tabContent.id = `content-${index}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `tab-${index}`);
        programTabsContent.appendChild(tabContent);
    });

    // Ensure the view mode settings are applied after navigation is set up
    const viewModeSelect = document.getElementById('viewMode');
    setViewMode(viewModeSelect.value); // Reapply view mode settings
}

// Function to fetch and display programs
function fetchPrograms() {
    const anyProgramsSaved = programs.length > 0;
    if (anyProgramsSaved) {
        document.getElementById('programs-container').style.display = 'flex';
        document.getElementById('no-programs-found').style.display = 'none';
        displayProgramNavigation();
    } else {
        document.getElementById('programs-container').style.display = 'none';
        document.getElementById('no-programs-found').style.display = 'flex';
    }
}

// Function to create a new program
function createProgram() {
    const programName = document.getElementById('programInput').value.trim();
    if (programName && !programs.includes(programName)) {
        programs.push(programName);
        const newProgram = {
            name: programName,
            years: [
                { year: 1, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
                { year: 2, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
                { year: 3, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
                { year: 4, semesterFall: { courses: [] }, semesterSpring: { courses: [] } }
            ]
        };
        academicMaps.programs.push(newProgram);
        localStorage.setItem('programs', JSON.stringify(programs));
        localStorage.setItem('academicMaps', JSON.stringify(academicMaps));
        fetchPrograms();
    } else {
        alert("Program name is either empty or already exists.");
    }
}

// Function to delete a program
function deleteProgram(programName) {
    const programIndex = academicMaps.programs.findIndex(p => p.name === programName);
    if (programIndex !== -1) {
        academicMaps.programs.splice(programIndex, 1);
        programs = academicMaps.programs.map(p => p.name);
        localStorage.setItem('programs', JSON.stringify(programs));
        localStorage.setItem('academicMaps', JSON.stringify(academicMaps));
        fetchPrograms();
    }
}

// Function to populate the course dropdown based on year and semester
function populateCourseDropdown() {
    const yearSelect = document.getElementById('year-select');
    const semesterSelect = document.getElementById('semester-select');
    const courseSelect = document.getElementById('course-select');

    const year = yearSelect.value;
    const semester = semesterSelect.value;

    if (year === "" || semester === "") {
        return;
    }

    // Fetch the available courses
    const allCourses = [...courseList, ...Object.values(electivesList).flat()]; // Include all courses

    courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
    allCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.courseCode;
        option.textContent = `${course.courseCode} - ${course.courseName}`;
        courseSelect.appendChild(option);
    });
}

// Function to add a course to the academic map
function addCourseToAcademicMap() {
    const year = document.getElementById('year-select').value;
    const semester = document.getElementById('semester-select').value;
    const courseCode = document.getElementById('course-select').value;
    const programName = document.querySelector('.nav-link.active').innerText;

    const programIndex = academicMaps.programs.findIndex(p => p.name === programName);
    if (programIndex !== -1) {
        const yearData = academicMaps.programs[programIndex].years.find(y => y.year == year);
        if (yearData && courseCode) {
            yearData[semester].courses.push(courseCode);
            localStorage.setItem('academicMaps', JSON.stringify(academicMaps));
            alert("Course added successfully!");
        } else {
            alert("Please select a valid course.");
        }
    } else {
        alert("Program not found.");
    }
}

// Event listeners for the course dropdowns
document.getElementById('year-select').addEventListener('change', populateCourseDropdown);
document.getElementById('semester-select').addEventListener('change', populateCourseDropdown);
