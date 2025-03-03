const EVENT_SYSTEM = {
  events: [
    // Weather Events
    {
      id: "heavyRain",
      name: "Sintflut-Regen! 🌧️",
      description: "Ein gigantisches Gewitter zieht am Samstag über das Festival! Die Wetterapp sagt: 12 Stunden Dauerregen!",
      criticalFailures: {
        accommodation: {
          smallTents: {
            fails: true,
            message: "Oh nein! Eure kleinen Zelte verwandeln sich in Planschbecken - alle Schlafsäcke sind durchweicht. Game Over! 🏊‍♂️"
          },
          groupTent: {
            failsUnless: {
              transport: ["car", "camper"],
            },
            message: "Ohne Fahrzeug zum Abstützen kippt das große Zelt im Sturm um wie ein nasser Sack. Tschüss Festival! 🌪️"
          }
        },
        transport: {
          heli: {
            fails: true,
            message: "Der Helikopter kann bei diesem Wetter nicht starten. Du verpasst das komplette Festival! ⛈️"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            accommodation: ["hotel", "camperAcc"]
          },
          message: "In deiner trockenen Unterkunft machst du es dir gemütlich, während draußen die Welt untergeht! ☕"
        },
        good: {
          conditions: {
            transport: ["car"],
            food: ["festivalFood", "hybrid"]
          },
          message: "Während andere im Regen paddeln, bleibst du relativ trocken. Die Food-Trucks retten deinen Tag! ⭐"
        },
        rough: {
          message: "Es ist matschig und nass, aber hey - so ein bisschen Regen hält echte Festival-Fans nicht auf! 💪"
        }
      }
    },

    {
      id: "heatwave",
      name: "Mega-Hitzewelle! 🌡️",
      description: "Die Temperaturen klettern auf 35 Grad - es ist offiziell: Das Festival wird zur Sauna!",
      criticalFailures: {
        accommodation: {
          camperAcc: {
            fails: true,
            message: "Dein Camper ohne Klimaanlage wird zum Backofen - da hilft nur die Flucht! 🔥"
          }
        },
        food: {
          cooking: {
            fails: true,
            message: "Bei der Hitze am Campingkocher zu stehen? Keine Chance, du gibst erschöpft auf! 🥵"
          },
          beerOnly: {
            fails: true,
            message: "Nur Bier bei dieser Hitze war keine gute Idee - du landest dehydriert im Sanitätszelt! 🚑"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            accommodation: ["hotel"],
            transport: ["heli"]
          },
          message: "Klimaanlage im Hotel und kühle Helikopterflüge über die schwitzende Masse - das Leben kann so schön sein! ❄️"
        },
        good: {
          conditions: {
            food: ["festivalFood"],
            accommodation: ["smallTents"]
          },
          message: "Die kleinen Zelte im Schatten sind perfekt, und die Food-Trucks haben sogar Eis! Du genießt deinen Festival-Sommer! 🍦"
        },
        rough: {
          message: "Puh, das ist heiß! Aber mit viel Wasser und Durchhaltewillen schaffst du es! 💦"
        }
      }
    },

    // Transport Events
    {
      id: "trafficJam",
      name: "Mega-Stau! 🚗",
      description: "Ein Unfall auf der Autobahn - der komplette Verkehr zum Festival steht still!",
      criticalFailures: {
        transport: {
          car: {
            failsUnless: {
              food: ["hybrid", "cooking"]
            },
            message: "6 Stunden im Stau ohne Vorräte - Mission gescheitert! 😫"
          },
          carpool: {
            fails: true,
            message: "Dein Fahrer gibt genervt auf und dreht um. Tja, das war's dann wohl... 🚫"
          }
        },
        food: {
          beerOnly: {
            failsIf: {
              transport: ["car", "carpool"]
            },
            message: "Stundenlang im Stau mit nichts außer Bier... die Polizei findet das gar nicht lustig! 👮"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            transport: ["heli", "train"]
          },
          message: "Du schwebst majestätisch über dem Stau hinweg - manchmal zahlt sich Luxus eben aus! 🚁"
        },
        good: {
          conditions: {
            transport: ["camper"],
            food: ["cooking", "hybrid"]
          },
          message: "Der Stau wird zur Camping-Party! Mit Essen an Bord ist das halb so wild! 🎵"
        },
        rough: {
          message: "Nach stundenlangem Stop-and-Go kommst du endlich an. Besser spät als nie! ⏰"
        }
      }
    },

    // Social Events
    {
      id: "neighborParty",
      name: "Laute Nachbarn! 🎵",
      description: "Deine Festival-Nachbarn feiern bis 4 Uhr morgens eine wilde Party!",
      criticalFailures: {
        accommodation: {
          smallTents: {
            failsIf: {
              transport: ["carpool", "train"]
            },
            message: "Ohne eigenes Fahrzeug als Rückzugsort bist du nach zwei schlaflosen Nächten völlig fertig! 😴"
          }
        },
        food: {
          beerOnly: {
            message: "Die Kombination aus Schlafmangel und ausschließlich Bier lässt dich das komplette Hauptprogramm verschlafen! 💤"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            accommodation: ["hotel"]
          },
          message: "In deinem ruhigen Hotelzimmer bekommst du von der Party nichts mit. Ausgeschlafen rockst du am nächsten Tag die Hauptbühne! 🎸"
        },
        good: {
          conditions: {
            transport: ["car", "camper"],
            accommodation: ["smallTents", "camperAcc"]
          },
          message: "Du verlegst dein Nachtlager kurzerhand woanders hin - Problem gelöst! 🚗"
        },
        rough: {
          message: "Wenn du sie nicht besiegen kannst, mach mit! Die Party war wild und morgen brauchst du definitiv einen Power-Nap... 🎊"
        }
      }
    },

    // Food Events
    {
      id: "foodTruckStrike",
      name: "Food-Truck Stop! 🍔",
      description: "Breaking News: Eine defekte Wasserleitung legt vorübergehend alle Food-Trucks lahm!",
      criticalFailures: {
        food: {
          festivalFood: {
            fails: true,
            message: "Ups! Dein Plan, dich nur von Food-Trucks zu ernähren, geht nach hinten los. Mit knurrendem Magen ist das Festival leider vorbei! 😅"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            food: ["cooking"],
            transport: ["car", "camper"]
          },
          message: "Deine Camping-Küche wird zum Geheimtipp! Sogar die Security kommt zum Nudeln schnorren! 🍝"
        },
        good: {
          conditions: {
            accommodation: ["hotel"]
          },
          message: "Das Hotel-Restaurant rettet dir den Tag! 🍽️"
        },
        rough: {
          message: "Trocken Brot und Käse aus dem Supermarkt... Naja, Hauptsache satt! 🧀"
        }
      }
    },

    // Positive Events
    {
      id: "surpriseGig",
      name: "Überraschungs-Konzert! 🎸",
      description: "Deine Lieblingsband kündigt spontan einen Überraschungs-Gig an!",
      criticalFailures: {
        accommodation: {
          hotel: {
            fails: true,
            message: "Bis du vom Hotel zum Festivalgelände kommst, ist das Konzert schon vorbei! 😭"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            accommodation: ["camperAcc", "smallTents", "groupTent"]
          },
          message: "Du bist direkt vor Ort und kannst das einmalige Konzert in vollen Zügen genießen! 🎵"
        },
        good: {
          message: "Du verpasst zwar den Anfang, aber der Rest ist trotzdem magisch! ✨"
        }
      }
    },

    {
      id: "vipParty",
      name: "VIP Einladung! 🎭",
      description: "Du gewinnst Zugang zur exklusiven Backstage-Party!",
      criticalFailures: {
        food: {
          beerOnly: {
            fails: true,
            message: "Nach zu viel Bier machst du dich vor deinen Lieblingskünstlern zum Affen. Peinlich! 🙈"
          }
        }
      },
      survivedOutcomes: {
        great: {
          conditions: {
            transport: ["heli"],
            accommodation: ["hotel"]
          },
          message: "Mit deinem VIP-Style passt du perfekt rein und knüpfst wertvolle Kontakte für die Zukunft! 🌟"
        },
        good: {
          conditions: {
            food: ["festivalFood", "hybrid"]
          },
          message: "Du genießt das luxuriöse Catering und hast einen unvergesslichen Abend! 🍾"
        },
        rough: {
          message: "Etwas fehl am Platz, aber eine coole Erfahrung! 🎭"
        }
      }
    }
  ],

  getRandomEvent() {
    return this.events[Math.floor(Math.random() * this.events.length)];
  },

  evaluateEvent(event, selections) {
    // 1. Check critical failures
    if (event.criticalFailures) {
      for (const [category, failures] of Object.entries(event.criticalFailures)) {
        const choice = selections[category];
        
        if (failures[choice]) {
          if (failures[choice].fails) {
            return {
              survived: false,
              message: failures[choice].message
            };
          }

          if (failures[choice].failsUnless) {
            const saved = Object.entries(failures[choice].failsUnless).every(
              ([reqCategory, validChoices]) => validChoices.includes(selections[reqCategory])
            );
            if (!saved) {
              return {
                survived: false,
                message: failures[choice].message
              };
            }
          }

          if (failures[choice].failsIf) {
            const fails = Object.entries(failures[choice].failsIf).every(
              ([reqCategory, badChoices]) => badChoices.includes(selections[reqCategory])
            );
            if (fails) {
              return {
                survived: false,
                message: failures[choice].message
              };
            }
          }
        }
      }
    }

    // 2. Check survival quality
    if (event.survivedOutcomes.great) {
      const isGreat = Object.entries(event.survivedOutcomes.great.conditions).every(
        ([category, validChoices]) => validChoices.includes(selections[category])
      );
      if (isGreat) {
        return {
          survived: true,
          quality: 'great',
          message: event.survivedOutcomes.great.message
        };
      }
    }

    if (event.survivedOutcomes.good) {
      const isGood = Object.entries(event.survivedOutcomes.good.conditions).every(
        ([category, validChoices]) => validChoices.includes(selections[category])
      );
      if (isGood) {
        return {
          survived: true,
          quality: 'good',
          message: event.survivedOutcomes.good.message
        };
      }
    }

    return {
      survived: true,
      quality: 'rough',
      message: event.survivedOutcomes.rough.message
    };
  }
};