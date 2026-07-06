const contentFields = [
  ['businessName', 'Business Name', 'text'],
  ['phoneNumber', 'Phone Number', 'tel'],
  ['email', 'Email', 'email'],
  ['address', 'Address', 'textarea'],
  ['openingHours', 'Opening Hours', 'textarea'],
  ['socialMediaLinks', 'Social Media Links', 'textarea'],
  ['heroText', 'Hero Text', 'textarea'],
  ['aboutUs', 'About Us', 'textarea'],
  ['services', 'Services', 'textarea']
];

async function initContentEditor() {
  const user = await PortalMvp.ready();
  const form = document.getElementById('content-form');
  const fields = document.getElementById('content-fields');
  const message = document.getElementById('content-message');
  const galleryList = document.getElementById('gallery-list');
  const docRef = window.firebaseDb.collection('websiteContent').doc(PortalMvp.clientId(user));
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() : {};

  fields.innerHTML = contentFields.map(([name, label, type]) => `
    <div class="form-group">
      <label class="form-label" for="${name}">${label}</label>
      ${type === 'textarea'
        ? `<textarea class="form-textarea small" id="${name}" name="${name}">${data[name] || ''}</textarea>`
        : `<input class="form-input" id="${name}" name="${name}" type="${type}" value="${data[name] || ''}">`}
    </div>
  `).join('');

  function renderGallery(images = []) {
    galleryList.innerHTML = images.length
      ? images.map(image => `<a class="btn btn-sm btn-ghost" href="${image.url}" target="_blank" rel="noopener">${image.name}</a>`).join('')
      : '<p class="empty-state">No gallery images uploaded yet.</p>';
  }

  renderGallery(data.galleryImages || []);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = 'Saving content...';
    message.className = 'status-message';

    const payload = {
      clientId: PortalMvp.clientId(user),
      updatedBy: user.id,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    contentFields.forEach(([name]) => {
      payload[name] = form.elements[name].value.trim();
    });

    const uploads = [];
    for (const file of form.gallery.files) {
      uploads.push(await PortalMvp.uploadFile(file, `website-content/${PortalMvp.clientId(user)}/gallery`));
    }

    if (uploads.length) {
      payload.galleryImages = firebase.firestore.FieldValue.arrayUnion(...uploads);
    }

    await docRef.set(payload, { merge: true });
    const refreshed = await docRef.get();
    renderGallery((refreshed.data() || {}).galleryImages || []);
    form.gallery.value = '';
    message.textContent = 'Website content saved.';
    message.className = 'status-message success';
  });
}

document.addEventListener('DOMContentLoaded', initContentEditor);
