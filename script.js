const volunteers = [
  { id: 1, name: "Amit", contact: "9876543210", skill: "First Aid", availability: "Available", location: "South Kolkata" },
  { id: 2, name: "Sneha", contact: "9876543211", skill: "Teaching", availability: "Available", location: "North Kolkata" },
  { id: 3, name: "Riya", contact: "9876543212", skill: "Food Distribution", availability: "Available", location: "South Kolkata" },
  { id: 4, name: "Neha", contact: "9876543213", skill: "First Aid", availability: "Available", location: "Central Kolkata" },
];

const tasks = [
  { id: 1, title: "Medical Camp", skill: "First Aid", needed: 2, location: "South Kolkata", date: "2026-04-10", priority: "High" },
  { id: 2, title: "Food Drive", skill: "Food Distribution", needed: 1, location: "South Kolkata", date: "2026-04-11", priority: "Medium" },
  { id: 3, title: "Teaching Drive", skill: "Teaching", needed: 1, location: "North Kolkata", date: "2026-04-12", priority: "Low" },
];

let assignments = {};

const volunteerList = document.getElementById("volunteerList");
const taskList = document.getElementById("taskList");
const assignmentList = document.getElementById("assignmentList");

const totalVolunteers = document.getElementById("totalVolunteers");
const totalTasks = document.getElementById("totalTasks");
const assignedCount = document.getElementById("assignedCount");
const pendingTasks = document.getElementById("pendingTasks");

const searchInput = document.getElementById("searchInput");
const volunteerForm = document.getElementById("volunteerForm");
const taskForm = document.getElementById("taskForm");
const assignBtn = document.getElementById("assignBtn");

function priorityOrder(priority) {
  return { High: 0, Medium: 1, Low: 2 }[priority] ?? 3;
}

function updateStats() {
  totalVolunteers.textContent = volunteers.length;
  totalTasks.textContent = tasks.length;
  assignedCount.textContent = Object.values(assignments).flat().length;
  pendingTasks.textContent = tasks.filter(task => (assignments[task.id]?.length || 0) < task.needed).length;
}

function renderVolunteers(filter = "") {
  volunteerList.innerHTML = "";

  const filtered = volunteers.filter(v =>
    v.name.toLowerCase().includes(filter.toLowerCase()) ||
    v.skill.toLowerCase().includes(filter.toLowerCase()) ||
    v.location.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach(v => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-title">${v.name}</div>
          <div class="item-sub">${v.contact}</div>
        </div>
        <div class="badges">
          <span class="badge-pill skill">${v.skill}</span>
          <span class="badge-pill ${v.availability === "Available" ? "available" : "busy"}">${v.availability}</span>
          <span class="badge-pill location">${v.location}</span>
        </div>
      </div>
    `;
    volunteerList.appendChild(item);
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(t => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="item-top">
        <div>
          <div class="item-title">${t.title}</div>
          <div class="item-sub">${t.date || "No date"}</div>
        </div>
        <div class="badges">
          <span class="badge-pill skill">${t.skill}</span>
          <span class="badge-pill location">${t.location}</span>
          <span class="badge-pill ${t.priority.toLowerCase()}">${t.priority}</span>
          <span class="badge-pill need">Need ${t.needed}</span>
        </div>
      </div>
    `;
    taskList.appendChild(item);
  });
}

function assignVolunteers() {
  const available = [...volunteers];
  const result = {};

  const sortedTasks = [...tasks].sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));

  sortedTasks.forEach(task => {
    const matched = available.filter(v => v.availability === "Available" && v.skill === task.skill);
    const sameLocation = matched.filter(v => v.location === task.location);
    const fallback = matched.filter(v => v.location !== task.location);
    const selected = [...sameLocation, ...fallback].slice(0, task.needed);

    result[task.id] = selected;

    selected.forEach(sel => {
      const index = available.findIndex(v => v.id === sel.id);
      if (index !== -1) available.splice(index, 1);
    });
  });

  assignments = result;
  renderAssignments();
  updateStats();
}

function renderAssignments() {
  assignmentList.innerHTML = "";

  const sortedTasks = [...tasks].sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));

  sortedTasks.forEach(task => {
    const assigned = assignments[task.id] || [];
    const card = document.createElement("div");
    card.className = "assignment-card";

    card.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.skill} • ${task.location}</p>
      <div class="badges" style="margin-bottom: 14px;">
        <span class="badge-pill need">Need ${task.needed}</span>
        <span class="badge-pill ${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      <div class="assigned-wrapper">
        ${
          assigned.length
            ? assigned.map(person => `
              <div class="assigned-person">
                <div class="item-title">${person.name}</div>
                <div class="item-sub">${person.skill} • ${person.location}</div>
              </div>
            `).join("")
            : `<div class="empty-state">No volunteers assigned yet</div>`
        }
      </div>
    `;

    assignmentList.appendChild(card);
  });
}

volunteerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newVolunteer = {
    id: Date.now(),
    name: document.getElementById("volName").value,
    contact: document.getElementById("volContact").value,
    skill: document.getElementById("volSkill").value,
    availability: document.getElementById("volAvailability").value,
    location: document.getElementById("volLocation").value,
  };

  volunteers.unshift(newVolunteer);
  volunteerForm.reset();
  document.getElementById("volSkill").value = "First Aid";
  document.getElementById("volAvailability").value = "Available";
  document.getElementById("volLocation").value = "South Kolkata";

  renderVolunteers(searchInput.value);
  updateStats();
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: Date.now(),
    title: document.getElementById("taskTitle").value,
    skill: document.getElementById("taskSkill").value,
    needed: Number(document.getElementById("taskNeeded").value),
    location: document.getElementById("taskLocation").value,
    date: document.getElementById("taskDate").value,
    priority: document.getElementById("taskPriority").value,
  };

  tasks.unshift(newTask);
  taskForm.reset();
  document.getElementById("taskSkill").value = "First Aid";
  document.getElementById("taskNeeded").value = 1;
  document.getElementById("taskLocation").value = "South Kolkata";
  document.getElementById("taskPriority").value = "Medium";

  renderTasks();
  renderAssignments();
  updateStats();
});

searchInput.addEventListener("input", (e) => {
  renderVolunteers(e.target.value);
});

assignBtn.addEventListener("click", assignVolunteers);

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Mouse-following animated background
const cyanGlow = document.querySelector(".cursor-cyan");
const violetGlow = document.querySelector(".cursor-violet");

document.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  cyanGlow.style.left = `${x}px`;
  cyanGlow.style.top = `${y}px`;

  violetGlow.style.left = `${x - 90}px`;
  violetGlow.style.top = `${y + 70}px`;
});

renderVolunteers();
renderTasks();
renderAssignments();
updateStats();
