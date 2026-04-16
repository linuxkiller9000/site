// PrayerTimes - Islamic Prayer Times Application
// Main JavaScript file

class PrayerTimesApp {
    constructor() {
        this.apiBase = 'https://api.aladhan.com/v1';
        this.currentLocation = null;
        this.prayerTimes = null;
        this.nextPrayer = null;
        this.countdownInterval = null;
        this.currentTimeInterval = null;
        this.deferredPrompt = null; // For PWA install
        this.qiblaBearing = 0; // Store Qibla direction for compass
        this.deviceHeading = 0; // Current device heading from compass
        this.settings = {
            timeFormat: localStorage.getItem('timeFormat') || '12',
            calculationMethod: localStorage.getItem('calculationMethod') || '5',
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'en'
        };

        // Country to cities mapping
        this.countryCities = {
            'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Asyut', 'Ismailia', 'Zagazig', 'Tanta', 'Mansoura', 'Damanhur', 'Beni Suef', 'Sohag', 'Hurghada', 'Qena', 'Minya', 'Damietta'],
            'Saudi Arabia': ['Mecca', 'Medina', 'Riyadh', 'Jeddah', 'Dammam', 'Taif', 'Khobar', 'Tabuk', 'Abha', 'Najran'],
            'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
            'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin'],
            'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Bahawalpur'],
            'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Barisal', 'Sylhet', 'Comilla', 'Narayanganj', 'Gazipur', 'Rangpur'],
            'Indonesia': ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Depok', 'Tangerang', 'South Tangerang'],
            'Malaysia': ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kuching', 'Kota Kinabalu', 'Seremban', 'Kuantan'],
            'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'],
            'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
            'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Newcastle', 'Sunderland', 'Brighton'],
            'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
            'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City'],
            'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
            'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
            'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
            'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
            'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'],
            'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst'],
            'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne'],
            'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'],
            'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'],
            'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Bodø'],
            'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Frederiksberg', 'Esbjerg', 'Randers', 'Kolding', 'Vejle', 'Roskilde'],
            'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Kouvola'],
            'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice'],
            'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice'],
            'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely'],
            'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina', 'Chania', 'Chalcis'],
            'Portugal': ['Lisbon', 'Porto', 'Amadora', 'Braga', 'Setúbal', 'Coimbra', 'Queluz', 'Funchal', 'Cacém', 'Vila Nova de Gaia'],
            'Ireland': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Bray', 'Navan', 'Ennis'],
            'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Manurewa', 'Hamilton', 'Tauranga', 'Lower Hutt', 'Dunedin', 'Palmerston North', 'Napier'],
            'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kawasaki', 'Kobe', 'Saitama', 'Hiroshima'],
            'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Seongnam'],
            'Singapore': ['Singapore'],
            'Thailand': ['Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai', 'Pak Kret', 'Si Racha', 'Phra Pradaeng', 'Lampang', 'Khon Kaen'],
            'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Haiphong', 'Biên Hòa', 'Cần Thơ', 'Vinh', 'Thủ Dầu Một', 'Thanh Hóa', 'Nha Trang'],
            'Philippines': ['Quezon City', 'Manila', 'Caloocan', 'Davao City', 'Cebu City', 'Zamboanga City', 'Taguig', 'Antipolo', 'Pasig', 'Cagayan de Oro'],
            'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Pietermaritzburg', 'Benoni', 'Tembisa'],
            'Kenya': ['Nairobi', 'Mombasa', 'Nakuru', 'Eldoret', 'Kisumu', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
            'Morocco': ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Meknès', 'Oujda', 'Kenitra', 'Agadir', 'Tétouan', 'Safi'],
            'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Ettadhamen', 'Kairouan', 'Bizerte', 'Gabès', 'Aryanah', 'Gafsa', 'El Mourouj'],
            'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra'],
            'Libya': ['Tripoli', 'Benghazi', 'Misrata', 'Tarhuna', 'Al-Khums', 'Zuwarah', 'Sabha', 'Ajdabiya', 'Sirte', 'Al-Bayda'],
            'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Al-Quwaysimah', 'Wadi Al-Seer', 'Tafilah', 'Madaba', 'Sahab', 'Karak'],
            'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Nabatieh', 'Jounieh', 'Zahle', 'Baalbek', 'Byblos', 'Batroun'],
            'Syria': ['Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Deir ez-Zor', 'Raqqa', 'Sweida', 'Idlib', 'Daraa'],
            'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf', 'Karbala', 'Kirkuk', 'Sulaymaniyah', 'Nasiriyah', 'Amarah'],
            'Iran': ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Tabriz', 'Shiraz', 'Ahvaz', 'Qom', 'Kermanshah', 'Urmia'],
            'Afghanistan': ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz', 'Ghazni', 'Balkh', 'Baghlan', 'Gardez'],
            'Uzbekistan': ['Tashkent', 'Namangan', 'Samarkand', 'Andijan', 'Bukhara', 'Nukus', 'Qarshi', 'Kokand', 'Chirchiq', 'Fergana'],
            'Kazakhstan': ['Almaty', 'Nur-Sultan', 'Shymkent', 'Aktobe', 'Karaganda', 'Taraz', 'Pavlodar', 'Ust-Kamenogorsk', 'Kyzylorda', 'Semey'],
            'Kyrgyzstan': ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok', 'Kyzyl-Kiya', 'Naryn', 'Talas', 'Kant', 'Batken'],
            'Tajikistan': ['Dushanbe', 'Khujand', 'Kulob', 'Istaravshan', 'Konibodom', 'Tursunzoda', 'Isfara', 'Panjakent', 'Shakhrisabz', 'Hisar'],
            'Turkmenistan': ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary', 'Balkanabat', 'Bayramaly', 'Türkmenbaşy', 'Tejen', 'Abadan', 'Yolöten'],
            'Palestine': ['Gaza', 'Hebron', 'Nablus', 'Rafah', 'Khan Yunis', 'Jabalia', 'Beit Lahia', 'Beit Hanoun', 'Dayr al-Balah', 'Jericho'],
            'Oman': ['Muscat', 'Seeb', 'Salalah', 'Bawshar', 'Sohar', 'As Suwayq', 'Ibri', 'Saham', 'Barka', 'Rustaq'],
            'Kuwait': ['Kuwait City', 'Al Ahmadi', 'Hawalli', 'Al Farwaniyah', 'Al Jahra', 'As Salimiyah', 'Sabah as Salim', 'Al Manqaf', 'Al Fintas', 'Mubarak al-Kabeer'],
            'Qatar': ['Doha', 'Al Rayyan', 'Umm Salal', 'Al Khor', 'Al Wakrah', 'Ar Rayyan', 'Ash Shihaniyah', 'Al Daayen', 'Al Shamal', 'Madinat ash Shamal'],
            'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'A\'ali', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Al Hidd'],
            'Maldives': ['Malé', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi', 'Thinadhoo', 'Naifaru', 'Dhidhdhoo', 'Hithadhoo', 'Kulhudhuffushi', 'Manadhoo'],
            'Yemen': ['Sana\'a', 'Aden', 'Taiz', 'Al Hudaydah', 'Mukalla', 'Ibb', 'Dhamar', 'Amran', 'Sayyan', 'Zabid'],
            'Sudan': ['Khartoum', 'Omdurman', 'Khartoum North', 'Port Sudan', 'Kassala', 'Al-Ubayyid', 'Al-Qadarif', 'Wad Madani', 'Al-Fashir', 'Kosti'],
            'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don'],
            'China': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Dongguan', 'Tianjin', 'Hangzhou', 'Nanjing', 'Chengdu', 'Wuhan'],
            'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán', 'La Plata', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'],
            'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
            'Mexico': ['Mexico City', 'Ecatepec', 'Guadalajara', 'Puebla', 'Juárez', 'Tijuana', 'León', 'Mérida', 'Monterrey', 'Querétaro'],
            'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'],
            'Peru': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Chimbote', 'Huancayo', 'Iquitos', 'Tacna'],
            'Chile': ['Santiago', 'Puente Alto', 'Antofagasta', 'Viña del Mar', 'Valparaíso', 'Talcahuano', 'San Bernardo', 'Temuco', 'Iquique', 'Concepción'],
            'Taiwan': ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao', 'Xinying', 'Hsinchu', 'Keelung', 'Chiayi', 'Changhua'],
            'Ukraine': ['Kyiv', 'Kharkiv', 'Dnipro', 'Donetsk', 'Odesa', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol'],
            'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea'],
            'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen'],
            'Croatia': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Slavonski Brod', 'Karlovac', 'Varaždin', 'Šibenik'],
            'Serbia': ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Loznica', 'Čačak', 'Kruševac', 'Kraljevo', 'Zrenjanin'],
            'Bosnia and Herzegovina': ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bihać', 'Brčko', 'Bijeljina', 'Prijedor', 'Trebinje'],
            'Albania': ['Tirana', 'Durrës', 'Vlorë', 'Elbasan', 'Shkodër', 'Korçë', 'Fier', 'Berat', 'Lushnjë', 'Kavajë'],
            'North Macedonia': ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo', 'Veles', 'Ohrid', 'Gostivar', 'Strumica', 'Kavadarci'],
            'Montenegro': ['Podgorica', 'Nikšić', 'Herceg Novi', 'Pljevlja', 'Budva', 'Bar', 'Cetinje', 'Ulcinj', 'Tivat', 'Kotor'],
            'Kosovo': ['Pristina', 'Prizren', 'Ferizaj', 'Pejë', 'Gjilan', 'Gjakovë', 'Mitrovicë', 'Vushtrri', 'Suharekë', 'Rahovec'],
            'Slovenia': ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik'],
            'Slovakia': ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica', 'Nitra', 'Trnava', 'Martin', 'Trenčín', 'Poprad'],
            'Estonia': ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 'Rakvere', 'Maardu', 'Kuressaare', 'Sillamäe'],
            'Latvia': ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne', 'Valmiera', 'Ogre', 'Tukums'],
            'Lithuania': ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'],
            'Belarus': ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno', 'Brest', 'Bobruisk', 'Baranovichi', 'Borisov', 'Pinsk'],
            'Moldova': ['Chișinău', 'Tiraspol', 'Bălți', 'Bendery', 'Rîbnița', 'Cahul', 'Ungheni', 'Soroca', 'Orhei', 'Dubăsari'],
            'Georgia': ['Tbilisi', 'Kutaisi', 'Batumi', 'Rustavi', 'Sukhumi', 'Zugdidi', 'Gori', 'Poti', 'Samtredia', 'Khashuri'],
            'Armenia': ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan', 'Abovyan', 'Kapan', 'Ararat', 'Armavir', 'Artashat'],
            'Azerbaijan': ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran', 'Shirvan', 'Nakhchivan', 'Shaki', 'Yevlakh', 'Barda'],
            'Iceland': ['Reykjavík', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær', 'Garðabær', 'Mosfellsbær', 'Árborg', 'Akranes', 'Fjardabyggd'],
            'Zimbabwe': ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Epworth', 'Kwekwe', 'Kadoma', 'Masvingo', 'Marondera']
        };

        this.availableCities = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.startCurrentTime();
        this.updateCitySuggestions(''); // Initialize with popular cities
        this.setDefaultLocation(); // Set default location immediately
        this.hideLoading();
        // Try to detect location in background
        this.detectLocation();
    }

    bindEvents() {
        // Location settings toggle
        document.getElementById('location-toggle').addEventListener('click', () => {
            const settings = document.getElementById('location-settings');
            const display = document.getElementById('location-display');
            settings.classList.toggle('hidden');
            display.classList.toggle('hidden');
        });

        // Location detection
        document.getElementById('detect-location').addEventListener('click', () => {
            this.detectLocation();
        });

        // Country selection
        document.getElementById('country-input').addEventListener('change', (e) => {
            this.updateCitySuggestions(e.target.value);
        });

        // Manual location search
        document.getElementById('manual-location').addEventListener('click', () => {
            this.searchByCity();
        });

        // Settings
        document.getElementById('time-format').addEventListener('change', (e) => {
            this.settings.timeFormat = e.target.value;
            this.saveSettings();
            this.updatePrayerTimesDisplay();
        });

        document.getElementById('calculation-method').addEventListener('change', (e) => {
            this.settings.calculationMethod = e.target.value;
            this.saveSettings();
            this.fetchPrayerTimes();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Enter key for city/country inputs
        document.getElementById('city-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchByCity();
        });
        document.getElementById('country-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchByCity();
        });

        // Add helpful hints for city input
        document.getElementById('city-input').addEventListener('focus', () => {
            this.showSearchHint();
            this.showCitySuggestionList();
        });

        document.getElementById('city-input').addEventListener('input', (e) => {
            this.updateSearchHint(e.target.value);
            this.filterCitySuggestions(e.target.value);
        });

        document.getElementById('city-input').addEventListener('blur', () => {
            // Hide hint and city list after a short delay to allow for clicks on list options
            setTimeout(() => {
                const hintDiv = document.getElementById('search-hint');
                if (hintDiv) {
                    hintDiv.remove();
                }
                this.hideCitySuggestionList();
            }, 200);
        });

        const citySuggestionList = document.getElementById('city-suggestion-list');
        citySuggestionList.addEventListener('click', (e) => {
            const item = e.target.closest('li');
            if (!item) return;
            const city = item.dataset.city;
            if (city) {
                const cityInput = document.getElementById('city-input');
                cityInput.value = city;
                this.hideCitySuggestionList();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#city-list-container')) {
                this.hideCitySuggestionList();
            }
        });

        // PWA Install functionality
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.deferredPrompt = null;
        });

        // Install button click
        document.getElementById('install-button').addEventListener('click', () => {
            this.installApp();
        });

        // For testing: show button if running on localhost or if no beforeinstallprompt fired
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                if (!this.deferredPrompt) {
                    this.showInstallButton();
                }
            }, 2000); // Show after 2 seconds for testing
        }

        // Device Orientation Listener for Qibla Compass
        // Updates needle rotation as user rotates their phone
        this.setupDeviceOrientation();
    }

    // Setup device orientation detection for dynamic Qibla compass
    setupDeviceOrientation() {
        // Check for iOS 13+ which requires explicit permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+: requires user permission
            document.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            console.log('iOS compass permission granted');
                            this.startCompassTracking();
                        } else {
                            console.log('iOS compass permission denied');
                        }
                    })
                    .catch(error => console.log('iOS compass error:', error));
            }, { once: true });
        } else if (typeof DeviceOrientationEvent !== 'undefined') {
            // Android: No permission needed, start immediately
            console.log('Android detected - starting compass tracking without permission');
            this.startCompassTracking();
        } else {
            console.warn('Device Orientation API not supported on this device');
        }
    }

    // Start listening to device orientation changes
    startCompassTracking() {
        if (typeof DeviceOrientationEvent === 'undefined') return;

        console.log('Compass tracking started');

        // Android primary event: deviceorientationabsolute
        // Provides orientation relative to Earth's coordinate frame
        window.addEventListener('deviceorientationabsolute', (event) => {
            const heading = this.getDeviceHeadingFromEvent(event);
            if (heading !== null) {
                this.deviceHeading = heading;
                this.updateCompassNeedle();
            }
        }, { passive: true });

        // Fallback: deviceorientation
        window.addEventListener('deviceorientation', (event) => {
            const heading = this.getDeviceHeadingFromEvent(event);
            if (heading !== null) {
                this.deviceHeading = heading;
                this.updateCompassNeedle();
            }
        }, { passive: true });
    }

    // Convert device orientation event data into a compass heading in degrees
    getDeviceHeadingFromEvent(event) {
        // iOS-specific heading
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
            return event.webkitCompassHeading;
        }

        // If alpha is unavailable, we cannot determine heading
        if (event.alpha === null || event.alpha === undefined) {
            return null;
        }

        // Android / generic heading handling.
        // event.alpha is the rotation around the z axis. For many browsers,
        // it represents the device heading when combined with screen orientation.
        const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
        let heading = event.alpha;

        // If the event is absolute, some browsers report alpha relative to north.
        // Otherwise, we adjust with the screen orientation.
        if (event.absolute) {
            heading = 360 - heading;
        }

        heading = heading + screenAngle;
        heading = (heading + 360) % 360;
        return heading;
    }

    // Update needle rotation based on device heading and Qibla bearing
    updateCompassNeedle() {
        const needle = document.getElementById('qibla-needle');
        if (!needle) return;

        // Calculate needle rotation:
        // The needle should point toward Qibla relative to magnetic north.
        const needleRotation = this.qiblaBearing - this.deviceHeading;

        needle.style.transition = 'transform 0.15s ease-out';
        needle.style.transform = `rotate(${needleRotation}deg)`;

        const debugHeading = document.getElementById('debug-heading');
        const debugBearing = document.getElementById('debug-bearing');
        if (debugHeading) debugHeading.textContent = `${Math.round(this.deviceHeading)}°`;
        if (debugBearing) debugBearing.textContent = `${Math.round(this.qiblaBearing)}°`;
    }

    // PWA Install methods
    showInstallButton() {
        const button = document.getElementById('install-button');
        button.classList.remove('hidden');
    }

    hideInstallButton() {
        const button = document.getElementById('install-button');
        button.classList.add('hidden');
    }

    installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                this.deferredPrompt = null;
            });
        } else {
            // For testing purposes when no prompt is available
            alert('Install prompt not available. In a real PWA, this would show the native install dialog.');
            this.hideInstallButton();
        }
    }

    // ========================================
    // QIBLA DIRECTION CALCULATION
    // ========================================
    // Calculates the bearing (angle) from the user's location to Mecca (Kaaba)
    // Using the great-circle bearing formula (inverse Haversine)
    
    calculateQibla() {
        if (!this.currentLocation) return;

        // Kaaba (Holy Mosque/Masjid al-Haram) coordinates in Mecca, Saudi Arabia
        const kaaba = {
            latitude: 21.4225,   // 21.4225° North
            longitude: 39.8262   // 39.8262° East
        };

        // User's location coordinates (converted to radians for trigonometry)
        const userLatRad = (this.currentLocation.lat * Math.PI) / 180;
        const userLonRad = (this.currentLocation.lng * Math.PI) / 180;
        const kaabaLatRad = (kaaba.latitude * Math.PI) / 180;
        const kaabaLonRad = (kaaba.longitude * Math.PI) / 180;

        // Calculate the difference in longitude
        const deltaLon = kaabaLonRad - userLonRad;

        // Great-circle bearing formula (atan2 method)
        // This calculates the initial bearing/azimuth from user to Kaaba
        const y = Math.sin(deltaLon) * Math.cos(kaabaLatRad);
        const x = Math.cos(userLatRad) * Math.sin(kaabaLatRad) - 
                  Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLon);
        
        let bearing = Math.atan2(y, x);

        // Convert from radians to degrees
        bearing = (bearing * 180) / Math.PI;

        // Normalize bearing to 0-360° range
        // (atan2 returns values in -180 to 180, so we add 360 and mod 360 to get 0-360)
        bearing = (bearing + 360) % 360;

        // Store the bearing for use by the compass
        this.qiblaBearing = bearing;

        // Update the UI with the calculated bearing
        this.updateQiblaDisplay(bearing);
    }

    updateQiblaDisplay(bearing) {
        // Round to nearest degree for display
        const roundedBearing = Math.round(bearing);

        // Update the angle display (e.g., "45°")
        const angleElement = document.getElementById('qibla-angle');
        if (angleElement) {
            angleElement.textContent = `${roundedBearing}°`;
        }

        // For initial display, rotate needle to bearing (static display)
        // Once device orientation is available, updateCompassNeedle will override this
        const needle = document.getElementById('qibla-needle');
        if (needle) {
            needle.style.transition = 'transform 0.5s ease-in-out';
            needle.style.transform = `rotate(${bearing}deg)`;
        }

        // Determine and display the cardinal/intercardinal direction name
        let directionName = 'North';
        if (bearing >= 337.5 || bearing < 22.5) directionName = 'North - شمال';
        else if (bearing >= 22.5 && bearing < 67.5) directionName = 'Northeast - شمال شرق';
        else if (bearing >= 67.5 && bearing < 112.5) directionName = 'East - شرق';
        else if (bearing >= 112.5 && bearing < 157.5) directionName = 'Southeast - جنوب شرق';
        else if (bearing >= 157.5 && bearing < 202.5) directionName = 'South - جنوب';
        else if (bearing >= 202.5 && bearing < 247.5) directionName = 'Southwest - جنوب غرب';
        else if (bearing >= 247.5 && bearing < 292.5) directionName = 'West - غرب';
        else if (bearing >= 292.5 && bearing < 337.5) directionName = 'Northwest - شمال غرب';

        // Update direction display
        const directionElement = document.getElementById('qibla-direction');
        if (directionElement) {
            directionElement.textContent = directionName;
        }

        // Update location display - show which city the direction is calculated from
        let locationText = 'Calculating location...';
        if (this.currentLocation) {
            if (this.currentLocation.city) {
                locationText = `${this.currentLocation.city}${this.currentLocation.country ? ', ' + this.currentLocation.country : ''}`;
            } else if (this.currentLocation.lat && this.currentLocation.lng) {
                locationText = `${this.currentLocation.lat.toFixed(4)}°, ${this.currentLocation.lng.toFixed(4)}°`;
            }
        }
        
        const locationElement = document.getElementById('qibla-location');
        if (locationElement) {
            locationElement.textContent = locationText;
        }

        // Trigger compass needle update to enable dynamic tracking if device orientation is available
        this.updateCompassNeedle();
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('main-content').classList.remove('opacity-0');
            document.getElementById('main-content').classList.add('opacity-100');
        }, 1000);
    }

    loadSettings() {
        // Apply saved settings
        document.getElementById('time-format').value = this.settings.timeFormat;
        document.getElementById('calculation-method').value = this.settings.calculationMethod;

        // Apply theme
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun mr-2"></i><span>Light Mode</span>';
        } else {
            document.body.classList.remove('dark');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon mr-2"></i><span>Dark Mode</span>';
        }
    }

    saveSettings() {
        localStorage.setItem('timeFormat', this.settings.timeFormat);
        localStorage.setItem('calculationMethod', this.settings.calculationMethod);
        localStorage.setItem('theme', this.settings.theme);
        localStorage.setItem('language', this.settings.language);
    }

    toggleTheme() {
        if (this.settings.theme === 'dark') {
            this.settings.theme = 'light';
            document.body.classList.remove('dark');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun mr-2"></i><span>Light Mode</span>';
        } else {
            this.settings.theme = 'dark';
            document.body.classList.add('dark');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon mr-2"></i><span>Dark Mode</span>';
        }
        this.saveSettings();
    }

    async detectLocation() {
        const locationDisplay = document.getElementById('current-location');
        locationDisplay.textContent = 'Detecting location...';

        // Show loading state on button
        const detectButton = document.getElementById('detect-location');
        const originalText = detectButton.innerHTML;
        detectButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Detecting...';
        detectButton.disabled = true;

        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                });
            });

            this.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                method: 'coordinates'
            };

            // Get location name from coordinates
            await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
            // Calculate Qibla direction
            this.calculateQibla();
            await this.fetchPrayerTimes();

        } catch (error) {
            console.warn('Location detection failed:', error);

            let errorMessage = 'Unable to detect your location. ';
            if (error.code === 1) {
                errorMessage += 'Please enable location permissions and try again.';
            } else if (error.code === 2) {
                errorMessage += 'Location information is unavailable.';
            } else if (error.code === 3) {
                errorMessage += 'Location request timed out.';
            } else {
                errorMessage += 'Using default location (Cairo, Egypt).';
            }

            this.showError(errorMessage);
            // Fallback to default location
            this.setDefaultLocation();
        } finally {
            // Reset button state
            detectButton.innerHTML = originalText;
            detectButton.disabled = false;
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();

            const city = data.city || data.locality || 'Unknown City';
            const country = data.countryName || 'Unknown Country';

            // Update currentLocation with city name for Qibla display
            if (this.currentLocation) {
                this.currentLocation.city = city;
                this.currentLocation.country = country;
            }

            document.getElementById('current-location').textContent = `${city}, ${country}`;
            document.getElementById('city-input').value = city;
            document.getElementById('country-input').value = country;

            // Update city suggestions for the detected country
            this.updateCitySuggestions(country);

        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            document.getElementById('current-location').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    async geocodeCity(city, country) {
        try {
            // Use Open-Meteo Geocoding API (free, no API key needed)
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&language=en&limit=1`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                this.currentLocation.lat = result.latitude;
                this.currentLocation.lng = result.longitude;
                this.currentLocation.method = 'coordinates'; // Switch to coordinate method for better accuracy
            }
        } catch (error) {
            console.warn('Geocoding failed, will use city name only:', error);
            // If geocoding fails, we'll just use city name (fallback to city-based prayer times API)
        }
    }

    setDefaultLocation() {
        this.currentLocation = {
            city: 'Cairo',
            country: 'Egypt',
            lat: 30.0444,
            lng: 31.2357,
            method: 'coordinates' // Use coordinates for better accuracy
        };
        document.getElementById('current-location').textContent = 'Cairo, Egypt';
        document.getElementById('city-input').value = 'Cairo';
        document.getElementById('country-input').value = 'Egypt';

        // Update city suggestions for Egypt
        this.updateCitySuggestions('Egypt');

        // Calculate Qibla direction
        this.calculateQibla();
        this.fetchPrayerTimes();
    }

    async searchByCity() {
        const city = document.getElementById('city-input').value.trim();
        const country = document.getElementById('country-input').value.trim();

        if (!country) {
            this.showError('Please select a country first');
            return;
        }

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        // Show loading state
        const searchButton = document.getElementById('manual-location');
        const originalText = searchButton.innerHTML;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Searching...';
        searchButton.disabled = true;

        try {
            this.currentLocation = {
                city: city,
                country: country || '', // Country is optional
                method: 'city'
            };

            document.getElementById('current-location').textContent = `${city}${country ? ', ' + country : ''}`;

            // Get coordinates for Qibla calculation
            await this.geocodeCity(city, country);
            
            // Calculate Qibla direction
            this.calculateQibla();
            await this.fetchPrayerTimes();

            // Success - hide location settings and show success message
            document.getElementById('location-settings').classList.add('hidden');
            document.getElementById('location-display').classList.remove('hidden');

        } catch (error) {
            console.error('Location search failed:', error);
            this.showError('City not found. Please check the spelling and try again.');
            // Reset to previous location if available
            if (this.prayerTimes) {
                // Keep current data, just show error
            } else {
                // No previous data, fallback to default
                this.setDefaultLocation();
            }
        } finally {
            // Reset button state
            searchButton.innerHTML = originalText;
            searchButton.disabled = false;
        }
    }

    async fetchPrayerTimes() {
        if (!this.currentLocation) return;

        try {
            let url;
            if (this.currentLocation.method === 'coordinates') {
                url = `${this.apiBase}/timings/${Date.now() / 1000}?latitude=${this.currentLocation.lat}&longitude=${this.currentLocation.lng}&method=${this.settings.calculationMethod}`;
            } else {
                url = `${this.apiBase}/timingsByCity?city=${encodeURIComponent(this.currentLocation.city)}&country=${encodeURIComponent(this.currentLocation.country || '')}&method=${this.settings.calculationMethod}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 200) {
                this.prayerTimes = data.data.timings;
                this.updateDates(data.data.date);
                this.updatePrayerTimesDisplay();
                this.calculateNextPrayer();
                this.startCountdown();
            } else {
                throw new Error(data.status || 'Location not found. Please check the city/country name.');
            }

        } catch (error) {
            console.error('Failed to fetch prayer times:', error);

            let errorMessage = 'Failed to load prayer times. ';
            if (error.message.includes('Location not found') || error.message.includes('not found')) {
                errorMessage += 'Please check the city/country name and try again.';
            } else if (error.message.includes('fetch')) {
                errorMessage += 'Please check your internet connection.';
            } else {
                errorMessage += 'Please try again later.';
            }

            this.showError(errorMessage);
            throw error; // Re-throw so searchByCity can handle it
        }
    }

    updateDates(dateData) {
        const gregorian = dateData.gregorian;
        const hijri = dateData.hijri;

        document.getElementById('gregorian-date').textContent =
            `${gregorian.weekday.en}, ${gregorian.day} ${gregorian.month.en} ${gregorian.year}`;

        document.getElementById('hijri-date').textContent =
            `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    }

    updatePrayerTimesDisplay() {
        if (!this.prayerTimes) return;

        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Imsak', 'Midnight', 'Firstthird', 'Lastthird'];

        prayers.forEach(prayer => {
            const time = this.prayerTimes[prayer];
            if (time) {
                const formattedTime = this.formatTime(time);
                const element = document.getElementById(`${prayer.toLowerCase()}-time`);
                if (element) {
                    element.textContent = formattedTime;
                }
            }
        });

        // Update current prayer highlighting
        this.updateCurrentPrayerHighlight();
    }

    formatTime(timeString) {
        if (this.settings.timeFormat === '12') {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        return timeString;
    }

    updateCurrentPrayerHighlight() {
        // Remove current class from all cards
        document.querySelectorAll('.prayer-card').forEach(card => {
            card.classList.remove('current');
        });

        if (this.nextPrayer && this.nextPrayer.name !== 'Next Day') {
            const currentCard = document.querySelector(`[data-prayer="${this.nextPrayer.name}"]`);
            if (currentCard) {
                currentCard.classList.add('current');
            }
        }
    }

    calculateNextPrayer() {
        if (!this.prayerTimes) return;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { name: 'Fajr', time: this.prayerTimes.Fajr },
            { name: 'Sunrise', time: this.prayerTimes.Sunrise },
            { name: 'Dhuhr', time: this.prayerTimes.Dhuhr },
            { name: 'Asr', time: this.prayerTimes.Asr },
            { name: 'Maghrib', time: this.prayerTimes.Maghrib },
            { name: 'Isha', time: this.prayerTimes.Isha }
        ];

        let nextPrayer = null;
        let minDiff = Infinity;

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerTime = hours * 60 + minutes;
            let diff = prayerTime - currentTime;

            // If prayer has passed today, add 24 hours for tomorrow
            if (diff <= 0) {
                diff += 24 * 60;
            }

            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = prayer;
            }
        }

        if (nextPrayer) {
            this.nextPrayer = {
                name: nextPrayer.name,
                time: nextPrayer.time,
                minutesUntil: minDiff
            };
            this.updateNextPrayerDisplay();
        } else {
            // Fallback if no prayer found
            this.nextPrayer = {
                name: 'Fajr',
                time: this.prayerTimes.Fajr,
                minutesUntil: 0
            };
            this.updateNextPrayerDisplay();
        }
    }

    updateNextPrayerDisplay() {
        if (!this.nextPrayer) return;

        document.getElementById('next-prayer-name').textContent = this.nextPrayer.name;
        document.getElementById('next-prayer-time').textContent = this.formatTime(this.nextPrayer.time);
    }

    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.countdownInterval = setInterval(() => {
            if (!this.nextPrayer) return;

            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [prayerHours, prayerMinutes] = this.nextPrayer.time.split(':').map(Number);
            const prayerTime = prayerHours * 60 + prayerMinutes;

            let minutesUntil = prayerTime - currentTime;
            if (minutesUntil < 0) {
                minutesUntil += 24 * 60; // Add 24 hours if prayer has passed
            }

            // Calculate exact time difference including seconds
            const prayerDate = new Date();
            prayerDate.setHours(prayerHours, prayerMinutes, 0, 0);

            if (prayerDate < now) {
                prayerDate.setDate(prayerDate.getDate() + 1);
            }

            const timeDiff = prayerDate - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('countdown').textContent = countdownText;

            // If countdown reaches zero, recalculate next prayer
            if (timeDiff <= 0) {
                this.calculateNextPrayer();
            }
        }, 1000);
    }

    startCurrentTime() {
        this.updateCurrentTime();
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        let timeString;

        if (this.settings.timeFormat === '12') {
            timeString = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } else {
            timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format
        }

        document.getElementById('current-time').textContent = timeString;
    }

    showError(message) {
        // Create or update error notification
        let errorDiv = document.getElementById('error-notification');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-notification';
            errorDiv.className = 'fixed top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-lg border border-red-400/50 z-50 max-w-sm';
            document.body.appendChild(errorDiv);
        }

        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-red-200 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSearchHint() {
        // Show a helpful hint when focusing on city input
        let hintDiv = document.getElementById('search-hint');
        if (!hintDiv) {
            hintDiv = document.createElement('div');
            hintDiv.id = 'search-hint';
            hintDiv.className = 'mt-2 text-xs text-slate-400 bg-slate-800/30 rounded px-2 py-1';
            document.getElementById('city-input').parentElement.appendChild(hintDiv);
        }
        const country = document.getElementById('country-input').value.trim();
        hintDiv.textContent = country
            ? `Type a city name in ${country} or choose from suggestions.`
            : 'Please select a country first to enable city recommendations.';
    }

    updateSearchHint(value) {
        const hintDiv = document.getElementById('search-hint');
        if (!hintDiv) return;
        const country = document.getElementById('country-input').value.trim();
        if (!country) {
            hintDiv.textContent = 'Select a country first to see city suggestions.';
            return;
        }
        if (!value) {
            hintDiv.textContent = `Recommended cities for ${country} appear below.`;
        } else {
            hintDiv.textContent = `Searching for “${value}” in ${country}. Choose a suggested city or continue typing.`;
        }
    }

    setCityInputState(enabled) {
        const cityInput = document.getElementById('city-input');
        const recDiv = document.getElementById('city-recommendations');
        if (!cityInput || !recDiv) return;
        cityInput.disabled = !enabled;
        cityInput.placeholder = enabled ? 'Choose a city in the selected country' : 'Select a country first to choose a city';
        if (!enabled) {
            cityInput.value = '';
            recDiv.textContent = 'Choose a country first to see city recommendations.';
            this.hideCitySuggestionList();
        }
    }

    showRecommendations(country) {
        const recDiv = document.getElementById('city-recommendations');
        if (!recDiv) return;
        if (!country) {
            recDiv.textContent = 'Choose a country first to see city recommendations.';
            return;
        }
        if (this.countryCities[country]) {
            const topCities = this.countryCities[country].slice(0, 5).join(', ');
            recDiv.textContent = `Recommended cities in ${country}: ${topCities}.`;
        } else {
            recDiv.textContent = `No built-in city recommendations for ${country}. Type your city name manually.`;
        }
    }

    updateCitySuggestions(country) {
        const cityDatalist = document.getElementById('city-suggestions');
        const cityInput = document.getElementById('city-input');
        if (!cityDatalist || !cityInput) return;

        // Clear existing options
        cityDatalist.innerHTML = '';

        if (!country) {
            this.setCityInputState(false);
            return;
        }

        this.setCityInputState(true);
        this.showRecommendations(country);

        let cities;
        if (this.countryCities[country]) {
            cities = this.countryCities[country];
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                cityDatalist.appendChild(option);
            });
        } else {
            cities = ['Cairo', 'Mecca', 'Medina', 'Istanbul', 'Dubai', 'London', 'New York', 'Paris', 'Tokyo', 'Mumbai'];
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                cityDatalist.appendChild(option);
            });
        }

        this.renderCitySuggestionList(cities);
        this.showCitySuggestionList();

        // Clear the city input when country changes
        cityInput.value = '';
    }

    showCitySuggestionList() {
        const list = document.getElementById('city-suggestion-list');
        if (!list || this.availableCities.length === 0) return;
        list.classList.remove('hidden');
    }

    hideCitySuggestionList() {
        const list = document.getElementById('city-suggestion-list');
        if (list) {
            list.classList.add('hidden');
        }
    }

    filterCitySuggestions(query) {
        const list = document.getElementById('city-suggestion-list');
        if (!list) return;

        const lowerQuery = query.trim().toLowerCase();
        const items = Array.from(list.querySelectorAll('li'));
        let visible = 0;

        items.forEach(item => {
            const city = item.dataset.city.toLowerCase();
            const match = !lowerQuery || city.includes(lowerQuery);
            item.classList.toggle('hidden', !match);
            if (match) visible += 1;
        });

        if (visible === 0) {
            list.classList.add('hidden');
        } else {
            list.classList.remove('hidden');
        }
    }

    renderCitySuggestionList(cities) {
        const list = document.getElementById('city-suggestion-list');
        if (!list) return;

        this.availableCities = cities || [];
        list.innerHTML = '';

        if (!this.availableCities.length) {
            list.classList.add('hidden');
            return;
        }

        this.availableCities.forEach(city => {
            const item = document.createElement('li');
            item.dataset.city = city;
            item.className = 'cursor-pointer px-3 py-2 text-sm text-slate-100 hover:bg-islamic-green/20';
            item.textContent = city;
            list.appendChild(item);
        });

        list.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrayerTimesApp();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}