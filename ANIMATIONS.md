# ParkSmart Animation Guide

This document outlines all animation features added to the ParkSmart platform for enhanced user experience.

## Overview

The application uses **Framer Motion** for complex, interactive animations and **CSS keyframes** for performant, simple animations.

## New Dependencies

- **framer-motion**: ^11.0.0 - Powerful React animation library

## Core Animation Files

### 1. `lib/animations.ts`
Central library containing reusable animation variants:
- `fadeInUp` / `fadeInDown` / `fadeInLeft` / `fadeInRight` - Opacity + position changes
- `scaleIn` - Scale from 0.9 to 1.0 with opacity
- `slideInUp` / `slideInDown` - Slide animations with stagger support
- `containerVariants` / `itemVariants` - Parent-child stagger animations
- `bounceVariants` - Spring physics bounce effect
- `pulseVariants` - Continuous pulsing animation
- `staggerContainer` / `staggerItem` - List item stagger patterns

### 2. `hooks/use-scroll-animation.ts`
Custom hook for scroll-triggered animations:
```typescript
const { ref, isVisible } = useScrollAnimation()
// Triggers when element enters viewport
```

## Component-Level Animations

### Animated Components

#### `components/scroll-reveal.tsx`
Wraps content with scroll-triggered fade/slide animations:
```tsx
<ScrollReveal variant="fadeInUp" delay={0.2}>
  Your content here
</ScrollReveal>
```
Variants: `fadeInUp`, `fadeInDown`, `slideInLeft`, `slideInRight`

#### `components/animated-button.tsx`
Button with hover/tap feedback and loading states:
```tsx
<AnimatedButton isLoading={false} variant="default">
  Click Me
</AnimatedButton>
```

#### `components/animated-counter.tsx`
Animated number counter for statistics:
```tsx
<AnimatedCounter value={1000} duration={2} prefix="$" suffix="k" />
```

#### `components/page-transition.tsx`
Page-level fade animation:
```tsx
<PageTransition>
  <main>Page content</main>
</PageTransition>
```

## Page-Specific Animations

### Home Page (`app/page.tsx`)
- **Navigation**: Slides down from top with fade
- **Hero Section**: Staggered text animations with spring physics
- **Feature Cards**: Cascade animation on scroll, lift on hover
- **Statistics**: Animated counter values with scale-in
- **CTA Section**: Slide-up animation with card hover effect

### Browse Page (`app/browse/page.tsx`)
- **Header**: Slides down with sticky behavior
- **Parking Cards**: Grid with staggered entrance animation
- **Card Hover**: Smooth upward lift effect (8px offset)
- **Button Interactions**: Scale and tap feedback

### Admin Dashboard (`app/admin/dashboard/page.tsx`)
- **Header**: Smooth slide-down entrance
- **Content Cards**: Staggered cascade animation
- **Charts**: Fade-in with viewport trigger

## CSS Animations

### Utility Classes (in `app/globals.css`)

```css
.animate-fade-in         /* 0.5s fade-in */
.animate-slide-in-up     /* Slide from bottom */
.animate-slide-in-down   /* Slide from top */
.animate-slide-in-left   /* Slide from left */
.animate-slide-in-right  /* Slide from right */
.animate-scale-in        /* Scale grow animation */
.animate-pulse-slow      /* 2s pulsing effect */
.animate-shimmer         /* Shimmer wave effect */
.animate-bounce-light    /* Gentle bounce */
```

### Usage Example
```html
<div class="animate-fade-in">Fades in smoothly</div>
<div class="animate-slide-in-up">Slides up from bottom</div>
<div class="animate-bounce-light">Bounces infinitely</div>
```

## Animation Best Practices

### 1. Performance
- Use `will-change` for frequently animated elements
- Leverage GPU acceleration with `transform` and `opacity`
- Avoid animating `width` and `height` directly
- Use `whileInView` for scroll-based animations to reduce render overhead

### 2. Timing
- **Entrance animations**: 0.4-0.6s duration
- **Hover interactions**: 0.2-0.3s duration
- **List items**: 0.1-0.15s stagger delay
- **Loading states**: 1s rotation for consistency

### 3. User Experience
- Animations should not distract or slow down interaction
- Disable animations for users who prefer reduced motion
- Ensure all animations are smooth (ease-out for entrance, ease-in-out for loops)

## Scroll Animation Triggers

Elements with `whileInView` animation:
- Trigger when element enters viewport
- `margin: "-100px"` - Starts animation 100px before visible
- `once: true` - Animation plays only once per page load

## Combining Animations

### Stagger Pattern
```tsx
<motion.div variants={staggerContainer} initial="hidden" whileInView="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Page Load Sequence
1. Navigation slides down (0.6s)
2. Hero content staggered in (0.5-1.2s)
3. Features cascade on scroll (0.6s each)

## Future Animation Enhancements

- [ ] Gesture animations for mobile interactions
- [ ] Parallax scrolling for hero section
- [ ] Animated SVG icons
- [ ] Modal entrance/exit animations
- [ ] Form field focus animations
- [ ] Tab transition animations
- [ ] Toast notification slide-in effects
- [ ] Skeleton loading animations

## Testing Animations

To test animations:
1. Inspect element in DevTools
2. Slow down animations: Ctrl+Shift+P → "Animations" → Set speed to 10x
3. Check performance: DevTools → Performance tab
4. Test on low-end devices for smoothness

## Troubleshooting

**Animations lagging:**
- Reduce number of simultaneous animations
- Use `will-change: transform` on parent
- Reduce `duration` values

**Animations not triggering:**
- Ensure `initial` and `animate`/`whileInView` are set
- Check viewport margin settings
- Verify component is client-side (`'use client'`)

**Performance issues:**
- Use CSS animations for simple effects
- Limit `staggerChildren` to < 5 items per list
- Cache animation variants outside component
