async function waitForFirebaseDb() {
  while (!window.firebaseDb) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadSettings() {
  await waitForFirebaseDb();
  const docRef = window.firebaseDb.collection('settings').doc('admin');
  try {
    const doc = await docRef.get();
    if (!doc.exists) return;
    const data = doc.data();
    const fields = ['companyName', 'supportEmail', 'website', 'portalTitle', 'welcomeMessage', 'emailToggle', 'ticketToggle', '2fa-toggle'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && data.hasOwnProperty(id)) {
        if (el.type === 'checkbox') {
          el.checked = data[id];
        } else {
          el.value = data[id];
        }
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings(event) {
  event.preventDefault();
  await waitForFirebaseDb();
  const fields = ['companyName', 'supportEmail', 'website', 'portalTitle', 'welcomeMessage', 'emailToggle', 'ticketToggle', '2fa-toggle'];
  const payload = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === 'checkbox') {
        payload[id] = el.checked;
      } else {
        payload[id] = el.value;
      }
    }
  });
  try {
    await window.firebaseDb.collection('settings').doc('admin').set(payload, { merge: true });
    alert('Settings saved successfully.');
  } catch (error) {
    console.error('Failed to save settings:', error);
    alert('Failed to save settings.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', saveSettings);
  });
});
