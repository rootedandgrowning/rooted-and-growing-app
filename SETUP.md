# Rooted and Growing App - Local Setup Guide

## 📱 Project Information

**App Name:** Rooted and Growing App  
**Bundle ID:** com.rootedandgrowing.oracle  
**App Store Connect ID:** 6753871636  
**Expo Account:** rootedandgrowingapp  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 2. Environment Setup

The `.env` file is already configured with:
```
EXPO_PUBLIC_BACKEND_URL=your-backend-url
EXPO_PUBLIC_APPLE_SUBMISSION_MODE=true
EXPO_PUBLIC_DEV_PERSONALIZATION=true
EXPO_PUBLIC_PRECISION_ASTRO=false
```

Update `EXPO_PUBLIC_BACKEND_URL` if you have a custom backend.

### 3. Start Development Server

```bash
npx expo start
```

This will:
- Start Metro bundler
- Show QR code for Expo Go
- Enable web preview at http://localhost:3000

---

## 🍎 iOS Build with EAS

### Prerequisites

1. **Expo Account:** rootedandgrowingapp
2. **Apple Developer Account** with active membership
3. **App Store Connect** app created (ID: 6753871636)
4. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```

### Step-by-Step Build Process

#### 1. Login to EAS

```bash
npx eas login
```

Enter your Expo credentials for the `rootedandgrowingapp` account.

#### 2. Configure iOS Credentials

```bash
npx eas credentials
```

- Select platform: **iOS**
- Login with your **Apple Developer account**
- Authorize EAS to manage certificates
- EAS will create/link:
  - Distribution Certificate
  - Provisioning Profile for `com.rootedandgrowing.oracle`

#### 3. Verify Credentials

```bash
npx eas credentials -p ios
```

Confirm:
- Bundle ID: `com.rootedandgrowing.oracle`
- Distribution certificate is active
- Provisioning profile is linked

#### 4. Build Development Client

```bash
npx eas build --platform ios --profile development
```

This creates an internal distribution build you can install via direct download or TestFlight.

#### 5. Build for Production

```bash
npx eas build --platform ios --profile production
```

This creates an App Store-ready build.

#### 6. Submit to App Store Connect

```bash
npx eas submit --platform ios
```

Will automatically upload to App Store Connect (ID: 6753871636).

---

## 📂 Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Daily Draw (home)
│   │   ├── home.tsx       # Home page
│   │   ├── journal.tsx    # Journal timeline
│   │   ├── meditations.tsx
│   │   ├── more.tsx       # Settings
│   │   └── weekly.tsx
│   ├── card/              # Card detail pages
│   ├── admin/             # Admin screens
│   ├── billing/           # Stripe checkout pages
│   ├── onboarding.tsx
│   ├── profile.tsx
│   ├── notifications.tsx
│   └── ...spread screens
├── assets/                # Images, fonts, icons
│   ├── cards/            # Oracle card images
│   └── images/           # App icons, splash
├── components/            # Reusable components
│   ├── CardShuffleExperience.tsx
│   ├── OracleCardImage.tsx
│   ├── WhyThisGuidanceModal.tsx
│   └── ...
├── constants/             # Theme, card data
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom hooks
├── utils/                 # Utilities
│   ├── astrology.ts      # Astrology calculations
│   ├── personalData.ts   # Secure storage
│   ├── storage.ts        # AsyncStorage helpers
│   └── ...
├── public/                # Static assets for web
├── app.json              # Expo configuration
├── eas.json              # EAS build configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## 🔧 Configuration Files

### app.json
Contains:
- App name, description, icon, splash
- iOS bundle identifier: `com.rootedandgrowing.oracle`
- Build number, version
- Permissions (camera, photos, notifications)

### eas.json
Build profiles:
- **development:** Internal distribution with dev client
- **preview:** Internal distribution for testing
- **production:** App Store distribution

Submit configuration points to App Store Connect ID: `6753871636`

### package.json
Key dependencies:
- expo: 54.0.13
- react-native: 0.79.5
- expo-router: 5.1.4
- expo-dev-client: 6.0.15
- All necessary Expo modules

---

## 🎨 Key Features

- **Daily Oracle Draw** with card shuffle experience
- **Spread Readings** (3-card, seasonal, growth)
- **Journal System** with saved spreads
- **Personalization** with astrology (sun sign, moon sign, confidence badges)
- **Profile Management** with timezone picker, birth time
- **Notifications** for daily/weekly reminders
- **Stripe Subscription** (hidden in APPLE_SUBMISSION_MODE)
- **Authentication** with JWT
- **Box Circle** community feature

---

## 🔐 Environment Variables

`.env` file contains:

- `EXPO_PUBLIC_BACKEND_URL` - FastAPI backend URL
- `EXPO_PUBLIC_APPLE_SUBMISSION_MODE` - Hide Stripe UI for App Store compliance
- `EXPO_PUBLIC_DEV_PERSONALIZATION` - Enable personalization features
- `EXPO_PUBLIC_PRECISION_ASTRO` - Feature flag for advanced astrology

**Note:** Never commit real API keys or secrets to version control.

---

## 🧪 Testing

### Web Preview
```bash
npx expo start --web
```

### iOS Simulator
```bash
npx expo start --ios
```

### Physical Device (Expo Go)
1. Install Expo Go from App Store
2. Run `npx expo start`
3. Scan QR code with camera

### Development Build
After building with EAS:
1. Download .ipa from build URL
2. Install via TestFlight or direct install
3. Test all native features

---

## 📱 Deployment Checklist

Before submitting to App Store:

- [ ] All TypeScript errors fixed
- [ ] App icons and splash screen finalized
- [ ] Privacy policy URL added
- [ ] In-app purchase compliance (if needed)
- [ ] App Store screenshots prepared
- [ ] App description and keywords ready
- [ ] Age rating determined
- [ ] Test on multiple iOS versions
- [ ] Verify all features work on physical device

---

## 🆘 Common Issues

### "Module not found"
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### "Could not connect to development server"
- Check firewall settings
- Ensure device and computer on same network
- Try `npx expo start --tunnel`

### "Build failed on EAS"
- Check build logs at the provided URL
- Verify all credentials are valid
- Ensure `app.json` and `eas.json` are correctly configured

### "Provisioning profile invalid"
```bash
npx eas credentials
# Select "Remove credentials" then set up again
```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## 🔗 Links

- **Expo Project:** https://expo.dev/accounts/rootedandgrowingapp/projects/rooted-and-growing
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6753871636
- **Bundle ID:** com.rootedandgrowing.oracle

---

## 📞 Support

For build and deployment questions, refer to Expo documentation or contact your development team.

**Current Version:** 1.0.0  
**Last Updated:** October 2025
