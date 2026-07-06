async function initClientInvoices() {
  const user = await PortalMvp.ready();
  const tbody = document.querySelector('#invoice-table tbody');
  const summary = document.getElementById('invoice-summary');

  try {
    const invoices = await PortalMvp.getClientRows('invoices', user, 'dueDate');
    const due = invoices.filter(item => (item.status || '').toLowerCase() !== 'paid')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    summary.textContent = `Outstanding: ${PortalMvp.currency.format(due)}`;

    if (!invoices.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No invoices available yet.</td></tr>';
      return;
    }

    tbody.innerHTML = invoices.map(invoice => `
      <tr>
        <td>${invoice.invoiceNumber || invoice.id}</td>
        <td>${invoice.project || '-'}</td>
        <td>${PortalMvp.currency.format(Number(invoice.amount || 0))}</td>
        <td>${PortalMvp.badge(invoice.status || 'Pending')}</td>
        <td>${PortalMvp.date(invoice.dueDate)}</td>
        <td>${invoice.pdfUrl ? `<a class="btn btn-sm btn-ghost" href="${invoice.pdfUrl}" target="_blank" rel="noopener">PDF</a>` : '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Unable to load invoices.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', initClientInvoices);
