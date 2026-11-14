// Shared navigation and small page enhancements.
document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuButton.textContent = isOpen ? "×" : "☰";
    });
  }

  // Academic planner: array methods, event handling, DOM updates and localStorage.
  const taskForm = document.querySelector("#task-form");
  if (taskForm) {
    const input = document.querySelector("#task-input");
    const dateInput = document.querySelector("#task-date");
    const list = document.querySelector("#task-list");
    const empty = document.querySelector("#empty-state");
    const total = document.querySelector("#task-total");
    const progressText = document.querySelector("#progress-text");
    const progressBar = document.querySelector("#progress-bar");
    const clearButton = document.querySelector("#clear-completed");
    let tasks = JSON.parse(localStorage.getItem("peacePortfolioTasks") || "[]");
    let filter = "all";

    const save = () => localStorage.setItem("peacePortfolioTasks", JSON.stringify(tasks));
    const render = () => {
      list.innerHTML = "";
      const visible = tasks.filter(task => filter === "all" || (filter === "active" ? !task.done : task.done));
      visible.forEach(task => {
        const item = document.createElement("li");
        item.className = `task-item${task.done ? " done" : ""}`;
        const check = document.createElement("input");
        check.type = "checkbox"; check.className = "task-check"; check.checked = task.done;
        check.setAttribute("aria-label", `Mark ${task.title} as ${task.done ? "not completed" : "completed"}`);
        check.addEventListener("change", () => { task.done = check.checked; save(); render(); });
        const main = document.createElement("div"); main.className = "task-main";
        const title = document.createElement("span"); title.className = "task-title"; title.textContent = task.title;
        main.appendChild(title);
        if (task.date) {
          const due = document.createElement("small"); due.className = "task-date";
          due.textContent = `Due ${new Date(`${task.date}T00:00:00`).toLocaleDateString(undefined, {year:"numeric",month:"short",day:"numeric"})}`;
          main.appendChild(due);
        }
        const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-task";
        remove.textContent = "Delete"; remove.setAttribute("aria-label", `Delete ${task.title}`);
        remove.addEventListener("click", () => { tasks = tasks.filter(entry => entry.id !== task.id); save(); render(); });
        item.append(check, main, remove); list.appendChild(item);
      });
      empty.hidden = visible.length !== 0;
      total.textContent = tasks.length;
      const completed = tasks.filter(task => task.done).length;
      const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
      progressText.textContent = `${percent}% complete`;
      progressBar.style.width = `${percent}%`;
    };
    taskForm.addEventListener("submit", event => {
      event.preventDefault();
      const title = input.value.trim();
      if (!title) { input.focus(); return; }
      tasks.unshift({id: Date.now(), title, date: dateInput.value, done: false});
      save(); render(); taskForm.reset(); input.focus();
    });
    document.querySelectorAll(".filter-btn").forEach(button => button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn === button));
      render();
    }));
    clearButton.addEventListener("click", () => { tasks = tasks.filter(task => !task.done); save(); render(); });
    render();
  }

  // Contact form validation. This demo validates locally; connect a form service to receive messages.
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const fields = ["name", "email", "phone", "message"];
    const feedback = document.querySelector("#form-feedback");
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      const values = Object.fromEntries(fields.map(id => [id, document.getElementById(id).value.trim()]));
      const errors = {};
      if (!values.name) errors.name = "Please enter your name.";
      if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = "Enter a valid email address.";
      if (!values.phone || !/^\d+$/.test(values.phone)) errors.phone = "Use digits only for your phone number.";
      if (!values.message) errors.message = "Please write a message.";
      fields.forEach(id => {
        const field = document.getElementById(id);
        document.getElementById(`${id}-error`).textContent = errors[id] || "";
        field.classList.toggle("input-error", Boolean(errors[id]));
        field.setAttribute("aria-invalid", String(Boolean(errors[id])));
      });
      if (Object.keys(errors).length) {
        feedback.textContent = "Please correct the highlighted fields and try again.";
        feedback.className = "form-feedback";
        const firstInvalid = fields.find(id => errors[id]);
        document.getElementById(firstInvalid).focus();
      } else {
        feedback.textContent = "All fields are valid. This demo does not send messages yet; connect a form backend to receive submissions.";
        feedback.className = "form-feedback success";
        contactForm.reset();
      }
    });
    fields.forEach(id => document.getElementById(id).addEventListener("input", () => {
      document.getElementById(`${id}-error`).textContent = "";
      document.getElementById(id).classList.remove("input-error");
      document.getElementById(id).setAttribute("aria-invalid", "false");
    }));
  }
});