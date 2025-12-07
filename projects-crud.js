function getLocalProjects() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
        return [];
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function saveLocalProjects(projects) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

function setCrudStatus(message) {
    const el = document.getElementById("crud-status");
    if (el) {
        el.textContent = message;
    }
}

function renderCrudPreview(projects) {
    const list = document.getElementById("crud-preview-list");
    if (!list) {
        return;
    }

    const data = Array.isArray(projects) ? projects : getLocalProjects();
    list.innerHTML = "";

    if (data.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No projects found in localStorage yet.";
        list.appendChild(p);
        return;
    }

    data.forEach(project => {
        const wrapper = document.createElement("div");
        wrapper.className = "crud-card-wrapper";

        const card = document.createElement("project-card");

        if (project.title) {
            card.setAttribute("title", project.title);
        }
        if (project.image) {
            card.setAttribute("image", project.image);
        }
        if (project.alt) {
            card.setAttribute("alt", project.alt);
        }
        if (project.description) {
            card.setAttribute("description", project.description);
        }
        if (project.link) {
            card.setAttribute("link", project.link);
        }

        const idLabel = document.createElement("p");
        idLabel.className = "crud-card-id";
        idLabel.textContent = "ID: " + project.id;

        wrapper.appendChild(card);
        wrapper.appendChild(idLabel);
        list.appendChild(wrapper);
    });
}

function handleProjectFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const idRaw = (formData.get("id") || "").toString().trim();

    let projects = getLocalProjects();
    let projectId;

    if (idRaw) {
        const asNumber = Number(idRaw);
        projectId = Number.isNaN(asNumber) ? idRaw : asNumber;
    } else {
        projectId = Date.now();
    }

    const title = (formData.get("title") || "").toString().trim();
    const image = (formData.get("image") || "").toString().trim();
    const alt = (formData.get("alt") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const link = (formData.get("link") || "").toString().trim();

    if (!title || !image || !alt || !description || !link) {
        setCrudStatus("Please fill out all fields before saving.");
        return;
    }

    const newProject = {
        id: projectId,
        title,
        image,
        alt,
        description,
        link
    };

    const existingIndex = projects.findIndex(p => String(p.id) === String(projectId));

    if (existingIndex !== -1) {
        projects[existingIndex] = newProject;
        setCrudStatus("Updated project with ID " + projectId + ".");
    } else {
        projects.push(newProject);
        setCrudStatus("Created new project with ID " + projectId + ".");
    }

    saveLocalProjects(projects);
    renderCrudPreview(projects);
    form.reset();
}

function handleDeleteSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("delete-id");
    if (!input) {
        return;
    }
    const idRaw = input.value.trim();
    if (!idRaw) {
        setCrudStatus("Enter an ID to delete.");
        return;
    }

    const projects = getLocalProjects();
    const filtered = projects.filter(p => String(p.id) !== idRaw);

    if (filtered.length === projects.length) {
        setCrudStatus("No project found with ID " + idRaw + ".");
    } else {
        saveLocalProjects(filtered);
        renderCrudPreview(filtered);
        setCrudStatus("Deleted project with ID " + idRaw + ".");
        input.value = "";
    }
}

function initCrudPage() {
    const projectForm = document.getElementById("project-form");
    const deleteForm = document.getElementById("delete-form");
    const reloadButton = document.getElementById("crud-reload");

    if (projectForm) {
        projectForm.addEventListener("submit", handleProjectFormSubmit);
    }

    if (deleteForm) {
        deleteForm.addEventListener("submit", handleDeleteSubmit);
    }

    if (reloadButton) {
        reloadButton.addEventListener("click", function () {
            renderCrudPreview();
            setCrudStatus("Reloaded projects from localStorage.");
        });
    }

    renderCrudPreview();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCrudPage);
} else {
    initCrudPage();
}
