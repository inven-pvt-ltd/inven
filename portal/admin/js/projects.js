


// Global array to store all projects
let allProjects = [];

// Utility to safely get a property with fallback
function getProp(obj, prop, fallback = '-') {
    if (!obj) return fallback;
    const val = obj[prop];
    return (val === undefined || val === null || val === '') ? fallback : val;
}

// Render project rows into the table body
function renderProjectsTable(projects) {
    const tbody = document.querySelector('#projectsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!Array.isArray(projects) || projects.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'text-center';
        td.textContent = 'No projects available.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    for (const p of projects) {
        const tr = document.createElement('tr');
        // Project Name
        const tdName = document.createElement('td');
        tdName.textContent = getProp(p, 'name', '-');
        tr.appendChild(tdName);
        // Client Name
        const tdClient = document.createElement('td');
        tdClient.textContent = getProp(p, 'client', '-');
        tr.appendChild(tdClient);
        // Progress (%)
        const tdProgress = document.createElement('td');
        let progress = getProp(p, 'progress', 0);
        if (typeof progress === 'number') {
            progress = Math.round(progress) + '%';
        } else if (typeof progress === 'string' && progress.match(/^\d+$/)) {
            progress = progress + '%';
        }
        tdProgress.textContent = progress;
        tr.appendChild(tdProgress);
        // Status
        const tdStatus = document.createElement('td');
        tdStatus.textContent = getProp(p, 'status', '-');
        tr.appendChild(tdStatus);
        // Deadline
        const tdDeadline = document.createElement('td');
        let deadline = getProp(p, 'deadline', '-');
        if (deadline instanceof Date && !isNaN(deadline)) {
            deadline = deadline.toLocaleDateString();
        } else if (typeof deadline === 'object' && deadline && typeof deadline.toDate === 'function') {
            // Firestore Timestamp
            deadline = deadline.toDate().toLocaleDateString();
        }
        tdDeadline.textContent = deadline;
        tr.appendChild(tdDeadline);
        // Manager
        const tdManager = document.createElement('td');
        tdManager.textContent = getProp(p, 'manager', '-');
        tr.appendChild(tdManager);
        // Actions
        const tdActions = document.createElement('td');
        tdActions.className = 'text-nowrap';
        const btnView = document.createElement('button');
        btnView.textContent = 'View';
        btnView.className = 'btn btn-sm btn-primary me-1';
        btnView.onclick = () => alert(`View: ${getProp(p, 'name', '-')}`);
        tdActions.appendChild(btnView);
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Edit';
        btnEdit.className = 'btn btn-sm btn-secondary me-1';
        btnEdit.onclick = () => alert(`Edit: ${getProp(p, 'name', '-')}`);
        tdActions.appendChild(btnEdit);
        const btnArchive = document.createElement('button');
        btnArchive.textContent = 'Archive';
        btnArchive.className = 'btn btn-sm btn-danger';
        btnArchive.onclick = () => alert(`Archive: ${getProp(p, 'name', '-')}`);
        tdActions.appendChild(btnArchive);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    }
}

// Update summary counters
function updateSummaryCounters(projects) {
    const total = projects.length;
    let active = 0, completed = 0, atRisk = 0;
    for (const p of projects) {
        const status = (getProp(p, 'status', '') + '').toLowerCase();
        if (status === 'active') active++;
        else if (status === 'completed') completed++;
        else if (status === 'at risk' || status === 'at-risk' || status === 'atrisk') atRisk++;
    }
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setText('total-projects', total);
    setText('active-projects', active);
    setText('completed-projects', completed);
    setText('at-risk-projects', atRisk);
}

// Filter projects by search term (name or client)
function filterProjectsBySearch(term) {
    if (!term) return allProjects;
    const lower = term.toLowerCase();
    return allProjects.filter(p =>
        (getProp(p, 'name', '').toLowerCase().includes(lower)) ||
        (getProp(p, 'client', '').toLowerCase().includes(lower))
    );
}

// Main loader
async function loadProjects() {
    // Wait for firebaseDb to exist
    let retries = 0;
    while (!window.firebaseDb && retries < 40) {
        await new Promise(res => setTimeout(res, 100));
        retries++;
    }
    // Defensive: fallback to empty state if no db
    if (!window.firebaseDb || !window.firebaseDb.collection) {
        allProjects = [];
        updateSummaryCounters([]);
        renderProjectsTable([]);
        return;
    }
    try {
        const snapshot = await window.firebaseDb.collection('projects').get();
        allProjects = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            allProjects.push(data);
        });
        updateSummaryCounters(allProjects);
        renderProjectsTable(allProjects);
    } catch (err) {
        console.error('Failed to load projects:', err);
        allProjects = [];
        updateSummaryCounters([]);
        renderProjectsTable([]);
    }
    // Set up search filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput && !searchInput._projectsSearchBound) {
        searchInput.addEventListener('input', function () {
            const filtered = filterProjectsBySearch(this.value);
            updateSummaryCounters(filtered);
            renderProjectsTable(filtered);
        });
        searchInput._projectsSearchBound = true;
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);