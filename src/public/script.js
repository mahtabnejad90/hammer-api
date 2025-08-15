const API_URL = '/data';
const LOGIN_URL = '/login';
const SIGNUP_URL = '/signup';

document.getElementById('signInBtn').addEventListener('click', () => {
  showSignIn();
});

document.getElementById('signUpBtn').addEventListener('click', () => {
  showSignUp();
});

function showSignIn() {
  document.getElementById('signInBtn').classList.add('active');
  document.getElementById('signUpBtn').classList.remove('active');
  document.getElementById('signInForm').style.display = 'flex';
  document.getElementById('signUpForm').style.display = 'none';
  clearMessages();
}

function showSignUp() {
  document.getElementById('signInBtn').classList.remove('active');
  document.getElementById('signUpBtn').classList.add('active');
  document.getElementById('signInForm').style.display = 'none';
  document.getElementById('signUpForm').style.display = 'flex';
  clearMessages();
}

function clearMessages() {
  document.getElementById('signInMessage').textContent = '';
  document.getElementById('signInMessage').className = 'auth-message';
  document.getElementById('signUpMessage').textContent = '';
  document.getElementById('signUpMessage').className = 'auth-message';
}

function showMessage(elementId, message, isSuccess = false) {
  const messageEl = document.getElementById(elementId);
  messageEl.textContent = message;
  messageEl.className = `auth-message ${isSuccess ? 'success' : 'error'}`;
}

document.getElementById('signUpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signUpUsername').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;

  if (!username || !email || !password) {
    showMessage('signUpMessage', 'All fields are required');
    return;
  }

  try {
    const res = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      showMessage('signUpMessage', 'Account created successfully!', true);
      setTimeout(() => {
        showApp();
      }, 1500);
    } else {
      showMessage('signUpMessage', data.message || 'Signup failed');
    }
  } catch (error) {
    showMessage('signUpMessage', 'Network error. Please try again.');
  }
});

document.getElementById('signInForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signInUsername').value.trim();
  const password = document.getElementById('signInPassword').value;

  if (!username || !password) {
    showMessage('signInMessage', 'Username and password are required');
    return;
  }

  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      showMessage('signInMessage', 'Sign in successful!', true);
      setTimeout(() => {
        showApp();
      }, 1000);
    } else {
      showMessage('signInMessage', data.message || 'Sign in failed');
    }
  } catch (error) {
    showMessage('signInMessage', 'Network error. Please try again.');
  }
});

document.getElementById('legacyLoginForm').addEventListener('submit', async (e) => {
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
    localStorage.setItem('username', username);
    showApp();
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

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showAuth();
});

document.getElementById('deleteAllBtn').addEventListener('click', async () => {
  const confirmDelete = confirm(
    'Are you sure you want to delete ALL data entries?\n\n' +
    'This action cannot be undone and will permanently remove all stored data.'
  );
  
  if (!confirmDelete) {
    return;
  }

  const button = document.getElementById('deleteAllBtn');
  const originalText = button.textContent;
  
  try {
    button.disabled = true;
    button.textContent = '🔄 Deleting...';
    
    const token = localStorage.getItem('token');
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      loadData();
      
      const dataList = document.getElementById('dataList');
      const successMsg = document.createElement('li');
      successMsg.textContent = '✅ All data entries deleted successfully';
      successMsg.style.background = '#d4edda';
      successMsg.style.color = '#155724';
      successMsg.style.borderLeft = '4px solid #28a745';
      dataList.appendChild(successMsg);
      
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.remove();
        }
      }, 3000);
      
    } else {
      alert(`Failed to delete data: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Delete all error:', error);
    alert('Network error. Please try again.');
  } finally {
    button.disabled = false;
    button.textContent = originalText;
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

function showAuth() {
  document.querySelector('.auth-container').style.display = 'block';
  document.getElementById('appContent').style.display = 'none';
}

function showApp() {
  document.querySelector('.auth-container').style.display = 'none';
  document.getElementById('appContent').style.display = 'block';
  
  const username = localStorage.getItem('username');
  document.getElementById('userWelcome').textContent = `Welcome, ${username}!`;
  loadData();
}

if (localStorage.getItem('token')) {
  showApp();
} else {
  showAuth();
}