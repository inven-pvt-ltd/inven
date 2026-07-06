async function initClientRevisions() {
  const user = await PortalMvp.ready();
  const form = document.getElementById('revision-form');
  const table = document.querySelector('#revision-table tbody');
  const message = document.getElementById('revision-message');

  async function render() {
    table.innerHTML = '<tr><td colspan="5">Loading revision requests...</td></tr>';
    try {
      const rows = await PortalMvp.getClientRows('revisionRequests', user, 'createdAt');
      if (!rows.length) {
        table.innerHTML = '<tr><td colspan="5" class="empty-state">No revision requests yet.</td></tr>';
        return;
      }
      table.innerHTML = rows.map(row => `
        <tr>
          <td>${row.title || '-'}</td>
          <td>${PortalMvp.badge(row.priority || 'Medium')}</td>
          <td>${PortalMvp.badge(row.status || 'Pending')}</td>
          <td>${PortalMvp.date(row.createdAt)}</td>
          <td>${row.fileUrl ? `<a class="btn btn-sm btn-ghost" href="${row.fileUrl}" target="_blank" rel="noopener">Download</a>` : '-'}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      table.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load revision requests.</td></tr>';
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = 'Submitting request...';
    message.className = 'status-message';

    const file = form.file.files[0];
    const upload = await PortalMvp.uploadFile(file, `revision-requests/${PortalMvp.clientId(user)}`);

    await window.firebaseDb.collection('revisionRequests').add({
      clientId: PortalMvp.clientId(user),
      userId: user.id,
      clientName: user.name || user.email,
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      priority: form.priority.value,
      status: 'Pending',
      fileName: upload?.name || '',
      fileUrl: upload?.url || '',
      storagePath: upload?.storagePath || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    form.reset();
    message.textContent = 'Revision request submitted.';
    message.className = 'status-message success';
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', initClientRevisions);
