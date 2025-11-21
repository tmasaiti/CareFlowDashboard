# Data Persistence Documentation

## Overview
ProjectFrost Care Management Portal uses **Dexie.js** (a wrapper around IndexedDB) for client-side data persistence. All data is stored locally in the browser and persists across page reloads and browser sessions.

## How Data Persistence Works

### Storage Technology
- **Dexie.js**: A minimalistic wrapper for IndexedDB
- **IndexedDB**: Browser-based NoSQL database
- **Location**: Data is stored in your browser's local storage (not on a server)
- **Persistence**: Data remains until explicitly deleted or browser storage is cleared

### Persisted Data Tables

#### Core Management Data
1. **Patients** - Patient records and demographics
2. **Medical History** - Diagnoses, allergies, medications, procedures
3. **Care Plans** - Patient care plans and templates
4. **Tasks** - Care tasks and their status
5. **Communications** - Notes, calls, emails, visits
6. **Staff** - Staff member information and credentials
7. **Shifts** - Staff scheduling and shift assignments

#### CQC Compliance Data
8. **Audit Logs** - Complete audit trail of all actions
9. **Risk Assessments** - Patient risk assessments and mitigation
10. **Compliance Evidence** - Documents, photos, certificates, signatures
11. **Safeguarding Incidents** - Incident reports and investigations
12. **Policies** - Policy documents and versions
13. **Policy Acknowledgments** - Staff policy acknowledgment tracking
14. **Training Records** - Staff training and certifications

## Database Configuration
- **Database Name**: `ProjectFrostDB`
- **Current Version**: 6
- **Location**: `client/src/lib/db.ts`

## Data Lifecycle

### Create
- Data is immediately saved to IndexedDB when created
- No server synchronization required
- Changes are atomic and transactional

### Read
- Data is queried directly from IndexedDB
- Real-time updates via `useLiveQuery` hook
- Instant access with no network latency

### Update
- Updates are saved immediately to IndexedDB
- UI automatically reflects changes via reactive queries
- Full transaction support ensures data integrity

### Delete
- Deletions are permanent within the browser
- Can be recovered only if exported beforehand

## Data Export/Backup
Currently, there is no built-in export feature. To backup data:
1. Use browser DevTools → Application → IndexedDB → ProjectFrostDB
2. Manually export tables as needed
3. Consider implementing JSON export functionality for backups

## Data Security
- Data is stored locally in the browser
- No data leaves the device unless explicitly exported
- Browser's same-origin policy protects data from other websites
- Consider implementing encryption for sensitive data in future versions

## Limitations
- **Storage Limit**: Browser-dependent (typically 50MB+, can go up to several GB)
- **Device-Specific**: Data doesn't sync between devices
- **Browser-Specific**: Data doesn't sync between different browsers
- **Clearing Browser Data**: Will delete all stored information

## Testing Data Persistence
1. Create a shift or add CQC compliance data
2. Refresh the page (F5 or Ctrl+R)
3. Data should still be present after reload
4. Close and reopen the browser - data persists

## Future Enhancements
- Cloud synchronization option
- Multi-device data sync
- Automated backup/export to file
- Data encryption at rest
- Import/export functionality
