// Utility Functions
function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "{}");
  }
  
  function setUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function getAppointments(username) {
    return JSON.parse(localStorage.getItem(`appointments_${username}`) || "[]");
  }
  
  function setAppointments(username, appointments) {
    localStorage.setItem(`appointments_${username}`, JSON.stringify(appointments));
  }
  
  // Register
  if (document.getElementById("registerForm")) {
    document.getElementById("registerForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("registerUsername").value;
      const password = document.getElementById("registerPassword").value;
      const users = getUsers();
  
      if (users[username]) {
        alert("User already exists.");
        return;
      }
  
      users[username] = password;
      setUsers(users);
      alert("Registered successfully!");
      window.location.href = "index.html";
    });
  }
  
  // Login
  if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      const users = getUsers();
  
      if (users[username] === password) {
        localStorage.setItem("loggedInUser", username);
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid credentials.");
      }
    });
  }
  
  // Dashboard Logic
  if (window.location.pathname.includes("dashboard.html")) {
    const username = localStorage.getItem("loggedInUser");
    if (!username) window.location.href = "index.html";
  
    document.getElementById("userWelcome").textContent = username;
  
    document.getElementById("appointmentForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const date = document.getElementById("date").value;
  
      const appointments = getAppointments(username);
      appointments.push({ title, date });
      setAppointments(username, appointments);
      renderAppointments();
      e.target.reset();
    });
  
    document.getElementById("searchInput").addEventListener("input", renderAppointments);
    document.getElementById("filterDate").addEventListener("change", renderAppointments);
  }
  
  function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterDate").value = "";
    renderAppointments();
  }
  
  function renderAppointments() {
    const username = localStorage.getItem("loggedInUser");
    if (!username) return;
  
    const appointmentsList = document.getElementById("appointmentsList");
    const completedList = document.getElementById("completedList");
    appointmentsList.innerHTML = "";
    completedList.innerHTML = "";
  
    let appointments = getAppointments(username);
  
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const filterDate = document.getElementById("filterDate")?.value || "";
  
    appointments = appointments
      .filter(appt => appt.title.toLowerCase().includes(searchTerm))
      .filter(appt => !filterDate || appt.date.startsWith(filterDate))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    const incomplete = appointments.filter(a => !a.completed);
    const completed = appointments.filter(a => a.completed);
  
    if (incomplete.length === 0) {
      appointmentsList.innerHTML = "<li>No matching appointments.</li>";
    } else {
      incomplete.forEach((appt, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${appt.title}</strong><br>
          <small>${new Date(appt.date).toLocaleString()}</small><br>
          <button onclick="markDone(${index})">Done</button>
          <button onclick="editAppointment(${index})">Edit</button>
          <button onclick="deleteAppointment(${index})">Delete</button>
        `;
        appointmentsList.appendChild(li);
      });
    }
  
    completed.forEach((appt, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong style="text-decoration: line-through;">${appt.title}</strong><br>
        <small style="text-decoration: line-through;">${new Date(appt.date).toLocaleString()}</small><br>
        <button onclick="deleteCompleted(${index})">Delete</button>
      `;
      completedList.appendChild(li);
    });
  }
  
  function markDone(index) {
    const username = localStorage.getItem("loggedInUser");
    const appointments = getAppointments(username);
  
    // Only mark the incomplete appointment list index
    const incomplete = appointments.filter(a => !a.completed);
    const apptToMark = incomplete[index];
  
    const mainIndex = appointments.findIndex(a => a.title === apptToMark.title && a.date === apptToMark.date);
    if (mainIndex > -1) {
      appointments[mainIndex].completed = true;
      setAppointments(username, appointments);
      renderAppointments();
    }
  }
  
  function deleteCompleted(index) {
    const username = localStorage.getItem("loggedInUser");
    const appointments = getAppointments(username);
  
    const completed = appointments.filter(a => a.completed);
    const apptToDelete = completed[index];
  
    const mainIndex = appointments.findIndex(a => a.title === apptToDelete.title && a.date === apptToDelete.date);
    if (mainIndex > -1) {
      appointments.splice(mainIndex, 1);
      setAppointments(username, appointments);
      renderAppointments();
    }
  }
  
  
  function deleteAppointment(index) {
    const username = localStorage.getItem("loggedInUser");
    const appointments = getAppointments(username);
    appointments.splice(index, 1);
    setAppointments(username, appointments);
    renderAppointments();
  }
  
  function editAppointment(index) {
    const username = localStorage.getItem("loggedInUser");
    const appointments = getAppointments(username);
    const appt = appointments[index];
  
    const newTitle = prompt("Edit Title:", appt.title);
    const newDate = prompt("Edit Date (YYYY-MM-DDTHH:MM):", appt.date);
  
    if (newTitle && newDate) {
      appointments[index] = { title: newTitle, date: newDate };
      setAppointments(username, appointments);
      renderAppointments();
    }
  }
  
  function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  }
  
  // Auto render if on dashboard
  if (window.location.pathname.includes("dashboard.html")) {
    renderAppointments();
  }
  
  