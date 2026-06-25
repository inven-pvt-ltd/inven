

// Firebase-backed invoices controller for admin portal
let allInvoices = [];

async function loadInvoices() {
    try {
        // Wait for Firebase db to be available
        let db = window.firebaseDb;
        if (!db) {
            // Wait for firebaseDb to be set on window
            await new Promise((resolve, reject) => {
                let waited = 0;
                const interval = setInterval(() => {
                    if (window.firebaseDb) {
                        db = window.firebaseDb;
                        clearInterval(interval);
                        resolve();
                    }
                    waited += 100;
                    if (waited > 5000) {
                        clearInterval(interval);
                        reject(new Error("firebaseDb not available"));
                    }
                }, 100);
            });
            db = window.firebaseDb;
        }
        // Query invoices collection
        const snapshot = await db.collection('invoices').get();
        allInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderInvoices(allInvoices);
        updateRevenueStats(allInvoices);
        setupSearch();
    } catch (err) {
        console.error('Failed to load invoices:', err);
        allInvoices = [];
        renderInvoices([]);
        updateRevenueStats([]);
        setupSearch();
    }
}

function updateRevenueStats(invoices) {
    let totalRevenue = 0;
    let outstandingRevenue = 0;
    let paidThisMonth = 0;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    for (const inv of invoices) {
        const amount = Number(inv.amount) || 0;
        if (inv.status === 'paid') {
            totalRevenue += amount;
            // Check if paid this month
            if (inv.paidAt) {
                let paidDate = inv.paidAt instanceof Date ? inv.paidAt : new Date(inv.paidAt);
                if (
                    paidDate.getFullYear() === thisYear &&
                    paidDate.getMonth() === thisMonth
                ) {
                    paidThisMonth += amount;
                }
            }
        } else if (inv.status === 'pending') {
            outstandingRevenue += amount;
        }
    }
    document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('outstanding-revenue').textContent = outstandingRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('paid-month').textContent = paidThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function renderInvoices(invoices) {
    const tbody = document.querySelector('#invoice-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!invoices || invoices.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.textContent = 'No invoices available.';
        td.className = 'text-center text-muted';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    for (const inv of invoices) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inv.id || ''}</td>
            <td>${inv.client || ''}</td>
            <td>${inv.project || ''}</td>
            <td>${inv.amount ? Number(inv.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''}</td>
            <td>${inv.status ? capitalize(inv.status) : ''}</td>
            <td>${inv.dueDate ? formatDate(inv.dueDate) : ''}</td>
            <td>
                <button class="btn btn-sm btn-link" onclick="viewInvoice('${inv.id}')">View</button>
                <button class="btn btn-sm btn-link" onclick="downloadInvoice('${inv.id}')">Download</button>
                ${inv.status !== 'paid'
                    ? `<button class="btn btn-sm btn-success" onclick="markInvoicePaid('${inv.id}')">Mark Paid</button>`
                    : ''}
            </td>
        `;
        tbody.appendChild(tr);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('invoice-search');
    if (!searchInput) return;
    searchInput.removeEventListener('input', handleSearch); // prevent duplicate listeners
    searchInput.addEventListener('input', handleSearch);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = allInvoices.filter(inv =>
        (inv.id && inv.id.toLowerCase().includes(query)) ||
        (inv.client && inv.client.toLowerCase().includes(query)) ||
        (inv.project && inv.project.toLowerCase().includes(query))
    );
    renderInvoices(filtered);
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(d) {
    try {
        let dateObj;
        if (d instanceof Date) {
            dateObj = d;
        } else if (d && d.toDate) {
            // Firestore Timestamp
            dateObj = d.toDate();
        } else {
            dateObj = new Date(d);
        }
        if (isNaN(dateObj)) return '';
        return dateObj.toLocaleDateString('en-US');
    } catch {
        return '';
    }
}

// Placeholder functions for invoice actions
function viewInvoice(invoiceId) {
    alert(`View Invoice: ${invoiceId}\n(Firebase integration placeholder)`);
}

function downloadInvoice(invoiceId) {
    alert(`Download Invoice: ${invoiceId}\n(Firebase integration placeholder)`);
}

function markInvoicePaid(invoiceId) {
    alert(`Mark Invoice Paid: ${invoiceId}\n(Firebase integration placeholder)`);
}

document.addEventListener('DOMContentLoaded', loadInvoices);