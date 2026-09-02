---
name: Cinematic Noir
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#c8c6c8'
  on-secondary: '#303032'
  secondary-container: '#474649'
  on-secondary-container: '#b7b4b7'
  tertiary: '#c8c5cb'
  on-tertiary: '#303034'
  tertiary-container: '#737277'
  on-tertiary-container: '#fbf8fe'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#e4e1e7'
  tertiary-fixed-dim: '#c8c5cb'
  on-tertiary-fixed: '#1b1b1f'
  on-tertiary-fixed-variant: '#47464b'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  metadata:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter-desktop: 32px
  gutter-mobile: 16px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system embodies a **Premium Cinematic** aesthetic, designed to evoke the immersive feeling of a darkened movie theater. The target audience includes cinephiles and casual viewers who appreciate high-production value and a focused discovery experience. 

The style is a sophisticated blend of **Minimalism** and **Glassmorphism**. It prioritizes visual content—movie posters and high-resolution stills—by utilizing a dark, obsidian-based color palette that recedes into the background. Depth is communicated through subtle translucency and backdrop blurs rather than heavy shadows, creating a modern, "liquid" interface that feels both expensive and high-tech. The emotional response is one of excitement, exclusivity, and focus.

## Colors

The palette is strictly dark-mode to maintain a theatrical atmosphere. 

- **Primary (Cinematic Red):** Used sparingly for high-action touchpoints like primary "Watch Now" buttons, active navigation states, and critical highlights.
- **Surface (Obsidian & Charcoal):** The base background uses #0A0A0B to ensure perfect blacks on OLED screens. Elevated surfaces like cards and modals use #161618.
- **Glass Effects:** Overlays and navigation bars use a semi-transparent version of the surface color with a 20px-30px blur to maintain legibility over vibrant movie backdrops.
- **Typography:** Pure white (#FFFFFF) is reserved for primary headlines, while secondary metadata uses a muted silver (#A0A0A0) to reduce visual noise.

## Typography

The typography system relies on a high-contrast pairing of **Montserrat** for headlines and **Inter** for UI and body text. 

- **Headlines:** Use Montserrat with tight tracking and heavy weights (Bold/ExtraBold) to mimic movie title treatments. 
- **Metadata:** Important details (Year, Duration, Rating) use the `label-caps` style with generous 0.1em tracking to ensure quick scanability against dark backgrounds.
- **Body:** Inter provides maximum legibility for movie synopses and cast lists.
- **Accessibility:** Ensure a minimum contrast ratio of 4.5:1 for all secondary text by using the muted silver only on the darkest surfaces.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **White Space:** Generous vertical spacing (stack-lg) is used between sections (e.g., "Trending" vs "Recommended") to prevent the UI from feeling cluttered.
- **Poster Aspect Ratio:** Movie cards must strictly adhere to a 2:3 aspect ratio to prevent distorting studio assets.
- **Hero Banners:** Use a full-bleed or wide-container approach with a bottom-to-top black gradient overlay (0% to 100% opacity) to ensure white text remains legible regardless of the underlying image.
- **Breakpoints:**
  - Desktop: 1200px+ (32px gutters)
  - Tablet: 768px - 1199px (24px gutters)
  - Mobile: Under 767px (16px gutters)

## Elevation & Depth

Visual hierarchy is established through a **Tonal Layering** system combined with **Glassmorphism**:

1.  **Level 0 (Floor):** Pure obsidian (#0A0A0B). Used for the main canvas.
2.  **Level 1 (Card/Surface):** Charcoal (#161618). Used for movie cards and content sections. Features a subtle 1px inner border of #FFFFFF at 5% opacity to define edges.
3.  **Level 2 (Overlay/Nav):** Glassmorphic surfaces. Uses a background blur of 24px and a 60% opaque fill of #0A0A0B.
4.  **Interaction:** Hovering over a Level 1 card should lift it slightly (scale 1.05) and increase the inner border brightness to 15% opacity, creating a "glow" effect rather than using traditional shadows.

## Shapes

The shape language is consistently **Rounded**, providing a premium, modern feel that softens the high-contrast color palette.

- **Standard (8px):** Used for buttons, input fields, and small UI elements.
- **Large (16px / rounded-lg):** The standard for movie posters and container cards.
- **Extra Large (24px / rounded-xl):** Reserved for high-level containers like modal windows or search bars.
- **Interactive States:** Buttons transition from standard roundedness to slightly more pronounced curves on hover to provide tactile feedback.

## Components

- **Movie Cards:** Must feature a 16px corner radius. Title and year should be placed below the poster in `body-md` and `metadata` styles. Ratings (IMDb/Star) should appear as a glassmorphic badge in the top-left corner of the poster.
- **Primary Buttons:** High-impact Cinematic Red (#E50914) with white text. Use a slight horizontal gradient for depth.
- **Secondary Buttons:** Ghost style with a 1px white border at 20% opacity and a backdrop blur.
- **Navigation:** A sticky top-bar featuring glassmorphism. Search should be integrated as an expandable icon-only element on mobile and a full-width translucent bar on desktop.
- **Chips/Tags:** Used for genres. Small, dark-grey (#2A2A2E) pills with `label-caps` typography.
- **Hero Banners:** Immersive, occupying 70-80% of the viewport height. Must include a "Watch Now" primary button and a "More Info" secondary button.
- **Scrollbars:** Custom slim, dark-grey scrollbars to avoid breaking the obsidian immersion.