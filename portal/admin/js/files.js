let allFiles = [];

async function loadFiles() {
  try {
    if (!window.firebaseDb) {
      throw new Error('firebaseDb is not available');
    }

    const querySnapshot = await window.firebaseDb.collection('files').get();
    allFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Update total files count
    const totalFilesElem = document.getElementById('total-files');
    totalFilesElem.textContent = allFiles.length;

    // Calculate total storage used
    const totalStorageUsed = allFiles.reduce((acc, file) => acc + (file.sizeBytes || 0), 0);
    const storageUsedElem = document.getElementById('storage-used');
    storageUsedElem.textContent = formatBytes(totalStorageUsed);

    // Sort by uploaded date descending for recent uploads
    const recentUploadsElem = document.getElementById('recent-uploads');
    const recentFiles = [...allFiles].sort((a, b) => {
      const dateA = normalizeDate(a.uploadedAt || a.uploaded);
      const dateB = normalizeDate(b.uploadedAt || b.uploaded);
      return dateB - dateA;
    }).slice(0, 5);
    recentUploadsElem.innerHTML = '';
    if (recentFiles.length === 0) {
      recentUploadsElem.textContent = 'No recent uploads';
    } else {
      recentFiles.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name || '-';
        recentUploadsElem.appendChild(li);
      });
    }

    renderTable(allFiles);
  } catch (error) {
    console.error('Error loading files:', error);
    document.getElementById('total-files').textContent = '0';
    document.getElementById('storage-used').textContent = '0 B';
    document.getElementById('recent-uploads').textContent = 'No recent uploads';
    renderTable([]);
  }
}

function renderTable(files) {
  const tbody = document.querySelector('#files-table tbody');
  tbody.innerHTML = '';

  if (files.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '6');
    td.textContent = 'No files uploaded yet.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  files.forEach(file => {
    const tr = document.createElement('tr');

    // File Name
    const nameTd = document.createElement('td');
    nameTd.textContent = file.name || '-';
    tr.appendChild(nameTd);

    // Client
    const clientTd = document.createElement('td');
    clientTd.textContent = file.client || file.clientName || file.clientId || '-';
    tr.appendChild(clientTd);

    // Project
    const projectTd = document.createElement('td');
    projectTd.textContent = file.project || '-';
    tr.appendChild(projectTd);

    // Size
    const sizeTd = document.createElement('td');
    sizeTd.textContent = formatBytes(file.sizeBytes || 0);
    tr.appendChild(sizeTd);

    // Uploaded Date
    const uploadedTd = document.createElement('td');
    if (file.uploadedAt || file.uploaded) {
      const date = normalizeDate(file.uploadedAt || file.uploaded);
      uploadedTd.textContent = date.toLocaleString();
    } else {
      uploadedTd.textContent = '-';
    }
    tr.appendChild(uploadedTd);

    // Actions (Download / Delete)
    const actionsTd = document.createElement('td');

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.type = 'button';
    downloadBtn.onclick = () => window.downloadFile(file.id);
    downloadBtn.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2');
    actionsTd.appendChild(downloadBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.type = 'button';
    deleteBtn.onclick = () => window.deleteFile(file.id);
    deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger');
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.downloadFile = function(name) {
  const file = allFiles.find(item => item.id === name);
  if (file?.url) {
    window.open(file.url, '_blank', 'noopener');
  }
};

window.deleteFile = async function(name) {
  const file = allFiles.find(item => item.id === name);
  if (!file || !confirm('Delete "' + (file.name || 'this file') + '"?')) return;
  if (file.storagePath && window.firebaseStorage) {
    await window.firebaseStorage.ref(file.storagePath).delete().catch(() => {});
  }
  await window.firebaseDb.collection('files').doc(file.id).delete();
  loadFiles();
};

function normalizeDate(value) {
  if (!value) return new Date(0);
  if (value.toDate) return value.toDate();
  return new Date(value);
}

document.addEventListener('DOMContentLoaded', () => {
  loadFiles();

  const uploadForm = document.getElementById('admin-upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('upload-message');
      const fileInput = document.getElementById('upload-file');
      const clientId = document.getElementById('upload-client-id').value.trim();
      const project = document.getElementById('upload-project').value.trim();
      const file = fileInput.files[0];
      if (!file || !clientId) return;

      message.textContent = 'Uploading...';
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
      const ref = window.firebaseStorage.ref(`client-files/${clientId}/${Date.now()}-${safeName}`);
      const snapshot = await ref.put(file);
      const url = await snapshot.ref.getDownloadURL();
      await window.firebaseDb.collection('files').add({
        clientId,
        project,
        name: file.name,
        sizeBytes: file.size,
        contentType: file.type,
        storagePath: snapshot.ref.fullPath,
        url,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      uploadForm.reset();
      message.textContent = 'File uploaded.';
      loadFiles();
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        renderTable(allFiles);
        return;
      }
      const filtered = allFiles.filter(file => {
        const name = (file.name || '').toLowerCase();
        const client = (file.client || file.clientName || file.clientId || '').toLowerCase();
        const project = (file.project || '').toLowerCase();
        return name.includes(query) || client.includes(query) || project.includes(query);
      });
      renderTable(filtered);
    });
  }
});
