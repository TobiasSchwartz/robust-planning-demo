const GAME_DATA = {
  BUDGET: 800,

  INTRO: {
    title: "Festival Planer",
    subtitle: 'Plane einen Festivalbesuch bei Rock am Ring<br>für dich und deine Crew!<br>Was könnte da schon schiefgehen? 😎',
    button_text: "Ready to rock? 🎸"
  },
  
  CATEGORY_DESCRIPTIONS: {
    default: "🎸 Wähle aus den drei Kategorien: Transport, Unterkunft und Verpflegung.\nJede Entscheidung beeinflusst, wie robust dein Festival-Wochenende wird!",
    transport: "🚗 Wie kommst du zum Festival? Von Zug bis Helikopter ist alles dabei!",
    accommodation: "⛺ Wo willst du schlafen? Vom Luxus-Hotel bis zum Minizelt.",
    food: "🍕 Der Festivalhunger kommt bestimmt! Gourmet oder Dosenbier?"
  },

  CATEGORIES: [
    { id: "transport", name: "Transport", icon: "🚗" },
    { id: "accommodation", name: "Unterkunft", icon: "⛺" },
    { id: "food", name: "Verpflegung", icon: "🍽️" }
  ],

  OPTIONS: {
    transport: {
      train: {
        name: "Zug",
        icon: "🚂",
        robustness: 8,
        description: "Stündlich zum Festival-Bahnhof. Shuttle inklusive. Letzte Fahrt 23 Uhr! 🏃‍♂️",
        pro: ["Staufrei", "Wetterunabhängig", "Umweltfreundlich"],
        con: ["Fahrplan-gebunden", "Wenig Gepäck", "Kein Plan B"],
        cost: 150
      },
      car: {
        name: "Auto",
        icon: "🚗",
        robustness: 7,
        description: "Dein eigenes Auto, deine Regeln. Drei Parkzonen verfügbar. Möge der Parkplatz mit dir sein! 🎯",
        pro: ["Flexibel", "Notfall-Schlafplatz", "Viel Stauraum"],
        con: ["Staugefahr", "Pannenrisiko", "Parkplatzstress"],
        cost: 180
      },
      carpool: {
        name: "Fahrgemeinschaft",
        icon: "👥",
        robustness: 4,
        description: "Über 100 Mitfahrgelegenheiten verfügbar. 70% positive Bewertungen - der Rest war... interessant! 😅",
        pro: ["Günstig", "Neue Freunde", "Umweltfreundlich"],
        con: ["Unzuverlässig", "Fremde Menschen", "Kein Einfluss"],
        cost: 50
      },
      camper: {
        name: "Camping-Bus",
        icon: "🚐",
        robustness: 8,
        description: "Premium-Platz mit Stromanschluss. Anreise 10-20 Uhr. Dein mobiles Zuhause! ⚡",
        pro: ["All-in-One", "Wetterfest", "Komfortabel"],
        con: ["Relativ teuer", "Zeitfenster", "Wenig Plätze"],
        cost: 400
      },
      heli: {
        name: "Helikopter",
        icon: "🚁",
        robustness: 7,
        description: "VIP-Style! Landung direkt neben der Hauptbühne. Rock'n'Roll, Baby! 🎸",
        pro: ["Mega-Eindruck", "Keine Staus", "Pure Freiheit"],
        con: ["Absurd teuer", "Wetterabhängig", "Angeber-Image"],
        cost: 800
      },
      // taxi: {
      //   name: "Premium Taxi",
      //   icon: "🚕",
      //   robustness: 6,
      //   description: "24/7 Luxus-Shuttle mit persönlichem Fahrer. Champagner inklusive! 🍾",
      //   pro: ["Flexibel", "Entspannt", "Stressfrei"],
      //   con: ["Teuer", "Staugefahr", "Abhängig vom Fahrer"],
      //   cost: 500
      // }
    },
    accommodation: {
      groupTent: {
        name: "Gruppenzelt",
        icon: "⛺",
        robustness: 4,
        description: "Festival-Palast mit 20m². Aufbauzeit: 25 Min zu viert oder 2h mit Chaos! 👑",
        pro: ["Gesellig", "Viel Platz", "Zentral"],
        con: ["Sturmgefährdet", "Aufwändig", "Teamarbeit nötig"],
        cost: 150
      },
      smallTents: {
        name: "2er-Zelte",
        icon: "🏕️",
        robustness: 8,
        description: "Klein, schnell, effektiv. 2 Min Aufbauzeit. Überall zu finden wie Mücken! 🦟",
        pro: ["Schnell", "Flexibel", "Ersetzbar"],
        con: ["Eng", "Getrennt", "Mehr Gewicht"],
        cost: 200
      },
      camperAcc: {
        name: "Camping-Bus",
        icon: "🚐",
        robustness: 6,
        description: "Erfordert die Anreise mit dem Camping-Bus. Deine Festival-Festung mit Strom! Luxus auf Rädern. 🏰",
        pro: ["Wetterfest", "Komfort", "Strom"],
        con: ["Teuer", "Standortfixiert", "Begrenzt"],
        cost: 0
      },
      hotel: {
        name: "Stadt-Hotel",
        icon: "🏨",
        robustness: 7,
        description: "15km vom Festival. Täglich Shuttle. Echte Betten und Dusche! 🚿",
        pro: ["Luxus pur", "Echte Dusche", "Ruhe"],
        con: ["Pendeln nötig", "Teuer", "Festival-Flair fehlt"],
        cost: 400
      }
    },
    food: {
      cooking: {
        name: "Campingkocher",
        icon: "🔥",
        robustness: 6,
        description: "DIY-Küche mit Gaskocher. 5 Supermärkte in 3km. Gordon Ramsay Mode! 👨‍🍳",
        pro: ["Günstig", "Flexibel", "Unabhängig"],
        con: ["Aufwändig", "Wetterabhängig", "Equipment nötig"],
        cost: 120
      },
      festivalFood: {
        name: "Festival-Food",
        icon: "🍕",
        robustness: 8,
        description: "40 Food-Trucks, 24/7 geöffnet. Kein Kochen, nur Schlemmen! 🍔",
        pro: ["Vielfältig", "Bequem", "Immer offen"],
        con: ["Teuer", "Warteschlangen", "Schwankende Qualität"],
        cost: 250
      },
      hybrid: {
        name: "Hybrid/Mix",
        icon: "🍳",
        robustness: 9,
        description: "Kleiner Kocher plus Food-Trucks. Das Beste aus beiden Welten! 🃏",
        pro: ["Flexibel", "Plan B", "Kosteneffizient"],
        con: ["Komplex", "Mehr Planung", "Viel Equipment"],
        cost: 200
      },
      beerOnly: {
        name: "Nur Bier",
        icon: "🍺",
        robustness: 3,
        description: "Flüssige Nahrung! Wer braucht schon feste Nahrung? YOLO! 🤪",
        pro: ["Billig", "Party pur", "Keine Küche nötig"],
        con: ["Ungesund", "Konstanter Harndrang", "Filmriss"],
        cost: 80
      }
    }
  },

  DEPENDENCIES: {
    // Disabled combinations based on selections
    RESTRICTIONS: {
      "transport.train": {
        disables: [
          "accommodation.groupTent",
          "accommodation.camperAcc",
        ],
        reason: "Mit dem Zug kannst du nicht so viel Equipment transportieren!"
      },
      "transport.carpool": {
        disables: [
          "accommodation.camperAcc",
          "accommodation.groupTent",
          "food.cooking"
        ],
        reason: "In einer Fahrgemeinschaft ist kein Platz für viel Gepäck!"
      },
      "accommodation.hotel": {
        disables: [
          "food.cooking"
        ],
        reason: "Im Hotel kannst du nicht selbst kochen!"
      },
      "transport.heli": {
        disables: [
          "accommodation.groupTent",
          "accommodation.camperAcc",
          "food.cooking"
        ],
        reason: "Im Helikopter ist der Platz für Gepäck sehr begrenzt!"
      },
      "transport.camper": {
        disables: [
          "accommodation.hotel",
        ],
        reason: "Mit dem Camping-Bus darfst du nicht in die Stadt fahren."
      },
      "accommodation.groupTent": {
        disables: [
          "transport.heli",
          "transport.train",
          "transport.car"
        ],
        reason: "Das Gruppenzelt braucht viel Platz!"
      },
      "food.cooking": {
        disables: [
          "accommodation.hotel",
        ],
        reason: "Im Hotel kannst du nicht selbst kochen!"
      },
      "accommodation.camperAcc": {
        disables: [
          "transport.train",
          "transport.carpool",
          "transport.heli",
          "transport.car"
        ],
        reason: "Wer im Camper schlafen will, muss auch damit anreisen!"
      }
    }
  }
};