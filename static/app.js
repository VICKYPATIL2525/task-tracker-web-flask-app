document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('taskInput');
  const deadlineInput = document.getElementById('deadlineInput');
  const buttons = document.querySelectorAll('.priority-btn');
  const tbody = document.querySelector('#tasksTable tbody');
  const doneTbody = document.querySelector('#doneTable tbody');
  const pendingFilter = document.getElementById('pendingFilter');
  const doneFilter = document.getElementById('doneFilter');
  const exportPendingBtn = document.getElementById('exportPending');
  const exportDoneBtn = document.getElementById('exportDone');

  // Helper function to format date as DD-MM-YYYY
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Helper function to format date and time as DD-MM-YYYY HH:MM AM/PM
  function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formattedHours = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  }

  // Set minimum date for deadline input to today
  function setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    deadlineInput.setAttribute('min', minDate);
  }

  // Initialize min date on load
  setMinDate();

  // Make entire deadline input clickable to open calendar
  deadlineInput.addEventListener('click', function() {
    this.showPicker();
  });

  async function load() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    render(tasks);
    renderDone(tasks.filter(t => t.completed));
  }

  function render(tasks) {
    tbody.innerHTML = '';
    // Filter out completed tasks and apply pending filter
    let pendingTasks = tasks.filter(t => !t.completed);
    pendingTasks = pendingTasks.filter(t => !pendingFilter || matchesFilter(t, pendingFilter.value));

    // Sort by deadline (closest first, tasks with no deadline at the end)
    pendingTasks.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    pendingTasks.forEach(t => {
      const tr = document.createElement('tr');
      const pri = priorityLabel(t.important, t.urgent);
      const createdAt = formatDateTime(t.created_at);
      const deadline = t.deadline ? formatDate(t.deadline) : 'No deadline';
      const taskWithDate = `<div class="task-text">${escapeHtml(t.text)}</div><div class="task-meta">Created: ${createdAt}</div>`;
      tr.innerHTML = `<td>${t.id}</td><td>${taskWithDate}</td><td>${pri}</td><td>${deadline}</td><td><button class="btn-done" data-id="${t.id}">✓ Done</button> <button class="btn-delete" data-id="${t.id}">✕ Delete</button></td>`;
      tr.classList.add(priorityClass(t.important, t.urgent));
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-done').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await fetch('/api/tasks/' + id + '/toggle', { method: 'POST' });
        load();
      });
    });
  }

  function renderDone(doneTasks) {
    doneTbody.innerHTML = '';
    doneTasks.forEach(t => {
      // apply done filter
      if (doneFilter && !matchesFilter(t, doneFilter.value)) return;
      const tr = document.createElement('tr');
      const pri = priorityLabel(t.important, t.urgent);
      const statusSymbol = t.completed ? '✅' : '⏳';
      const createdAt = formatDateTime(t.created_at);
      const deadline = t.deadline ? formatDate(t.deadline) : 'No deadline';
      const completedAt = formatDateTime(t.completed_at);
      tr.innerHTML = `<td>${t.id}</td><td>${escapeHtml(t.text)}</td><td>${pri}</td><td>${createdAt}</td><td>${deadline}</td><td>${completedAt}</td><td>${statusSymbol}</td><td><button class="move-pending" data-id="${t.id}">Move to Pending</button></td>`;
      tr.classList.add(priorityClass(t.important, t.urgent));
      tr.classList.add('completed');
      doneTbody.appendChild(tr);
    });

    // attach move-to-pending handlers
    document.querySelectorAll('.move-pending').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await fetch('/api/tasks/' + id + '/toggle', { method: 'POST' });
        load();
      });
    });
  }

  function priorityLabel(imp, urg) {
    if (imp && urg) return 'Important & Urgent';
    if (!imp && urg) return 'NotImportant & Urgent';
    if (imp && !urg) return 'Important & NotUrgent';
    return 'NotImportant & NotUrgent';
  }

  function priorityClass(imp, urg) {
    if (imp && urg) return 'prio-critical';
    if (!imp && urg) return 'prio-urgent';
    if (imp && !urg) return 'prio-important';
    return 'prio-normal';
  }

  function matchesFilter(task, value) {
    if (!value || value === 'all') return true;
    if (value === 'imp_urg') return Boolean(task.important && task.urgent);
    if (value === 'notimp_urg') return Boolean(!task.important && task.urgent);
    if (value === 'imp_noturg') return Boolean(task.important && !task.urgent);
    if (value === 'notimp_noturg') return Boolean(!task.important && !task.urgent);
    return true;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  buttons.forEach(b => {
    b.addEventListener('click', async () => {
      const important = b.dataset.important === 'true';
      const urgent = b.dataset.urgent === 'true';
      const text = input.value.trim();
      if (!text) {
        alert('Please enter a task before adding');
        input.focus();
        return;
      }
      const deadline = deadlineInput.value;
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, important, urgent, deadline }),
      });
      input.value = '';
      deadlineInput.value = '';
      load();
    });
  });

  // Delete handler for pending tasks
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      if (!confirm('Delete this task?')) return;
      await fetch('/api/tasks/' + id, { method: 'DELETE' });
      load();
    }
  });

  // filter change listeners
  if (pendingFilter) pendingFilter.addEventListener('change', () => load());
  if (doneFilter) doneFilter.addEventListener('change', () => load());

  // Export via server-side XLSX (preserves encoding and allows formatting)
  async function downloadFromEndpoint(path, defaultName) {
    const res = await fetch(path);
    if (!res.ok) {
      alert('Export failed: ' + res.statusText);
      return;
    }
    const blob = await res.blob();
    // try to get filename from content-disposition
    const cd = res.headers.get('content-disposition');
    let filename = defaultName;
    if (cd) {
      const match = cd.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/);
      if (match) filename = decodeURIComponent(match[1] || match[2]);
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (exportPendingBtn) exportPendingBtn.addEventListener('click', () => {
    downloadFromEndpoint('/export/pending', `pending_tasks.xlsx`);
  });
  if (exportDoneBtn) exportDoneBtn.addEventListener('click', () => {
    downloadFromEndpoint('/export/done', `done_tasks.xlsx`);
  });

  load();
});
