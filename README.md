# PrayerTimes 🕌

A beautiful, modern Islamic prayer times web application with automatic location detection, elegant design, and PWA capabilities.

[![GitHub](https://img.shields.io/badge/GitHub-motxzl%2Fprayer--times-blue?logo=github)](https://github.com/motxzl/prayer-times)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/motxzl/prayer-times)](https://github.com/motxzl/prayer-times/stargazers)

## ✨ Features

- **Automatic Location Detection**: Uses browser Geolocation API with fallback to manual city selection
- **Accurate Prayer Times**: Powered by the official Aladhan API
- **Multiple Calculation Methods**: Support for various Islamic calculation methods
- **Real-time Countdown**: Live countdown timer to the next prayer
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **PWA Ready**: Installable as a progressive web app
- **Multiple Languages**: English and Arabic support
- **Time Formats**: 12-hour and 24-hour format options
- **Offline Support**: Service worker for offline functionality

## 🚀 Quick Start

### From GitHub
```bash
git clone https://github.com/motxzl/prayer-times.git
cd prayer-times
```

### Run the App
1. **Open the project**: Navigate to the project folder in VS Code
2. **Start a local server**: Use Live Server extension or any local server
3. **Open `index.html`**: The app will load immediately

### Alternative: Open Directly
- Simply open `index.html` in any modern web browser
- For best experience, use a local server to avoid CORS issues

## 🛠️ Tech Stack

- **HTML5** with semantic markup
- **Tailwind CSS** via CDN for styling
- **Vanilla JavaScript** (no frameworks)
- **Aladhan API** for prayer times data
- **PWA** with Service Worker and Web App Manifest

## 📱 PWA Installation

The app can be installed as a Progressive Web App:

1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Click the install icon in the address bar
3. Or use the "Add to Home Screen" option on mobile

## ⚙️ Configuration

### Calculation Methods
- Egyptian General Authority (default)
- University of Islamic Sciences, Karachi
- Islamic Society of North America
- Muslim World League
- Umm Al-Qura University, Makkah
- And many more...

### Location Options
- **Automatic**: Uses GPS coordinates
- **Manual**: Search by city and country name
- **Default**: Falls back to Cairo, Egypt

## 🎨 Design Features

- **Glassmorphism**: Modern glass-like UI elements
- **Islamic Green Theme**: Authentic color scheme (#10b981)
- **Smooth Animations**: Subtle transitions and hover effects
- **Typography**: Clean fonts with Arabic support
- **Accessibility**: Proper focus states and keyboard navigation

## 📊 API Usage

The app uses the Aladhan API:
- **Base URL**: `https://api.aladhan.com/v1`
- **Endpoints**:
  - `/timings` - By coordinates
  - `/timingsByCity` - By city name
- **Parameters**: latitude, longitude, method, city, country

## 🔧 Development

### File Structure
```
prayertimes/
├── index.html          # Main HTML file
├── style.css           # Custom styles
├── script.js           # Application logic
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── tailwind.config.js # Tailwind configuration
```

### Key Components

1. **Location Detection**: Handles GPS and manual location input
2. **Prayer Times Fetching**: API integration with error handling
3. **Countdown Timer**: Real-time countdown to next prayer
4. **Settings Management**: Persistent user preferences
5. **Theme System**: Dark/light mode with localStorage
6. **PWA Features**: Offline support and installability

## 🌙 Prayer Times Included

- **Fajr** (Dawn Prayer)
- **Dhuhr** (Noon Prayer)
- **Asr** (Afternoon Prayer)
- **Maghrib** (Sunset Prayer)
- **Isha** (Night Prayer)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Bug Reports

Found a bug? Have a feature request? Please [open an issue](https://github.com/motxzl/prayer-times/issues) on GitHub.

## 📧 Contact

For questions or feedback, please reach out through:
- [GitHub Issues](https://github.com/motxzl/prayer-times/issues)
- [GitHub Discussions](https://github.com/motxzl/prayer-times/discussions)

## 🙏 Acknowledgments

- [Aladhan API](https://aladhan.com/) for prayer times data
- Tailwind CSS for styling framework
- Font Awesome for icons
- **Sunrise** (Sunrise Time)
- **Dhuhr** (Noon Prayer)
- **Asr** (Afternoon Prayer)
- **Maghrib** (Sunset Prayer)
- **Isha** (Night Prayer)
- **Imsak** (Pre-dawn time)
- **Midnight** (Midnight time)
- **First Third** & **Last Third** (Night thirds for Tahajjud)

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Made with ❤️ for the Ummah. Free to use and modify.

## 🙏 Credits

- **Aladhan API**: For providing accurate prayer times
- **Tailwind CSS**: For the utility-first CSS framework
- **Font Awesome**: For beautiful icons
- **BigDataCloud API**: For reverse geocoding

---

**Note**: This is a client-side only application. No server or database required. All data is fetched from public APIs and stored locally in the browser.