# Kanban Board

A drag-and-drop task management board built with vanilla JavaScript. Cards can be created, edited, deleted, and moved across columns. Data persists across sessions via localStorage.

---

## Live Demo 
Go here to view the webpage: https://hashtagone.github.io/Kanban-Board/

---


## Features

- Three columns — To Do, In Progress, Done — with editable headers
- Add, edit, and delete cards with a title, tag, and optional note
- Drag and drop cards between columns
- Confirmation modal before deletion
- Dark mode toggle
- Persistent state via localStorage — your board survives page refreshes
- Smooth animations — card pop-in on create, pop-out on delete, plop on drop, and modal entrance/exit sequences

---

## Tech Stack

- HTML
- CSS (custom properties, keyframe animations)
- Vanilla JavaScript (Drag and Drop API, localStorage)

---

## What I Learned

- How to implement drag and drop using the native HTML Drag and Drop API, including custom ghost images
- Managing application state as a single JS object and syncing it to localStorage
- Coordinating multi-layer animations — separating overlay, modal box, and inner element animations with staggered delays
- The FLIP animation technique conceptually, and why frameworks like Framer Motion make it practical
- Why `animationend` matters — delaying DOM removal until an exit animation finishes so nothing disappears prematurely

---

## How to Run

No installation needed. Open `index.html` directly in a browser, or visit the live demo linked above.
