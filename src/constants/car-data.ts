/**
 * Comprehensive car make/model reference data for CarMarket365.
 * European-focused with global coverage. Includes current models and
 * recent discontinued models commonly found on the used car market.
 *
 * Used by:
 * - SellCar form (make/model dropdowns)
 * - AdvancedSearch filters
 * - TradeInEstimator
 * - BrowseCars filters
 * - Backend reference data endpoints
 */

export interface CarMakeData {
  name: string;
  country: string;
  models: string[];
}

export const CAR_DATA: CarMakeData[] = [
  // ═══════════════════════════════════════
  // GERMAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Audi',
    country: 'DE',
    models: [
      // A-series sedans/hatchbacks
      'A1', 'A1 Sportback', 'A2', 'A3', 'A3 Sportback', 'A3 Sedan', 'A3 Cabriolet',
      'A4', 'A4 Avant', 'A4 Allroad', 'A5', 'A5 Sportback', 'A5 Cabriolet',
      'A6', 'A6 Avant', 'A6 Allroad', 'A7', 'A7 Sportback', 'A8', 'A8 L',
      // Q-series SUVs
      'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q4 Sportback e-tron',
      'Q5', 'Q5 Sportback', 'Q7', 'Q8', 'Q8 e-tron', 'Q8 Sportback e-tron',
      // S-performance
      'S1', 'S3', 'S4', 'S4 Avant', 'S5', 'S5 Sportback', 'S6', 'S6 Avant',
      'S7', 'S8', 'SQ2', 'SQ5', 'SQ5 Sportback', 'SQ7', 'SQ8',
      // RS-performance
      'RS3', 'RS3 Sportback', 'RS4', 'RS4 Avant', 'RS5', 'RS5 Sportback',
      'RS6', 'RS6 Avant', 'RS7', 'RS Q3', 'RS Q3 Sportback', 'RS Q8',
      'RS e-tron GT',
      // Sports / Electric
      'TT', 'TT Roadster', 'TTS', 'TT RS', 'R8', 'R8 Spyder',
      'e-tron', 'e-tron Sportback', 'e-tron GT',
    ],
  },
  {
    name: 'BMW',
    country: 'DE',
    models: [
      // Core series
      '1 Series', '2 Series', '2 Series Active Tourer', '2 Series Gran Coupe',
      '2 Series Gran Tourer', '3 Series', '3 Series Touring', '3 Series Gran Turismo',
      '4 Series', '4 Series Gran Coupe', '4 Series Convertible',
      '5 Series', '5 Series Touring', '5 Series Gran Turismo',
      '6 Series', '6 Series Gran Coupe', '6 Series Gran Turismo',
      '7 Series', '8 Series', '8 Series Gran Coupe', '8 Series Convertible',
      // X-series SUVs
      'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM',
      // Z-series
      'Z3', 'Z4',
      // i-series electric
      'i3', 'i4', 'i5', 'i5 Touring', 'i7', 'i8',
      'iX', 'iX1', 'iX2', 'iX3',
      // M-performance
      'M2', 'M3', 'M3 Touring', 'M4', 'M4 Convertible',
      'M5', 'M5 Touring', 'M8', 'M8 Gran Coupe',
      'X3 M', 'X4 M', 'X5 M', 'X6 M',
    ],
  },
  {
    name: 'Mercedes-Benz',
    country: 'DE',
    models: [
      // Core classes
      'A-Class', 'A-Class Sedan', 'B-Class',
      'C-Class', 'C-Class Estate', 'C-Class Coupe', 'C-Class Cabriolet',
      'CLA', 'CLA Shooting Brake', 'CLE', 'CLE Cabriolet', 'CLK', 'CLS',
      'E-Class', 'E-Class Estate', 'E-Class Coupe', 'E-Class Cabriolet', 'E-Class All-Terrain',
      'S-Class', 'S-Class Maybach',
      // SUVs / Crossovers
      'G-Class', 'GLA', 'GLB', 'GLC', 'GLC Coupe',
      'GLE', 'GLE Coupe', 'GLS',
      'ML', 'GL', 'GLK', 'R-Class',
      // Sports / Roadsters
      'AMG GT', 'AMG GT 4-Door', 'SL', 'SLK', 'SLC', 'SLR McLaren', 'SLS AMG',
      // EQ Electric
      'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'EQV',
      // Vans / Commercial
      'V-Class', 'Marco Polo', 'Vito', 'Citan', 'Sprinter',
      // AMG standalone
      'AMG One', 'AMG C 63', 'AMG E 63', 'AMG S 63',
    ],
  },
  {
    name: 'Volkswagen',
    country: 'DE',
    models: [
      // Compact / Sedans
      'Up!', 'Polo', 'Golf', 'Golf Variant', 'Golf Sportsvan', 'Golf Plus',
      'Golf GTI', 'Golf GTD', 'Golf GTE', 'Golf R',
      'Jetta', 'Bora', 'Passat', 'Passat Variant', 'Passat CC', 'CC', 'Arteon',
      'Arteon Shooting Brake', 'Phaeton',
      // SUVs / Crossovers
      'T-Cross', 'T-Roc', 'T-Roc Cabriolet', 'Taigo', 'Tiguan', 'Tiguan Allspace',
      'Touareg', 'Atlas',
      // MPVs
      'Touran', 'Sharan',
      // Sports / Classic
      'Scirocco', 'Beetle', 'Eos',
      'Lupo', 'Fox',
      // ID Electric
      'ID.3', 'ID.4', 'ID.4 GTX', 'ID.5', 'ID.5 GTX', 'ID.7', 'ID.7 Tourer', 'ID.Buzz',
      // Commercial
      'Caddy', 'Transporter', 'Multivan', 'Caravelle', 'Crafter', 'Amarok',
    ],
  },
  {
    name: 'Opel',
    country: 'DE',
    models: [
      // Current models
      'Corsa', 'Corsa-e', 'Astra', 'Astra Sports Tourer', 'Insignia', 'Insignia Grand Sport',
      'Insignia Sports Tourer', 'Insignia Country Tourer',
      'Crossland', 'Crossland X', 'Grandland', 'Grandland X',
      'Mokka', 'Mokka-e', 'Mokka X',
      'Rocks-e',
      // Discontinued (common used)
      'Adam', 'Karl', 'Meriva', 'Zafira', 'Zafira Tourer', 'Zafira Life',
      'Cascada', 'Cabrio',
      'Vectra', 'Vectra Caravan', 'Signum', 'Omega',
      'Astra GTC', 'Astra OPC',
      'Antara', 'Frontera', 'Monterey',
      'Agila', 'Tigra', 'GT', 'Speedster', 'Calibra',
      'Ampera', 'Ampera-e',
      // Commercial
      'Combo', 'Combo Life', 'Vivaro', 'Vivaro-e', 'Movano',
    ],
  },
  {
    name: 'Porsche',
    country: 'DE',
    models: [
      '911', '911 Carrera', '911 Turbo', '911 GT3', '911 GT3 RS',
      '911 Targa', '911 Cabriolet', '911 Dakar',
      '718 Boxster', '718 Cayman', '718 Spyder', '718 Cayman GT4',
      'Boxster', 'Cayman',
      'Panamera', 'Panamera Sport Turismo',
      'Macan', 'Macan Electric', 'Cayenne', 'Cayenne Coupe',
      'Taycan', 'Taycan Cross Turismo', 'Taycan Sport Turismo',
      '918 Spyder', 'Carrera GT',
    ],
  },
  {
    name: 'Smart',
    country: 'DE',
    models: [
      'ForTwo', 'ForTwo Cabrio', 'ForTwo EQ',
      'ForFour', 'ForFour EQ',
      'Roadster', '#1', '#3',
    ],
  },
  {
    name: 'Mini',
    country: 'DE',
    models: [
      'Hatch', '3-Door', '5-Door',
      'Clubman', 'Countryman', 'Convertible',
      'Cooper', 'Cooper S', 'Cooper SE', 'Cooper Electric',
      'John Cooper Works', 'Paceman', 'Roadster', 'Coupe',
      'Aceman', 'Countryman Electric',
      'One', 'One D',
    ],
  },
  {
    name: 'Maybach',
    country: 'DE',
    models: ['S-Class', 'GLS', '57', '62'],
  },

  // ═══════════════════════════════════════
  // FRENCH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Peugeot',
    country: 'FR',
    models: [
      // Current
      '108', '208', 'e-208', '308', 'e-308', '308 SW',
      '408', '508', '508 SW', '508 PSE',
      '2008', 'e-2008', '3008', 'e-3008', '5008', 'e-5008',
      // Discontinued (common used)
      '106', '107', '206', '206 CC', '206 SW', '206+',
      '207', '207 CC', '207 SW', '301',
      '306', '307', '307 CC', '307 SW',
      '407', '407 Coupe', '407 SW', '607',
      '807', '1007', '4007', '4008',
      'RCZ', 'iOn',
      // Commercial
      'Partner', 'Partner Tepee', 'Rifter', 'e-Rifter',
      'Expert', 'e-Expert', 'Traveller', 'e-Traveller',
      'Boxer', 'e-Boxer', 'Bipper',
    ],
  },
  {
    name: 'Renault',
    country: 'FR',
    models: [
      // Current
      'Clio', 'Megane', 'Megane Estate', 'Megane E-Tech',
      'Captur', 'Arkana', 'Austral', 'Espace', 'Rafale',
      'Scenic', 'Scenic E-Tech', 'Twingo', 'Twingo E-Tech', 'Zoe',
      'Symbioz',
      // Discontinued (common used)
      'Laguna', 'Laguna Estate', 'Latitude', 'Talisman', 'Talisman Estate',
      'Vel Satis', 'Safrane', 'Fluence', 'Symbol', 'Thalia',
      'Modus', 'Grand Modus', 'Wind',
      'Megane RS', 'Megane CC', 'Megane Scenic',
      'Kadjar', 'Koleos',
      'Captur', 'Grand Scenic',
      'Twizy', 'Avantime', 'Spider',
      // Commercial
      'Kangoo', 'Kangoo E-Tech', 'Express',
      'Trafic', 'SpaceClass',
      'Master',
    ],
  },
  {
    name: 'Citroën',
    country: 'FR',
    models: [
      // Current
      'C3', 'C3 Aircross', 'C3 You', 'C4', 'C4 X', 'e-C4', 'e-C4 X',
      'C5 Aircross', 'C5 X',
      'Ami',
      // Discontinued (common used)
      'C1', 'C2', 'C3 Picasso', 'C3 Pluriel',
      'C4 Cactus', 'C4 Picasso', 'Grand C4 Picasso', 'C4 SpaceTourer', 'Grand C4 SpaceTourer',
      'C5', 'C5 Tourer', 'C6', 'C8',
      'C-Crosser', 'C-Elysee', 'C-Zero',
      'Xsara', 'Xsara Picasso', 'Saxo',
      'DS3', 'DS4', 'DS5',
      // Commercial
      'Berlingo', 'e-Berlingo', 'Berlingo Multispace',
      'SpaceTourer', 'e-SpaceTourer',
      'Jumpy', 'e-Jumpy', 'Jumper', 'Nemo',
    ],
  },
  {
    name: 'DS',
    country: 'FR',
    models: [
      'DS 3', 'DS 3 Crossback', 'DS 3 E-Tense',
      'DS 4', 'DS 4 Cross',
      'DS 7', 'DS 7 Crossback', 'DS 7 E-Tense',
      'DS 9', 'DS 9 E-Tense',
    ],
  },
  {
    name: 'Alpine',
    country: 'FR',
    models: ['A110', 'A110 S', 'A110 R', 'A290'],
  },
  {
    name: 'Bugatti',
    country: 'FR',
    models: ['Chiron', 'Chiron Sport', 'Chiron Pur Sport', 'Divo', 'Centodieci', 'Bolide', 'Mistral', 'Tourbillon', 'Veyron'],
  },

  // ═══════════════════════════════════════
  // ITALIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Fiat',
    country: 'IT',
    models: [
      // Current
      '500', '500e', '500X', '500L', '600e', 'Panda', 'Panda Cross', 'Tipo',
      'Tipo Cross', 'Tipo Station Wagon',
      // Discontinued (common used)
      'Punto', 'Grande Punto', 'Punto Evo',
      'Bravo', 'Brava', 'Linea', 'Stilo',
      'Croma', 'Idea', 'Sedici',
      'Multipla', 'Ulysse',
      '124 Spider', 'Barchetta', 'Coupe',
      'Qubo', 'Fullback',
      'Seicento',
      // Commercial
      'Doblo', 'Fiorino', 'Scudo', 'Talento', 'Ducato',
      'Professional', 'E-Doblo', 'E-Scudo',
    ],
  },
  {
    name: 'Abarth',
    country: 'IT',
    models: [
      '500', '500e', '500C', '595', '595C', '595 Competizione',
      '695', '695 Rivale', '695 Biposto',
      '124 Spider', 'Punto', 'Grande Punto',
    ],
  },
  {
    name: 'Alfa Romeo',
    country: 'IT',
    models: [
      // Current
      'Giulia', 'Giulia Quadrifoglio', 'Stelvio', 'Stelvio Quadrifoglio',
      'Tonale', 'Junior',
      // Discontinued (common used)
      'Giulietta', 'MiTo',
      '147', '147 GTA', '156', '156 Sportwagon', '159', '159 Sportwagon',
      '166', 'GT', 'GTV', 'Spider', 'Brera',
      '4C', '4C Spider', '8C', '8C Spider',
      'Crosswagon', '33', '75', '145', '146', '155',
    ],
  },
  {
    name: 'Lancia',
    country: 'IT',
    models: [
      'Ypsilon', 'Ypsilon HF',
      // Discontinued (common used in Southern Europe)
      'Delta', 'Musa', 'Phedra', 'Thesis', 'Lybra', 'Dedra',
      'Kappa', 'Stratos',
    ],
  },
  {
    name: 'Maserati',
    country: 'IT',
    models: [
      'Ghibli', 'Quattroporte', 'Levante', 'MC20', 'MC20 Cielo',
      'Grecale', 'Grecale Folgore', 'GranTurismo', 'GranTurismo Folgore',
      'GranCabrio', 'GranCabrio Folgore',
      // Discontinued
      'GranSport', 'Coupe', 'Spyder', '3200 GT',
    ],
  },
  {
    name: 'Ferrari',
    country: 'IT',
    models: [
      // Current / Recent
      'Roma', 'Roma Spider', 'Portofino M', '296 GTB', '296 GTS',
      'SF90 Stradale', 'SF90 Spider', 'F8 Tributo', 'F8 Spider',
      '812 Superfast', '812 GTS', '812 Competizione',
      'Purosangue', 'Daytona SP3', '12Cilindri',
      // Discontinued (commonly traded)
      'F12 Berlinetta', 'GTC4Lusso', '488 GTB', '488 Spider', '488 Pista',
      '458 Italia', '458 Spider', '458 Speciale',
      'California', 'California T', 'FF',
      '599 GTB', '599 GTO', '612 Scaglietti',
      'F430', 'F430 Spider', '360 Modena', '360 Spider',
      'F355', '348', 'Testarossa', 'Enzo',
      'LaFerrari',
    ],
  },
  {
    name: 'Lamborghini',
    country: 'IT',
    models: [
      'Huracán', 'Huracán Evo', 'Huracán STO', 'Huracán Tecnica', 'Huracán Sterrato',
      'Urus', 'Urus SE', 'Urus Performante',
      'Revuelto', 'Temerario',
      // Discontinued
      'Aventador', 'Aventador SVJ', 'Aventador Ultimae',
      'Gallardo', 'Gallardo Spyder',
      'Murciélago', 'Diablo', 'Countach LPI 800-4', 'Sián',
    ],
  },
  {
    name: 'Pagani',
    country: 'IT',
    models: ['Huayra', 'Huayra Roadster', 'Huayra R', 'Utopia', 'Zonda'],
  },
  {
    name: 'De Tomaso',
    country: 'IT',
    models: ['P72'],
  },

  // ═══════════════════════════════════════
  // CZECH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Škoda',
    country: 'CZ',
    models: [
      // Current
      'Fabia', 'Fabia Combi', 'Scala', 'Octavia', 'Octavia Combi', 'Octavia RS',
      'Superb', 'Superb Combi', 'Superb iV',
      'Kamiq', 'Karoq', 'Kodiaq', 'Kodiaq RS',
      'Enyaq iV', 'Enyaq Coupé iV', 'Enyaq RS iV',
      'Elroq', 'Epiq',
      // Discontinued (common used)
      'Citigo', 'Citigo iV',
      'Rapid', 'Rapid Spaceback',
      'Roomster', 'Roomster Praktik',
      'Yeti',
      'Felicia',
    ],
  },

  // ═══════════════════════════════════════
  // SPANISH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'SEAT',
    country: 'ES',
    models: [
      // Current
      'Ibiza', 'Leon', 'Leon Sportstourer', 'Leon FR',
      'Arona', 'Ateca', 'Tarraco',
      // Discontinued (common used)
      'Mii', 'Toledo', 'Exeo', 'Exeo ST',
      'Altea', 'Altea XL', 'Altea Freetrack',
      'Alhambra', 'Cordoba', 'Arosa',
      'Leon Cupra', 'Leon FR',
    ],
  },
  {
    name: 'CUPRA',
    country: 'ES',
    models: [
      'Born', 'Formentor', 'Leon', 'Leon Sportstourer',
      'Ateca', 'Tavascan', 'Terramar', 'Raval',
    ],
  },

  // ═══════════════════════════════════════
  // ROMANIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Dacia',
    country: 'RO',
    models: [
      // Current
      'Sandero', 'Sandero Stepway', 'Logan', 'Logan MCV', 'Logan Stepway',
      'Duster', 'Jogger', 'Spring',
      'Bigster',
      // Discontinued
      'Lodgy', 'Lodgy Stepway', 'Dokker', 'Dokker Stepway',
      'Solenza', '1300', '1310',
    ],
  },

  // ═══════════════════════════════════════
  // SWEDISH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Volvo',
    country: 'SE',
    models: [
      // Current
      'S60', 'S90', 'V60', 'V60 Cross Country', 'V90', 'V90 Cross Country',
      'XC40', 'XC40 Recharge', 'XC60', 'XC90',
      'C40 Recharge', 'EX30', 'EX40', 'EX90', 'EM90',
      // Discontinued (common used)
      'S40', 'S80', 'V40', 'V40 Cross Country',
      'V50', 'V70', 'XC70',
      'C30', 'C70',
    ],
  },
  {
    name: 'Polestar',
    country: 'SE',
    models: ['Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4', 'Polestar 5', 'Polestar 6'],
  },
  {
    name: 'Koenigsegg',
    country: 'SE',
    models: ['Agera', 'Agera RS', 'Regera', 'Jesko', 'Jesko Absolut', 'Gemera', 'CC850', 'CCX', 'CCXR'],
  },
  {
    name: 'Saab',
    country: 'SE',
    models: [
      '9-3', '9-3 SportCombi', '9-3 Convertible', '9-3 Griffin',
      '9-5', '9-5 SportCombi',
      '9-4X', '9-2X',
      '900', '9000',
    ],
  },

  // ═══════════════════════════════════════
  // BRITISH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Jaguar',
    country: 'GB',
    models: [
      // Current / Recent
      'XE', 'XF', 'XF Sportbrake', 'XJ',
      'F-Type', 'F-Type Convertible',
      'E-Pace', 'F-Pace', 'F-Pace SVR', 'I-Pace',
      // Discontinued (common used)
      'S-Type', 'X-Type', 'X-Type Estate',
      'XK', 'XKR', 'XK8',
      'XJ6', 'XJ8', 'XJR',
    ],
  },
  {
    name: 'Land Rover',
    country: 'GB',
    models: [
      'Defender', 'Defender 90', 'Defender 110', 'Defender 130',
      'Discovery', 'Discovery Sport',
      'Range Rover', 'Range Rover Sport', 'Range Rover Velar',
      'Range Rover Evoque', 'Range Rover Evoque Convertible',
      // Discontinued
      'Freelander', 'Freelander 2',
      'Discovery 3', 'Discovery 4',
    ],
  },
  {
    name: 'Bentley',
    country: 'GB',
    models: [
      'Continental GT', 'Continental GT Convertible', 'Continental GT Speed',
      'Continental GTC',
      'Flying Spur', 'Flying Spur Hybrid',
      'Bentayga', 'Bentayga EWB', 'Bentayga S',
      // Discontinued
      'Mulsanne', 'Brooklands', 'Azure', 'Arnage',
    ],
  },
  {
    name: 'Rolls-Royce',
    country: 'GB',
    models: [
      'Ghost', 'Ghost Extended', 'Phantom', 'Phantom Extended',
      'Wraith', 'Dawn', 'Cullinan', 'Cullinan Black Badge',
      'Spectre',
      // Discontinued
      'Silver Shadow', 'Silver Spirit', 'Silver Seraph',
    ],
  },
  {
    name: 'Aston Martin',
    country: 'GB',
    models: [
      // Current
      'Vantage', 'Vantage Roadster', 'DB12', 'DB12 Volante',
      'DBS', 'DBS Volante', 'DBX', 'DBX707',
      'Valkyrie', 'Valhalla',
      // Discontinued (commonly traded)
      'DB11', 'DB11 Volante', 'DB9', 'DB9 Volante',
      'DBS Superleggera', 'Rapide', 'Rapide S',
      'V8 Vantage', 'V12 Vantage', 'Vanquish',
    ],
  },
  {
    name: 'McLaren',
    country: 'GB',
    models: [
      // Current
      'GT', 'Artura', 'Artura Spider', '750S', '750S Spider', 'W1',
      // Discontinued
      '720S', '720S Spider', '765LT', '765LT Spider',
      '570S', '570GT', '540C', '600LT',
      '620R', 'Elva', 'Speedtail', 'Senna',
      'P1', '650S', '12C', 'MP4-12C',
    ],
  },
  {
    name: 'Lotus',
    country: 'GB',
    models: [
      'Emira', 'Emira V6', 'Eletre', 'Emeya',
      // Discontinued
      'Evora', 'Evora GT', 'Exige', 'Elise',
      'Evija',
    ],
  },
  {
    name: 'Morgan',
    country: 'GB',
    models: ['Plus Four', 'Plus Six', 'Super 3', '3 Wheeler', 'Aero 8', 'Roadster'],
  },
  {
    name: 'Caterham',
    country: 'GB',
    models: ['Seven 170', 'Seven 270', 'Seven 340', 'Seven 360', 'Seven 420', 'Seven 480', 'Seven 620'],
  },
  {
    name: 'TVR',
    country: 'GB',
    models: ['Griffith', 'Tuscan', 'Sagaris', 'Tamora', 'T350', 'Cerbera'],
  },
  {
    name: 'Noble',
    country: 'GB',
    models: ['M500', 'M600', 'M400'],
  },
  {
    name: 'MG',
    country: 'GB',
    models: [
      // Current (SAIC ownership)
      'MG3', 'MG4', 'MG4 XPower', 'MG5', 'MG5 EV',
      'ZS', 'ZS EV', 'HS', 'HS PHEV',
      'Marvel R', 'Cyberster',
      // Classic (commonly traded as used)
      'MG TF', 'MG F', 'MG ZR', 'MG ZS (classic)', 'MG ZT',
    ],
  },

  // ═══════════════════════════════════════
  // CROATIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Rimac',
    country: 'HR',
    models: ['Nevera', 'Concept One'],
  },

  // ═══════════════════════════════════════
  // DUTCH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Donkervoort',
    country: 'NL',
    models: ['D8 GTO', 'D8 GTO-JD70', 'F22'],
  },
  {
    name: 'Spyker',
    country: 'NL',
    models: ['C8 Aileron', 'C8 Preliator', 'B6 Venator'],
  },

  // ═══════════════════════════════════════
  // AUSTRIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'KTM',
    country: 'AT',
    models: ['X-Bow', 'X-Bow GT', 'X-Bow GT-XR', 'X-Bow GTX'],
  },

  // ═══════════════════════════════════════
  // GERMAN (NICHE / TUNER)
  // ═══════════════════════════════════════
  {
    name: 'Wiesmann',
    country: 'DE',
    models: ['MF3', 'MF4', 'MF5', 'Project Thunderball'],
  },
  {
    name: 'Alpina',
    country: 'DE',
    models: [
      'B3', 'B3 Touring', 'B4', 'B4 Gran Coupe',
      'B5', 'B5 Touring', 'B7', 'B8 Gran Coupe',
      'XB7', 'XD3', 'XD4',
      'D3', 'D4', 'D5',
    ],
  },
  {
    name: 'Brabus',
    country: 'DE',
    models: [
      'Rocket 900', '800', '700', '600',
      'Smart Brabus', 'G 900',
    ],
  },

  // ═══════════════════════════════════════
  // JAPANESE BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Toyota',
    country: 'JP',
    models: [
      'Aygo', 'Aygo X', 'Yaris', 'Yaris Cross', 'Yaris GR',
      'Corolla', 'Corolla Touring Sports', 'Corolla Cross', 'Corolla Sedan',
      'Camry', 'Prius', 'Prius+',
      'C-HR', 'RAV4', 'RAV4 PHEV', 'Highlander',
      'Land Cruiser', 'Land Cruiser 70', 'Land Cruiser Prado',
      'Hilux', 'Proace', 'Proace City', 'Proace Verso',
      'Supra', 'GR86', 'GR Corolla',
      'bZ4X', 'Mirai',
      // Discontinued (common used)
      'Auris', 'Avensis', 'Verso', 'Urban Cruiser', 'IQ',
      'Celica', 'MR2',
    ],
  },
  {
    name: 'Honda',
    country: 'JP',
    models: [
      'Jazz', 'Civic', 'Civic Type R', 'Accord',
      'HR-V', 'CR-V', 'ZR-V',
      'e:Ny1', 'Honda e',
      // Discontinued (common used)
      'Insight', 'CR-Z', 'S2000', 'NSX',
      'City', 'FR-V', 'Stream',
    ],
  },
  {
    name: 'Nissan',
    country: 'JP',
    models: [
      'Micra', 'Note', 'Sentra', 'Altima',
      'Juke', 'Qashqai', 'X-Trail', 'Pathfinder',
      'Ariya', 'Leaf', 'Navara', 'GT-R', 'Z', '370Z', '350Z',
      // Discontinued (common used)
      'Almera', 'Primera', 'Tiida', 'Pulsar',
      'Murano', 'Terrano',
      'NV200', 'NV300', 'e-NV200',
    ],
  },
  {
    name: 'Mazda',
    country: 'JP',
    models: [
      'Mazda2', 'Mazda2 Hybrid', 'Mazda3', 'Mazda3 Fastback',
      'Mazda6', 'Mazda6 Wagon',
      'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'CX-90',
      'MX-5', 'MX-5 RF', 'MX-30',
      // Discontinued (common used)
      '2', '3', '5', '6',
      'CX-7', 'CX-9', 'BT-50',
      'RX-8',
    ],
  },
  {
    name: 'Suzuki',
    country: 'JP',
    models: [
      'Swift', 'Swift Sport', 'Ignis', 'Baleno',
      'Vitara', 'S-Cross', 'Jimny',
      'Across', 'Swace',
      // Discontinued (common used)
      'Alto', 'Celerio', 'Splash', 'SX4', 'SX4 S-Cross',
      'Kizashi', 'Grand Vitara', 'Liana',
    ],
  },
  {
    name: 'Subaru',
    country: 'JP',
    models: [
      'Impreza', 'Crosstrek', 'Legacy', 'Outback',
      'Forester', 'Solterra', 'BRZ', 'WRX', 'WRX STI',
      // Discontinued (common used)
      'XV', 'Levorg', 'Tribeca',
    ],
  },
  {
    name: 'Mitsubishi',
    country: 'JP',
    models: [
      'Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'Outlander PHEV',
      'L200', 'Colt',
      // Discontinued (common used)
      'Lancer', 'Lancer Evolution', 'Galant', 'Carisma',
      'Pajero', 'Pajero Sport', 'i-MiEV',
    ],
  },
  {
    name: 'Lexus',
    country: 'JP',
    models: [
      'IS', 'IS F', 'ES', 'GS', 'GS F', 'LS',
      'UX', 'UX 300e', 'NX', 'RX', 'RZ', 'RZ 450e',
      'LC', 'LC Convertible', 'LBX', 'GX', 'LX', 'TX',
      // Discontinued (common used)
      'CT', 'RC', 'RC F',
    ],
  },
  {
    name: 'Infiniti',
    country: 'JP',
    models: [
      'Q30', 'Q50', 'Q60', 'Q70',
      'QX30', 'QX50', 'QX55', 'QX60', 'QX80',
      // Discontinued
      'EX', 'FX', 'G37', 'M', 'JX',
    ],
  },
  {
    name: 'Isuzu',
    country: 'JP',
    models: ['D-Max', 'MU-X'],
  },
  {
    name: 'Acura',
    country: 'JP',
    models: ['Integra', 'TLX', 'RDX', 'MDX', 'ZDX', 'NSX'],
  },

  // ═══════════════════════════════════════
  // KOREAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Hyundai',
    country: 'KR',
    models: [
      'i10', 'i20', 'i20 N', 'i30', 'i30 N', 'i30 Fastback', 'i30 Wagon',
      'Elantra', 'Sonata',
      'Bayon', 'Kona', 'Kona N', 'Kona Electric',
      'Tucson', 'Santa Fe', 'Palisade',
      'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6', 'Ioniq 7',
      'Nexo', 'Staria',
      // Discontinued (common used)
      'i40', 'i40 Wagon', 'ix20', 'ix35', 'ix55',
      'Accent', 'Getz', 'Matrix',
      'Santa Fe Sport', 'Veloster', 'Veloster N',
      'Genesis Coupe', 'Equus',
    ],
  },
  {
    name: 'Kia',
    country: 'KR',
    models: [
      'Picanto', 'Rio', 'Ceed', 'Ceed SW', 'ProCeed', 'XCeed',
      'Forte', 'K5', 'K8',
      'Stonic', 'Niro', 'Niro EV', 'Niro PHEV',
      'Sportage', 'Sorento', 'Telluride',
      'EV6', 'EV6 GT', 'EV9', 'EV3', 'EV5',
      'Carnival',
      // Discontinued (common used)
      'Venga', 'Soul', 'Soul EV', 'Optima',
      'Carens', 'Ceed GT',
      'Stinger', 'Stinger GT',
    ],
  },
  {
    name: 'Genesis',
    country: 'KR',
    models: ['G70', 'G70 Shooting Brake', 'G80', 'G80 Electrified', 'G90', 'GV60', 'GV70', 'GV70 Electrified', 'GV80'],
  },
  {
    name: 'SsangYong',
    country: 'KR',
    models: [
      'Tivoli', 'Tivoli XLV', 'Korando', 'Korando e-Motion',
      'Rexton', 'Musso', 'Torres', 'Torres EVX',
      // Discontinued
      'Rodius', 'Kyron', 'Actyon',
    ],
  },

  // ═══════════════════════════════════════
  // AMERICAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Tesla',
    country: 'US',
    models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  },
  {
    name: 'Ford',
    country: 'US',
    models: [
      // European models
      'Fiesta', 'Fiesta ST', 'Focus', 'Focus ST', 'Focus RS',
      'Mondeo', 'Mondeo Hybrid', 'Galaxy', 'S-Max',
      'Mustang', 'Mustang Mach-E', 'Mustang Mach-E GT',
      'Puma', 'Puma ST', 'EcoSport', 'Kuga', 'Edge', 'Explorer',
      'Bronco', 'Bronco Sport',
      'F-150', 'F-150 Lightning', 'Ranger', 'Ranger Raptor', 'Maverick',
      'Transit', 'Transit Custom', 'Transit Connect', 'Transit Courier',
      'E-Transit', 'Tourneo', 'Tourneo Custom', 'Tourneo Connect', 'Tourneo Courier',
      // Discontinued (common used)
      'Ka', 'Ka+', 'C-Max', 'Grand C-Max', 'B-Max',
      'Fusion', 'Cougar',
    ],
  },
  {
    name: 'Chevrolet',
    country: 'US',
    models: [
      'Spark', 'Cruze', 'Malibu', 'Camaro', 'Corvette', 'Corvette Stingray',
      'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe',
      'Suburban', 'Silverado', 'Colorado',
      'Bolt EV', 'Bolt EUV', 'Equinox EV', 'Blazer EV',
      // European discontinued
      'Aveo', 'Captiva', 'Orlando', 'Trax (EU)',
      'Matiz', 'Kalos', 'Lacetti', 'Epica',
    ],
  },
  {
    name: 'Jeep',
    country: 'US',
    models: [
      'Renegade', 'Renegade 4xe', 'Compass', 'Compass 4xe',
      'Cherokee', 'Grand Cherokee', 'Grand Cherokee 4xe', 'Grand Cherokee L',
      'Wrangler', 'Wrangler 4xe', 'Gladiator',
      'Avenger', 'Recon', 'Wagoneer', 'Grand Wagoneer',
      // Discontinued
      'Commander', 'Patriot', 'Liberty',
    ],
  },
  {
    name: 'Dodge',
    country: 'US',
    models: ['Challenger', 'Charger', 'Charger Daytona', 'Durango', 'Hornet', 'Hornet R/T'],
  },
  {
    name: 'Chrysler',
    country: 'US',
    models: ['300', 'Pacifica', 'Pacifica Hybrid', 'Voyager', 'Grand Voyager', 'Sebring', 'Crossfire', 'PT Cruiser'],
  },
  {
    name: 'Cadillac',
    country: 'US',
    models: ['CT4', 'CT5', 'CT5-V', 'XT4', 'XT5', 'XT6', 'Escalade', 'Escalade V', 'Lyriq', 'Celestiq', 'Optiq'],
  },
  {
    name: 'GMC',
    country: 'US',
    models: ['Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Sierra', 'Sierra Denali', 'Canyon', 'Hummer EV', 'Hummer EV SUV'],
  },
  {
    name: 'Lincoln',
    country: 'US',
    models: ['Corsair', 'Nautilus', 'Aviator', 'Navigator', 'Continental', 'MKZ', 'MKC', 'MKX'],
  },
  {
    name: 'RAM',
    country: 'US',
    models: ['1500', '1500 REV', '2500', '3500', 'ProMaster', 'ProMaster City'],
  },
  {
    name: 'Rivian',
    country: 'US',
    models: ['R1T', 'R1S', 'R2', 'R3', 'R3X'],
  },
  {
    name: 'Lucid',
    country: 'US',
    models: ['Air', 'Air Pure', 'Air Touring', 'Air Grand Touring', 'Gravity'],
  },
  {
    name: 'Buick',
    country: 'US',
    models: ['Encore', 'Encore GX', 'Envision', 'Enclave', 'Electra E5'],
  },

  // ═══════════════════════════════════════
  // CHINESE BRANDS (European presence)
  // ═══════════════════════════════════════
  {
    name: 'BYD',
    country: 'CN',
    models: ['Atto 3', 'Dolphin', 'Seal', 'Seal U', 'Tang', 'Han', 'Sealion 7'],
  },
  {
    name: 'NIO',
    country: 'CN',
    models: ['ET5', 'ET5 Touring', 'ET7', 'EL6', 'EL7', 'EL8', 'EP9'],
  },
  {
    name: 'XPeng',
    country: 'CN',
    models: ['P7', 'P5', 'G6', 'G9', 'X9'],
  },
  {
    name: 'Lynk & Co',
    country: 'CN',
    models: ['01', '02'],
  },
  {
    name: 'Aiways',
    country: 'CN',
    models: ['U5', 'U6'],
  },
  {
    name: 'GWM/ORA',
    country: 'CN',
    models: ['ORA 03', 'ORA 07', 'WEY 03', 'WEY 05', 'WEY Coffee 01'],
  },
  {
    name: 'Zeekr',
    country: 'CN',
    models: ['001', 'X', '007'],
  },
  {
    name: 'Leapmotor',
    country: 'CN',
    models: ['T03', 'C10', 'C16', 'B10'],
  },

  // ═══════════════════════════════════════
  // RUSSIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Lada',
    country: 'RU',
    models: [
      // Current production
      'Granta', 'Granta Cross', 'Vesta', 'Vesta Cross', 'Vesta SW', 'Vesta SW Cross',
      'Niva Legend', 'Niva Travel', 'Largus', 'Largus Cross',
      // Discontinued (very common used in Balkans/Eastern Europe)
      'Samara', '2108', '2109', '21099',
      '2110', '2111', '2112',
      'Priora', 'Kalina', 'Kalina Cross',
      '4x4', '4x4 Urban', 'Niva',
      '2101', '2102', '2103', '2104', '2105', '2106', '2107',
      'Oka', 'Xray', 'Xray Cross',
    ],
  },
  {
    name: 'UAZ',
    country: 'RU',
    models: ['Patriot', 'Hunter', 'Pickup', 'Profi', 'Bukhanka', 'SGR'],
  },
  {
    name: 'GAZ',
    country: 'RU',
    models: ['Volga', 'Gazelle', 'Sobol', 'Gazelle Next', '21', '24', '3110', '31105'],
  },

  // ═══════════════════════════════════════
  // SERBIAN / YUGOSLAV BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Zastava',
    country: 'RS',
    models: [
      'Yugo', 'Yugo 45', 'Yugo 55', 'Yugo 60', 'Yugo Koral',
      'Yugo Florida', 'Yugo Tempo', 'Yugo Skala',
      '101', '128', '750', '850',
      '10', 'Coral', 'Skala',
    ],
  },

  // ═══════════════════════════════════════
  // POLISH BRANDS
  // ═══════════════════════════════════════
  {
    name: 'FSO',
    country: 'PL',
    models: ['Polonez', 'Polonez Caro', 'Warszawa'],
  },

  // ═══════════════════════════════════════
  // EAST GERMAN (CLASSIC / COLLECTOR)
  // ═══════════════════════════════════════
  {
    name: 'Trabant',
    country: 'DE',
    models: ['601', '1.1', 'P50', 'P60'],
  },
  {
    name: 'Wartburg',
    country: 'DE',
    models: ['353', '311', '312', '1.3'],
  },

  // ═══════════════════════════════════════
  // ADDITIONAL EUROPEAN (mobile.de/autoscout24)
  // ═══════════════════════════════════════
  {
    name: 'Rover',
    country: 'GB',
    models: [
      '25', '45', '75', '75 Tourer',
      '200', '400', '600', '800',
      'Streetwise', 'CityRover',
    ],
  },
  {
    name: 'Vauxhall',
    country: 'GB',
    models: [
      'Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland',
      'Mokka', 'Adam', 'Viva',
      'Vectra', 'Zafira', 'Meriva', 'Agila', 'Cascada',
    ],
  },
  {
    name: 'Hummer',
    country: 'US',
    models: ['H1', 'H2', 'H3', 'EV', 'EV SUV'],
  },
  {
    name: 'Pontiac',
    country: 'US',
    models: ['Firebird', 'GTO', 'G6', 'G8', 'Solstice', 'Vibe', 'Trans Am'],
  },
  {
    name: 'Oldsmobile',
    country: 'US',
    models: ['Cutlass', 'Alero', 'Intrigue', 'Bravada', '442'],
  },

  // ═══════════════════════════════════════
  // ADDITIONAL KOREAN (discontinued, common used)
  // ═══════════════════════════════════════
  {
    name: 'Daewoo',
    country: 'KR',
    models: [
      'Matiz', 'Kalos', 'Lacetti', 'Nubira', 'Leganza',
      'Tacuma', 'Evanda', 'Espero', 'Lanos', 'Nexia',
      'Tico', 'Cielo',
    ],
  },

  // ═══════════════════════════════════════
  // ADDITIONAL JAPANESE (mobile.de/autoscout24)
  // ═══════════════════════════════════════
  {
    name: 'Daihatsu',
    country: 'JP',
    models: [
      'Sirion', 'Cuore', 'Charade', 'Trevis', 'Materia',
      'Terios', 'Copen', 'YRV', 'Move', 'Rocky',
    ],
  },
  {
    name: 'Datsun',
    country: 'JP',
    models: ['on-DO', 'mi-DO', 'Go', 'Go+', '240Z', '280Z'],
  },

  // ═══════════════════════════════════════
  // ADDITIONAL CHINESE (European market 2024-2026)
  // ═══════════════════════════════════════
  {
    name: 'Chery',
    country: 'CN',
    models: ['Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5', 'Omoda 7', 'Jaecoo 7'],
  },
  {
    name: 'Changan',
    country: 'CN',
    models: ['Uni-V', 'Uni-T', 'Uni-K', 'CS55 Plus', 'CS75 Plus', 'Deepal S07', 'Deepal L07'],
  },
  {
    name: 'Dongfeng',
    country: 'CN',
    models: ['Box', 'Voyah Free', 'Voyah Dream', 'Nammi 01', 'Forthing 4'],
  },
  {
    name: 'Hongqi',
    country: 'CN',
    models: ['E-HS9', 'EH7', 'EHS7'],
  },
  {
    name: 'BAIC',
    country: 'CN',
    models: ['X55', 'X7', 'EU5', 'Beijing X55', 'Beijing X7'],
  },
  {
    name: 'Seres',
    country: 'CN',
    models: ['3', '5'],
  },
  {
    name: 'VinFast',
    country: 'VN',
    models: ['VF 6', 'VF 7', 'VF 8', 'VF 9'],
  },
  {
    name: 'JAC',
    country: 'CN',
    models: ['JS2', 'JS3', 'JS4', 'JS6', 'e-JS1'],
  },
  {
    name: 'XEV',
    country: 'CN',
    models: ['Yoyo'],
  },

  // ═══════════════════════════════════════
  // UKRAINIAN
  // ═══════════════════════════════════════
  {
    name: 'ZAZ',
    country: 'UA',
    models: ['Forza', 'Vida', 'Chance', 'Sens', 'Lanos', 'Slavuta', 'Tavria', 'Zaporozhets'],
  },

  // ═══════════════════════════════════════
  // ROMANIAN (additional)
  // ═══════════════════════════════════════
  {
    name: 'ARO',
    country: 'RO',
    models: ['10', '24', '240', '244', '246', '243', '461'],
  },

  // ═══════════════════════════════════════
  // MALAYSIAN
  // ═══════════════════════════════════════
  {
    name: 'Proton',
    country: 'MY',
    models: ['Saga', 'Persona', 'X50', 'X70', 'X90', 'Iriz', 'Exora'],
  },

  // ═══════════════════════════════════════
  // GERMAN (additional from mobile.de)
  // ═══════════════════════════════════════
  {
    name: 'Borgward',
    country: 'DE',
    models: ['BX5', 'BX7', 'Isabella'],
  },
  {
    name: 'Artega',
    country: 'DE',
    models: ['GT', 'Scalo', 'Karo-Isetta'],
  },
  {
    name: 'Gumpert',
    country: 'DE',
    models: ['Apollo', 'Apollo N', 'Nathalie'],
  },
  {
    name: 'Brilliance',
    country: 'CN',
    models: ['BS4', 'BS6', 'V5', 'H530', 'V3', 'V7'],
  },
  {
    name: 'Iveco',
    country: 'IT',
    models: ['Daily', 'Daily Electric', 'Eurocargo', 'S-Way', 'Massif', 'eDaily'],
  },
  {
    name: 'KGM',
    country: 'KR',
    models: ['Torres', 'Torres EVX', 'Korando', 'Rexton', 'Musso', 'Tivoli'],
  },
  {
    name: 'DeLorean',
    country: 'US',
    models: ['DMC-12', 'Alpha5'],
  },
  {
    name: 'Austin',
    country: 'GB',
    models: ['Mini', 'Healey', 'Allegro', 'Maxi', 'Montego', 'Metro'],
  },
  {
    name: 'Triumph',
    country: 'GB',
    models: ['TR6', 'TR7', 'TR8', 'Spitfire', 'Stag', 'GT6', 'Dolomite', 'Herald'],
  },
  {
    name: 'Morris',
    country: 'GB',
    models: ['Minor', 'Marina', 'Oxford', '1100'],
  },

  // ═══════════════════════════════════════
  // FRENCH (additional)
  // ═══════════════════════════════════════
  {
    name: 'Aixam',
    country: 'FR',
    models: ['City', 'Coupe', 'Crossline', 'eCity', 'eCrossline', 'eCoupe'],
  },

  // ═══════════════════════════════════════
  // INDIAN BRANDS
  // ═══════════════════════════════════════
  {
    name: 'Tata',
    country: 'IN',
    models: ['Nexon', 'Harrier', 'Safari', 'Tiago', 'Punch', 'Curvv'],
  },
  {
    name: 'Mahindra',
    country: 'IN',
    models: ['XUV700', 'Thar', 'Scorpio', 'XUV400', 'BE 6'],
  },
];

// ═══════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════

/** Common vehicle features used in listing forms */
export const COMMON_FEATURES = [
  'Air Conditioning', 'Climate Control', 'Heated Seats', 'Leather Seats',
  'Navigation System', 'Bluetooth', 'USB Port', 'Apple CarPlay', 'Android Auto',
  'Cruise Control', 'Parking Sensors', 'Backup Camera', 'Sunroof',
  'Keyless Entry', 'Push Button Start', 'Alloy Wheels', 'LED Headlights',
  'Fog Lights', 'Rain Sensor', 'Electric Windows', 'Electric Mirrors',
] as const;

/** Common safety features used in listing forms */
export const COMMON_SAFETY = [
  'ABS', 'ESP', 'Airbags', 'Side Airbags', 'Curtain Airbags',
  'ISOFIX', 'Lane Assist', 'Blind Spot Monitor', 'Forward Collision Warning',
  'Automatic Emergency Braking', 'Tire Pressure Monitor', 'Traction Control',
] as const;

/** Popular brands shown first in dropdowns (matches website order) */
export const POPULAR_MAKE_NAMES = [
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Opel',
  'Ford', 'Renault', 'Peugeot', 'Škoda', 'Fiat', 'Hyundai',
] as const;

/** All make names — popular brands first, then rest alphabetically */
export const CAR_MAKES: string[] = [
  ...POPULAR_MAKE_NAMES,
  ...CAR_DATA.map((m) => m.name)
    .filter((name) => !POPULAR_MAKE_NAMES.includes(name as any))
    .sort(),
];

/** Make → models lookup */
export const CAR_MODELS_BY_MAKE: Record<string, string[]> = Object.fromEntries(
  CAR_DATA.map((m) => [m.name, m.models]),
);

/** Get models for a given make (returns empty array if unknown) */
export function getModelsForMake(make: string): string[] {
  return CAR_MODELS_BY_MAKE[make] ?? [];
}

/** Get all European makes */
export function getEuropeanMakes(): string[] {
  const europeanCountries = ['DE', 'FR', 'IT', 'CZ', 'ES', 'RO', 'SE', 'GB', 'HR', 'NL', 'AT', 'RU', 'RS', 'PL'];
  return CAR_DATA
    .filter((m) => europeanCountries.includes(m.country))
    .map((m) => m.name)
    .sort();
}

/** Year range for vehicle listings (1970–current+1) */
export const MIN_YEAR = 1970;
export const MAX_YEAR = new Date().getFullYear() + 1;

/** Generate year options descending (newest first) */
export function getYearOptions(): number[] {
  const years: number[] = [];
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
    years.push(y);
  }
  return years;
}

/** Popular brands shown on the homepage (subset of all makes) */
export const POPULAR_BRANDS = [
  { name: 'BMW', initials: 'BMW', color: '#0066B1', logo: '/brands/bmw.png' },
  { name: 'Mercedes-Benz', initials: 'MB', color: '#333333', logo: '/brands/mercedes-benz.png' },
  { name: 'Audi', initials: 'A', color: '#BB0A30', logo: '/brands/audi.png' },
  { name: 'Volkswagen', initials: 'VW', color: '#001E50', logo: '/brands/volkswagen.png' },
  { name: 'Toyota', initials: 'T', color: '#EB0A1E', logo: '/brands/toyota.png' },
  { name: 'Opel', initials: 'O', color: '#F7A600', logo: '/brands/opel.png' },
  { name: 'Ford', initials: 'F', color: '#003478', logo: '/brands/ford.png' },
  { name: 'Renault', initials: 'R', color: '#FFCC00', logo: '/brands/renault.png' },
  { name: 'Peugeot', initials: 'P', color: '#1B3C6D', logo: '/brands/peugeot.png' },
  { name: 'Škoda', initials: 'Š', color: '#4BA82E', logo: '/brands/skoda.png' },
  { name: 'Fiat', initials: 'Fi', color: '#9E1B32', logo: '/brands/fiat.png' },
  { name: 'Hyundai', initials: 'H', color: '#002C5F', logo: '/brands/hyundai.png' },
] as const;
