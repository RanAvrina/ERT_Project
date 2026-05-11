/**
 * tasks.js - לוגיקה של עמוד המשימות
 */

function initTasksPage() {
  console.log('Tasks page initialized');

  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskForm = document.getElementById('taskForm');
  const cancelTask = document.getElementById('cancelTask');

  addTaskBtn?.addEventListener('click', () => {
    document.getElementById('addTaskDialog').style.display = 'flex';
  });

  taskForm?.addEventListener('submit', handleAddTask);
  cancelTask?.addEventListener('click', () => {
    document.getElementById('addTaskDialog').style.display = 'none';
  });

  loadTasks();
}

async function handleAddTask(e) {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const assignee = document.getElementById('taskAssignee').value;

  const tasks = getFromStorage('tasks') || [];
  tasks.push({
    id: new Date().getTime(),
    title,
    description,
    assignee,
    completed: false,
  });
  saveToStorage('tasks', tasks);

  document.getElementById('addTaskDialog').style.display = 'none';
  e.target.reset();
  loadTasks();
}

async function loadTasks() {
  const tasks = getFromStorage('tasks') || [];
  const tasksList = document.getElementById('tasksList');

  if (tasks.length === 0) {
    tasksList.innerHTML = '<p style="text-align: center; color: #999;">אין משימות עדיין</p>';
    return;
  }

  tasksList.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-item">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
      <div class="task-content">
        <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
        <div class="task-assignee">מוקצה ל: ${task.assignee || 'ללא'}</div>
      </div>
    </div>
  `,
    )
    .join('');
}
