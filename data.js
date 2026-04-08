(function () {
  function freitext(config) {
    return Object.assign(
      {
        type: "freitext",
        inputLabel: "Antwort",
        placeholder: "Antwort eingeben"
      },
      config
    );
  }

  function lueckentext(config) {
    return Object.assign(
      {
        type: "lueckentext",
        blanks: []
      },
      config
    );
  }

  function dragdrop(config) {
    return Object.assign(
      {
        type: "dragdrop",
        slots: [],
        options: [],
        correctMap: {}
      },
      config
    );
  }

  function fehlertext(config) {
    return Object.assign(
      {
        type: "fehlertext",
        inputLabel: "Korrigierter Satz",
        placeholder: "Schreibe den Satz richtig auf"
      },
      config
    );
  }

  function erklaerung(config) {
    return Object.assign(
      {
        type: "erklaerung",
        inputLabel: "Erklärung",
        placeholder: "Erkläre kurz, warum ..."
      },
      config
    );
  }

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function replaceText(value, replacements) {
    let result = String(value);

    Object.keys(replacements).forEach(function (source) {
      const target = replacements[source];
      result = result.split(source).join(target);
      result = result.split(source.toLowerCase()).join(String(target).toLowerCase());
    });

    return result;
  }

  function transformValue(value, replacements) {
    if (typeof value === "string") {
      return replaceText(value, replacements);
    }

    if (Array.isArray(value)) {
      return value.map(function (entry) {
        return transformValue(entry, replacements);
      });
    }

    if (value && typeof value === "object") {
      const copy = {};

      Object.keys(value).forEach(function (key) {
        copy[key] = key === "id" ? value[key] : transformValue(value[key], replacements);
      });

      return copy;
    }

    return value;
  }

  const taskVariants = [
    {
      suffix: "",
      titleSuffix: "",
      replacements: {}
    },
    {
      suffix: "-v2",
      titleSuffix: " · Variante 2",
      replacements: {
        Aylin: "Mina",
        Ben: "Noah",
        Lara: "Esra",
        Ali: "Yusuf",
        Nora: "Mara",
        Mira: "Zehra",
        Lea: "Sofia",
        "Frau Keller": "Frau Sommer",
        Bern: "Zürich",
        Bahnhof: "Busbahnhof",
        Schule: "Sprachschule",
        Klasse: "Lerngruppe",
        Gruppe: "Kurs"
      }
    },
    {
      suffix: "-v3",
      titleSuffix: " · Variante 3",
      replacements: {
        Aylin: "Nora",
        Ben: "Tariq",
        Lara: "Mara",
        Ali: "Bilal",
        Nora: "Lina",
        Mira: "Selin",
        Lea: "Amira",
        "Frau Keller": "Frau Weber",
        Bern: "Basel",
        Bahnhof: "Haltestelle",
        Schule: "Berufsschule",
        Klasse: "Gruppe",
        Gruppe: "Seminargruppe"
      }
    },
    {
      suffix: "-v4",
      titleSuffix: " · Variante 4",
      replacements: {
        Aylin: "Zehra",
        Ben: "Adam",
        Lara: "Lina",
        Ali: "Karim",
        Nora: "Mina",
        Mira: "Aylin",
        Lea: "Nora",
        "Frau Keller": "Frau Huber",
        Bern: "Luzern",
        Bahnhof: "Zugbahnhof",
        Schule: "Abendschule",
        Klasse: "AG",
        Gruppe: "Lerngruppe"
      }
    }
  ];

  function createTaskVariant(task, variant) {
    const copy = transformValue(cloneValue(task), variant.replacements);
    copy.id = task.id + variant.suffix;
    copy.title = String(copy.title || task.title || "") + variant.titleSuffix;
    return copy;
  }

  function expandTasks(tasks) {
    return taskVariants.reduce(function (all, variant) {
      return all.concat(
        tasks.map(function (task) {
          return createTaskVariant(task, variant);
        })
      );
    }, []);
  }

  const levels = [
    {
      id: "anfaenger",
      rank: "01",
      title: "Anfänger",
      subtitle: "Perfekt und Präteritum sicher bilden",
      description:
        "Hier geht es um die ersten Vergangenheitsformen: Perfekt für den Alltag und Präteritum für wichtige Grundformen und Erzählungen.",
      modules: [
        {
          id: "perfekt-bilden",
          title: "Perfekt bilden",
          summary: "Hilfsverb, Partizip II und Satzklammer im Perfekt richtig verwenden.",
          tasks: [
            freitext({
              id: "p1-ft",
              title: "Perfekt aus dem Präsens bilden",
              prompt: "Bilde das Perfekt: Ich lerne Deutsch.",
              acceptedAnswers: ["ich habe deutsch gelernt"],
              hint: "Du brauchst ein Hilfsverb und das Partizip II.",
              solution: "Ich habe Deutsch gelernt.",
              explanation:
                "Das Perfekt wird mit Hilfsverb und Partizip II gebildet. Bei 'lernen' heißt das: 'habe gelernt'."
            }),
            lueckentext({
              id: "p1-lt",
              title: "Hilfsverb und Partizip ergänzen",
              prompt: "Ergänze die Perfektform vollständig.",
              context: "Achte auf die Satzklammer.",
              segments: ["Gestern ", " wir lange im Park ", "."],
              blanks: [
                {
                  id: "b1",
                  label: "Hilfsverb",
                  answers: ["haben"]
                },
                {
                  id: "b2",
                  label: "Partizip II",
                  answers: ["gespielt"]
                }
              ],
              hint: "Im Perfekt steht das Hilfsverb vorn und das Partizip am Satzende.",
              solution: "Gestern haben wir lange im Park gespielt.",
              explanation:
                "Die Perfektform lautet 'haben gespielt'. Das Hilfsverb steht an Position 2, das Partizip II am Ende."
            }),
            dragdrop({
              id: "p1-dd",
              title: "Perfektsatz ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Perfektsatz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Verbteil 1" },
                { id: "ende", label: "Verbteil 2 + Rest" }
              ],
              options: [
                { id: "o1", label: "Am Abend" },
                { id: "o2", label: "hat" },
                { id: "o3", label: "Aylin ihre Hausaufgaben gemacht." },
                { id: "o4", label: "morgen" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Im Perfekt steht das Hilfsverb vor dem Subjekt, das Partizip ganz am Ende.",
              solution: "Am Abend hat Aylin ihre Hausaufgaben gemacht.",
              explanation:
                "Im Hauptsatz bildet das Perfekt eine Satzklammer: 'hat' steht früh, 'gemacht' steht am Ende."
            }),
            fehlertext({
              id: "p1-fe",
              title: "Falsches Hilfsverb korrigieren",
              prompt: "Korrigiere den Satz.",
              context: "Wir sind einen Film gesehen.",
              acceptedAnswers: ["wir haben einen film gesehen"],
              hint: "Das Verb 'sehen' bildet das Perfekt mit 'haben'.",
              solution: "Wir haben einen Film gesehen.",
              explanation:
                "Bei den meisten Vollverben verwendet man im Perfekt 'haben'. 'Sehen' ist kein Bewegungsverb mit Ortswechsel."
            }),
            erklaerung({
              id: "p1-er",
              title: "Hilfsverb erklären",
              prompt: "Erkläre kurz: Warum heißt es 'Ich bin nach Hause gegangen' und nicht 'Ich habe nach Hause gegangen'?",
              keywordGroups: [["sein", "bin"], ["bewegung", "ortswechsel", "richtung"]],
              acceptedAnswers: [
                "weil gehen eine bewegung mit ortswechsel ist und deshalb das perfekt mit sein gebildet wird",
                "weil man bei gehen im perfekt sein benutzt, da es um eine bewegung von einem ort zum anderen geht"
              ],
              hint: "Denke an Verben der Bewegung mit Ortswechsel.",
              solution:
                "Bei 'gehen' verwendet man im Perfekt 'sein', weil das Verb eine Bewegung mit Ortswechsel ausdrückt.",
              explanation:
                "Viele Bewegungsverben mit Richtungs- oder Ortswechsel bilden das Perfekt mit 'sein'."
            })
          ]
        },
        {
          id: "praeteritum-bilden",
          title: "Präteritum bilden",
          summary: "Typische Präteritumformen von sein, haben und wichtigen Verben anwenden.",
          tasks: [
            freitext({
              id: "p2-ft",
              title: "Präteritum von haben bilden",
              prompt: "Bilde das Präteritum: Ich habe keine Zeit.",
              acceptedAnswers: ["ich hatte keine zeit"],
              hint: "Die Präteritumform von 'haben' ist unregelmäßig.",
              solution: "Ich hatte keine Zeit.",
              explanation:
                "Im Präteritum heißt 'haben' nicht 'habte', sondern 'hatte'."
            }),
            lueckentext({
              id: "p2-lt",
              title: "Zwei Präteritumformen ergänzen",
              prompt: "Ergänze die Verben im Präteritum.",
              context: "Beide Formen stehen in einer Erzählung.",
              segments: ["Früher ", " mein Lehrer streng, aber er ", " immer fair."],
              blanks: [
                {
                  id: "b1",
                  label: "Verb 1",
                  answers: ["war"]
                },
                {
                  id: "b2",
                  label: "Verb 2",
                  answers: ["blieb"]
                }
              ],
              hint: "Die Formen gehören zu 'sein' und 'bleiben'.",
              solution: "Früher war mein Lehrer streng, aber er blieb immer fair.",
              explanation:
                "Im Präteritum heißt es 'war' und 'blieb'. Solche Formen muss man oft auswendig lernen."
            }),
            dragdrop({
              id: "p2-dd",
              title: "Erzählsatz ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Satz im Präteritum.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Verb" },
                { id: "ende", label: "Rest" }
              ],
              options: [
                { id: "o1", label: "Letzte Woche" },
                { id: "o2", label: "kam" },
                { id: "o3", label: "der Bus zu spät." },
                { id: "o4", label: "kommen" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Vergangenheitsform von 'kommen' lautet hier 'kam'.",
              solution: "Letzte Woche kam der Bus zu spät.",
              explanation:
                "Im Präteritum vieler starker Verben verändert sich der Stamm. Deshalb heißt es 'kam'."
            }),
            fehlertext({
              id: "p2-fe",
              title: "Unregelmäßige Form verbessern",
              prompt: "Korrigiere den Satz im Präteritum.",
              context: "Gestern gehte ich früh ins Bett.",
              acceptedAnswers: ["gestern ging ich früh ins bett", "gestern ging ich frueh ins bett"],
              hint: "Das Verb 'gehen' bildet das Präteritum unregelmäßig.",
              solution: "Gestern ging ich früh ins Bett.",
              explanation:
                "Die richtige Präteritumform von 'gehen' lautet 'ging'."
            }),
            erklaerung({
              id: "p2-er",
              title: "Verwendung erklären",
              prompt: "Erkläre kurz: Warum liest man das Präteritum oft in Geschichten und Berichten?",
              keywordGroups: [["geschichte", "erzählung", "bericht", "schrift"], ["vergangenheit"]],
              acceptedAnswers: [
                "weil das praeteritum in schriftlichen erzaehlungen oft fuer vergangene handlungen verwendet wird",
                "weil man in geschichten und berichten vergangene ereignisse oft im praeteritum erzaehlt"
              ],
              hint: "Es geht um schriftliche Erzählungen über Vergangenes.",
              solution:
                "Das Präteritum wird in Geschichten, Berichten und anderen schriftlichen Erzählungen oft für vergangene Handlungen verwendet.",
              explanation:
                "Im Alltag hört man häufig das Perfekt. In schriftlichen Erzähltexten ist dagegen das Präteritum typisch."
            })
          ]
        }
      ]
    },
    {
      id: "leicht-fortgeschritten",
      rank: "02",
      title: "Leicht fortgeschritten",
      subtitle: "Plusquamperfekt und Modalverben in der Vergangenheit",
      description:
        "Hier wird deutlich, was vor einer anderen Vergangenheit geschah und wie Modalverben in Perfekt und Präteritum funktionieren.",
      modules: [
        {
          id: "plusquamperfekt",
          title: "Plusquamperfekt",
          summary: "Vorvergangenheit bilden und richtig mit einer zweiten Vergangenheit verbinden.",
          tasks: [
            freitext({
              id: "p3-ft",
              title: "Vorvergangenheit bilden",
              prompt: "Bilde das Plusquamperfekt von dem ersten Satz: Lara schließt die Tür ab. Dann ging sie los.",
              acceptedAnswers: [
                "lara hatte die tür abgeschlossen",
                "lara hatte die tuer abgeschlossen"
              ],
              hint: "Du brauchst 'hatte' oder 'war' und ein Partizip II.",
              solution: "Lara hatte die Tür abgeschlossen.",
              explanation:
                "Das Plusquamperfekt zeigt, dass das Abschließen vor dem Losgehen passiert ist."
            }),
            lueckentext({
              id: "p3-lt",
              title: "Plusquamperfekt ergänzen",
              prompt: "Ergänze die Vorvergangenheit.",
              context: "Die Handlung vor dem Unterricht steht im Plusquamperfekt.",
              segments: ["Bevor der Unterricht begann, ", " wir alles ", "."],
              blanks: [
                {
                  id: "b1",
                  label: "Hilfsverb",
                  answers: ["hatten"]
                },
                {
                  id: "b2",
                  label: "Partizip II",
                  answers: ["vorbereitet"]
                }
              ],
              hint: "Das Hilfsverb steht hier im Präteritum: 'hatten'.",
              solution: "Bevor der Unterricht begann, hatten wir alles vorbereitet.",
              explanation:
                "Plusquamperfekt = Präteritum von 'haben/sein' + Partizip II."
            }),
            dragdrop({
              id: "p3-dd",
              title: "Vorher und nachher ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Satz mit Plusquamperfekt.",
              slots: [
                { id: "start", label: "Nebensatzanfang" },
                { id: "mitte", label: "Nebensatzrest" },
                { id: "ende", label: "Hauptsatz" }
              ],
              options: [
                { id: "o1", label: "Nachdem Ali gefrühstückt hatte," },
                { id: "o2", label: "ging er" },
                { id: "o3", label: "zur Schule." },
                { id: "o4", label: "frühstückt" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die frühere Handlung steht im Nebensatz mit 'hatte'.",
              solution: "Nachdem Ali gefrühstückt hatte, ging er zur Schule.",
              explanation:
                "Das Frühstück passierte zuerst. Deshalb steht es im Plusquamperfekt, die spätere Handlung im Präteritum."
            }),
            fehlertext({
              id: "p3-fe",
              title: "Zeitfolge korrigieren",
              prompt: "Korrigiere den Satz.",
              context: "Nachdem wir gegessen haben, gingen wir spazieren.",
              acceptedAnswers: [
                "nachdem wir gegessen hatten gingen wir spazieren",
                "nachdem wir gegessen hatten, gingen wir spazieren"
              ],
              hint: "Die frühere Handlung braucht hier das Plusquamperfekt.",
              solution: "Nachdem wir gegessen hatten, gingen wir spazieren.",
              explanation:
                "Das Essen geschah vor dem Spaziergang. Darum braucht der Nebensatz das Plusquamperfekt."
            }),
            erklaerung({
              id: "p3-er",
              title: "Funktion erklären",
              prompt: "Erkläre kurz: Wozu benutzt man das Plusquamperfekt?",
              keywordGroups: [["vor", "früher", "zuerst", "vorher"], ["vergangenheit"]],
              acceptedAnswers: [
                "man benutzt das plusquamperfekt fuer eine vergangene handlung, die vor einer anderen vergangenheit passiert ist",
                "das plusquamperfekt zeigt, dass etwas schon vorher in der vergangenheit geschehen war"
              ],
              hint: "Es geht um eine Handlung vor einer anderen Handlung in der Vergangenheit.",
              solution:
                "Das Plusquamperfekt benutzt man für eine vergangene Handlung, die vor einer anderen vergangenen Handlung passiert ist.",
              explanation:
                "Darum nennt man es auch Vorvergangenheit."
            })
          ]
        },
        {
          id: "modalverben-vergangenheit",
          title: "Modalverben in der Vergangenheit",
          summary: "Modalverben in Präteritum und Perfekt mit Doppelinfinitiv richtig verwenden.",
          tasks: [
            freitext({
              id: "p4-ft",
              title: "Perfekt mit Modalverb bilden",
              prompt: "Bilde das Perfekt: Ich muss früh aufstehen.",
              acceptedAnswers: [
                "ich habe früh aufstehen müssen",
                "ich habe frueh aufstehen muessen"
              ],
              hint: "Bei Modalverben stehen am Ende zwei Infinitive.",
              solution: "Ich habe früh aufstehen müssen.",
              explanation:
                "Im Perfekt mit Modalverb steht oft der Doppelinfinitiv: 'habe aufstehen müssen'."
            }),
            lueckentext({
              id: "p4-lt",
              title: "Modalverben im Präteritum",
              prompt: "Ergänze die beiden Modalverben im Präteritum.",
              context: "Es geht um Regeln und Möglichkeiten in der Kindheit.",
              segments: ["Als Kind ", " ich nie lange fernsehen, aber am Wochenende ", " ich ausschlafen."],
              blanks: [
                {
                  id: "b1",
                  label: "Modalverb 1",
                  answers: ["durfte"]
                },
                {
                  id: "b2",
                  label: "Modalverb 2",
                  answers: ["konnte"]
                }
              ],
              hint: "Die Formen gehören zu 'dürfen' und 'können'.",
              solution: "Als Kind durfte ich nie lange fernsehen, aber am Wochenende konnte ich ausschlafen.",
              explanation:
                "Im Präteritum lauten die Formen 'durfte' und 'konnte'."
            }),
            dragdrop({
              id: "p4-dd",
              title: "Perfekt mit Doppelinfinitiv ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Verbteil 1" },
                { id: "ende", label: "Verbteil 2 + Rest" }
              ],
              options: [
                { id: "o1", label: "Sie" },
                { id: "o2", label: "hat" },
                { id: "o3", label: "heute nicht kommen können." },
                { id: "o4", label: "gekonnt" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Im Perfekt mit Modalverb steht meistens kein Partizip wie 'gekonnt'.",
              solution: "Sie hat heute nicht kommen können.",
              explanation:
                "Bei der Ersatzinfinitiv-Konstruktion stehen am Satzende zwei Infinitive: 'kommen können'."
            }),
            fehlertext({
              id: "p4-fe",
              title: "Doppelinfinitiv verbessern",
              prompt: "Korrigiere den Satz.",
              context: "Wir haben ins Kino gehen gekonnt.",
              acceptedAnswers: [
                "wir haben ins kino gehen können",
                "wir haben ins kino gehen koennen"
              ],
              hint: "Im Perfekt mit Modalverb bleibt die Form meistens Infinitiv.",
              solution: "Wir haben ins Kino gehen können.",
              explanation:
                "Mit Modalverb verwendet man hier den Ersatzinfinitiv 'können' statt des Partizips 'gekonnt'."
            }),
            erklaerung({
              id: "p4-er",
              title: "Besonderheit erklären",
              prompt: "Erkläre kurz: Warum stehen in 'Ich habe kommen müssen' am Ende zwei Infinitive?",
              keywordGroups: [["modalverb", "müssen", "können", "wollen"], ["zwei", "infinitive", "doppelinfinitiv"]],
              acceptedAnswers: [
                "weil im perfekt mit modalverb oft ein doppelinfinitiv steht",
                "weil modalverben im perfekt haeufig mit zwei infinitiven am satzende erscheinen"
              ],
              hint: "Es geht um die besondere Perfektbildung mit Modalverben.",
              solution:
                "Bei Modalverben steht im Perfekt oft ein Doppelinfinitiv. Deshalb enden solche Sätze auf zwei Infinitive.",
              explanation:
                "Diese Form nennt man auch Ersatzinfinitiv."
            })
          ]
        }
      ]
    },
    {
      id: "fortgeschritten",
      rank: "03",
      title: "Fortgeschritten",
      subtitle: "Futur I und Futur II anwenden",
      description:
        "In diesem Bereich geht es um Zukunft, Vermutungen und um Handlungen, die bis zu einem zukünftigen Zeitpunkt abgeschlossen sein werden.",
      modules: [
        {
          id: "futur-eins",
          title: "Futur I",
          summary: "Zukunft mit 'werden' und Infinitiv sicher bilden.",
          tasks: [
            freitext({
              id: "p5-ft",
              title: "Zukunft ausdrücken",
              prompt: "Bilde das Futur I: Morgen lerne ich für die Prüfung.",
              acceptedAnswers: [
                "morgen werde ich für die prüfung lernen",
                "morgen werde ich fuer die pruefung lernen"
              ],
              hint: "Futur I = werden + Infinitiv.",
              solution: "Morgen werde ich für die Prüfung lernen.",
              explanation:
                "Im Futur I kombiniert man 'werden' mit dem Infinitiv des Vollverbs."
            }),
            lueckentext({
              id: "p5-lt",
              title: "Futur I ergänzen",
              prompt: "Ergänze den Satz im Futur I.",
              context: "Achte auf 'werden' und den Infinitiv.",
              segments: ["Nächste Woche ", " wir das Kapitel zu Ende ", "."],
              blanks: [
                {
                  id: "b1",
                  label: "Form von werden",
                  answers: ["werden"]
                },
                {
                  id: "b2",
                  label: "Infinitiv",
                  answers: ["lesen"]
                }
              ],
              hint: "Bei 'wir' heißt die Form von 'werden' ebenfalls 'werden'.",
              solution: "Nächste Woche werden wir das Kapitel zu Ende lesen.",
              explanation:
                "Das Futur I besteht aus 'werden' und Infinitiv. Der Infinitiv steht am Satzende."
            }),
            dragdrop({
              id: "p5-dd",
              title: "Zukunftssatz ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Futur-I-Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Verb" },
                { id: "ende", label: "Rest" }
              ],
              options: [
                { id: "o1", label: "In zwei Jahren" },
                { id: "o2", label: "wird" },
                { id: "o3", label: "Nora in Bern studieren." },
                { id: "o4", label: "studierte" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Der Infinitiv 'studieren' steht am Ende.",
              solution: "In zwei Jahren wird Nora in Bern studieren.",
              explanation:
                "Futur I verwendet 'wird' als finites Verb und den Infinitiv am Satzende."
            }),
            fehlertext({
              id: "p5-fe",
              title: "Futur I verbessern",
              prompt: "Korrigiere den Satz.",
              context: "Ich werde morgen gegangen.",
              acceptedAnswers: ["ich werde morgen gehen"],
              hint: "Nach 'werde' steht im Futur I der Infinitiv.",
              solution: "Ich werde morgen gehen.",
              explanation:
                "Das Partizip 'gegangen' gehört nicht ins Futur I. Dort steht der Infinitiv 'gehen'."
            }),
            erklaerung({
              id: "p5-er",
              title: "Bedeutung erklären",
              prompt: "Erkläre kurz: Was drückt das Futur I meistens aus?",
              keywordGroups: [["zukunft", "später", "morgen"], ["werden"]],
              acceptedAnswers: [
                "das futur i drueckt meistens zukunft aus und wird mit werden plus infinitiv gebildet",
                "mit dem futur i spricht man meist ueber etwas, das spaeter passieren wird"
              ],
              hint: "Denke an spätere Ereignisse.",
              solution:
                "Das Futur I drückt meistens Zukunft aus. Es wird mit 'werden' und dem Infinitiv gebildet.",
              explanation:
                "Oft kann das Futur I auch eine Absicht oder Vermutung ausdrücken, aber seine Grundfunktion ist die Zukunft."
            })
          ]
        },
        {
          id: "futur-zwei",
          title: "Futur II",
          summary: "Abgeschlossene Zukunft und Vermutungen mit Futur II formulieren.",
          tasks: [
            freitext({
              id: "p6-ft",
              title: "Abgeschlossene Zukunft bilden",
              prompt: "Bilde das Futur II: Bis 18 Uhr schreibt Lara den Bericht.",
              acceptedAnswers: ["bis 18 uhr wird lara den bericht geschrieben haben"],
              hint: "Futur II = werden + Partizip II + haben/sein.",
              solution: "Bis 18 Uhr wird Lara den Bericht geschrieben haben.",
              explanation:
                "Das Futur II zeigt, dass eine Handlung bis zu einem zukünftigen Zeitpunkt abgeschlossen sein wird."
            }),
            lueckentext({
              id: "p6-lt",
              title: "Futur II ergänzen",
              prompt: "Ergänze den Satz im Futur II.",
              context: "Achte auf die dreiteilige Verbform.",
              segments: ["In einer Stunde ", " der Zug den Bahnhof ", " ", "."],
              blanks: [
                {
                  id: "b1",
                  label: "Form von werden",
                  answers: ["wird"]
                },
                {
                  id: "b2",
                  label: "Partizip II",
                  answers: ["verlassen"]
                },
                {
                  id: "b3",
                  label: "Hilfsverb",
                  answers: ["haben"]
                }
              ],
              hint: "Die Verbteile lauten hier: wird + verlassen + haben.",
              solution: "In einer Stunde wird der Zug den Bahnhof verlassen haben.",
              explanation:
                "Im Futur II stehen am Satzende Partizip II und Hilfsverb im Infinitiv."
            }),
            dragdrop({
              id: "p6-dd",
              title: "Futur-II-Satz ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Futur-II-Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Verbteil 1" },
                { id: "ende", label: "Verbteil 2 + Rest" }
              ],
              options: [
                { id: "o1", label: "Bis morgen" },
                { id: "o2", label: "wird" },
                { id: "o3", label: "die Klasse das Projekt beendet haben." },
                { id: "o4", label: "beendet" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Klammer lautet hier: 'wird ... beendet haben'.",
              solution: "Bis morgen wird die Klasse das Projekt beendet haben.",
              explanation:
                "Das Futur II verbindet Zukunft mit bereits abgeschlossenem Ergebnis."
            }),
            fehlertext({
              id: "p6-fe",
              title: "Futur II korrigieren",
              prompt: "Korrigiere den Satz.",
              context: "Nächste Woche wird er die Aufgabe lösen haben.",
              acceptedAnswers: [
                "nächste woche wird er die aufgabe gelöst haben",
                "naechste woche wird er die aufgabe geloest haben"
              ],
              hint: "Im Futur II brauchst du das Partizip II.",
              solution: "Nächste Woche wird er die Aufgabe gelöst haben.",
              explanation:
                "Die Form 'lösen haben' ist falsch. Richtig ist 'gelöst haben'."
            }),
            erklaerung({
              id: "p6-er",
              title: "Zeitbedeutung erklären",
              prompt: "Erkläre kurz: Was zeigt das Futur II an?",
              keywordGroups: [["abgeschlossen", "fertig", "vollendet"], ["zukunft", "später"]],
              acceptedAnswers: [
                "das futur ii zeigt, dass etwas bis zu einem spaeteren zeitpunkt abgeschlossen sein wird",
                "mit futur ii sagt man, dass eine handlung in der zukunft schon fertig sein wird"
              ],
              hint: "Es geht um eine Handlung, die später bereits fertig ist.",
              solution:
                "Das Futur II zeigt, dass eine Handlung bis zu einem zukünftigen Zeitpunkt abgeschlossen sein wird.",
              explanation:
                "Darum passt das Futur II oft zu Angaben wie 'bis morgen' oder 'in einer Stunde'."
            })
          ]
        }
      ]
    },
    {
      id: "profi",
      rank: "04",
      title: "Profi",
      subtitle: "Alle Zeiten im Überblick und im Zusammenhang anwenden",
      description:
        "Zum Schluss werden Perfekt, Präteritum, Plusquamperfekt, Futur I und Futur II gezielt verglichen und in kleinen Kontexten kombiniert.",
      modules: [
        {
          id: "zeiten-ueberblick",
          title: "Überblick über alle Zeiten",
          summary: "Zeitformen unterscheiden und passend zum Sinn auswählen.",
          tasks: [
            freitext({
              id: "p7-ft",
              title: "Perfekt im Überblick",
              prompt: "Formuliere den Satz im Perfekt: Aylin besucht ihre Tante.",
              acceptedAnswers: ["aylin hat ihre tante besucht"],
              hint: "Du brauchst 'hat' und das Partizip II.",
              solution: "Aylin hat ihre Tante besucht.",
              explanation:
                "Auch im Überblick über alle Zeiten muss zuerst die passende Grundform sicher sitzen."
            }),
            lueckentext({
              id: "p7-lt",
              title: "Mehrere Zeiten ergänzen",
              prompt: "Ergänze die passende Zeitform in jeder Lücke.",
              context: "1 = Präteritum, 2 = Perfekt, 3 = Futur I.",
              segments: ["Gestern ", " ich krank, deshalb ", " ich zu Hause geblieben. Morgen ", " ich wieder in die Schule gehen."],
              blanks: [
                {
                  id: "b1",
                  label: "Lücke 1",
                  answers: ["war"]
                },
                {
                  id: "b2",
                  label: "Lücke 2",
                  answers: ["bin"]
                },
                {
                  id: "b3",
                  label: "Lücke 3",
                  answers: ["werde"]
                }
              ],
              hint: "Die drei Lücken gehören zu drei verschiedenen Zeitformen.",
              solution: "Gestern war ich krank, deshalb bin ich zu Hause geblieben. Morgen werde ich wieder in die Schule gehen.",
              explanation:
                "Präteritum, Perfekt und Futur I haben verschiedene Aufgaben. Hier zeigt jede Lücke eine andere Funktion."
            }),
            dragdrop({
              id: "p7-dd",
              title: "Zeitfolge ordnen",
              prompt: "Ordne die Satzteile zu einem sinnvollen Satz.",
              slots: [
                { id: "start", label: "Zeitangabe" },
                { id: "mitte", label: "frühere Handlung" },
                { id: "ende", label: "spätere Handlung" }
              ],
              options: [
                { id: "o1", label: "Vor dem Unterricht" },
                { id: "o2", label: "hatte Ben schon gefrühstückt," },
                { id: "o3", label: "jetzt trinkt er nur noch Tee." },
                { id: "o4", label: "frühstückt" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die frühere Handlung steht im Plusquamperfekt.",
              solution: "Vor dem Unterricht hatte Ben schon gefrühstückt, jetzt trinkt er nur noch Tee.",
              explanation:
                "Im Satz werden zwei Zeitebenen verbunden: Vorvergangenheit und Gegenwart."
            }),
            fehlertext({
              id: "p7-fe",
              title: "Futur II erkennen",
              prompt: "Korrigiere den Satz.",
              context: "Bis morgen hat Lea die Aufgabe beendet haben.",
              acceptedAnswers: ["bis morgen wird lea die aufgabe beendet haben"],
              hint: "Mit 'bis morgen' passt hier das Futur II.",
              solution: "Bis morgen wird Lea die Aufgabe beendet haben.",
              explanation:
                "Die Verbform braucht 'wird' als finites Verb und am Ende 'beendet haben'."
            }),
            erklaerung({
              id: "p7-er",
              title: "Zeitunterschied erklären",
              prompt: "Erkläre kurz den Unterschied zwischen Perfekt und Plusquamperfekt.",
              keywordGroups: [["perfekt", "vergangenheit"], ["plusquamperfekt", "vorvergangenheit", "vorher"]],
              acceptedAnswers: [
                "das perfekt beschreibt vergangenheit, das plusquamperfekt eine noch fruehere vergangenheit vor einer anderen handlung",
                "plusquamperfekt ist vorvergangenheit, perfekt beschreibt eine normale vergangene handlung"
              ],
              hint: "Eine Form ist Vergangenheit, die andere Vorvergangenheit.",
              solution:
                "Das Perfekt beschreibt eine vergangene Handlung. Das Plusquamperfekt beschreibt eine noch frühere Handlung vor einer anderen Vergangenheit.",
              explanation:
                "Darum braucht man das Plusquamperfekt oft in Verbindung mit Präteritum oder Perfekt."
            })
          ]
        },
        {
          id: "zeiten-im-kontext",
          title: "Zeiten im Zusammenhang",
          summary: "Zeitformen in kleinen Texten und sinnvollen Folgen sicher anwenden.",
          tasks: [
            freitext({
              id: "p8-ft",
              title: "Satz in eine andere Zeitform setzen",
              prompt: "Schreibe den Satz im Perfekt: Früher spielte Mira Klavier.",
              acceptedAnswers: [
                "früher hat mira klavier gespielt",
                "frueher hat mira klavier gespielt"
              ],
              hint: "Das Vollverb heißt im Partizip II 'gespielt'.",
              solution: "Früher hat Mira Klavier gespielt.",
              explanation:
                "Du wandelst hier eine Präteritumform in das Perfekt um."
            }),
            lueckentext({
              id: "p8-lt",
              title: "Mini-Text ergänzen",
              prompt: "Ergänze den kleinen Text mit den passenden Formen.",
              context: "1 = Plusquamperfekt-Hilfsverb, 2 = Partizip II, 3 = Präteritum.",
              segments: ["Als wir am Bahnhof ankamen, ", " der Zug schon ", ". Deshalb ", " wir ein Taxi."],
              blanks: [
                {
                  id: "b1",
                  label: "Lücke 1",
                  answers: ["war"]
                },
                {
                  id: "b2",
                  label: "Lücke 2",
                  answers: ["abgefahren"]
                },
                {
                  id: "b3",
                  label: "Lücke 3",
                  answers: ["nahmen"]
                }
              ],
              hint: "Die frühere Handlung ist schon abgeschlossen, die nächste steht im Präteritum.",
              solution: "Als wir am Bahnhof ankamen, war der Zug schon abgefahren. Deshalb nahmen wir ein Taxi.",
              explanation:
                "Hier sieht man gut, wie Plusquamperfekt und Präteritum zusammenarbeiten."
            }),
            dragdrop({
              id: "p8-dd",
              title: "Futur im Kontext ordnen",
              prompt: "Ordne die Satzteile zu einem korrekten Satz.",
              slots: [
                { id: "start", label: "Zeitangabe" },
                { id: "mitte", label: "Verb" },
                { id: "ende", label: "Rest" }
              ],
              options: [
                { id: "o1", label: "Nächste Woche" },
                { id: "o2", label: "wird" },
                { id: "o3", label: "Frau Keller die Tests zurückgeben." },
                { id: "o4", label: "zurückgegeben" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Es geht um eine einfache Zukunft, nicht um Futur II.",
              solution: "Nächste Woche wird Frau Keller die Tests zurückgeben.",
              explanation:
                "Mit Futur I kündigt der Satz eine Handlung in der Zukunft an."
            }),
            fehlertext({
              id: "p8-fe",
              title: "Zeitfolge im Satz verbessern",
              prompt: "Korrigiere den Satz so, dass die Zeitfolge stimmt.",
              context: "Bevor ich esse, hatte ich mir die Hände gewaschen.",
              acceptedAnswers: [
                "bevor ich aß hatte ich mir die hände gewaschen",
                "bevor ich aß, hatte ich mir die hände gewaschen",
                "bevor ich ass hatte ich mir die haende gewaschen",
                "bevor ich ass, hatte ich mir die haende gewaschen"
              ],
              hint: "Wenn der Hauptsatz in der Vergangenheit steht, muss auch der Nebensatz dazu passen.",
              solution: "Bevor ich aß, hatte ich mir die Hände gewaschen.",
              explanation:
                "Die frühere Handlung steht im Plusquamperfekt, die spätere Erzählhandlung im Präteritum."
            }),
            erklaerung({
              id: "p8-er",
              title: "Zeiten kombinieren erklären",
              prompt: "Erkläre kurz: Warum kombiniert man in Erzählungen oft Präteritum und Plusquamperfekt?",
              keywordGroups: [["präteritum", "praeteritum"], ["plusquamperfekt", "vorher", "früher", "frueher"]],
              acceptedAnswers: [
                "weil das praeteritum die haupthandlung erzaehlt und das plusquamperfekt zeigt, was vorher passiert war",
                "in erzaehlungen beschreibt das praeteritum die laufende vergangenheit und das plusquamperfekt die vorvergangenheit"
              ],
              hint: "Eine Form erzählt die Haupthandlung, die andere springt noch weiter zurück.",
              solution:
                "In Erzählungen beschreibt das Präteritum die Haupthandlung. Das Plusquamperfekt zeigt, was schon vorher passiert war.",
              explanation:
                "So kann man zeitliche Beziehungen in einem Text klar machen."
            })
          ]
        }
      ]
    }
  ];

  levels.forEach(function (level) {
    level.modules.forEach(function (module) {
      module.tasks = expandTasks(module.tasks);
    });
  });

  const moduleSequence = [];
  let totalTasks = 0;

  levels.forEach(function (level) {
    level.modules.forEach(function (module) {
      module.levelId = level.id;
      module.levelTitle = level.title;
      module.rank = level.rank;
      moduleSequence.push(module.id);
      totalTasks += module.tasks.length;
    });
  });

  window.SprachwerkstattZeitenData = {
    passThreshold: 60,
    maxAttempts: 3,
    taskTypeLabels: {
      freitext: "Freitext",
      lueckentext: "Lückentext",
      dragdrop: "Drag and Drop",
      fehlertext: "Fehlertext",
      erklaerung: "Erklärung"
    },
    levels: levels,
    moduleSequence: moduleSequence,
    totalTasks: totalTasks
  };
})();
