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
      const dateA = a.uploaded ? new Date(a.uploaded) : new Date(0);
      const dateB = b.uploaded ? new Date(b.uploaded) : new Date(0);
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
    clientTd.textContent = file.client || '-';
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
    if (file.uploaded) {
      const date = new Date(file.uploaded);
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
    downloadBtn.onclick = () => window.downloadFile(file.name || '');
    downloadBtn.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2');
    actionsTd.appendChild(downloadBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.type = 'button';
    deleteBtn.onclick = () => window.deleteFile(file.name || '');
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
  alert('Download for ' + name + ' will use Firebase Storage.');
};

window.deleteFile = function(name) {
  if (confirm('Are you sure you want to delete "' + name + '"?')) {
    alert('Delete for ' + name + ' will use Firebase Storage.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadFiles();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        renderTable(allFiles);
        return;
      }
      const filtered = allFiles.filter(file => {
        const name = (file.name || '').toLowerCase();
        const client = (file.client || '').toLowerCase();
        const project = (file.project || '').toLowerCase();
        return name.includes(query) || client.includes(query) || project.includes(query);
      });
      renderTable(filtered);
    });
  }
});
