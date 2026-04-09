# MatiksUI

MatiksUI is a polished Expo + React Native UI prototype for the Matiks multiplayer math duel app. This project currently focuses on a premium post-game score reveal experience with smooth motion, layered visuals, and performance-friendly animation patterns designed for Android first, while remaining iOS compatible.
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)
## Overview

This screen is built as a production-style animated result experience for a competitive math duel flow. It emphasizes a premium reveal sequence:

1. The final score counts up from zero with a slight overshoot.
2. The combo streak badge pops in with a bounce.
3. The rank reveal slides up and fades in after the score settles.
4. The share CTA stays visible with a looping shimmer and responsive press feedback.
5. A Skia confetti burst triggers when the score animation completes.

The goal of this repo is to showcase a modern, game-like React Native motion UI using Reanimated 3 and Skia without relying on Lottie or heavyweight animation packages.

## Tech Stack

- Expo
- React Native
- TypeScript
- React Native Reanimated 3
- Shopify React Native Skia

## Features

### Post Game Score Reveal Screen

- Animated score counter from `0` to `2840`
- Integer ticking effect driven by animated values
- Overshoot and settle behavior for a more premium score reveal
- Combo streak badge: `🔥 7 Combo Streak!`
- Flame icon pulse loop using scale and opacity
- Rank reveal: `#3 of 1,200`
- Delayed rank entrance after score completion
- Share CTA with looping gradient shimmer/glint
- Press feedback with scale down, bounce up, and settle
- Skia confetti burst with randomized particle directions, rotation, and fade-out
- Custom modern background using layered gradients, glow fields, and geometric light bands

### Performance Notes

- Animations are driven with Reanimated shared values
- No React state is used inside animation callbacks
- Motion is sequenced on the UI thread
- Lightweight visual layering keeps the screen smooth on Android devices

## Project Structure

```text
MatiksUI/
├─ App.tsx
├─ ScoreRevealScreen.tsx
├─ app.json
├─ babel.config.js
├─ package.json
├─ tsconfig.json
└─ README.md
```

### Key Files

- [`App.tsx`](./App.tsx): App entry point that mounts the score reveal screen
- [`ScoreRevealScreen.tsx`](./ScoreRevealScreen.tsx): Main animated UI screen and all motion logic
- [`app.json`](./app.json): Expo app configuration
- [`babel.config.js`](./babel.config.js): Babel config with the Reanimated plugin
- [`package.json`](./package.json): Dependencies and scripts

## Animation Breakdown

### 1. Score Counter

- Uses `useSharedValue`, `withTiming`, and `withSpring`
- Counts from `0` to the final score
- Adds a small overshoot before settling
- Uses `interpolate` and rounding for integer display updates

### 2. Combo Streak Badge

- Starts hidden
- Enters with `0 -> 1.15 -> 1.0`
- Uses `withSequence` and `withSpring`
- Flame pulse loops using `withRepeat`

### 3. Rank Reveal

- Begins below its final position with opacity `0`
- Slides upward and fades in
- Triggered after the score animation completes with a short delay

### 4. Share CTA

- Visible throughout the screen
- Has a looping moving glint rendered with Skia gradient shading
- On press, scales down then springs up and settles

### 5. Confetti Burst

- Built with `@shopify/react-native-skia`
- Triggers when the score reveal finishes
- Each particle uses randomized velocity, size, spin, and fade-out

## Design Direction

This screen aims for a dark competitive arcade feel rather than a generic dashboard look.

Design characteristics:

- Deep navy / near-black base
- Electric blue and teal glow accents
- Strong hierarchy around the score
- Minimal but expressive card surfaces
- Subtle geometric light bands to add uniqueness
- Bright CTA for clear action focus

## Getting Started

### Prerequisites

- Node.js 18 or newer recommended
- npm

### Install

```bash
npm install --legacy-peer-deps
```

Note:

- `--legacy-peer-deps` is currently used because the installed Skia version works with this setup but npm peer resolution is stricter than the runtime requirements in this repo.

### Run the Project

Start the Expo development server:

```bash
npm start
```

Run on web:

```bash
npm run web
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

## Available Scripts

- `npm start` - Start Expo
- `npm run web` - Launch the web version
- `npm run android` - Open Android target through Expo
- `npm run ios` - Open iOS target through Expo

## Development Notes

- The project uses the Reanimated Babel plugin, which is required for motion code to run correctly.
- The screen is intentionally implemented as a single-file component to match the original build requirement.
- Skia is used only for visual enhancement layers like confetti and shimmer rendering.

## Testing

Basic verification completed:

- TypeScript check via `npx tsc --noEmit`
- Expo web dev server launched successfully during setup

## License

This repository currently does not define a separate license file. Add one if you plan to distribute or open-source the project publicly.

### Built with ❤️ by **Barsha Saha**  
💻 Frontend Developer | Tech Enthusiast
