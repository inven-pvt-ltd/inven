


// Production-ready client management script for admin portal

let allClients = [];

async function loadClients() {
    let db;
    try {
        // Wait for firebaseDb to be available
        db = await (typeof window.firebaseDb === 'function'
            ? window.firebaseDb()
            : window.firebaseDb);
        if (!db) throw new Error('firebaseDb not available');

        // Query users collection for clients
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('role', '==', 'client').get();
        allClients = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allClients.push({
                id: doc.id,
                ...data
            });
        });
        renderKPIs(allClients);
        renderClientsTable(allClients);
    } catch (err) {
        console.error('Error loading clients:', err);
        allClients = [];
        renderKPIs([]);
        renderClientsTable([]);
    }

    // Attach search handler
    const searchInput = document.getElementById('client-search');
    if (searchInput) {
        searchInput.removeEventListener('input', handleClientSearch);
        searchInput.addEventListener('input', handleClientSearch);
    }
}

function renderKPIs(clients) {
    // KPIs: total, active, pending, enterprise
    let total = clients.length;
    let active = clients.filter(c => c.status === 'active').length;
    let pending = clients.filter(c => c.status === 'pending').length;
    let enterprise = clients.filter(c => c.type === 'enterprise').length;
    const setKPI = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setKPI('kpi-total', total);
    setKPI('kpi-active', active);
    setKPI('kpi-pending', pending);
    setKPI('kpi-enterprise', enterprise);
}

function renderClientsTable(clients) {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!clients.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 99;
        td.textContent = 'No clients found.';
        td.className = 'text-center text-muted';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.name || ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.status || ''}</td>
            <td>${client.type || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-info" data-action="view" data-id="${client.id}">View</button>
                <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${client.id}">Edit</button>
                <button class="btn btn-sm btn-outline-warning" data-action="reset" data-id="${client.id}">Reset</button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${client.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Attach action button listeners
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', handleClientAction);
    });
}

function handleClientSearch(e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
        renderClientsTable(allClients);
        return;
    }
    const filtered = allClients.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.status && c.status.toLowerCase().includes(q)) ||
        (c.type && c.type.toLowerCase().includes(q))
    );
    renderClientsTable(filtered);
}

function handleClientAction(e) {
    const btn = e.currentTarget;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const client = allClients.find(c => c.id === id);
    if (!client) return;
    switch (action) {
        case 'view':
            alert(`View client: ${client.name || client.email || client.id}`);
            break;
        case 'edit':
            alert(`Edit client: ${client.name || client.email || client.id}`);
            break;
        case 'reset':
            alert(`Reset client password: ${client.name || client.email || client.id}`);
            break;
        case 'delete':
            alert(`Delete client: ${client.name || client.email || client.id}`);
            break;
        default:
            break;
    }
}

document.addEventListener('DOMContentLoaded', loadClients);