# Installation

## Requirements

- Node.js 22+
- pnpm 10+
- Expo CLI (optional, `npx expo` works without global install)

## Install from Source

```bash
git clone https://github.com/arcade-cabinet/otter-river-rush.git
cd otter-river-rush
pnpm install
```

## Environment Variables

Only required when running asset generation or EAS builds:

```bash
MESHY_API_KEY=msy_xxx
EXPO_TOKEN=xxx
```

## Platform Prerequisites

- **Web**: No extra setup beyond Node + pnpm.
- **iOS**: macOS + Xcode (for simulator or device builds).
- **Android**: Android Studio + Java 21.
