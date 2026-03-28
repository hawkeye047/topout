```markdown
# Design System Specification: The Industrial Sentinel

## 1. Overview & Creative North Star: "Precision Brutalism"
This design system is built on the philosophy of **Precision Brutalism**. It rejects the "bubbly" consumer-tech aesthetic in favor of high-performance, industrial authority. The interface should feel like a custom-machined piece of hardware: heavy, deliberate, and undeniably premium.

### The Creative North Star
We move beyond standard layouts by embracing **The Machine Aesthetic**. This means utilizing rigid verticality, intentional asymmetry, and "monolithic" stacking. We break the template look by treating the screen as a high-contrast dashboard where information isn't just displayed—it is "instrumented." Expect sharp 0px–4px radii, tight typography, and a "Dark-Mode-First" hierarchy that uses light not as a background, but as a surgical tool.

---

## 2. Color Architecture
Our palette is rooted in a "Deep Sea" navy, punctuated by high-vis Amber. We do not use "off-black"; we use deep, chromatic blues to maintain a premium feel.

### Named Color Tokens (Material Design Convention)
*   **Surface (Background):** `#0b1326` (The Void)
*   **Primary (Accent):** `#ffc174` / **Primary Container:** `#f59e0b` (The Amber Signal)
*   **Secondary:** `#b7c8e1` (The Slate Structural)
*   **On-Surface:** `#dae2fd` (High-Contrast Text)
*   **Surface-Container-Highest:** `#2d3449` (Elevated Machined Panels)

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. 
*   *Implementation:* A `surface-container-low` section sitting directly on a `surface` background creates a hard industrial edge without the "cheapness" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, stacked layers. 
1.  **Level 0 (Base):** `surface` (#0b1326)
2.  **Level 1 (Sections):** `surface-container-low` (#131b2e)
3.  **Level 2 (Active Cards):** `surface-container-high` (#222a3d)
This nesting creates depth through "Tonal Machining."

### Signature Textures
Use **Angular Gradients** for primary actions. Instead of a flat Amber, use a linear gradient from `primary` (#ffc174) to `primary-container` (#f59e0b) at a 135-degree angle. This mimics the sheen of anodized metal.

---

## 3. Typography: The Editorial Command
The type system is built on **DM Sans** (referenced as `manrope` in tokens for display/`inter` for body to maintain high-readability alternatives).

*   **The Command Headline:** `display-lg` (3.5rem) or `headline-lg` (2rem). Use **Bold** weights with **tight tracking** (-0.02em to -0.05em). Headers should feel compressed and powerful.
*   **The Wordmark:** 'TOPOUT' must be Uppercase, Bold, with wide letter-spacing (0.2em), accompanied by a single `primary` amber dot.
*   **The Label:** `label-md` (0.75rem). Use uppercase for industrial labels (e.g., PHASE: 01) to mimic technical blueprints.

---

## 4. Elevation & Depth: Tonal Layering
We do not use traditional "shadows" to indicate depth. We use **Luminance Shifts**.

*   **The Layering Principle:** To "lift" an element, simply move it one step up the `surface-container` scale. 
*   **The Ghost Border:** If a boundary is required for accessibility in complex Gantt charts, use the `outline-variant` token at **15% opacity**. This creates a "phantom" edge that is felt rather than seen.
*   **Glassmorphism:** For floating role-based toggles or tooltips, use `surface-container-highest` at 80% opacity with a **20px Backdrop Blur**. This maintains the "Industrial" weight while allowing the navy background to bleed through.

---

## 5. Components: Machined Elements

### Industrial Phase Cards
*   **Radius:** 0px (Sharp).
*   **Structure:** No borders. Header section uses `surface-container-highest`, body uses `surface-container-low`.
*   **Interaction:** On hover, the background shift should be immediate (0ms) or extremely fast (100ms) to mimic a physical switch.

### Role-Based Toggle Pills
*   **Style:** Unlike traditional rounded pills, these are rectangular with a 2px radius.
*   **State:** The active state uses the Amber `primary` color with black text (`on-primary`). The inactive state is `surface-container-highest`.

### Gantt-Style Bars
*   **Geometry:** Sharp right-angles. No rounded caps.
*   **Coloring:** Use `primary-container` for active tracks. Use `secondary-container` for background tracks.
*   **Spacing:** Use the `0.5` (0.1rem) spacing token for slim gaps between parallel bars to create a "grid-locked" feel.

### Progress Rings
*   **Visual:** Thick strokes (minimum 8px). Use the `primary` amber for the progress arc and a very low-opacity `secondary` for the track. Center the percentage in `title-lg` Bold.

### Input Fields
*   **Style:** Underline-only or solid block background. Forbid the "box" look.
*   **Active State:** The underline shifts from `outline-variant` to `primary` (Amber). Helper text must be `label-sm` in Slate Gray.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Grid:** Align every element to the `0.9rem` (4) or `1.75rem` (8) spacing increments.
*   **Use High Contrast:** Ensure Amber CTAs sit on the darkest Navy backgrounds for maximum "signal" strength.
*   **Tighten Tracking:** On all Bold headers, tighten letter-spacing to make the wordmark feel like a solid block of metal.

### Don't:
*   **No Rounded Corners:** Never exceed a `4px` radius. If a component defaults to "pill" or "circle," override it to a square or subtle chamfer.
*   **No Drop Shadows:** Avoid standard black shadows. If you must use a shadow for a floating modal, use a tinted Navy shadow at 8% opacity with a 40px blur.
*   **No Dividers:** Never use a line where a background color change or white space could work instead. Vertical breathing room is your primary separator.