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
    <span class="card-tag"></span>
    <p class="card-title"></p>
    <p class="card-body"></p>
    <div class ="card-actions">
        <button class="edit-btn">✎</button>
        <button class="delete-btn">✕</button>
    </div>
    `;
    div.querySelector(".card-tag").textContent = card.tag;
    div.querySelector(".card-title").textContent = card.title;
    div.querySelector(".card-body").textContent = card.body;

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

        const newCardEl = document.querySelector(`.card[data-id="${newCard.id}"]`);
        if (newCardEl) {
            newCardEl.classList.add("pop-in");
            newCardEl.addEventListener("animationend", () => {
                newCardEl.classList.remove("pop-in");
            }, { once: true });
        }
    
    });
}

function deleteCard(cardId, colId) {
    openConfirm(() => {
        const cardEl = document.querySelector(`.card[data-id="${cardId}"]`)
        if (cardEl) {
            cardEl.classList.add("pop-out");
            cardEl.addEventListener("animationend", () => {
                state.columns[colId].cards = state.columns[colId].cards.filter(
                    card => card.id !== cardId
                );
                render();
                saveState();
            }, {once: true});
        }
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

    const droppedId = draggedCard.id;

    draggedCard.id = null;
    draggedCard.colId = null;

    render();
    saveState();

    const droppedEl = document.querySelector(`.card[data-id="${droppedId}"]`)
    if (droppedEl) {
        droppedEl.classList.add("plopped");
        droppedEl.addEventListener("animationend", () => {
            droppedEl.classList.remove("plopped");
        }, { once: true });
    }
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
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        document.querySelector("#theme-toggle").textContent = "☀️";
        localStorage.setItem("theme", "dark");
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

    const overlay = document.querySelector("#modal-overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("open");
    document.querySelector("#modal-title").focus();
}

function closeModal() {
    const overlay = document.querySelector("#modal-overlay");
    overlay.classList.remove("open");
    overlay.classList.add("closing");

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("closing");
        modalCallback = null;
    }, 300);
   
}

// CONFIRM MODAL //

function openConfirm(callback) {
    confirmCallback = callback;
    const overlay = document.querySelector("#confirm-overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("open");
}

function closeConfirm() {
    const overlay = document.querySelector("#confirm-overlay");
    overlay.classList.remove("open");
    overlay.classList.add("closing");

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.classList.remove("closing");
        confirmCallback = null;
    }, 300);
}

// RENDERING //

function render() {
    Object.entries(state.columns).forEach(([colId, colData]) => {
        const heading = document.querySelector(`#${colId} .column-header h2`);
        const container = document.querySelector(`#${colId} .cards-container`);

        if (heading && colData.title !== undefined) {
            heading.textContent = colData.title;
        }


        container.innerHTML="";

        colData.cards.forEach(card => {
            const cardEl = createCard(card, colId);
            container.appendChild(cardEl);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.querySelector("#theme-toggle").textContent ="☀️"
    }
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
