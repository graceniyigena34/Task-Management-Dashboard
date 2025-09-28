// ===== SELECT ELEMENTS =====
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("dueDate");
const assigneeInput = document.getElementById("assignee");
const tagsInput = document.getElementById("tags");
const statusInput = document.getElementById("status");
const btnClear = document.getElementById("btnClear");
const btnImportSample = document.getElementById("btnImportSample");
const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");

const totalCount = document.getElementById("totalCount");
const countDone = document.getElementById("countDone");
const countInProgress = document.getElementById("countInProgress");
const countPending = document.getElementById("countPending");
const progressFill = document.getElementById("progressFill");
const taskList = document.getElementById("taskList");

// ===== STORAGE =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===== RENDER TASKS =====
function renderTasks() {
  taskList.innerHTML = "";

  // Search + Filter
  let filtered = tasks.filter(task => {
    const matchesStatus = filterStatus.value === "All" || task.status === filterStatus.value;
    const query = searchInput.value.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.tags.join(",").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Sorting
  if (sortBy.value === "due_asc") {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy.value === "title_asc") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Create task cards
  filtered.forEach((task, index) => {
    const div = document.createElement("div");
    div.className =
      "p-4 bg-white rounded shadow border-l-4 " +
      (task.status === "Done"
        ? "border-green-500"
        : task.status === "In Progress"
        ? "border-yellow-500"
        : "border-gray-400");

    div.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">${task.title}</h3>
        <select onchange="updateStatus(${index}, this.value)" class="p-1 border rounded text-sm">
          <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${task.status === "Done" ? "selected" : ""}>Done</option>
        </select>
      </div>
      <p class="text-sm text-gray-600 mb-2">${task.description || "No description"}</p>
      <div class="text-xs text-gray-500 mb-2">📅 Due: ${task.dueDate || "No due date"} | 👤 ${
      task.assignee || "Unassigned"
    }</div>
      <div class="text-xs text-blue-600 mb-2">🏷️ ${task.tags.join(", ")}</div>
      <div class="flex gap-2">
        <button onclick="editTask(${index})" class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
        <button onclick="deleteTask(${index})" class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
      </div>
    `;
    taskList.appendChild(div);
  });

  updateAnalytics();
}

// ===== ADD TASK =====
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dueDateInput.value,
    assignee: assigneeInput.value.trim(),
    tags: tagsInput.value.split(",").map(t => t.trim()).filter(Boolean),
    status: statusInput.value,
    createdAt: new Date().toISOString(),
  };

  if (!newTask.title) {
    alert("Title is required!");
    return;
  }

  tasks.push(newTask);
  saveTasks();
  taskForm.reset();
  renderTasks();
});

// ===== EDIT TASK =====
window.editTask = (index) => {
  const task = tasks[index];
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  dueDateInput.value = task.dueDate;
  assigneeInput.value = task.assignee;
  tagsInput.value = task.tags.join(", ");
  statusInput.value = task.status;

  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
};

// ===== DELETE TASK =====
window.deleteTask = (index) => {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
};

// ===== UPDATE STATUS =====
window.updateStatus = (index, newStatus) => {
  tasks[index].status = newStatus;
  saveTasks();
  renderTasks();
};

// ===== CLEAR ALL =====
btnClear.addEventListener("click", () => {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// ===== SAMPLE TASKS =====
btnImportSample.addEventListener("click", () => {
  tasks = [
    {
      title: "Design Login Page",
      description: "Create UI for login page using Tailwind.",
      dueDate: "2025-10-05",
      assignee: "Alice",
      tags: ["UI", "Frontend"],
      status: "In Progress",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Fix API Bug",
      description: "Resolve 500 error in GET /tasks endpoint.",
      dueDate: "2025-10-10",
      assignee: "Bob",
      tags: ["Backend", "Bug"],
      status: "Pending",
      createdAt: new Date().toISOString(),
    },
  ];
  saveTasks();
  renderTasks();
});

// ===== SAVE TASKS =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== ANALYTICS =====
function updateAnalytics() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const pending = tasks.filter(t => t.status === "Pending").length;

  totalCount.textContent = total;
  countDone.textContent = done;
  countInProgress.textContent = inProgress;
  countPending.textContent = pending;

  const completion = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = `${completion}%`;
}

// ===== EVENT LISTENERS =====
searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);
sortBy.addEventListener("change", renderTasks);

// ===== INIT =====
renderTasks();

// Select modal elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editDueDate = document.getElementById("editDueDate");
const editAssignee = document.getElementById("editAssignee");
const editTags = document.getElementById("editTags");
const editStatus = document.getElementById("editStatus");
let editIndex = null;

// Open modal
window.editTask = (index) => {
  editIndex = index;
  const task = tasks[index];
  editTitle.value = task.title;
  editDescription.value = task.description;
  editDueDate.value = task.dueDate;
  editAssignee.value = task.assignee;
  editTags.value = task.tags.join(", ");
  editStatus.value = task.status;
  editModal.classList.remove("hidden");
};

// Close modal
window.closeEditModal = () => {
  editModal.classList.add("hidden");
};

// Save edited task
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editIndex !== null) {
    tasks[editIndex] = {
      title: editTitle.value.trim(),
      description: editDescription.value.trim(),
      dueDate: editDueDate.value,
      assignee: editAssignee.value.trim(),
      tags: editTags.value.split(",").map(t => t.trim()).filter(Boolean),
      status: editStatus.value,
      createdAt: tasks[editIndex].createdAt
    };
    saveTasks();
    renderTasks();
    closeEditModal();
  }
});

