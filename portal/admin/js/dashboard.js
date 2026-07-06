async function loadDashboard() {
  while (!window.firebaseDb) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const db = window.firebaseDb;
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const clientsEl = document.getElementById('kpi-total-clients');
  const projectsEl = document.getElementById('kpi-active-projects');
  const revenueEl = document.getElementById('kpi-revenue');
  const revisionsEl = document.getElementById('kpi-open-revisions');
  const timelineList = document.getElementById('timeline-list');
  const projectsTable = document.getElementById('projects-table');

  const [usersSnap, projectsSnap, invoicesSnap, revisionsSnap] = await Promise.all([
    db.collection('users').get().catch(() => ({ docs: [] })),
    db.collection('projects').get().catch(() => ({ docs: [] })),
    db.collection('invoices').get().catch(() => ({ docs: [] })),
    db.collection('revisionRequests').orderBy('createdAt', 'desc').get().catch(() => ({ docs: [] }))
  ]);

  const users = usersSnap.docs.map(doc => doc.data());
  const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const invoices = invoicesSnap.docs.map(doc => doc.data());
  const revisions = revisionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  clientsEl.textContent = users.filter(user => (user.role || '').toLowerCase() === 'client').length;
  projectsEl.textContent = projects.filter(project => (project.status || '').toLowerCase() !== 'completed').length;
  revenueEl.textContent = money.format(invoices.filter(invoice => (invoice.status || '').toLowerCase() === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0));
  revisionsEl.textContent = revisions.filter(item => (item.status || 'Pending') !== 'Completed').length;

  timelineList.innerHTML = revisions.length
    ? revisions.slice(0, 6).map(item => `<li class="timeline-item"><span class="timeline-dot"></span><div class="timeline-content"><div class="timeline-desc">${item.title || 'Revision request'} - ${item.status || 'Pending'}</div><div class="timeline-time">${item.clientName || item.clientId || 'Client'}</div></div></li>`).join('')
    : '<li class="timeline-item"><div class="timeline-content"><div class="timeline-desc">No revision requests yet.</div></div></li>';

  projectsTable.innerHTML = projects.length
    ? projects.slice(0, 8).map(project => `<tr><td>${project.name || 'Project'}</td><td>${project.client || project.clientName || project.clientId || '-'}</td><td><div class="progress-bar-bg"><div class="progress-bar" style="width:${Number(project.progress || 0)}%"></div></div></td><td>${project.status || '-'}</td><td>${project.deadline || '-'}</td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;">No projects available.</td></tr>';
}

document.addEventListener('DOMContentLoaded', loadDashboard);
