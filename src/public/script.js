const API_URL = '/data';

document.getElementById('dataForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const value = document.getElementById('value').value.trim();

  if (!name || !value) return;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, value }),
  });

  if (res.ok) {
    document.getElementById('name').value = '';
    document.getElementById('value').value = '';
    loadData();
  }
});

async function loadData() {
  const res = await fetch(API_URL);
  const { data } = await res.json();

  const list = document.getElementById('dataList');
  list.innerHTML = '';
  data.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.value} (${entry.timestamp})`;
    list.appendChild(li);
  });
}

loadData();
