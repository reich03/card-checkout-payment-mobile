# GreenPay — Mobile App

Cross-platform mobile checkout built with **Expo SDK 57** + **React Native 0.86** + **TypeScript**. Brand: **GreenPay** — pagos simples y seguros.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo | SDK 57 | Toolchain, modules & Metro |
| React Native | 0.86.0 | Mobile framework |
| React | 19.2.x | UI library |
| TypeScript | 5.x / 6.x | Type-safe language |
| Redux Toolkit | latest | State management (Flux) |
| React Navigation | 7.x | Screen navigation |
| Jest + jest-expo | 29.x | Unit testing (>80% coverage) |

## App Flow (7 Screens)

1. **Splash Screen** — Brand loading screen
2. **Home (Products)** — Product catalog grid with prices
3. **Cart** — Selected items with quantity controls
4. **Checkout** — Payment method selection
5. **Card Info** — Credit card form with Visa/MC detection (bottom sheet)
6. **Payment Summary** — Order review + confirm payment (bottom sheet)
7. **Transaction Result** — Success / Error / Pending status

## Project Structure

```
android/              # Native Android project (Gradle) — committed
ios/                  # Native iOS project (Xcode/CocoaPods) — committed
src/
├── screens/          # 7 screen components
├── components/       # Reusable UI components (CardForm, ProductCard, etc.)
├── store/            # Redux store configuration
│   └── slices/       # productsSlice, cartSlice, paymentSlice
├── services/         # API client, payment service
├── utils/            # Card validation, encryption, formatters
├── navigation/       # Stack navigator config
├── types/            # TypeScript interfaces & types
└── assets/           # Images, fonts
```

## Getting Started

### Prerequisites
- Node.js 22.13+
- npm 10+
- Android Studio (for Android) or Xcode (for iOS)
- JDK 17+ (Android)
- CocoaPods (iOS, macOS only)

### Install & Run

```bash
# Install dependencies
npm install

# iOS pods (macOS only)
npm run ios:pods
# or: cd ios && pod install && cd ..

# Start Metro / Expo Dev Tools
npm start

# Run via Expo (uses local android/ / ios/)
npm run android
npm run ios

# Run tests
npm test
npm run test:coverage
```

## Hybrid native builds

You can work either through Expo or by entering the native folders.

### Android (Gradle)

```bash
# Debug APK
npm run android:assemble
# or: cd android && ./gradlew assembleDebug

# Release APK
npm run android:release
# or: cd android && ./gradlew assembleRelease

# Install debug build on a connected device/emulator
npm run android:install
```

Release APK path: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (Xcode / CocoaPods)

```bash
npm run ios:pods
# or: cd ios && pod install

# Then open in Xcode
open ios/PayCheckoutApp.xcworkspace
```

Or simply `npm run ios` to build and launch the simulator via Expo.

### Regenerating native projects

If you change `app.json` plugins / identifiers and need a fresh native sync:

```bash
npm run prebuild        # sync without wiping custom native edits
npm run prebuild:clean  # wipe and regenerate android/ + ios/
```

> Prefer small native edits carefully: `prebuild --clean` will overwrite generated files.

## Test Coverage

> Coverage results will be added here after implementation.

```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
-----------------------------|---------|----------|---------|---------|
```

## Responsive Design

Minimum supported screen: **iPhone SE (2020)** — 375x667 pt.
All UI components use flexible layouts with anchors to adapt across screen sizes.

## License

Private — not for distribution.
