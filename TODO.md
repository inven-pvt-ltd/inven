# TODO - INVEN Admin Portal Client Management System

- [ ] Inspect existing `/portal/admin` UI and JS for current client/file/invoice/revision assumptions.
- [ ] Implement reusable Firebase admin client service layer under `/portal/admin/js/admin-services.js`.
- [ ] Add Admin Clients module UI: `/portal/admin/clients.html` and multi-step wizard: `/portal/admin/client-wizard.html`.
- [ ] Add Admin Client Profile page: `/portal/admin/client-profile.html` + controller `/portal/admin/js/client-profile.js`.
- [ ] Implement `createClientUser` Flow:
  - [ ] Call callable function `createClientUser` from Admin Portal during wizard finish.
  - [ ] After function returns UID, initialize default client data structures.
- [ ] Remove manual client-ID hardcoding from `/portal/admin/files.html` + `/portal/admin/js/files.js` (add client selector, scope by clientId).
- [ ] Replace global invoice/dashboard/revision queries with client-scoped, seed-filtered queries.
- [ ] Add Notifications + Activity generation on admin actions.
- [ ] Add messaging, website request status updates, and project management within client profile.
- [ ] Update empty states/loading/success/error notifications across new modules.
- [ ] Ensure client portal remains dynamically filtered by authenticated UID (verify no hardcoded client IDs remain in admin-created flows).
- [ ] Validate Firestore schema consistency and seed doc handling.

