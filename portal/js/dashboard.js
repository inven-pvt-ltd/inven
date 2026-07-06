async function initDashboard() {
  const user = await PortalMvp.ready();
  const projectList = document.getElementById('project-progress-list');
  const activityList = document.getElementById('recent-activity-list');
  const paymentDue = document.getElementById('next-payment-due');

  const [projects, revisions, invoices, files] = await Promise.all([
    PortalMvp.getClientRows('projects', user, 'updatedAt').catch(() => []),
    PortalMvp.getClientRows('revisionRequests', user, 'createdAt').catch(() => []),
    PortalMvp.getClientRows('invoices', user, 'dueDate').catch(() => []),
    PortalMvp.getClientRows('files', user, 'uploadedAt').catch(() => [])
  ]);

  const activeProjects = projects.filter(project => (project.status || '').toLowerCase() !== 'completed');
  const openRevisions = revisions.filter(item => (item.status || 'Pending') !== 'Completed');
  const unpaidInvoices = invoices.filter(invoice => (invoice.status || '').toLowerCase() !== 'paid');
  const nextInvoice = unpaidInvoices.sort((a, b) => PortalMvp.sortDate(a.dueDate) - PortalMvp.sortDate(b.dueDate))[0];

  document.getElementById('active-projects').textContent = activeProjects.length;
  document.getElementById('open-revisions').textContent = openRevisions.length;
  document.getElementById('shared-files').textContent = files.length;
  document.getElementById('outstanding-balance').textContent = PortalMvp.currency.format(
    unpaidInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
  );

  paymentDue.textContent = nextInvoice
    ? `${PortalMvp.currency.format(Number(nextInvoice.amount || 0))} due ${PortalMvp.date(nextInvoice.dueDate)}`
    : 'No payment currently due';

  projectList.innerHTML = projects.length
    ? projects.slice(0, 4).map(project => {
      const progress = Math.max(0, Math.min(100, Number(project.progress || 0)));
      return `
        <div class="progress-item">
          <div class="progress-header">
            <span class="progress-label">${project.name || 'Project'}</span>
            <span class="progress-percentage">${progress}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
        </div>
      `;
    }).join('')
    : '<p class="empty-state">No projects added yet.</p>';

  const activity = [
    ...revisions.map(item => ({ type: 'Revision', title: item.title, date: item.createdAt, detail: item.status || 'Pending' })),
    ...files.map(item => ({ type: 'File', title: item.name, date: item.uploadedAt, detail: 'Uploaded' })),
    ...invoices.map(item => ({ type: 'Invoice', title: item.invoiceNumber || item.project, date: item.dueDate, detail: item.status || 'Pending' }))
  ].sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return dateB - dateA;
  }).slice(0, 6);

  activityList.innerHTML = activity.length
    ? activity.map(item => `
      <div class="activity-item">
        <div class="activity-icon">${item.type.charAt(0)}</div>
        <div class="activity-content">
          <div class="activity-title">${item.title || item.type}</div>
          <div class="activity-description">${item.type} - ${item.detail}</div>
          <div class="activity-time">${PortalMvp.date(item.date)}</div>
        </div>
      </div>
    `).join('')
    : '<p class="empty-state">No recent activity yet.</p>';
}

document.addEventListener('DOMContentLoaded', initDashboard);
