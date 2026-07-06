async function initProfile() {
  const user = await PortalMvp.ready();
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('password-form');
  const profileMessage = document.getElementById('profile-message');
  const passwordMessage = document.getElementById('password-message');

  profileForm.name.value = user.name || '';
  profileForm.email.value = user.email || '';
  profileForm.role.value = user.role || 'client';

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await window.firebaseDb.collection('users').doc(user.id).set({
      name: profileForm.name.value.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    user.name = profileForm.name.value.trim();
    sessionStorage.setItem('portal_user', JSON.stringify(user));
    profileMessage.textContent = 'Profile saved.';
    profileMessage.className = 'status-message success';
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = passwordForm.password.value;
    if (password.length < 6) {
      passwordMessage.textContent = 'Use at least 6 characters.';
      passwordMessage.className = 'status-message error';
      return;
    }
    await window.firebaseAuth.currentUser.updatePassword(password);
    passwordForm.reset();
    passwordMessage.textContent = 'Password updated.';
    passwordMessage.className = 'status-message success';
  });
}

document.addEventListener('DOMContentLoaded', initProfile);
