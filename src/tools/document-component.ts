import { z } from 'zod';

export const documentComponentInputSchema = {
  componentType: z.enum([
    'button', 'link', 'modal', 'dialog', 'tabs', 'accordion',
    'menu', 'dropdown', 'tooltip', 'carousel', 'slider', 'form',
    'table', 'alert', 'toast', 'combobox', 'listbox', 'tree', 'grid', 'other'
  ]).describe('Type of UI component to document'),
  customName: z.string().optional().describe('Custom component name if type is "other"'),
  includeKeyboard: z.boolean().optional().default(true).describe('Include keyboard interaction documentation'),
  includeAria: z.boolean().optional().default(true).describe('Include ARIA attributes documentation'),
  includeScreenReader: z.boolean().optional().default(true).describe('Include screen reader expectations'),
};

interface ComponentDoc {
  name: string;
  description: string;
  wcagCriteria: string[];
  keyboard: {
    key: string;
    action: string;
  }[];
  aria: {
    attribute: string;
    usage: string;
    required: boolean;
  }[];
  screenReader: string[];
  codeExample: string;
  bestPractices: string[];
}

const componentDocs: Record<string, ComponentDoc> = {
  button: {
    name: 'Button',
    description: 'Interactive element that triggers an action when activated',
    wcagCriteria: ['4.1.2', '2.1.1', '2.5.3'],
    keyboard: [
      { key: 'Enter', action: 'Activates the button' },
      { key: 'Space', action: 'Activates the button' },
    ],
    aria: [
      { attribute: 'aria-pressed', usage: 'For toggle buttons, indicates pressed state (true/false)', required: false },
      { attribute: 'aria-expanded', usage: 'If button controls expandable content', required: false },
      { attribute: 'aria-haspopup', usage: 'If button opens a menu (menu/listbox/dialog)', required: false },
      { attribute: 'aria-disabled', usage: 'Indicates disabled state (prefer disabled attribute)', required: false },
    ],
    screenReader: [
      'Announces button role and accessible name',
      'Announces pressed/expanded state if applicable',
      'Announces disabled state if applicable',
    ],
    codeExample: `<button type="button" aria-pressed="false">
  Toggle Dark Mode
</button>`,
    bestPractices: [
      'Use native <button> element when possible',
      'Ensure visible text matches accessible name (Label in Name)',
      'Don\'t use title attribute as primary label',
      'Icon-only buttons need aria-label or visually hidden text',
    ],
  },

  modal: {
    name: 'Modal Dialog',
    description: 'Overlay window that requires user interaction before returning to main content',
    wcagCriteria: ['2.1.2', '2.4.3', '1.3.1', '4.1.2'],
    keyboard: [
      { key: 'Tab', action: 'Moves focus to next focusable element within dialog' },
      { key: 'Shift + Tab', action: 'Moves focus to previous focusable element within dialog' },
      { key: 'Escape', action: 'Closes the dialog' },
    ],
    aria: [
      { attribute: 'role="dialog"', usage: 'Identifies element as a dialog', required: true },
      { attribute: 'aria-modal="true"', usage: 'Indicates modal behavior (traps focus)', required: true },
      { attribute: 'aria-labelledby', usage: 'Points to dialog title element', required: true },
      { attribute: 'aria-describedby', usage: 'Points to dialog description (optional)', required: false },
    ],
    screenReader: [
      'Announces "dialog" role when opened',
      'Announces dialog title from aria-labelledby',
      'May announce description from aria-describedby',
      'Focus should be on dialog or first focusable element',
    ],
    codeExample: `<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <button type="button">Cancel</button>
  <button type="button">Confirm</button>
</div>`,
    bestPractices: [
      'Move focus to dialog on open (typically first focusable or dialog itself)',
      'Trap focus within dialog while open',
      'Return focus to trigger element on close',
      'Ensure Escape key closes dialog',
      'Consider using native <dialog> element',
    ],
  },

  tabs: {
    name: 'Tabs',
    description: 'Set of layered sections of content, showing one panel at a time',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Tab', action: 'Moves focus to the active tab, then to tab panel' },
      { key: 'Left Arrow', action: 'Moves focus to previous tab (activates in manual mode)' },
      { key: 'Right Arrow', action: 'Moves focus to next tab (activates in manual mode)' },
      { key: 'Home', action: 'Moves focus to first tab' },
      { key: 'End', action: 'Moves focus to last tab' },
      { key: 'Enter/Space', action: 'Activates focused tab (manual activation mode)' },
    ],
    aria: [
      { attribute: 'role="tablist"', usage: 'Container for tab elements', required: true },
      { attribute: 'role="tab"', usage: 'Each tab button', required: true },
      { attribute: 'role="tabpanel"', usage: 'Each content panel', required: true },
      { attribute: 'aria-selected', usage: 'true on active tab, false on others', required: true },
      { attribute: 'aria-controls', usage: 'Points from tab to its panel ID', required: true },
      { attribute: 'aria-labelledby', usage: 'Points from panel to its tab ID', required: true },
      { attribute: 'tabindex', usage: '-1 on inactive tabs, 0 on active tab', required: true },
    ],
    screenReader: [
      'Announces "tab" role and position (e.g., "tab 1 of 3")',
      'Announces selected state',
      'Announces tab name',
      'Panel announces as "tabpanel" with associated tab name',
    ],
    codeExample: `<div role="tablist" aria-label="Product Info">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">
    Description
  </button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Content for Description tab
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  Content for Reviews tab
</div>`,
    bestPractices: [
      'Only one tab in tab order at a time (use tabindex)',
      'Arrow keys move between tabs, Tab moves to panel',
      'Consider automatic activation vs manual activation',
      'Use aria-orientation for vertical tabs',
    ],
  },

  accordion: {
    name: 'Accordion',
    description: 'Vertically stacked set of interactive headings with show/hide content',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Enter/Space', action: 'Toggle expanded/collapsed state of focused header' },
      { key: 'Tab', action: 'Moves focus to next focusable element' },
      { key: 'Down Arrow', action: 'Moves focus to next accordion header (optional)' },
      { key: 'Up Arrow', action: 'Moves focus to previous accordion header (optional)' },
      { key: 'Home', action: 'Moves focus to first accordion header (optional)' },
      { key: 'End', action: 'Moves focus to last accordion header (optional)' },
    ],
    aria: [
      { attribute: 'aria-expanded', usage: 'true when panel is visible, false when hidden', required: true },
      { attribute: 'aria-controls', usage: 'Points to controlled panel ID', required: true },
      { attribute: 'aria-labelledby', usage: 'On panel, points to header button', required: false },
    ],
    screenReader: [
      'Announces button role and accessible name',
      'Announces expanded/collapsed state',
      'Content becomes accessible when expanded',
    ],
    codeExample: `<h3>
  <button aria-expanded="true" aria-controls="panel-1">
    Section 1
  </button>
</h3>
<div id="panel-1" role="region" aria-labelledby="accordion-header-1">
  Section 1 content...
</div>

<h3>
  <button aria-expanded="false" aria-controls="panel-2">
    Section 2
  </button>
</h3>
<div id="panel-2" hidden>
  Section 2 content...
</div>`,
    bestPractices: [
      'Use proper heading levels for headers',
      'Button inside heading for semantic structure',
      'Allow multiple panels open unless space is critical',
      'Consider role="region" on panels for landmark navigation',
    ],
  },

  menu: {
    name: 'Menu',
    description: 'List of actions or options that user can invoke',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1', '2.4.3'],
    keyboard: [
      { key: 'Enter/Space', action: 'Activates menu item and closes menu' },
      { key: 'Down Arrow', action: 'Moves focus to next menu item' },
      { key: 'Up Arrow', action: 'Moves focus to previous menu item' },
      { key: 'Home', action: 'Moves focus to first menu item' },
      { key: 'End', action: 'Moves focus to last menu item' },
      { key: 'Escape', action: 'Closes menu and returns focus to trigger' },
      { key: 'Character', action: 'Moves focus to item starting with that character' },
    ],
    aria: [
      { attribute: 'role="menu"', usage: 'Container element', required: true },
      { attribute: 'role="menuitem"', usage: 'Each action item', required: true },
      { attribute: 'aria-haspopup="menu"', usage: 'On trigger button', required: true },
      { attribute: 'aria-expanded', usage: 'On trigger, true when open', required: true },
      { attribute: 'tabindex="-1"', usage: 'On menu items (roving tabindex)', required: true },
    ],
    screenReader: [
      'Trigger announces "menu button" and expanded state',
      'Menu items announce role and name',
      'Position announced (e.g., "1 of 5")',
    ],
    codeExample: `<button aria-haspopup="menu" aria-expanded="false" aria-controls="actions-menu">
  Actions
</button>
<ul role="menu" id="actions-menu" hidden>
  <li role="menuitem" tabindex="-1">Edit</li>
  <li role="menuitem" tabindex="-1">Duplicate</li>
  <li role="menuitem" tabindex="-1">Delete</li>
</ul>`,
    bestPractices: [
      'Focus first item when menu opens',
      'Manage focus with roving tabindex',
      'Close menu on Escape or click outside',
      'Use menuitemcheckbox/menuitemradio for toggle items',
    ],
  },

  combobox: {
    name: 'Combobox',
    description: 'Input with popup list of options (autocomplete/select hybrid)',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1', '3.2.2'],
    keyboard: [
      { key: 'Down Arrow', action: 'Opens listbox and moves to first/next option' },
      { key: 'Up Arrow', action: 'Opens listbox and moves to last/previous option' },
      { key: 'Enter', action: 'Selects focused option and closes listbox' },
      { key: 'Escape', action: 'Closes listbox without selection' },
      { key: 'Home/End', action: 'Moves cursor in input field' },
      { key: 'Character', action: 'Types in input, filters options' },
    ],
    aria: [
      { attribute: 'role="combobox"', usage: 'On the input element', required: true },
      { attribute: 'aria-expanded', usage: 'true when listbox is visible', required: true },
      { attribute: 'aria-controls', usage: 'Points to listbox ID', required: true },
      { attribute: 'aria-activedescendant', usage: 'Points to focused option ID', required: true },
      { attribute: 'aria-autocomplete', usage: 'list, both, inline, or none', required: false },
      { attribute: 'role="listbox"', usage: 'On popup container', required: true },
      { attribute: 'role="option"', usage: 'On each option', required: true },
    ],
    screenReader: [
      'Announces "combobox" role and expanded state',
      'Announces active option as user arrows through',
      'Announces number of results when filtering',
    ],
    codeExample: `<label for="city-input">City</label>
<input
  id="city-input"
  role="combobox"
  aria-expanded="true"
  aria-controls="city-listbox"
  aria-activedescendant="city-1"
  aria-autocomplete="list"
>
<ul role="listbox" id="city-listbox">
  <li role="option" id="city-1" aria-selected="true">New York</li>
  <li role="option" id="city-2">Los Angeles</li>
  <li role="option" id="city-3">Chicago</li>
</ul>`,
    bestPractices: [
      'Announce number of results for screen readers',
      'Support both mouse and keyboard selection',
      'Clear filter on Escape if text was typed',
      'Consider loading states for async options',
    ],
  },

  alert: {
    name: 'Alert',
    description: 'Important message that attracts user attention without interrupting workflow',
    wcagCriteria: ['4.1.3', '1.3.1'],
    keyboard: [],
    aria: [
      { attribute: 'role="alert"', usage: 'For urgent messages that need immediate attention', required: true },
      { attribute: 'role="status"', usage: 'Alternative for non-urgent status updates', required: false },
      { attribute: 'aria-live="assertive"', usage: 'Implicit with role="alert"', required: false },
      { attribute: 'aria-atomic="true"', usage: 'Announce entire region on update', required: false },
    ],
    screenReader: [
      'Announces content immediately when it appears',
      'Interrupts current announcement for role="alert"',
      'Politely waits for role="status"',
    ],
    codeExample: `<!-- Urgent error -->
<div role="alert">
  Your session will expire in 2 minutes.
</div>

<!-- Non-urgent status -->
<div role="status">
  3 items added to cart.
</div>`,
    bestPractices: [
      'Use role="alert" sparingly (it interrupts)',
      'Prefer role="status" for non-critical updates',
      'Keep message concise',
      'Don\'t use for messages already in focus',
    ],
  },

  tooltip: {
    name: 'Tooltip',
    description: 'Popup that displays description for an element on hover/focus',
    wcagCriteria: ['1.4.13', '4.1.2'],
    keyboard: [
      { key: 'Escape', action: 'Dismisses the tooltip' },
      { key: 'Tab', action: 'Focus triggers tooltip on focusable elements' },
    ],
    aria: [
      { attribute: 'role="tooltip"', usage: 'On the tooltip container', required: true },
      { attribute: 'aria-describedby', usage: 'On trigger, points to tooltip ID', required: true },
    ],
    screenReader: [
      'Content announced as description of trigger element',
      'Announced after the element\'s name and role',
    ],
    codeExample: `<button aria-describedby="save-tip">
  <svg aria-hidden="true"><!-- save icon --></svg>
  <span class="visually-hidden">Save</span>
</button>
<div role="tooltip" id="save-tip" hidden>
  Save your changes (Ctrl+S)
</div>`,
    bestPractices: [
      'Tooltip must be dismissable (Escape key)',
      'Tooltip must be hoverable (WCAG 1.4.13)',
      'Tooltip must persist until dismissed',
      'Don\'t put interactive content in tooltips',
      'Use aria-describedby, not aria-labelledby',
    ],
  },

  form: {
    name: 'Form',
    description: 'Collection of form controls for user input',
    wcagCriteria: ['1.3.1', '1.3.5', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '4.1.2'],
    keyboard: [
      { key: 'Tab', action: 'Moves between form controls' },
      { key: 'Enter', action: 'Submits form (in input) or activates button' },
      { key: 'Space', action: 'Toggles checkbox, activates button' },
      { key: 'Arrow keys', action: 'Navigate radio groups, select options' },
    ],
    aria: [
      { attribute: 'aria-required', usage: 'Indicates required field', required: false },
      { attribute: 'aria-invalid', usage: 'Indicates validation error', required: false },
      { attribute: 'aria-describedby', usage: 'Points to help/error text', required: false },
      { attribute: 'aria-errormessage', usage: 'Points to error message', required: false },
      { attribute: 'autocomplete', usage: 'Identifies input purpose (WCAG 1.3.5)', required: false },
    ],
    screenReader: [
      'Label announced with each control',
      'Required state announced',
      'Invalid state and error message announced',
      'Help text announced as description',
    ],
    codeExample: `<form>
  <label for="email">Email (required)</label>
  <input
    type="email"
    id="email"
    required
    aria-required="true"
    aria-describedby="email-help email-error"
    aria-invalid="true"
    autocomplete="email"
  >
  <span id="email-help">We'll never share your email.</span>
  <span id="email-error" role="alert">Please enter a valid email.</span>

  <button type="submit">Subscribe</button>
</form>`,
    bestPractices: [
      'Every input needs a visible label',
      'Mark required fields and explain asterisk convention',
      'Show errors inline near the field',
      'Provide suggestions for fixing errors',
      'Use autocomplete for personal data fields',
    ],
  },

  table: {
    name: 'Data Table',
    description: 'Structured data in rows and columns',
    wcagCriteria: ['1.3.1', '1.3.2'],
    keyboard: [
      { key: 'Tab', action: 'Moves to interactive elements within table' },
      { key: 'Arrow keys', action: 'Navigate cells (in grid role)' },
    ],
    aria: [
      { attribute: 'scope', usage: 'col or row on th elements', required: true },
      { attribute: 'headers', usage: 'For complex tables with multiple headers', required: false },
      { attribute: 'aria-sort', usage: 'On sortable column headers', required: false },
      { attribute: 'aria-describedby', usage: 'Point to table caption/description', required: false },
    ],
    screenReader: [
      'Caption announces table purpose',
      'Headers announced with each data cell',
      'Row and column position available',
      'Sort state announced for sortable columns',
    ],
    codeExample: `<table>
  <caption>Q4 2024 Sales by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col" aria-sort="ascending">Sales</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North</th>
      <td>$1.2M</td>
      <td>+15%</td>
    </tr>
  </tbody>
</table>`,
    bestPractices: [
      'Use <caption> to describe table purpose',
      'Use <th> with scope for headers',
      'Don\'t use tables for layout',
      'Keep tables simple; avoid spanning cells',
      'For interactive tables, consider role="grid"',
    ],
  },

  carousel: {
    name: 'Carousel/Slideshow',
    description: 'Rotating content with multiple slides',
    wcagCriteria: ['1.3.1', '2.1.1', '2.2.2', '4.1.2'],
    keyboard: [
      { key: 'Tab', action: 'Moves to carousel controls and slide content' },
      { key: 'Left/Right Arrow', action: 'Navigate between slides (when focused)' },
      { key: 'Enter/Space', action: 'Activate pause/play or navigation buttons' },
    ],
    aria: [
      { attribute: 'aria-roledescription="carousel"', usage: 'On container', required: false },
      { attribute: 'role="group"', usage: 'On each slide', required: true },
      { attribute: 'aria-roledescription="slide"', usage: 'On each slide', required: false },
      { attribute: 'aria-label', usage: 'Slide position (e.g., "1 of 5")', required: true },
      { attribute: 'aria-live="polite"', usage: 'On slide container for auto-advance', required: false },
    ],
    screenReader: [
      'Announces carousel and current slide',
      'Announces slide change',
      'Pause/play state announced',
    ],
    codeExample: `<section aria-roledescription="carousel" aria-label="Featured Products">
  <button aria-label="Previous slide">←</button>
  <button aria-label="Pause auto-rotation">⏸</button>
  <button aria-label="Next slide">→</button>

  <div aria-live="polite">
    <div role="group" aria-roledescription="slide" aria-label="1 of 3">
      Slide 1 content
    </div>
  </div>
</section>`,
    bestPractices: [
      'Provide pause control for auto-advancing carousels',
      'Stop auto-advance on hover/focus',
      'Ensure all content accessible without carousel',
      'Consider if carousel is really needed',
    ],
  },

  slider: {
    name: 'Slider/Range',
    description: 'Input that allows selecting a value from a range',
    wcagCriteria: ['4.1.2', '2.1.1', '2.5.1'],
    keyboard: [
      { key: 'Right/Up Arrow', action: 'Increase value by step' },
      { key: 'Left/Down Arrow', action: 'Decrease value by step' },
      { key: 'Page Up', action: 'Increase value by larger step' },
      { key: 'Page Down', action: 'Decrease value by larger step' },
      { key: 'Home', action: 'Set to minimum value' },
      { key: 'End', action: 'Set to maximum value' },
    ],
    aria: [
      { attribute: 'role="slider"', usage: 'On the thumb/control element', required: true },
      { attribute: 'aria-valuenow', usage: 'Current value', required: true },
      { attribute: 'aria-valuemin', usage: 'Minimum value', required: true },
      { attribute: 'aria-valuemax', usage: 'Maximum value', required: true },
      { attribute: 'aria-valuetext', usage: 'Human-readable value (e.g., "$50")', required: false },
      { attribute: 'aria-orientation', usage: 'vertical if not horizontal', required: false },
    ],
    screenReader: [
      'Announces slider role and label',
      'Announces current value (valuetext if provided)',
      'Announces min/max on request',
    ],
    codeExample: `<label id="price-label">Price Range</label>
<div
  role="slider"
  aria-labelledby="price-label"
  aria-valuenow="50"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuetext="$50"
  tabindex="0"
>
  <!-- Visual slider track and thumb -->
</div>`,
    bestPractices: [
      'Prefer native <input type="range"> when possible',
      'Use aria-valuetext for meaningful values',
      'Ensure touch/drag has keyboard alternative',
      'Show current value visually',
    ],
  },

  link: {
    name: 'Link',
    description: 'Navigation element that takes user to a new location',
    wcagCriteria: ['2.4.4', '2.4.9', '4.1.2'],
    keyboard: [
      { key: 'Enter', action: 'Activates the link' },
    ],
    aria: [
      { attribute: 'aria-current', usage: 'Indicates current page/step (page, step, location)', required: false },
      { attribute: 'aria-describedby', usage: 'Additional context for link', required: false },
    ],
    screenReader: [
      'Announces "link" role and accessible name',
      'Opens in new tab/window should be announced',
      'Current page state announced if aria-current used',
    ],
    codeExample: `<!-- Standard link -->
<a href="/contact">Contact Us</a>

<!-- Link with new window warning -->
<a href="https://external.com" target="_blank">
  External Site
  <span class="visually-hidden">(opens in new tab)</span>
</a>

<!-- Current page in navigation -->
<a href="/products" aria-current="page">Products</a>`,
    bestPractices: [
      'Link text should describe destination',
      'Avoid "click here", "read more"',
      'Indicate if link opens new window/tab',
      'Don\'t use javascript:void(0) for buttons',
      'Links navigate, buttons perform actions',
    ],
  },

  dropdown: {
    name: 'Dropdown/Select',
    description: 'Single-select input with a list of options',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Space/Enter', action: 'Opens dropdown, selects focused option' },
      { key: 'Down Arrow', action: 'Opens dropdown, moves to next option' },
      { key: 'Up Arrow', action: 'Opens dropdown, moves to previous option' },
      { key: 'Escape', action: 'Closes dropdown' },
      { key: 'Character', action: 'Jumps to option starting with character' },
    ],
    aria: [
      { attribute: 'role="listbox"', usage: 'On options container (if custom)', required: true },
      { attribute: 'role="option"', usage: 'On each option (if custom)', required: true },
      { attribute: 'aria-expanded', usage: 'On button, true when open', required: true },
      { attribute: 'aria-haspopup="listbox"', usage: 'On trigger button', required: true },
      { attribute: 'aria-selected', usage: 'On selected option', required: true },
    ],
    screenReader: [
      'Announces "button" and "listbox" roles',
      'Announces selected value',
      'Announces options with selected state',
    ],
    codeExample: `<!-- Prefer native select when possible -->
<label for="country">Country</label>
<select id="country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Custom dropdown -->
<label id="sort-label">Sort by</label>
<button aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sort-label">
  Newest
</button>
<ul role="listbox" hidden>
  <li role="option" aria-selected="true">Newest</li>
  <li role="option" aria-selected="false">Price: Low to High</li>
</ul>`,
    bestPractices: [
      'Prefer native <select> for better support',
      'Manage focus within options list',
      'Close on selection or click outside',
      'Support type-ahead for long lists',
    ],
  },

  toast: {
    name: 'Toast Notification',
    description: 'Temporary message that appears and auto-dismisses',
    wcagCriteria: ['4.1.3', '2.2.1'],
    keyboard: [
      { key: 'Escape', action: 'Dismiss toast (if interactive)' },
      { key: 'Tab', action: 'Move to toast actions (if interactive)' },
    ],
    aria: [
      { attribute: 'role="status"', usage: 'For non-urgent informational toasts', required: true },
      { attribute: 'role="alert"', usage: 'For urgent error toasts only', required: false },
      { attribute: 'aria-live="polite"', usage: 'Implicit with role="status"', required: false },
    ],
    screenReader: [
      'Announces when toast appears',
      'status role waits politely',
      'alert role interrupts',
    ],
    codeExample: `<!-- Success toast -->
<div role="status" class="toast">
  Settings saved successfully.
  <button aria-label="Dismiss">×</button>
</div>

<!-- Error toast -->
<div role="alert" class="toast toast-error">
  Failed to save. Please try again.
  <button>Retry</button>
</div>`,
    bestPractices: [
      'Don\'t auto-dismiss error messages',
      'Provide enough time to read (WCAG 2.2.1)',
      'Allow dismissal',
      'Don\'t stack too many toasts',
      'Consider if toast is the right pattern',
    ],
  },

  listbox: {
    name: 'Listbox',
    description: 'List of options where one or more can be selected',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Down Arrow', action: 'Move focus to next option' },
      { key: 'Up Arrow', action: 'Move focus to previous option' },
      { key: 'Home', action: 'Move focus to first option' },
      { key: 'End', action: 'Move focus to last option' },
      { key: 'Space', action: 'Toggle selection (multi-select)' },
      { key: 'Ctrl + A', action: 'Select all (multi-select)' },
      { key: 'Character', action: 'Jump to option starting with character' },
    ],
    aria: [
      { attribute: 'role="listbox"', usage: 'On container', required: true },
      { attribute: 'role="option"', usage: 'On each option', required: true },
      { attribute: 'aria-selected', usage: 'Selection state on options', required: true },
      { attribute: 'aria-multiselectable', usage: 'true if multiple selection allowed', required: false },
      { attribute: 'aria-activedescendant', usage: 'Points to focused option', required: false },
    ],
    screenReader: [
      'Announces "listbox" role',
      'Announces multiselectable if applicable',
      'Announces option with selection state',
      'Announces position (e.g., "3 of 10")',
    ],
    codeExample: `<label id="toppings-label">Select toppings</label>
<ul role="listbox" aria-labelledby="toppings-label" aria-multiselectable="true">
  <li role="option" aria-selected="false">Pepperoni</li>
  <li role="option" aria-selected="true">Mushrooms</li>
  <li role="option" aria-selected="false">Olives</li>
</ul>`,
    bestPractices: [
      'Use native <select multiple> when possible',
      'Manage focus with roving tabindex or aria-activedescendant',
      'Provide clear selection feedback',
      'Consider checkboxes for better touch support',
    ],
  },

  tree: {
    name: 'Tree View',
    description: 'Hierarchical list with expandable/collapsible nodes',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Down Arrow', action: 'Move to next visible node' },
      { key: 'Up Arrow', action: 'Move to previous visible node' },
      { key: 'Right Arrow', action: 'Expand node, or move to first child' },
      { key: 'Left Arrow', action: 'Collapse node, or move to parent' },
      { key: 'Home', action: 'Move to first node' },
      { key: 'End', action: 'Move to last visible node' },
      { key: 'Enter', action: 'Activate node' },
      { key: 'Character', action: 'Move to next node starting with character' },
    ],
    aria: [
      { attribute: 'role="tree"', usage: 'On container', required: true },
      { attribute: 'role="treeitem"', usage: 'On each node', required: true },
      { attribute: 'role="group"', usage: 'On nested container', required: true },
      { attribute: 'aria-expanded', usage: 'On parent nodes', required: true },
      { attribute: 'aria-selected', usage: 'If tree is selectable', required: false },
    ],
    screenReader: [
      'Announces tree and treeitem roles',
      'Announces expanded/collapsed state',
      'Announces level and position',
      'Announces selection state if applicable',
    ],
    codeExample: `<ul role="tree" aria-label="File browser">
  <li role="treeitem" aria-expanded="true">
    Documents
    <ul role="group">
      <li role="treeitem">Resume.pdf</li>
      <li role="treeitem">Cover Letter.pdf</li>
    </ul>
  </li>
  <li role="treeitem" aria-expanded="false">
    Images
    <ul role="group" hidden>
      <li role="treeitem">photo.jpg</li>
    </ul>
  </li>
</ul>`,
    bestPractices: [
      'Use proper nesting with role="group"',
      'Manage focus with roving tabindex',
      'Indicate level visually and programmatically',
      'Consider virtualization for large trees',
    ],
  },

  grid: {
    name: 'Data Grid',
    description: 'Interactive table with cell-level keyboard navigation',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1'],
    keyboard: [
      { key: 'Arrow keys', action: 'Navigate between cells' },
      { key: 'Home', action: 'Move to first cell in row' },
      { key: 'End', action: 'Move to last cell in row' },
      { key: 'Ctrl + Home', action: 'Move to first cell in grid' },
      { key: 'Ctrl + End', action: 'Move to last cell in grid' },
      { key: 'Page Down/Up', action: 'Scroll by page' },
      { key: 'Enter', action: 'Enter edit mode or activate' },
      { key: 'Escape', action: 'Exit edit mode' },
    ],
    aria: [
      { attribute: 'role="grid"', usage: 'On table/container', required: true },
      { attribute: 'role="row"', usage: 'On each row', required: true },
      { attribute: 'role="gridcell"', usage: 'On data cells', required: true },
      { attribute: 'role="rowheader"', usage: 'On row header cells', required: false },
      { attribute: 'role="columnheader"', usage: 'On column header cells', required: false },
      { attribute: 'aria-colindex', usage: 'Column position (for virtual grids)', required: false },
      { attribute: 'aria-rowindex', usage: 'Row position (for virtual grids)', required: false },
    ],
    screenReader: [
      'Announces grid/table structure',
      'Announces row and column position',
      'Announces cell content and headers',
      'Announces edit mode if applicable',
    ],
    codeExample: `<table role="grid" aria-label="Quarterly Sales">
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col">Product</th>
      <th role="columnheader" scope="col" aria-sort="ascending">Q1</th>
      <th role="columnheader" scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <th role="rowheader" scope="row">Widget</th>
      <td role="gridcell" tabindex="-1">$10,000</td>
      <td role="gridcell" tabindex="-1">$12,000</td>
    </tr>
  </tbody>
</table>`,
    bestPractices: [
      'Use role="grid" only for interactive tables',
      'Implement full arrow key navigation',
      'Support cell editing if needed',
      'Use aria-colindex/rowindex for virtual scrolling',
    ],
  },

  other: {
    name: 'Custom Component',
    description: 'Guidelines for building accessible custom components',
    wcagCriteria: ['4.1.2', '1.3.1', '2.1.1', '2.4.7'],
    keyboard: [
      { key: 'Tab', action: 'Move focus to/from component' },
      { key: 'Arrow keys', action: 'Navigate within component (common pattern)' },
      { key: 'Enter/Space', action: 'Activate current item' },
      { key: 'Escape', action: 'Close/cancel operation' },
    ],
    aria: [
      { attribute: 'role', usage: 'Appropriate role for component type', required: true },
      { attribute: 'aria-label/labelledby', usage: 'Accessible name', required: true },
      { attribute: 'tabindex', usage: '0 for focusable, -1 for programmatic focus', required: true },
      { attribute: 'aria-*', usage: 'States and properties as needed', required: false },
    ],
    screenReader: [
      'Must announce role clearly',
      'Must announce accessible name',
      'Must announce relevant states',
      'Must announce changes dynamically',
    ],
    codeExample: `<!-- Custom component template -->
<div
  role="[appropriate-role]"
  aria-label="[or aria-labelledby]"
  tabindex="0"
>
  <!-- Component content -->
</div>`,
    bestPractices: [
      'Prefer native HTML elements when possible',
      'Follow ARIA Authoring Practices patterns',
      'Test with multiple screen readers',
      'Ensure full keyboard operability',
      'Provide visible focus indicator',
      'Announce state changes to AT',
    ],
  },
};

function formatComponentDoc(
  doc: ComponentDoc,
  options: { includeKeyboard: boolean; includeAria: boolean; includeScreenReader: boolean }
): string {
  const lines = [
    `# ${doc.name} - Accessibility Documentation`,
    '',
    doc.description,
    '',
    `**Related WCAG Criteria:** ${doc.wcagCriteria.join(', ')}`,
    '',
  ];

  if (options.includeKeyboard && doc.keyboard.length > 0) {
    lines.push('## Keyboard Interactions');
    lines.push('');
    lines.push('| Key | Action |');
    lines.push('|-----|--------|');
    doc.keyboard.forEach(k => {
      lines.push(`| \`${k.key}\` | ${k.action} |`);
    });
    lines.push('');
  }

  if (options.includeAria) {
    lines.push('## ARIA Attributes');
    lines.push('');
    doc.aria.forEach(a => {
      const required = a.required ? ' **(required)**' : '';
      lines.push(`- \`${a.attribute}\`${required}: ${a.usage}`);
    });
    lines.push('');
  }

  if (options.includeScreenReader) {
    lines.push('## Screen Reader Expectations');
    lines.push('');
    doc.screenReader.forEach(sr => {
      lines.push(`- ${sr}`);
    });
    lines.push('');
  }

  lines.push('## Code Example');
  lines.push('');
  lines.push('```html');
  lines.push(doc.codeExample);
  lines.push('```');
  lines.push('');

  lines.push('## Best Practices');
  lines.push('');
  doc.bestPractices.forEach(bp => {
    lines.push(`- ${bp}`);
  });
  lines.push('');

  return lines.join('\n');
}

export async function documentComponent(args: {
  componentType: string;
  customName?: string;
  includeKeyboard?: boolean;
  includeAria?: boolean;
  includeScreenReader?: boolean;
}): Promise<string> {
  const {
    componentType,
    customName,
    includeKeyboard = true,
    includeAria = true,
    includeScreenReader = true,
  } = args;

  const doc = componentDocs[componentType];
  if (!doc) {
    const available = Object.keys(componentDocs).filter(k => k !== 'other').join(', ');
    return `Component type "${componentType}" not found.\n\nAvailable types: ${available}\n\nUse "other" for custom components.`;
  }

  const docToFormat = componentType === 'other' && customName
    ? { ...doc, name: customName }
    : doc;

  return formatComponentDoc(docToFormat, { includeKeyboard, includeAria, includeScreenReader });
}
