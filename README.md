# Segment Builder - AI-Powered Customer Segmentation Tool

A modern, intuitive customer segmentation interface that combines conversational AI with manual condition building. Built as a high-fidelity prototype for modern e-commerce platforms.

## Overview

Segment Builder allows users to create complex customer segments through natural language or manual input. The tool intelligently parses user intent and translates it into structured segmentation conditions with support for AND/OR logic.

## Features

### 🤖 AI-Powered Condition Creation
- Natural language processing for condition building
- Automatic detection of AND/OR logic from user prompts
- Intelligent parsing of fields, operators, values, and time ranges
- Real-time condition generation from chat input

### ✏️ Manual Condition Building
- Click-to-add manual condition creation
- Smart form fields that adapt based on selections
- Field-specific operators and input types
- Validation and helpful placeholder text

### 🔀 Advanced Logic Control
- Visual AND/OR operators between conditions
- Click-to-toggle logic switching
- Color-coded logic pills (blue for AND, purple for OR)
- Clear visual flow of condition relationships

### 📝 Inline Editing
- Expandable condition cards for editing
- No disruptive modals - all editing happens inline
- Smooth animations and auto-scroll to keep forms visible
- Save/cancel controls per condition

### 🎨 Polished UI/UX
- Responsive design that works on all screen sizes
- Smooth animations and transitions throughout
- Color-coded condition types
- Toast notifications for user feedback
- Professional, modern interface design

### 💾 Segment Management
- Save segments with auto-generated names
- Editable segment naming
- Condition summary before saving
- Estimated audience size calculation
- Success celebration with segment creation

## Tech Stack

- **React** - UI framework
- **Framer Motion** - Animation library
- **Tailwind CSS** - Styling and design system
- **Vite** - Build tool and dev server

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd segment-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Creating Conditions via AI

1. Type a natural language description in the chat input:
   - *"customers who purchased in last 60 days"*
   - *"also filter out those who got email in 3 days"*
   - *"or VIP customers"*

2. Watch as conditions appear in the right panel automatically

3. AND/OR logic is detected from your language:
   - Use "also filter" or "and" for AND logic
   - Use "or" for OR logic

### Adding Conditions Manually

1. Click the **"+ Add Condition"** button
2. Select a field type (Shopify Purchase, Email Received, etc.)
3. Choose an operator (is, is not, contains, etc.)
4. Enter a value
5. Select time range if applicable
6. Click **"Save"** to add the condition

### Editing Conditions

1. Hover over any condition card
2. Click the edit icon (✏️)
3. The card expands inline with editable fields
4. Make your changes
5. Click **"Save Changes"** or **"Cancel"**

### Managing Logic Operators

1. Click any AND/OR pill between conditions
2. Select AND or OR from the dropdown
3. Watch the color change (blue = AND, purple = OR)

### Saving Segments

1. Add at least one condition
2. Click **"Save Segment"** (disabled until conditions exist)
3. Review the auto-generated segment name (editable)
4. Review condition summary
5. Click **"Create Segment"**
6. See success confirmation with estimated audience

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx       # Chat UI and input handling
│   ├── ConditionBar.jsx         # Right panel with conditions list
│   ├── ConditionCard.jsx        # Individual condition display/edit
│   ├── LogicOperator.jsx        # AND/OR pills between conditions
│   ├── SaveSegmentModal.jsx     # Modal for saving segments
│   ├── SuccessState.jsx         # Success confirmation screen
│   └── Toast.jsx                # Toast notification component
├── utils/
│   ├── aiParser.js              # Natural language parsing logic
│   └── mockResponses.js         # AI response templates
├── App.jsx                      # Main app component and state
└── main.jsx                     # App entry point
```

## Component Details

### ChatInterface
Handles user input and displays conversation history. Includes example prompts, message threading, and auto-scroll functionality.

**Props:**
- `onConditionsUpdate` - Callback when new conditions are created
- `messages` - Array of chat messages
- `onSendMessage` - Handler for sending new messages

### ConditionBar
Right panel displaying all conditions with add/edit/delete capabilities. Manages scrolling, empty states, and footer actions.

**Props:**
- `conditions` - Array of condition objects
- `onEditCondition` - Handler for editing conditions
- `onDeleteCondition` - Handler for deleting conditions
- `onClearAll` - Handler for clearing all conditions
- `onSave` - Handler for saving segment

### ConditionCard
Displays individual conditions with view/edit modes. Handles inline expansion for editing and validation.

**Props:**
- `condition` - Condition object with field, operator, value, timeRange
- `onEdit` - Callback when condition is edited
- `onDelete` - Callback when condition is deleted

### LogicOperator
Visual AND/OR pill between conditions with click-to-toggle functionality.

**Props:**
- `operator` - Current operator ('AND' or 'OR')
- `onChange` - Callback when operator changes

## Condition Data Structure

```javascript
{
  id: "unique-id",
  field: "Shopify Purchase",      // Field type
  operator: "is",                  // Comparison operator
  value: "None",                   // Value to compare
  timeRange: "Last 60 days",       // Optional time constraint
  logicOperator: "AND",            // Logic to next condition
  isNew: false,                    // Is this unsaved?
  isExpanded: false                // Is edit mode active?
}
```

## Available Field Types

- **🛍️ Shopify Purchase** - Customer purchase activity
- **📧 Email Received** - Email engagement tracking
- **🏷️ Customer Tag** - Customer labels and categories
- **🛒 Cart Value** - Shopping cart amounts
- **👤 Customer Status** - Account status
- **📅 Last Activity** - Recent interaction tracking
- **📍 Location** - Geographic customer data

## Operator Types by Field

**Text Fields:** is, is not, contains, does not contain

**Numeric Fields:** equals, greater than, less than, between

**Date/Time Fields:** in last, before, after, is none

## Key Features Implementation

### Auto-Scroll on Expand
When a condition card expands or a new manual condition is added, the container automatically scrolls to ensure the entire form is visible.

### Smart Form Fields
Form fields dynamically change based on selections:
- Operators adapt to field type
- Value input changes based on operator
- Time range only shows for date/time fields

### Validation
- Required field checking before save
- Inline error messages
- Disabled save states with tooltips
- Real-time validation feedback

### Animations
- Smooth entrance/exit for conditions
- Expandable card height transitions
- Logic operator fade-in effects
- Toast slide-in notifications
- Success celebration effects

## Development Notes

### State Management
All condition state is managed in `App.jsx` and passed down to child components. This ensures a single source of truth and predictable data flow.

### Animation Strategy
Framer Motion is used throughout for smooth animations. Only new elements animate on entrance; existing elements remain stable to prevent jarring layout shifts.

### Responsive Design
The layout adapts to different screen sizes:
- Desktop: Two-column layout with chat and conditions side-by-side
- Mobile: Stacked layout with full-width components

## Future Enhancements

- **Condition Grouping** - Visual bracketing for complex logic
- **Custom Time Ranges** - Date picker for precise time selection
- **Template Segments** - Pre-built segment templates
- **Segment Preview** - Live customer count updates
- **Export Functionality** - Export segments to CSV/JSON
- **Keyboard Shortcuts** - Power user keyboard navigation
- **Undo/Redo** - Action history management
- **Drag-and-Drop** - Reorder conditions with drag
- **Advanced Operators** - More comparison options (regex, ranges)
- **Multi-Language** - Internationalization support

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Modern browsers with ES6+ support required.

## Performance Considerations

- Optimized re-renders with React.memo where needed
- Debounced AI parsing for long inputs
- Smooth animations with GPU acceleration
- Efficient scroll handling for large condition lists

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management for expanded cards
- Screen reader friendly structure
- High contrast color schemes

## License

This is a prototype/demonstration project.

## Contact

For questions or feedback about this prototype, please reach out through the repository issues.

---

**Built with attention to detail and modern UX principles** ✨