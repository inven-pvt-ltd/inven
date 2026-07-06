const PortalMvp = {
  currency: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),

  async ready() {
    while (!window.firebaseAuth || !window.firebaseDb) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return new Promise((resolve) => {
      const stored = this.currentUser();
      if (stored) {
        resolve(stored);
        return;
      }

      window.firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
          window.location.href = this.loginPath();
          return;
        }

        const snap = await window.firebaseDb.collection('users').doc(firebaseUser.uid).get();
        const profile = snap.exists ? snap.data() : {};
        const user = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile.name || firebaseUser.email,
          role: profile.role || 'client',
          clientId: profile.clientId || firebaseUser.uid,
          avatar: (profile.name || firebaseUser.email || 'U').charAt(0).toUpperCase()
        };
        sessionStorage.setItem('portal_user', JSON.stringify(user));
        resolve(user);
      });
    });
  },

  currentUser() {
    try {
      return JSON.parse(sessionStorage.getItem('portal_user'));
    } catch (_error) {
      return null;
    }
  },

  loginPath() {
    return window.location.pathname.includes('/portal/admin/') ? '../login.html' : '/portal/login.html';
  },

  clientId(user) {
    return user.clientId || user.id || user.uid;
  },

  async getClientRows(collectionName, user, orderField = 'createdAt') {
    const db = window.firebaseDb;
    const clientId = this.clientId(user);
    const snapshot = await db.collection(collectionName).where('clientId', '==', clientId).get();
    const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (!orderField) return rows;
    return rows.sort((a, b) => this.sortDate(b[orderField]) - this.sortDate(a[orderField]));
  },

  async getAllRows(collectionName, orderField = 'createdAt') {
    let query = window.firebaseDb.collection(collectionName);
    if (orderField) query = query.orderBy(orderField, 'desc');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  date(value) {
    if (!value) return '-';
    const date = value.toDate ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  },

  sortDate(value) {
    if (!value) return new Date(0);
    return value.toDate ? value.toDate() : new Date(value);
  },

  bytes(bytes = 0) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${sizes[index]}`;
  },

  statusClass(status = '') {
    const normalized = status.toLowerCase();
    if (normalized.includes('complete') || normalized.includes('paid')) return 'badge-success';
    if (normalized.includes('progress') || normalized.includes('pending')) return 'badge-warning';
    if (normalized.includes('overdue') || normalized.includes('high')) return 'badge-danger';
    return 'badge-primary';
  },

  badge(label) {
    return `<span class="badge ${this.statusClass(label)}">${label || 'Pending'}</span>`;
  },

  async uploadFile(file, path) {
    if (!file) return null;
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
    const ref = window.firebaseStorage.ref(`${path}/${Date.now()}-${safeName}`);
    const snapshot = await ref.put(file);
    return {
      name: file.name,
      sizeBytes: file.size,
      contentType: file.type,
      storagePath: snapshot.ref.fullPath,
      url: await snapshot.ref.getDownloadURL()
    };
  },

  bindLogout() {
    document.addEventListener('click', async (event) => {
      if (!event.target.closest('[data-action="logout"]')) return;
      sessionStorage.removeItem('portal_user');
      if (window.firebaseAuth) await window.firebaseAuth.signOut();
      window.location.href = this.loginPath();
    });
  }
};

window.PortalMvp = PortalMvp;
PortalMvp.bindLogout();
