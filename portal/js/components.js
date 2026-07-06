/**
 * INVEN Portal - Component Loader
 * Dynamically load navbar, sidebar, footer components
 */

class ComponentLoader {
  static async loadComponents() {
    try {
      const basePath = window.location.pathname.includes('/portal/') ? '/portal/' : '';
      const [navbar, sidebar, footer] = await Promise.all([
        fetch(`${basePath}components/navbar.html`).then(r => r.text()),
        fetch(`${basePath}components/sidebar.html`).then(r => r.text()),
        fetch(`${basePath}components/footer.html`).then(r => r.text())
      ]);

      // Inject components
      const navContainer = document.getElementById('navbar-container');
      if (navContainer) navContainer.innerHTML = navbar;

      const sidebarContainer = document.getElementById('sidebar-container');
      if (sidebarContainer) sidebarContainer.innerHTML = sidebar;

      const footerContainer = document.getElementById('footer-container');
      if (footerContainer) footerContainer.innerHTML = footer;

      // Initialize component behaviors
      this.initNavbar();
      this.initSidebar();
      this.initFooter();
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }

  static initNavbar() {
    // Dropdown functionality
    const userDropdown = document.querySelector('[data-dropdown="user"]');
    const dropdownMenu = document.querySelector('[data-dropdown-menu="user"]');

    if (userDropdown && dropdownMenu) {
      userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
      });

      document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
      });
    }

    // Search functionality
    const searchInput = document.querySelector('.navbar-search input');
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.borderColor = 'var(--color-primary)';
      });
      searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.borderColor = 'var(--color-border)';
      });
    }
  }

  static initSidebar() {
    // Navigation item active state
    const currentPage = document.body.dataset.page || window.location.pathname.split('/').pop().split('.')[0];
    const navItems = document.querySelectorAll('[data-page]');
    
    navItems.forEach(item => {
      if (item.dataset.page === currentPage || item.href.includes(currentPage)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Collapse button
    const collapseBtn = document.querySelector('[data-action="toggle-sidebar"]');
    const sidebar = document.querySelector('[data-component="sidebar"]');

    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }

  static initFooter() {
    // Footer functionality if needed
  }
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ComponentLoader.loadComponents());
} else {
  ComponentLoader.loadComponents();
}

window.ComponentLoader = ComponentLoader;
