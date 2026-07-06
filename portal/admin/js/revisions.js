let revisionRows = [];

function formatDate(value) {
  if (!value) return '-';
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
}

function badge(status) {
  const value = status || 'Pending';
  const lowered = value.toLowerCase();
  const className = lowered.includes('complete') ? 'status completed' : lowered.includes('progress') ? 'status paused' : 'status active';
  return `<span class="${className}">${value}</span>`;
}

async function loadRevisions() {
  while (!window.firebaseDb) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const snapshot = await window.firebaseDb.collection('revisionRequests').orderBy('createdAt', 'desc').get();
  revisionRows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderRevisions(revisionRows);
}

function renderRevisions(rows) {
  const tbody = document.querySelector('#revisions-table tbody');
  const openCount = document.getElementById('open-revisions');
  const totalCount = document.getElementById('total-revisions');
  const completedCount = document.getElementById('completed-revisions');

  totalCount.textContent = rows.length;
  openCount.textContent = rows.filter(row => (row.status || 'Pending') !== 'Completed').length;
  completedCount.textContent = rows.filter(row => row.status === 'Completed').length;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No revision requests yet.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td>${row.title || '-'}</td>
      <td>${row.clientName || row.clientId || '-'}</td>
      <td>${row.priority || 'Medium'}</td>
      <td>${badge(row.status)}</td>
      <td>${formatDate(row.createdAt)}</td>
      <td>${row.fileUrl ? `<a class="action-btn download" href="${row.fileUrl}" target="_blank" rel="noopener">File</a>` : '-'}</td>
      <td>
        <select class="status-select" data-id="${row.id}">
          <option ${row.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${row.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option ${row.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="action-btn delete" data-delete="${row.id}">Delete</button>
      </td>
    </tr>
    <tr><td colspan="7" class="description-row">${row.description || ''}</td></tr>
  `).join('');
}

document.addEventListener('change', async (event) => {
  if (!event.target.matches('.status-select')) return;
  await window.firebaseDb.collection('revisionRequests').doc(event.target.dataset.id).set({
    status: event.target.value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  loadRevisions();
});

document.addEventListener('click', async (event) => {
  const id = event.target.dataset.delete;
  if (!id) return;
  if (!confirm('Delete this revision request?')) return;
  await window.firebaseDb.collection('revisionRequests').doc(id).delete();
  loadRevisions();
});

document.addEventListener('DOMContentLoaded', loadRevisions);
