const entryInput = document.getElementById('entryInput');
const charCount = document.getElementById('charCount');
const saveBtn = document.getElementById('saveBtn');
const entriesList = document.getElementById('entriesList');
const searchInput = document.getElementById('searchInput');
const streakEl = document.getElementById('streak');
const themeBtn = document.getElementById('themeBtn');
const savedMsg = document.getElementById('savedMsg');

let entries = JSON.parse(localStorage.getItem('microJournal')) || [];
let isDark = localStorage.getItem('darkMode') === 'true';

// Apply saved theme
if (isDark) {
  document.body.classList.add('dark');
  themeBtn.textContent = '☀️';
}

// Enable / disable Save button while typing
entryInput.addEventListener('input', () => {
  const length = entryInput.value.trim().length;
  charCount.textContent = entryInput.value.length;
  saveBtn.disabled = length === 0;
});

// Save Entry button
saveBtn.addEventListener('click', () => {
  const text = entryInput.value.trim();
  if (!text) return;

  const today = new Date().toISOString().split('T')[0];

  // Remove existing entry from today (if any)
  entries = entries.filter(e => e.date !== today);

  // Add new entry
  entries.unshift({
    id: Date.now(),
    text: text,
    date: today
  });

  // Save to localStorage
  localStorage.setItem('microJournal', JSON.stringify(entries));

  // Clear input
  entryInput.value = '';
  charCount.textContent = '0';
  saveBtn.disabled = true;

  // Show "Saved!" message
  savedMsg.classList.add('show');
  setTimeout(() => {
    savedMsg.classList.remove('show');
  }, 1500);

  // Refresh list + streak
  renderEntries();
  updateStreak();
});

// Search
searchInput.addEventListener('input', () => {
  renderEntries(searchInput.value.toLowerCase().trim());
});

// Theme toggle
themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
});

// Render entries
function renderEntries(filter = '') {
  const filtered = entries.filter(e =>
    e.text.toLowerCase().includes(filter)
  );

  if (filtered.length === 0) {
    entriesList.innerHTML = `<div class="empty">${filter ? 'No matching entries' : 'No entries yet. Write your first sentence!'}</div>`;
    return;
  }

  entriesList.innerHTML = filtered.map(entry => `
    <div class="entry">
      <div>
        <div class="entry-text">${escapeHtml(entry.text)}</div>
        <div class="entry-date">${formatDate(entry.date)}</div>
      </div>
      <button class="delete-btn" onclick="deleteEntry(${entry.id})">×</button>
    </div>
  `).join('');
}

// Delete entry
window.deleteEntry = function(id) {
  if (!confirm('Delete this entry?')) return;
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('microJournal', JSON.stringify(entries));
  renderEntries(searchInput.value.toLowerCase().trim());
  updateStreak();
};

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateStreak() {
  if (entries.length === 0) {
    streakEl.textContent = '🔥 0 day streak';
    return;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();

  for (let i = 0; i < uniqueDates.length; i++) {
    const entryDate = new Date(uniqueDates[i] + 'T00:00:00');
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);

    if (entryDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  streakEl.textContent = `🔥 ${streak} day streak`;
}

// Initial load
renderEntries();
updateStreak();