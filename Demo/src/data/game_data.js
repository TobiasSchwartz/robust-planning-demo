const GAME_DATA = {
  BUDGET: 800,

  INTRO: {
    title: "Festival Planer",
    subtitle: 'Plane einen Festivalbesuch bei Rock am Ring<br>für dich und deine Crew!<br>Was könnte da schon schiefgehen? 😎',
    button_text: "Ready to rock? 🎸"
  },
  
  CATEGORY_DESCRIPTIONS: {
    default: "🎸 Ziel: Dein Wochenende soll auch dann klappen, wenn etwas Unerwartetes passiert!",
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
        cost: 40
      },
      car: {
        name: "Auto",
        icon: "🚗",
        robustness: 7,
        description: "Dein eigenes Auto, deine Regeln. Drei Parkzonen verfügbar. Möge der Parkplatz mit dir sein! 🎯",
        pro: ["Flexibel", "Notfall-Schlafplatz", "Viel Stauraum"],
        con: ["Staugefahr", "Pannenrisiko", "Parkplatzstress"],
        cost: 50
      },
      carpool: {
        name: "Fahrgemeinschaft",
        icon: "👥",
        robustness: 4,
        description: "Über 100 Mitfahrgelegenheiten verfügbar. 70% positive Bewertungen - der Rest war... interessant! 😅",
        pro: ["Günstig", "Neue Freunde", "Umweltfreundlich"],
        con: ["Unzuverlässig", "Fremde Menschen", "Kein Einfluss"],
        cost: 25
      },
      camper: {
        name: "Camping-Bus",
        icon: "🚐",
        robustness: 8,
        description: "Premium-Platz mit Stromanschluss. Anreise 10-20 Uhr. Dein mobiles Zuhause! ⚡",
        pro: ["All-in-One", "Regenfest", "Komfortabel"],
        con: ["Relativ teuer", "Zeitfenster", "Wenig Plätze"],
        cost: 100
      },
      heli: {
        name: "Helikopter",
        icon: "🚁",
        robustness: 7,
        description: "VIP-Style! Landung direkt neben der Hauptbühne. Rock'n'Roll, Baby! 🎸",
        pro: ["Mega-Eindruck", "Keine Staus", "Pure Freiheit"],
        con: ["Absurd teuer", "Wetterabhängig", "Angeber-Image"],
        cost: 2000
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
        con: ["Langer Aufbau", "Sturmgefährdet", "Teamarbeit nötig"],
        cost: 40
      },
      smallTents: {
        name: "2er-Zelte",
        icon: "🏕️",
        robustness: 8,
        description: "Klein, schnell, effektiv. 2 Min Aufbauzeit. Überall zu finden wie Mücken! 🦟",
        pro: ["Schnell", "Flexibel", "Ersetzbar"],
        con: ["Nicht regendicht", "Hellhörig", "Eng"],
        cost: 30
      },
      camperAcc: {
        name: "Camping-Bus",
        icon: "🚐",
        robustness: 6,
        description: "Erfordert die Anreise mit dem Camping-Bus. Deine Festival-Festung mit Strom! Luxus auf Rädern. 🏰",
        pro: ["Regenfest", "Komfort", "Strom"],
        con: ["Teuer", "Heizt sich auf", "Standortfixiert"],
        cost: 0,
        costLabel: "inklusive"
      },
      hotel: {
        name: "Stadt-Hotel",
        icon: "🏨",
        robustness: 7,
        description: "15km vom Festival. Täglich Shuttle. Echte Betten und Dusche! 🚿",
        pro: ["Luxus pur", "Echte Dusche", "Ruhe"],
        con: ["Pendeln nötig", "Teuer", "Festival-Flair fehlt"],
        cost: 100
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
        cost: 35
      },
      festivalFood: {
        name: "Food Trucks",
        icon: "🍕",
        robustness: 8,
        description: "40 Food-Trucks, 24/7 geöffnet. Kein Kochen, nur Schlemmen! 🍔",
        pro: ["Vielfältig", "Bequem", "Immer offen"],
        con: ["Von Trucks abhängig", "Teuer", "Warteschlangen"],
        cost: 75
      },
      hybrid: {
        name: "Kocher & Trucks",
        icon: "🍳",
        robustness: 9,
        description: "Kleiner Kocher plus Food-Trucks. Das Beste aus beiden Welten! 🃏",
        pro: ["Flexibel", "Plan B", "Kosteneffizient"],
        con: ["Komplex", "Mehr Planung", "Viel Equipment"],
        cost: 55
      },
      beerOnly: {
        name: "Nur Bier",
        icon: "🍺",
        robustness: 3,
        description: "Flüssige Nahrung! Wer braucht schon feste Nahrung? YOLO! 🤪",
        pro: ["Billig", "Party pur", "Keine Küche nötig"],
        con: ["Ungesund", "Konstanter Harndrang", "Filmriss"],
        cost: 30
      }
    }
  },

  COMBINATION_RULES: [
    // Bonus for all-in camper strategy
    {
      categories: ["transport", "accommodation"],
      condition: ["camper", "camperAcc"],
      bonus: 2,
      description: "All-in Camper-Strategie"
    },
    // Bonus for flexible hybrid approach
    {
      categories: ["food"],
      condition: ["hybrid"],
      bonus: 1,
      description: "Flexibler Backup-Plan"
    },
    // Penalty for risky beer-only choice
    {
      categories: ["food"],
      condition: ["beerOnly"],
      bonus: -2,
      description: "Hochriskante Ernährung"
    }
  ],

  DEPENDENCIES: {
    // Disabled combinations based on selections
    RESTRICTIONS: {
      "transport.train": {
        disables: [
          "accommodation.groupTent",
          "accommodation.camperAcc"
        ],
        reason: "Mit dem Zug kannst du nicht so viel Equipment transportieren!"
      },
      "transport.carpool": {
        disables: [
          "accommodation.groupTent",
          "accommodation.camperAcc",
          "food.cooking"
        ],
        reason: "In einer Fahrgemeinschaft ist kein Platz für viel Gepäck!"
      },
      "transport.car": {
        disables: [
          "accommodation.camperAcc"
        ],
        reason: "Mit einem normalen Auto kannst du nicht im Camping-Bus schlafen!"
      },
      "accommodation.hotel": {
        disables: [
          "food.cooking",
          "food.hybrid"
        ],
        reason: "Im Hotel kannst du nicht selbst kochen!"
      },
      "transport.heli": {
        disables: [
          "accommodation.groupTent",
          "accommodation.camperAcc",
          "food.cooking",
          "food.hybrid"
        ],
        reason: "Im Helikopter ist kaum Platz für Gepäck - und Gasflaschen sind verboten!"
      },
      "transport.camper": {
        disables: [
          "accommodation.hotel",
          "accommodation.smallTents",
          "accommodation.groupTent"
        ],
        reason: "Camping-Bus heißt: Du schläfst auch darin - kein Zelt, kein Hotel!"
      },
      "accommodation.groupTent": {
        disables: [
          "transport.heli",
          "transport.train",
          "transport.carpool"
        ],
        reason: "Das Gruppenzelt braucht viel Platz - du brauchst einen eigenen Wagen!"
      },
      "food.cooking": {
        disables: [
          "accommodation.hotel",
        ],
        reason: "Im Hotel kannst du nicht selbst kochen!"
      },
    }
  }
};