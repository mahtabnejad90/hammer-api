const API_URL = '/data';
const LOGIN_URL = '/login';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();

  if (!username) return;

  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (res.ok) {
    const { token } = await res.json();
    localStorage.setItem('token', token);
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('dataForm').style.display = 'block';
    loadData();
  } else {
    alert('Login failed');
  }
});

document.getElementById('dataForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const dateOfBirth = document.getElementById('dob').value;
  const country = document.getElementById('country').value.trim();
  const postalCode = document.getElementById('postalCode').value.trim();

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ firstName, lastName, dateOfBirth, country, postalCode }),
  });

  if (res.ok) {
    document.getElementById('dataForm').reset();
    loadData();
  } else {
    alert('Submission failed');
  }
});

async function loadData() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const { data } = await res.json();
    const list = document.getElementById('dataList');
    list.innerHTML = '';
    data.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.firstname} ${entry.lastname} (${entry.dateofbirth}) - ${entry.country}, ${entry.postalcode}`;
      list.appendChild(li);
    });
  } else {
    alert('Failed to load data');
  }
}

if (localStorage.getItem('token')) {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('dataForm').style.display = 'block';
  loadData();
}