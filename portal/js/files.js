async function initFiles() {
  const user = await PortalMvp.ready();
  const form = document.getElementById('file-upload-form');
  const tbody = document.querySelector('#files-table tbody');
  const message = document.getElementById('files-message');
  const total = document.getElementById('total-files');
  const storage = document.getElementById('storage-used');

  async function render() {
    tbody.innerHTML = '<tr><td colspan="5">Loading files...</td></tr>';
    try {
      const files = await PortalMvp.getClientRows('files', user, 'uploadedAt');
      total.textContent = files.length;
      storage.textContent = PortalMvp.bytes(files.reduce((sum, file) => sum + Number(file.sizeBytes || 0), 0));

      if (!files.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No files uploaded yet.</td></tr>';
        return;
      }

      tbody.innerHTML = files.map(file => `
        <tr>
          <td>${file.name || '-'}</td>
          <td>${file.project || '-'}</td>
          <td>${PortalMvp.bytes(file.sizeBytes)}</td>
          <td>${PortalMvp.date(file.uploadedAt)}</td>
          <td>${file.url ? `<a class="btn btn-sm btn-ghost" href="${file.url}" target="_blank" rel="noopener">Download</a>` : '-'}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load files.</td></tr>';
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = form.file.files[0];
    if (!file) return;

    message.textContent = 'Uploading file...';
    message.className = 'status-message';
    const upload = await PortalMvp.uploadFile(file, `client-files/${PortalMvp.clientId(user)}`);
    await window.firebaseDb.collection('files').add({
      ...upload,
      clientId: PortalMvp.clientId(user),
      uploadedBy: user.id,
      project: form.project.value.trim(),
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    form.reset();
    message.textContent = 'File uploaded.';
    message.className = 'status-message success';
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', initFiles);
