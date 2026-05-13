let state = {
    columns: {
        "col-todo": {title: "To Do",    cards: [] },
        "col-progress": { title: "In Progress",    cards: [] },
        "col-done": {title: "Done",     cards: [] }

    }
};

let draggedCard = {
    id: null,
    colId: null
};

let modalCallback = null;
let confirmCallback = null;


// CARD FUNCTIONALITY //

function createCard(card, colId) {
    const div = document.createElement("div");
    div.classList.add("card");
    div.dataset.id = card.id;
    div.dataset.col = colId;
    div.setAttribute("draggable", "true");
    div.addEventListener("dragstart", (e) => {
        const clone = div.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.top = "-1000px";
        clone.style.width = div.offsetWidth + "px";
        clone.style.opacity = "1";
        clone.style.transform = "rotate(1.5deg)";
        document.body.appendChild(clone);

        e.dataTransfer.setDragImage(clone, e.offsetX, e.offsetY);

        setTimeout(() => {
            document.body.removeChild(clone);
        div.classList.add("dragging");
        }, 0);

        handleDragStart(card, colId);
    });

    div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
    });

    div.innerHTML = `
    <span class="card-tag">${card.tag}</span>
    <p class="card-title">${card.title}</p>
    <p class="card-body">${card.body}</p>
    <div class ="card-actions">
        <button class="edit-btn">✎</button>
        <button class="delete-btn">✕</button>
    </div>
    `;

    div.querySelector('.edit-btn').addEventListener("click", () => {
        editCard(card.id, colId);
    });

    div.querySelector(".delete-btn").addEventListener("click", () => {
        deleteCard(card.id, colId);
    });

    return div;
}

function addCard(colId) {
    openModal("Add Card", {}, (title, tag, body) => {
        const newCard = {
            id: Date.now(),
            title: title,
            tag: tag,
            body: body
        };
        
        state.columns[colId].cards.push(newCard);
        render();
        saveState();
    
    });
}

function deleteCard(cardId, colId) {
    openConfirm(() => {
    state.columns[colId].cards = state.columns[colId].cards.filter(
        card => card.id !== cardId
    );
    render();
    saveState();
    });
}

function editCard(cardId, colId) {
    const card = state.columns[colId].cards.find(c => c.id === cardId)
    if (!card) return;

    openModal("Edit Card", card, (title, tag, body) => {
        card.title = title;
        card.tag = tag;
        card.body = body;
    

    render();
    saveState();
    });
}

// DRAGGING //

function handleDragStart(card, colId) {
    draggedCard.id = card.id;
    draggedCard.colId = colId;
}

function handleDragOver (e) {
    e.preventDefault();
}

function handleDrop(targetColId) {
    if (draggedCard.colId === targetColId) return;

    const sourceCards = state.columns[draggedCard.colId].cards;
    const cardIndex = sourceCards.findIndex(c => c.id === draggedCard.id);
    const card = sourceCards[cardIndex];

    sourceCards.splice(cardIndex, 1);

    state.columns[targetColId].cards.push(card);

    draggedCard.id = null;
    draggedCard.colId = null;

    render();
    saveState();
}

// LOCALSTORAGE // 
function saveState() {
    localStorage.setItem("kanban-state", JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem("kanban-state");
    state = stored ? JSON.parse(stored) : state;

    render();
}


// DARK MODE // 

function darkMode () {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
        document.documentElement.removeAttribute("data-theme");
        document.querySelector("#theme-toggle").textContent = "🌙";
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        document.querySelector("#theme-toggle").textContent = "☀️";
    }
}

document.querySelector("#theme-toggle").addEventListener("click", darkMode);



// MODAL //

function openModal(heading, prefill, callback) {
    modalCallback = callback;

    document.querySelector("#modal-heading").textContent = heading;

    document.querySelector("#modal-title").value = prefill.title || "";
    document.querySelector("#modal-tag").value = prefill.tag || "";
    document.querySelector("#modal-body").value = prefill.body || "";

    document.querySelector("#modal-overlay").classList.remove("hidden");
    document.querySelector("#modal-title").focus();
}

function closeModal() {
    document.querySelector("#modal-overlay").classList.add("hidden");
    modalCallback = null;
}

// CONFIRM MODAL //

function openConfirm(callback) {
    confirmCallback = callback;

    document.querySelector("#confirm-overlay").classList.remove("hidden");
}

function closeConfirm() {
    document.querySelector("#confirm-overlay").classList.add("hidden");
    confirmCallback = null;
}

// RENDERING //

function render() {
    Object.entries(state.columns).forEach(([colId, colData]) => {
        const container = document.querySelector(`#${colId} .cards-container`);
        container.innerHTML="";

        colData.cards.forEach(card => {
            const cardEl = createCard(card, colId);
            container.appendChild(cardEl);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadState();
    document.querySelectorAll(".add-card-btn").forEach(btn => {
        const colId = btn.closest(".column").id;
        btn.addEventListener("click", () => addCard(colId))
    });

    document.querySelectorAll(".cards-container").forEach(container => {
        const colId = container.closest(".column").id;
        container.addEventListener("dragover", handleDragOver);
        container.addEventListener("drop", () => handleDrop(colId));
    });

    document.querySelectorAll(".column-header h2").forEach(h2 => {
        const colId = h2.closest(".column").id;

        h2.addEventListener("input", () => {
            state.columns[colId].title = h2.textContent;
            saveState();
        });
    });

    document.querySelector("#modal-cancel").addEventListener("click", closeModal);

    document.querySelector("#modal-save").addEventListener("click", () => {
        const title = document.querySelector("#modal-title").value.trim();
        const tag = document.querySelector("#modal-tag").value.trim() || "general";
        const body = document.querySelector("#modal-body").value.trim() || "";

        if (!title) {
            document.querySelector("#modal-title").focus();
            return;
        }

        if (modalCallback) modalCallback(title, tag, body);
        closeModal();
    
    });

    document.querySelector("#confirm-cancel").addEventListener("click", closeConfirm);

    document.querySelector("#confirm-delete").addEventListener("click", () => {
        if (confirmCallback) confirmCallback();
        closeConfirm();
    });
});
