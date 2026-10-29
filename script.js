const STORAGE_KEY = 'haru-han-kan-tasks';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');
const progressText = document.querySelector('#progress-text');
const clearCompletedButton = document.querySelector('#clear-completed');
const storageNote = document.querySelector('#storage-note');
const storageDot = document.querySelector('#storage-dot');
let tasks = loadTasks();
function setStorageStatus(available) {
  storageNote.textContent = available ? '이 기기에 자동 저장돼요' : '저장할 수 없어요. 새로고침하면 목록이 사라질 수 있어요.';
  storageDot.classList.toggle('is-unavailable', !available);
}
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean') : [];
  } catch {
    setStorageStatus(false);
    return [];
  }
}
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    setStorageStatus(true);
  } catch {
    setStorageStatus(false);
  }
}
function renderTasks() {
  list.replaceChildren();
  const completedCount = tasks.filter((task) => task.done).length;
  count.textContent = String(tasks.length);
  progressText.textContent = tasks.length === 0 ? '천천히 하나씩 해봐요' : completedCount === tasks.length ? '오늘 할 일을 모두 마쳤어요! 🎉' : '완료 ' + completedCount + ' / ' + tasks.length;
  emptyState.hidden = tasks.length > 0;
  clearCompletedButton.hidden = completedCount === 0;
  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' is-done' : '');
    const check = document.createElement('button');
    check.className = 'check-button';
    check.type = 'button';
    check.setAttribute('aria-label', task.done ? task.text + ' 완료 취소' : task.text + ' 완료');
    check.setAttribute('aria-pressed', String(task.done));
    check.textContent = task.done ? '✓' : '';
    check.addEventListener('click', () => { task.done = !task.done; saveTasks(); renderTasks(); });
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.setAttribute('aria-label', task.text + ' 삭제');
    remove.title = '할 일 삭제';
    remove.textContent = '×';
    remove.addEventListener('click', () => { tasks = tasks.filter((itemTask) => itemTask.id !== task.id); saveTasks(); renderTasks(); });
    item.append(check, text, remove);
    list.append(item);
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});
clearCompletedButton.addEventListener('click', () => { tasks = tasks.filter((task) => !task.done); saveTasks(); renderTasks(); });
const today = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
document.querySelector('#today-label').textContent = today.format(new Date());
renderTasks();
