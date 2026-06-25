async function loadDashboard() {
  // Wait for window.firebaseDb to be available
  while (!window.firebaseDb) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const db = window.firebaseDb;

  // Initialize counts and sums
  let totalClients = 0;
  let totalProjects = 0;
  let totalRevenue = 0;
  let openTickets = 0;

  // Elements to update
  const kpiTotalClients = document.getElementById('kpi-total-clients');
  const kpiActiveProjects = document.getElementById('kpi-active-projects');
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiOpenTickets = document.getElementById('kpi-open-tickets');

  const timelineList = document.getElementById('timeline-list');
  const projectsTable = document.getElementById('projects-table');
  const notificationsList = document.getElementById('notifications-list');

  // Clear containers
  if (timelineList) timelineList.innerHTML = '';
  if (projectsTable) projectsTable.innerHTML = '';
  if (notificationsList) notificationsList.innerHTML = '';

  try {
    // USERS - count clients
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.role === 'client') {
        totalClients++;
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    totalClients = 0;
  }

  try {
    // PROJECTS - count all
    const projectsSnapshot = await db.collection('projects').get();
    totalProjects = projectsSnapshot.size;

    // Populate projects table if exists
    if (projectsTable) {
      if (totalProjects === 0) {
        projectsTable.innerHTML = '<tr><td colspan="100%">No projects yet.</td></tr>';
      } else {
        projectsSnapshot.forEach(doc => {
          const project = doc.data();
          const tr = document.createElement('tr');

          // Assuming project has name, status, and deadline fields
          const nameTd = document.createElement('td');
          nameTd.textContent = project.name || 'Unnamed Project';
          tr.appendChild(nameTd);

          const statusTd = document.createElement('td');
          statusTd.textContent = project.status || 'Unknown';
          tr.appendChild(statusTd);

          const deadlineTd = document.createElement('td');
          deadlineTd.textContent = project.deadline || 'N/A';
          tr.appendChild(deadlineTd);

          projectsTable.appendChild(tr);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    totalProjects = 0;
    if (projectsTable) {
      projectsTable.innerHTML = '<tr><td colspan="100%">No projects yet.</td></tr>';
    }
  }

  try {
    // INVOICES - sum amount where status === 'paid'
    const invoicesSnapshot = await db.collection('invoices').get();
    invoicesSnapshot.forEach(doc => {
      const invoice = doc.data();
      if (invoice.status === 'paid' && typeof invoice.amount === 'number') {
        totalRevenue += invoice.amount;
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    totalRevenue = 0;
  }

  try {
    // TICKETS - count where status !== 'closed'
    const ticketsSnapshot = await db.collection('tickets').get();
    ticketsSnapshot.forEach(doc => {
      const ticket = doc.data();
      if (ticket.status !== 'closed') {
        openTickets++;
      }
    });

    // Populate timeline-list and notifications-list with tickets info
    if (timelineList) {
      if (ticketsSnapshot.empty) {
        timelineList.innerHTML = '<li>No tickets yet.</li>';
      } else {
        timelineList.innerHTML = '';
        ticketsSnapshot.forEach(doc => {
          const ticket = doc.data();
          const li = document.createElement('li');
          li.textContent = `Ticket: ${ticket.title || 'Untitled'} - Status: ${ticket.status || 'Unknown'}`;
          timelineList.appendChild(li);
        });
      }
    }

    if (notificationsList) {
      if (ticketsSnapshot.empty) {
        notificationsList.innerHTML = '<li>No notifications yet.</li>';
      } else {
        notificationsList.innerHTML = '';
        ticketsSnapshot.forEach(doc => {
          const ticket = doc.data();
          if (ticket.status !== 'closed') {
            const li = document.createElement('li');
            li.textContent = `Open ticket: ${ticket.title || 'Untitled'}`;
            notificationsList.appendChild(li);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    openTickets = 0;
    if (timelineList) timelineList.innerHTML = '<li>No tickets yet.</li>';
    if (notificationsList) notificationsList.innerHTML = '<li>No notifications yet.</li>';
  }

  // Update dashboard KPIs in DOM
  if (kpiTotalClients) kpiTotalClients.textContent = totalClients;
  if (kpiActiveProjects) kpiActiveProjects.textContent = totalProjects;
  if (kpiRevenue) kpiRevenue.textContent = totalRevenue.toFixed(2);
  if (kpiOpenTickets) kpiOpenTickets.textContent = openTickets;
}

document.addEventListener('DOMContentLoaded', loadDashboard);
