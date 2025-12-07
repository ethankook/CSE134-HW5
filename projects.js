const LOCAL_STORAGE_KEY = "hw5-projects-local";
const REMOTE_URL = "https://api.jsonbin.io/v3/b/6935048fd0ea881f4017fc3e/latest";

class ProjectCard extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title") || "Project Title";
        const image = this.getAttribute("image") || "images/NumArt-Demo.png";
        const alt = this.getAttribute("alt") || title;
        const description = this.getAttribute("description") || "";
        const link = this.getAttribute("link") || "#";

        this.innerHTML = `
            <article class="project-card">
                <picture class="card-image">
                    <img src="${image}" alt="${alt}" loading="lazy" decoding="async">
                </picture>
                <div class="card-overlay">
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <a href="${link}" target="_blank" rel="noopener noreferrer">View project</a>
                </div>
            </article>
        `;
    }
}

customElements.define("project-card", ProjectCard);

function seedLocalStorageIfEmpty() {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
        return;
    }

    const seedData = [
        {
            id: 1,
            title: "NumArt",
            image: "images/NumArtLogo.jpg",
            alt: "NumArt paint-by-numbers demo",
            description: "End-to-end paint-by-numbers pipeline that turns images into paintable templates and controls a Raspberry Pi paint mixer.",
            link: "https://github.com/ethankook/numart-backend"
        },
        {
                id: 2,
                title: "RISC Processor",
                image: "images/RiscLogo.avif",
                alt: "Custom RISC processor diagram",
                description: "Custom RISC-style CPU with 8 registers and a compact instruction set implemented and simulated for education.",
                link: "https://github.com/ethankook/RISC"
        }
    ];

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedData));
}

function setStatus(message) {
    const status = document.getElementById("projects-status");
    if (status) {
        status.textContent = message;
    }
}

function renderProjects(projects) {
    const container = document.getElementById("project-list");
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(projects) || projects.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No projects to display yet.";
        container.appendChild(empty);
        return;
    }

    projects.forEach(project => {
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

        container.appendChild(card);
    });
}

async function handleLoadLocal() {
    try {
        seedLocalStorageIfEmpty();
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        renderProjects(data);
        setStatus("Loaded projects from localStorage.");
    } catch (error) {
        setStatus("Could not load local projects.");
    }
}

async function handleLoadRemote() {
    try {
        setStatus("Loading remote projects...");
        const response = await fetch(REMOTE_URL);
        if (!response.ok) {
            throw new Error("Network error: " + response.status);
        }

        const json = await response.json();
        const projects = json.record || json; // get the actual array

        renderProjects(projects);
        setStatus("Loaded projects from remote data.");
    } catch (error) {
        console.error(error);
        setStatus("Could not load remote projects. Check REMOTE_URL or your API.");
    }
}


function initProjectPage() {
    const localButton = document.getElementById("load-local");
    const remoteButton = document.getElementById("load-remote");

    if (localButton) {
        localButton.addEventListener("click", handleLoadLocal);
    }

    if (remoteButton) {
        remoteButton.addEventListener("click", handleLoadRemote);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectPage);
} else {
    initProjectPage();
}


function initProjectSearch() {
    const searchInput = document.getElementById("project-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll("#project-list project-card");

        cards.forEach(card => {
            const title = (card.getAttribute("title") || "").toLowerCase();
            const description = (card.getAttribute("description") || "").toLowerCase();
            const matches = title.includes(query) || description.includes(query);
            card.style.display = matches ? "" : "none";
        });
    });
}

// call this inside initProjectPage
function initProjectPage() {
    const localButton = document.getElementById("load-local");
    const remoteButton = document.getElementById("load-remote");

    if (localButton) {
        localButton.addEventListener("click", handleLoadLocal);
    }

    if (remoteButton) {
        remoteButton.addEventListener("click", handleLoadRemote);
    }

    initProjectSearch();
}
