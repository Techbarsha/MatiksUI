# Matiks UI Intern Assignment: Score Reveal UI

Hi! I'm Barsha Saha, and this is my submission for the UI Designer Intern position at Matiks.

For this assignment, I designed and developed MatiksScoreUI, a polished Expo + React Native UI prototype for the Matiks multiplayer math duel app. This project focuses on a premium post-game score reveal experience with smooth motion, layered visuals, and performance-friendly animation patterns designed for Android first, while remaining iOS compatible.

## Overview
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)

For this assignment, I designed and developed MatiksScoreUI, a polished Expo + React Native UI prototype for the Matiks multiplayer math duel app. This project focuses on a premium post-game score reveal experience with smooth motion, layered visuals, and performance-friendly animation patterns designed for Android first, while remaining iOS compatible.

## Overview
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-Enabled-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-Enabled-blue?style=for-the-badge&logo=expo)

This screen is built as a production-style animated result experience for a competitive math duel flow. It emphasizes a premium reveal sequence:

- The final score counts up from zero with a slight overshoot.
- The combo streak badge pops in with a bounce.
- The rank reveal slides up and fades in after the score settles.
- The share CTA stays visible with a looping shimmer and responsive press feedback.
- A Skia confetti burst triggers when the score animation completes.
- The final score counts up from zero with a slight overshoot.
- The combo streak badge pops in with a bounce.
- The rank reveal slides up and fades in after the score settles.
- The share CTA stays visible with a looping shimmer and responsive press feedback.
- A Skia confetti burst triggers when the score animation completes.

The goal of this assignment is to showcase my ability to create a modern, game-like React Native motion UI using Reanimated 3 and Skia without relying on Lottie or heavyweight animation packages.
The goal of this assignment is to showcase my ability to create a modern, game-like React Native motion UI using Reanimated 3 and Skia without relying on Lottie or heavyweight animation packages.

## Tech Stack

- Expo
- React Native
- TypeScript
- React Native Reanimated 3
- Shopify React Native Skia

## Features

- **Post Game Score Reveal Screen**
- **Animated Score Counter:** Ticks from 0 to 2840 using animated values with an overshoot and settle behavior for a premium feel. Integer ticking effect driven by animated values.
- **Combo Streak Badge:** Displays 🔥 7 Combo Streak! with a flame icon pulse loop using scale and opacity.
- **Rank Reveal:** Displays #3 of 1,200 with a delayed entrance after score completion.
- **Share CTA:** Features a looping gradient shimmer/glint and press feedback (scales down, bounces up, and settles).
- **Skia Confetti Burst:** Randomized particle directions, rotation, and fade-out triggered upon score completion.
- **Custom Modern Background:** Uses layered gradients, glow fields, and geometric light bands.

## Performance Notes
- **Post Game Score Reveal Screen**
- **Animated Score Counter:** Ticks from 0 to 2840 using animated values with an overshoot and settle behavior for a premium feel. Integer ticking effect driven by animated values.
- **Combo Streak Badge:** Displays 🔥 7 Combo Streak! with a flame icon pulse loop using scale and opacity.
- **Rank Reveal:** Displays #3 of 1,200 with a delayed entrance after score completion.
- **Share CTA:** Features a looping gradient shimmer/glint and press feedback (scales down, bounces up, and settles).
- **Skia Confetti Burst:** Randomized particle directions, rotation, and fade-out triggered upon score completion.
- **Custom Modern Background:** Uses layered gradients, glow fields, and geometric light bands.

## Performance Notes

- Animations are driven with Reanimated shared values.
- No React state is used inside animation callbacks.
- Motion is sequenced on the UI thread.
- Lightweight visual layering keeps the screen smooth on Android devices.
- Animations are driven with Reanimated shared values.
- No React state is used inside animation callbacks.
- Motion is sequenced on the UI thread.
- Lightweight visual layering keeps the screen smooth on Android devices.

## Getting Started

### Prerequisites

- Node.js 18 or newer recommended
- npm

### Install

```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is currently used because the installed Skia version works with this setup but npm peer resolution is stricter than the runtime requirements in this repo.
Note: `--legacy-peer-deps` is currently used because the installed Skia version works with this setup but npm peer resolution is stricter than the runtime requirements in this repo.

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

## Development Notes

- The project uses the Reanimated Babel plugin, which is required for motion code to run correctly.
- The screen is intentionally implemented as a single-file component to match the original build requirement.
- Skia is used only for visual enhancement layers like confetti and shimmer rendering.

## Testing

Basic verification completed:

- TypeScript check via `npx tsc --noEmit`
- Expo web dev server launched successfully during setup

Built with ❤️ by Barsha Saha 💻 Tech Enthusiast
```