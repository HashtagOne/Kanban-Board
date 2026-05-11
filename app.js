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


// CARD FUNCTIONALITY //

function createCard(card, colId) {
    const div = document.createElement("div");
    div.classList.add("card");
    div.dataset.id = card.id;
    div.dataset.col = colId;
    div.setAttribute("draggable", "true");
    div.addEventListener("dragstart", (e) => {
        const clone = div.cloneNode(true);
        clone.style.width = div.offsetWidth + "px";
        clone.style.opacity = "1";
        clone.style.transform = "rotate(1.5deg)";

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
    const title = prompt("Card title:");
    if (!title || !title.trim()) return;

    const tag = prompt("Tag (e.g. dev, design, bug):");
    const body = prompt("Note (optional):");

    const newCard = {
        id: Date.now(),
        title: title.trim(),
        tag: tag.trim() || "general",
        body: body.trim() || ""
    };

    state.columns[colId].cards.push(newCard);
    render();
    saveState();
}

function deleteCard(cardId, colId) {
    const confirmed = confirm("Delete this card?");
    if (!confirmed) return;

    state.columns[colId].cards = state.columns[colId].cards.filter(
        card => card.id !== cardId
    );
    render();
    saveState();
}

function editCard(cardId, colId) {
    const card = state.columns[colId].cards.find(c => c.id === cardId)
    if (!card) return;

    const newTitle = prompt("Edit title:", card.title);
    if (!newTitle || !newTitle.trim()) return;

    const newTag = prompt("Edit tag:", card.tag);
    const newBody = prompt("Edit note:", card.body);

    card.title = newTitle.trim();
    card.tag = newTag.trim() || "general";
    card.body = newBody.trim() || "";

    render();
    saveState();
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
    })

    document.querySelectorAll(".cards-container").forEach(container => {
        const colId = container.closest(".column").id;
        container.addEventListener("dragover", handleDragOver);
        container.addEventListener("drop", () => handleDrop(colId));
    })

    document.querySelectorAll(".column-header h2").forEach(h2 => {
        const colId = h2.closest(".column").id;

        h2.addEventListener("input", () => {
            state.columns[colId].title = h2.textContent;
            saveState();
        });
    });
});

function saveState() {
    localStorage.setItem("kanban-state", JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem("kanban-state");
    state = stored ? JSON.parse(stored) : state;

    render();
}