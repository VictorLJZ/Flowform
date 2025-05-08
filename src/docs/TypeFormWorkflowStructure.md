# TypeForm-Style Workflow Connection Structure

## Overview

This document describes the ideal structure and behavior for a TypeForm-like workflow connection system. This structure prioritizes flexibility, intuitiveness, and power while maintaining a clean user interface.

## Connection Data Structure

### Rule-Based Connection Model

Each connection between blocks contains:

1. **Source Block ID**: The originating block
2. **Rules Collection**: Multiple independent rules that determine workflow branches
3. **Default Rule**: A fallback path for when no rules match

### Rule Structure

Each rule consists of:

1. **Conditions**: Logic criteria for when this rule applies
2. **Target Block ID**: Where to send the user when conditions are met
3. **Rule ID**: Unique identifier
4. **Order**: Priority sequence (rules are evaluated in order)

### Condition Structure

Conditions support:

1. **Simple Conditions**: Field + Operator + Value (e.g., "name equals John")
2. **Compound Conditions**: Multiple conditions joined by AND/OR operators
3. **Nested Groups**: Parenthetical grouping for complex logic (e.g., (A AND B) OR C)

## Block Navigation Logic

1. When a user completes a block, all rules are evaluated in sequence
2. The first rule with matching conditions determines the next block
3. If no rules match, the default path is followed
4. If no default path exists, the next sequential block is shown

## UI Components & Behavior

### Rule Card UI

Each rule card includes:

1. **IF Section**: Displays the condition(s) that trigger this rule
   - Field selector (which question/field to evaluate)
   - Operator selector (equals, not equals, contains, etc.)
   - Value input (what to compare against)
   - Compound condition controls (AND/OR)
   - Add/remove condition buttons
   
2. **THEN Section**: Shows the destination block
   - Target block selector dropdown
   - Visual confirmation of selected target
   
3. **Rule Management**: 
   - Delete rule button
   - Drag handle for reordering (optional)

### Connection Management

1. **Add Rule Button**: Creates a new rule card with empty conditions
2. **Default Path Section**: "All other cases go to..." with block selector
3. **Rule Ordering**: Visual indication of evaluation order

### Visual Design

1. **Distinct Cards**: Each rule is a distinct, self-contained card
2. **Contextual Controls**: Only relevant controls appear based on condition type
3. **Inline Editing**: All settings can be changed without opening modal dialogs
4. **Clear Hierarchy**: Visual distinction between rules, conditions, and the default path

## Special Features

1. **Condition Preview**: Show example values from the form to help users create conditions
2. **Rule Summary**: Condensed view of rules when not actively editing
3. **Validation**: Prevent invalid or circular routing paths
4. **Rule Testing**: Allow previewing which path would be taken for sample answers
5. **Orphan Prevention**: Ensure blocks remain reachable when editing connections

## Optional Enhancements

1. **Rule Templates**: Predefined condition patterns for common scenarios
2. **Rule Duplication**: Clone existing rules as starting points
3. **Block Suggestions**: AI-powered suggestions for logical next blocks
4. **Rule Analytics**: Track which rules are triggered most frequently
5. **Visual Paths**: Flowchart visualization of possible paths

## Limitations and Boundaries

1. Max number of rules per connection: Unlimited (practical limit ~20)
2. Max conditions per rule: Unlimited (practical limit ~5)
3. Max nesting level for compound conditions: 3 levels
4. Circular references: Prevented via validation
5. Orphaned blocks: Prevented via validation
