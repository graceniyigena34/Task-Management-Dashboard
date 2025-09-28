// // ===== SELECT ELEMENTS =====
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
  filtered.forEach(task => {
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
        <select onchange="updateStatus('${task.id}', this.value)" class="p-1 border rounded text-sm">
          <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${task.status === "Done" ? "selected" : ""}>Done</option>
        </select>
      </div>
      <p class="text-sm text-gray-600 mb-2">${task.description || "No description"}</p>
      <div class="text-xs text-gray-500 mb-2">📅 Due: ${task.dueDate || "No due date"} | 👤 ${task.assignee || "Unassigned"}</div>
      <div class="text-xs text-blue-600 mb-2">🏷️ ${task.tags.join(", ")}</div>
      <div class="flex gap-2">
        <button onclick="editTask('${task.id}')" class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
        <button onclick="deleteTask('${task.id}')" class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
      </div>
    `;
    taskList.appendChild(div);
  });

  updateAnalytics();
}

// ===== ADD TASK =====
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const newTask = {
    id: Date.now().toString(),
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dueDateInput.value,
    assignee: assigneeInput.value.trim(),
    tags: tagsInput.value.split(",").map(t => t.trim()).filter(Boolean),
    status: statusInput.value,
    createdAt: new Date().toISOString()
  };
  if (!newTask.title) return alert("Title is required!");
  tasks.push(newTask);
  saveTasks();
  taskForm.reset();
  renderTasks();
});

// ===== DELETE TASK =====
window.deleteTask = id => {
  if (confirm("Delete this task?")) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
};

// ===== UPDATE STATUS =====
window.updateStatus = (id, newStatus) => {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks();
    renderTasks();
  }
};

// ===== MODAL EDIT =====
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editDueDate = document.getElementById("editDueDate");
const editAssignee = document.getElementById("editAssignee");
const editTags = document.getElementById("editTags");
const editStatus = document.getElementById("editStatus");
let editId = null;

window.editTask = id => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editId = id;
  editTitle.value = task.title;
  editDescription.value = task.description;
  editDueDate.value = task.dueDate;
  editAssignee.value = task.assignee;
  editTags.value = task.tags.join(", ");
  editStatus.value = task.status;
  editModal.classList.remove("hidden");
};

window.closeEditModal = () => editModal.classList.add("hidden");

editForm.addEventListener("submit", e => {
  e.preventDefault();
  const task = tasks.find(t => t.id === editId);
  if (!task) return;
  task.title = editTitle.value.trim();
  task.description = editDescription.value.trim();
  task.dueDate = editDueDate.value;
  task.assignee = editAssignee.value.trim();
  task.tags = editTags.value.split(",").map(t => t.trim()).filter(Boolean);
  task.status = editStatus.value;
  saveTasks();
  renderTasks();
  closeEditModal();
});

// ===== CLEAR ALL =====
btnClear.addEventListener("click", () => {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});