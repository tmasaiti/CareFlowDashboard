# ProjectFrost Care Management - Design Guidelines

## Design Approach

**Selected Framework:** Healthcare-optimized Material Design with custom medical UI patterns

**Philosophy:** Professional medical interface prioritizing information clarity, data hierarchy, and rapid task completion. The design balances clinical precision with approachable aesthetics to reduce cognitive load during high-stakes medical workflows.

**Key Principles:**
- Information density without clutter
- Instant status recognition through color coding
- Scannable data tables and medical records
- Clear action hierarchy for critical tasks
- Trust-building through professional polish

---

## Color System

### Primary Brand Colors

**Light Mode:**
- Primary Blue: 210 100% 45% (Medical trust blue - headers, primary actions)
- Primary Yellow: 45 95% 55% (Attention yellow - highlights, warnings)
- Background: 0 0% 98% (Clean medical white)
- Surface: 0 0% 100% (Card backgrounds)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%

**Dark Mode:**
- Primary Blue: 210 85% 55%
- Primary Yellow: 45 90% 65%
- Background: 220 15% 12%
- Surface: 220 12% 16%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

### Status Indicator Colors (Critical for Medical Context)

**Light & Dark Mode Variants:**
- **Done/Complete:** Green - Light: 142 70% 45% | Dark: 142 65% 55%
- **Pending/In Progress:** Yellow - Light: 45 95% 50% | Dark: 45 90% 60%
- **On Hold/Paused:** Orange - Light: 30 90% 55% | Dark: 30 85% 60%
- **Critical/Urgent:** Red - Light: 0 85% 50% | Dark: 0 80% 60%
- **Missed Deadline:** Dark Red - Light: 0 70% 35% | Dark: 0 75% 45%
- **Arrived/Active:** Teal - Light: 180 60% 45% | Dark: 180 55% 55%
- **Discharged/Inactive:** Gray - Light: 220 10% 55% | Dark: 220 8% 45%

### Accent & Semantic Colors
- Success: 142 70% 45%
- Warning: 45 95% 55%
- Error: 0 85% 50%
- Info: 210 100% 50%

---

## Typography

**Font Stack:** Inter (primary), system-ui, sans-serif

**Scale & Hierarchy:**
- **Display/Page Headers:** text-3xl (30px) font-bold tracking-tight
- **Section Headers:** text-2xl (24px) font-semibold
- **Subsection/Card Titles:** text-xl (20px) font-semibold
- **Body/Table Content:** text-base (16px) font-normal
- **Secondary/Helper Text:** text-sm (14px) font-normal text-secondary
- **Labels/Micro Text:** text-xs (12px) font-medium uppercase tracking-wide

**Medical Data Typography:**
- Patient vitals/metrics: text-2xl font-bold (numbers) + text-sm (units)
- Medical IDs: font-mono text-sm
- Timestamps: text-xs text-secondary

---

## Layout System

**Spacing Primitives:** Tailwind units 2, 4, 6, 8, 12, 16 (consistent medical UI rhythm)

**Container Strategy:**
- Dashboard/Main Views: max-w-7xl mx-auto
- Forms/Detail Pages: max-w-4xl mx-auto
- Modals: max-w-2xl
- Side Panels: w-80 to w-96

**Grid System:**
- Dashboard Metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Patient Cards: grid-cols-1 lg:grid-cols-2 gap-6
- Data Tables: Full-width with horizontal scroll on mobile

**Vertical Rhythm:**
- Page sections: py-8 to py-12
- Card padding: p-6
- Form sections: space-y-6
- List items: py-3 to py-4

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Height: h-16, sticky positioning
- Logo left, primary nav center, user profile/notifications right
- Blue background (primary brand color)
- White text with yellow accent for active states

**Sidebar (Optional for Multi-Section Views):**
- Fixed left, w-64
- Collapsible on tablet/mobile
- Vertical navigation with icon + label pattern

### Data Tables
**Medical Records Table:**
- Alternating row backgrounds (subtle zebra striping)
- Sticky header with sorting indicators
- Row hover states with subtle elevation
- Status badges in dedicated column
- Action menu (⋮) right-aligned per row
- Pagination: 25/50/100 rows per page

### Cards
**Patient Summary Card:**
- White background with subtle border
- Header with patient name + status badge
- Quick stats grid (2x2 or 3x2)
- Action buttons footer
- Elevation: shadow-sm on hover: shadow-md

**Metric/KPI Card:**
- Compact design for dashboard
- Large number display (text-3xl font-bold)
- Label below (text-sm text-secondary)
- Optional trend indicator (↑↓) with color
- Background: subtle blue or yellow tint based on status

### Status Badges
**Pill-Shaped Badges:**
- Rounded-full px-3 py-1
- Text: text-xs font-semibold uppercase
- Background: Status color at 15% opacity (light mode) / 25% (dark mode)
- Text color: Status color (full saturation)
- Border: 1px border of status color at 40% opacity

**Larger Status Indicators (for headers):**
- Rounded-lg px-4 py-2
- Include icon + text
- Can use solid background for critical statuses

### Buttons
**Primary Action (Medical-Critical):**
- Blue background (primary color)
- White text, font-semibold
- px-6 py-2.5 rounded-lg
- Shadow-sm with hover:shadow-md
- Yellow ring on focus for keyboard navigation

**Secondary/Cancel:**
- Border-2 border-gray-300
- Transparent background
- Gray-700 text
- Same padding/radius as primary

**Danger/Critical:**
- Red background for destructive actions
- White text with appropriate icon

### Forms & Inputs
**Text Inputs:**
- Border: 2px solid gray-300, focus: blue primary
- Rounded-lg px-4 py-2.5
- Full-width by default
- Label above (text-sm font-medium mb-2)
- Helper text below (text-xs text-secondary)
- Error state: red border + red text

**Multi-Step Wizard:**
- Progress indicator at top (step numbers + connecting lines)
- Active step: blue fill, completed: blue with checkmark, upcoming: gray outline
- Navigation: "Back" (secondary) and "Next/Save" (primary) buttons
- Form sections with clear headers (text-xl font-semibold mb-6)

**Select Dropdowns:**
- Match text input styling
- Chevron-down icon right-aligned
- Dropdown menu: shadow-lg, rounded-lg, max-h-60 overflow-auto

### Tabs
**Horizontal Tab Navigation:**
- Border-b-2 border-gray-200 on container
- Tab items: px-4 py-3 with hover states
- Active tab: border-b-4 border-blue-primary, text-blue-primary font-semibold
- Inactive: text-gray-600 hover:text-gray-900

### Modals & Overlays
**Modal Dialog:**
- Dark overlay (bg-black/50)
- Centered modal: rounded-xl shadow-2xl
- Header with title + close button
- Body with scroll if content exceeds viewport
- Footer with action buttons (right-aligned)

### Alerts & Notifications
**Alert Banners:**
- Full-width or contained
- Rounded-lg px-4 py-3
- Icon left, message center, dismiss right
- Color-coded by type (info: blue, warning: yellow, error: red, success: green)

**Toast Notifications:**
- Fixed positioning (top-right or bottom-right)
- Slide-in animation
- Auto-dismiss after 5 seconds
- Stack multiple toasts with gap-2

---

## Data Visualization

**Timeline View (Medical History):**
- Vertical line (border-l-2 border-blue-200)
- Circular markers at each event (w-4 h-4 rounded-full)
- Date on left, content on right
- Expandable entries (chevron indicator)

**Care Plan Progress:**
- Horizontal progress bars
- Percentage text overlay
- Color-coded by status
- Grouped by goal category

**Patient Vitals Dashboard:**
- Line charts or sparklines for trends
- Large current value with small historical context
- Color-coded ranges (normal, warning, critical)

---

## Images & Illustrations

**Minimal Image Usage:** This is a utility-focused medical application prioritizing data and functionality over marketing imagery.

**Where to Use Images:**
- **Login/Authentication Page:** Optional abstract medical illustration or blue/yellow gradient backdrop
- **Empty States:** Simple line art illustrations (e.g., "No patients found", "No care plans yet")
- **Patient Profiles:** Avatar/profile photo (circular, 48px-64px diameter)
- **Uploaded Documents:** Thumbnail previews in medical history attachments

**No Hero Images:** Dashboard and internal pages focus on data density and task completion, not marketing aesthetics.

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px-1024px (2-column grids, collapsible sidebar)
- Desktop: > 1024px (full layout with all columns)

**Mobile Adaptations:**
- Top nav becomes hamburger menu
- Data tables: horizontal scroll or card-based view
- Multi-column dashboards stack to single column
- Forms remain full-width with larger touch targets (py-3)

---

## Accessibility & Keyboard Navigation

- All interactive elements: visible focus rings (ring-2 ring-blue-500 ring-offset-2)
- Color is never the only indicator (icons + text for statuses)
- ARIA labels for icon-only buttons
- Keyboard shortcuts for common actions (display in tooltips)
- High contrast mode support with border reinforcements

---

This design system creates a professional, trustworthy healthcare interface with instant status recognition, efficient data scanning, and clear action hierarchy—essential for medical workflows where clarity can impact patient care.