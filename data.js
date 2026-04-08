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
        inputLabel: "Erklaerung",
        placeholder: "Erklaere kurz, warum ..."
      },
      config
    );
  }

  const levels = [
    {
      id: "anfaenger",
      rank: "01",
      title: "Anfaenger",
      subtitle: "Mal-Angaben erkennen und einfach verwenden",
      description:
        "Hier geht es um die Grundfrage: Welche Ausdruecke sagen, wie oft etwas passiert?",
      modules: [
        {
          id: "grundlagen-erkennen",
          title: "Grundlagen erkennen",
          summary: "Einfache Mal-Angaben von Zeitpunkt und Dauer unterscheiden.",
          tasks: [
            freitext({
              id: "g1-ft",
              title: "Eine passende Mal-Angabe schreiben",
              prompt: "Schreibe eine Mal-Angabe, die bedeutet: an allen Tagen.",
              acceptedAnswers: ["jeden tag", "taeglich", "taglich"],
              hint: "Gesucht ist eine Antwort auf die Frage: Wie oft?",
              solution: "jeden Tag",
              explanation:
                "'Jeden Tag' und 'taeglich' sind Mal-Angaben. Sie sagen, dass etwas an jedem Tag passiert."
            }),
            lueckentext({
              id: "g1-lt",
              title: "Luecken passend fuellen",
              prompt: "Ergaenze beide Luecken mit der passenden Mal-Angabe.",
              context: "1 = haeufig, aber nicht immer. 2 = kein einziges Mal.",
              segments: ["Ich gehe ", " spazieren. Mein Bruder geht ", " spazieren."],
              blanks: [
                {
                  id: "b1",
                  label: "Luecke 1",
                  answers: ["oft"]
                },
                {
                  id: "b2",
                  label: "Luecke 2",
                  answers: ["nie"]
                }
              ],
              hint: "Die erste Angabe ist nicht total. Die zweite bedeutet 0 Mal.",
              solution: "Ich gehe oft spazieren. Mein Bruder geht nie spazieren.",
              explanation:
                "'Oft' beschreibt eine hohe Haeufigkeit. 'Nie' bedeutet, dass etwas kein einziges Mal passiert."
            }),
            dragdrop({
              id: "g1-dd",
              title: "Satzteile ordnen",
              prompt: "Ordne die Satzteile so, dass ein richtiger Satz mit Mal-Angabe entsteht.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Jeden Mittwoch" },
                { id: "o2", label: "trifft sich" },
                { id: "o3", label: "unsere Klasse in der Bibliothek." },
                { id: "o4", label: "gestern" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Suche zuerst die Mal-Angabe und danach das Verb in Position 2.",
              solution: "Jeden Mittwoch trifft sich unsere Klasse in der Bibliothek.",
              explanation:
                "'Jeden Mittwoch' ist die Mal-Angabe. Danach steht im Hauptsatz das Verb 'trifft'."
            }),
            fehlertext({
              id: "g1-fe",
              title: "Fehlertext verbessern",
              prompt: "Der Satz enthaelt keine Mal-Angabe. Schreibe ihn so um, dass die Frage 'Wie oft?' beantwortet wird.",
              context: "Wir treffen uns gestern im Park.",
              acceptedAnswers: ["wir treffen uns oft im park.", "wir treffen uns oft im park"],
              hint: "Ersetze den Zeitpunkt durch eine Haeufigkeitsangabe.",
              solution: "Wir treffen uns oft im Park.",
              explanation:
                "'Gestern' sagt, wann etwas passiert. Eine Mal-Angabe muss sagen, wie oft etwas passiert, zum Beispiel 'oft'."
            }),
            erklaerung({
              id: "g1-er",
              title: "Kurz erklaeren",
              prompt: "Erklaere kurz: Warum ist 'um 8 Uhr' keine Mal-Angabe?",
              keywordGroups: [["zeitpunkt"], ["wie oft", "haeufig"]],
              acceptedAnswers: [
                "um 8 uhr ist ein zeitpunkt und keine antwort auf wie oft.",
                "um 8 uhr nennt einen zeitpunkt und keine haeufigkeit."
              ],
              hint: "Vergleiche die Fragen 'Wann?' und 'Wie oft?'.",
              solution: "Um 8 Uhr ist ein Zeitpunkt. Es beantwortet die Frage 'Wann?' und nicht 'Wie oft?'.",
              explanation:
                "Eine Mal-Angabe beschreibt Wiederholung oder Haeufigkeit. 'Um 8 Uhr' nennt nur einen Zeitpunkt."
            })
          ]
        },
        {
          id: "alltagssaetze",
          title: "Alltagssaetze",
          summary: "Einfache Saetze mit typischen Mal-Angaben aus dem Alltag bilden.",
          tasks: [
            freitext({
              id: "g2-ft",
              title: "Bedeutung in ein Wort umsetzen",
              prompt: "Schreibe die passende Mal-Angabe: nicht ein einziges Mal.",
              acceptedAnswers: ["nie"],
              hint: "Die gesuchte Angabe bedeutet 0 Mal.",
              solution: "nie",
              explanation:
                "'Nie' ist eine Mal-Angabe und bedeutet: etwas passiert kein einziges Mal."
            }),
            lueckentext({
              id: "g2-lt",
              title: "Alltag ergaenzen",
              prompt: "Fuellen die Luecken passend aus.",
              context: "1 = jede Woche am gleichen Tag. 2 = nicht oft.",
              segments: ["Sara besucht ihre Oma ", ". Im Winter geht sie ", " schwimmen."],
              blanks: [
                {
                  id: "b1",
                  label: "Luecke 1",
                  answers: ["jeden sonntag"]
                },
                {
                  id: "b2",
                  label: "Luecke 2",
                  answers: ["selten"]
                }
              ],
              hint: "Eine Angabe ist genau, die andere eher ungenau.",
              solution: "Sara besucht ihre Oma jeden Sonntag. Im Winter geht sie selten schwimmen.",
              explanation:
                "'Jeden Sonntag' ist eine genaue Mal-Angabe. 'Selten' ist ungenau, aber trotzdem eine Mal-Angabe."
            }),
            dragdrop({
              id: "g2-dd",
              title: "Satz mit genauer Angabe bauen",
              prompt: "Ordne die Teile zu einem korrekten Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Dreimal im Monat" },
                { id: "o2", label: "putzt" },
                { id: "o3", label: "Leon sein Fahrrad." },
                { id: "o4", label: "zwei Stunden" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe kommt hier an den Satzanfang.",
              solution: "Dreimal im Monat putzt Leon sein Fahrrad.",
              explanation:
                "'Dreimal im Monat' beantwortet die Frage 'Wie oft?'. Danach folgt die Verbform 'putzt'."
            }),
            fehlertext({
              id: "g2-fe",
              title: "Dauer oder Haeufigkeit?",
              prompt: "Schreibe den Satz so um, dass eine Mal-Angabe entsteht.",
              context: "Ich lerne zwei Stunden Deutsch.",
              acceptedAnswers: [
                "ich lerne zweimal pro woche deutsch.",
                "ich lerne zweimal pro woche deutsch"
              ],
              hint: "Zwei Stunden ist eine Dauer. Gesucht ist eine Haeufigkeitsangabe.",
              solution: "Ich lerne zweimal pro Woche Deutsch.",
              explanation:
                "'Zwei Stunden' beantwortet die Frage 'Wie lange?'. 'Zweimal pro Woche' beantwortet die Frage 'Wie oft?'."
            }),
            erklaerung({
              id: "g2-er",
              title: "Genau unterscheiden",
              prompt: "Erklaere kurz den Unterschied zwischen 'jeden Mittwoch' und 'am Mittwoch'.",
              keywordGroups: [["jede woche", "wiederholt"], ["einmal", "ein tag", "ein zeitpunkt"]],
              acceptedAnswers: [
                "jeden mittwoch bedeutet jede woche. am mittwoch kann nur einen tag meinen.",
                "jeden mittwoch ist wiederholt. am mittwoch kann nur ein zeitpunkt sein."
              ],
              hint: "Eine Form sagt Wiederholung, die andere oft nur einen einzelnen Tag.",
              solution:
                "'Jeden Mittwoch' bedeutet: jede Woche wieder. 'Am Mittwoch' kann auch nur einen einzelnen Mittwoch meinen.",
              explanation:
                "Mal-Angaben beschreiben Wiederholung. Deshalb ist 'jeden Mittwoch' als Mal-Angabe klarer als 'am Mittwoch'."
            })
          ]
        }
      ]
    },
    {
      id: "leicht-fortgeschritten",
      rank: "02",
      title: "Leicht fortgeschritten",
      subtitle: "Genau, ungenau und richtig im Satz platziert",
      description:
        "In diesem Bereich werden Mal-Angaben genauer formuliert und mit sicherer Satzstellung verwendet.",
      modules: [
        {
          id: "genaue-angaben",
          title: "Genaue und ungenaue Angaben",
          summary: "Zwischen sehr genauen und eher offenen Mal-Angaben unterscheiden.",
          tasks: [
            freitext({
              id: "g3-ft",
              title: "Eine genaue Angabe formulieren",
              prompt: "Schreibe eine genaue Mal-Angabe fuer: Der Kurs findet 2-mal pro Woche statt.",
              acceptedAnswers: ["zweimal pro woche"],
              hint: "Gesucht ist eine Form mit Zahl.",
              solution: "zweimal pro Woche",
              explanation:
                "'Zweimal pro Woche' ist eine genaue Mal-Angabe, weil die Haeufigkeit exakt genannt wird."
            }),
            lueckentext({
              id: "g3-lt",
              title: "Genau oder eher offen",
              prompt: "Ergaenze die zwei Mal-Angaben.",
              context: "1 = meistens. 2 = nicht oft.",
              segments: ["Ich esse ", " in der Mensa, aber ich koche ", " zu Hause."],
              blanks: [
                {
                  id: "b1",
                  label: "Luecke 1",
                  answers: ["meistens"]
                },
                {
                  id: "b2",
                  label: "Luecke 2",
                  answers: ["selten"]
                }
              ],
              hint: "Eine Loesung ist etwas staerker als 'oft'.",
              solution: "Ich esse meistens in der Mensa, aber ich koche selten zu Hause.",
              explanation:
                "'Meistens' bedeutet: in den meisten Faellen. 'Selten' bedeutet: nicht oft."
            }),
            dragdrop({
              id: "g3-dd",
              title: "Haeufigkeit richtig einbauen",
              prompt: "Baue aus den Teilen einen korrekten Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Amir kommt" },
                { id: "o2", label: "fast nie" },
                { id: "o3", label: "zu spaet." },
                { id: "o4", label: "um 7 Uhr" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe beschreibt hier das Verb 'kommt'.",
              solution: "Amir kommt fast nie zu spaet.",
              explanation:
                "'Fast nie' ist eine sehr starke Mal-Angabe. Sie sagt: nur in ganz wenigen Faellen."
            }),
            fehlertext({
              id: "g3-fe",
              title: "Den Zeitpunkt austauschen",
              prompt: "Schreibe den Satz so um, dass eine passende Mal-Angabe entsteht.",
              context: "Meine Schwester liest um 20 Uhr Buecher.",
              acceptedAnswers: [
                "meine schwester liest jeden abend buecher.",
                "meine schwester liest oft buecher."
              ],
              hint: "Ersetze 'Wann?' durch 'Wie oft?'.",
              solution: "Meine Schwester liest jeden Abend Buecher.",
              explanation:
                "'Um 20 Uhr' gibt nur einen Zeitpunkt an. 'Jeden Abend' ist eine Mal-Angabe, weil es Wiederholung zeigt."
            }),
            erklaerung({
              id: "g3-er",
              title: "Fragen vergleichen",
              prompt: "Erklaere kurz: Warum passt 'manchmal' besser auf die Frage 'Wie oft?' als 'um 20 Uhr'?",
              keywordGroups: [["manchmal", "haeufigkeit"], ["um 20 uhr", "zeitpunkt"]],
              acceptedAnswers: [
                "manchmal beschreibt haeufigkeit. um 20 uhr ist nur ein zeitpunkt.",
                "manchmal beantwortet wie oft. um 20 uhr beantwortet wann."
              ],
              hint: "Vergleiche die beiden Fragen genau.",
              solution:
                "'Manchmal' beantwortet die Frage 'Wie oft?'. 'Um 20 Uhr' beantwortet die Frage 'Wann?'.",
              explanation:
                "Eine Mal-Angabe beschreibt, wie oft etwas geschieht. Ein Zeitpunkt nennt nur die Uhrzeit oder den Tag."
            })
          ]
        },
        {
          id: "satzstellung",
          title: "Satzstellung und Varianten",
          summary: "Mal-Angaben am Anfang oder im Mittelfeld sicher verwenden.",
          tasks: [
            freitext({
              id: "g4-ft",
              title: "Satz mit Vorgabe schreiben",
              prompt: "Schreibe den Satz richtig auf: zweimal pro Woche / ich / joggen",
              acceptedAnswers: [
                "ich jogge zweimal pro woche.",
                "ich jogge zweimal pro woche",
                "zweimal pro woche jogge ich.",
                "zweimal pro woche jogge ich"
              ],
              hint: "Im Hauptsatz steht das Verb in Position 2.",
              solution: "Ich jogge zweimal pro Woche.",
              explanation:
                "Die Mal-Angabe kann im Satz stehen oder ins Vorfeld rutschen. Das Verb bleibt trotzdem auf Position 2."
            }),
            lueckentext({
              id: "g4-lt",
              title: "Vorfeld und Mittelfeld",
              prompt: "Ergaenze die Luecken.",
              context: "1 = genaue Mal-Angabe am Satzanfang. 2 = haeufig, aber nicht immer.",
              segments: ["", " gehe ich ins Training, und am Sonntag schlafe ich ", " aus."],
              blanks: [
                {
                  id: "b1",
                  label: "Luecke 1",
                  answers: ["jeden freitag"]
                },
                {
                  id: "b2",
                  label: "Luecke 2",
                  answers: ["oft"]
                }
              ],
              hint: "Wenn die Mal-Angabe vorne steht, kommt das Verb direkt danach.",
              solution: "Jeden Freitag gehe ich ins Training, und am Sonntag schlafe ich oft aus.",
              explanation:
                "Die erste Mal-Angabe steht im Vorfeld. Deshalb folgt direkt das Verb 'gehe'."
            }),
            dragdrop({
              id: "g4-dd",
              title: "Satzstellung ordnen",
              prompt: "Ordne die Teile zu einem korrekten Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Selten" },
                { id: "o2", label: "vergisst" },
                { id: "o3", label: "Mia ihr Heft." },
                { id: "o4", label: "jeden Morgen" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Steht die Mal-Angabe vorn, folgt das Verb sofort.",
              solution: "Selten vergisst Mia ihr Heft.",
              explanation:
                "'Selten' kann am Satzanfang stehen. Dann bleibt das Verb trotzdem an zweiter Stelle."
            }),
            fehlertext({
              id: "g4-fe",
              title: "Satzstellung reparieren",
              prompt: "Der Satz ist falsch gebaut. Schreibe ihn richtig auf.",
              context: "Nie ich gehe freitags ins Kino.",
              acceptedAnswers: [
                "ich gehe freitags nie ins kino.",
                "ich gehe nie freitags ins kino."
              ],
              hint: "Das Verb darf im Hauptsatz nicht auf Position 3 stehen.",
              solution: "Ich gehe freitags nie ins Kino.",
              explanation:
                "Im Hauptsatz steht das Verb auf Position 2. Deshalb ist 'Nie ich gehe ...' falsch."
            }),
            erklaerung({
              id: "g4-er",
              title: "Verbposition erklaeren",
              prompt: "Erklaere kurz: Warum ist 'Oft gehe ich zu Fuss' richtig?",
              keywordGroups: [["verb", "position 2", "zweite position"], ["oft", "vorne", "vorfeld"]],
              acceptedAnswers: [
                "oft steht vorne im vorfeld und das verb bleibt auf position 2.",
                "oft kann vorne stehen. dann steht gehe trotzdem an zweiter position."
              ],
              hint: "Denke an das Vorfeld im Hauptsatz.",
              solution:
                "'Oft' steht im Vorfeld. Im Hauptsatz bleibt das Verb trotzdem auf Position 2: 'gehe'.",
              explanation:
                "Mal-Angaben koennen am Satzanfang stehen. Die Grundregel des Hauptsatzes bleibt aber gleich."
            })
          ]
        }
      ]
    },
    {
      id: "fortgeschritten",
      rank: "03",
      title: "Fortgeschritten",
      subtitle: "Mal-Angaben vergleichen, abstufen und im Zusammenhang korrigieren",
      description:
        "Jetzt werden Haeufigkeiten verglichen, abgestuft und in laengeren Zusammenhaengen sicher benutzt.",
      modules: [
        {
          id: "vergleichen",
          title: "Vergleichen und abstufen",
          summary: "Frueher und heute mit passenden Mal-Angaben gegenueberstellen.",
          tasks: [
            freitext({
              id: "g5-ft",
              title: "Vergleichssatz schreiben",
              prompt:
                "Schreibe den Satz richtig auf: frueher / ich / selten / Deutsch sprechen / heute / jeden Tag",
              acceptedAnswers: [
                "frueher habe ich selten deutsch gesprochen, heute spreche ich jeden tag deutsch.",
                "frueher sprach ich selten deutsch, heute spreche ich jeden tag deutsch."
              ],
              hint: "In deinem Satz sollen zwei verschiedene Mal-Angaben vorkommen.",
              solution: "Frueher habe ich selten Deutsch gesprochen, heute spreche ich jeden Tag Deutsch.",
              explanation:
                "Der Satz vergleicht zwei Zeiten. 'Selten' und 'jeden Tag' zeigen die unterschiedliche Haeufigkeit."
            }),
            lueckentext({
              id: "g5-lt",
              title: "Frueher und heute",
              prompt: "Ergaenze beide Luecken passend.",
              context: "1 = nicht oft. 2 = an jedem Morgen.",
              segments: ["Frueher bin ich ", " schwimmen gegangen, heute gehe ich ", " laufen."],
              blanks: [
                {
                  id: "b1",
                  label: "Luecke 1",
                  answers: ["selten"]
                },
                {
                  id: "b2",
                  label: "Luecke 2",
                  answers: ["jeden morgen"]
                }
              ],
              hint: "Eine Angabe ist ungenau, die andere genau wiederholt.",
              solution: "Frueher bin ich selten schwimmen gegangen, heute gehe ich jeden Morgen laufen.",
              explanation:
                "'Selten' und 'jeden Morgen' sind beide Mal-Angaben, aber mit unterschiedlicher Genauigkeit."
            }),
            dragdrop({
              id: "g5-dd",
              title: "Kontrast bauen",
              prompt: "Ordne die Teile zu einem korrekten Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Im Urlaub lese ich" },
                { id: "o2", label: "fast nie" },
                { id: "o3", label: "lange Nachrichten." },
                { id: "o4", label: "jeden Mittwoch" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe beschreibt hier das Lesen.",
              solution: "Im Urlaub lese ich fast nie lange Nachrichten.",
              explanation:
                "'Fast nie' ist eine abgestufte Mal-Angabe. Sie ist staerker als 'selten'."
            }),
            fehlertext({
              id: "g5-fe",
              title: "Zeit und Haeufigkeit trennen",
              prompt: "Schreibe den Satz korrekt auf.",
              context: "Frueher treffe ich selten Freunde, heute jeden Tag.",
              acceptedAnswers: [
                "frueher traf ich selten freunde, heute treffe ich jeden tag freunde.",
                "frueher habe ich selten freunde getroffen, heute treffe ich jeden tag freunde."
              ],
              hint: "Der erste Teil braucht eine passende Vergangenheitsform und der zweite ein Verb.",
              solution: "Frueher traf ich selten Freunde, heute treffe ich jeden Tag Freunde.",
              explanation:
                "Mal-Angaben allein machen noch keinen ganzen Satz. Beide Satzteile brauchen eine vollstaendige Verbform."
            }),
            erklaerung({
              id: "g5-er",
              title: "Staerke erklaeren",
              prompt: "Erklaere kurz den Unterschied zwischen 'meistens' und 'immer'.",
              keywordGroups: [["meistens", "nicht immer", "nicht jedes mal"], ["immer", "100", "jedes mal"]],
              acceptedAnswers: [
                "meistens bedeutet oft, aber nicht immer. immer bedeutet jedes mal.",
                "meistens ist nicht 100 prozent. immer ist 100 prozent."
              ],
              hint: "Eine Angabe ist total, die andere fast total.",
              solution:
                "'Meistens' bedeutet: in den meisten Faellen, aber nicht immer. 'Immer' bedeutet: jedes Mal.",
              explanation:
                "Beide Woerter sind Mal-Angaben, aber sie unterscheiden sich in der Staerke der Aussage."
            })
          ]
        },
        {
          id: "zusammenhang",
          title: "Korrigieren im Zusammenhang",
          summary: "Mal-Angaben in kleinen Texten erkennen, einsetzen und begruenden.",
          tasks: [
            freitext({
              id: "g6-ft",
              title: "Genaue Formulierung finden",
              prompt: "Schreibe die Mal-Angabe auf: an jedem zweiten Tag.",
              acceptedAnswers: ["jeden zweiten tag"],
              hint: "Gesucht ist eine wiederholte Angabe mit Abstand.",
              solution: "jeden zweiten Tag",
              explanation:
                "'Jeden zweiten Tag' ist eine Mal-Angabe. Sie beschreibt eine regelmaessige Wiederholung."
            }),
            lueckentext({
              id: "g6-lt",
              title: "Mini-Text ergaenzen",
              prompt: "Ergaenze die drei Luecken sinnvoll.",
              context: "1 = an jedem Montag. 2 = oft. 3 = fast nie.",
              segments: [
                "",
                " trifft sich unsere Lerngruppe. Wir sprechen ",
                " Deutsch, aber wir benutzen ",
                " Handys."
              ],
              blanks: [
                { id: "b1", label: "Luecke 1", answers: ["jeden montag"] },
                { id: "b2", label: "Luecke 2", answers: ["oft"] },
                { id: "b3", label: "Luecke 3", answers: ["fast nie"] }
              ],
              hint: "Zwei Angaben sind ungenau, eine ist genau.",
              solution:
                "Jeden Montag trifft sich unsere Lerngruppe. Wir sprechen oft Deutsch, aber wir benutzen fast nie Handys.",
              explanation:
                "Alle drei Formen beantworten die Frage 'Wie oft?'. Deshalb sind sie Mal-Angaben."
            }),
            dragdrop({
              id: "g6-dd",
              title: "Kurztext ordnen",
              prompt: "Baue aus den Teilen einen richtigen Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Nach dem Unterricht" },
                { id: "o2", label: "kaufen wir" },
                { id: "o3", label: "manchmal noch Brot." },
                { id: "o4", label: "zwei Stunden" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe beschreibt das Kaufen, nicht die Dauer.",
              solution: "Nach dem Unterricht kaufen wir manchmal noch Brot.",
              explanation:
                "'Manchmal' ist die Mal-Angabe. 'Zwei Stunden' waere hier eine Dauer und passt nicht."
            }),
            fehlertext({
              id: "g6-fe",
              title: "Dauer in Haeufigkeit verwandeln",
              prompt: "Schreibe den Satz so um, dass eine Mal-Angabe verwendet wird.",
              context: "Im Sommer fahren wir zwei Wochen ans Meer.",
              acceptedAnswers: [
                "im sommer fahren wir einmal ans meer.",
                "im sommer fahren wir einmal im jahr ans meer."
              ],
              hint: "Die Vorlage sagt, wie lange. Gesucht ist, wie oft.",
              solution: "Im Sommer fahren wir einmal ans Meer.",
              explanation:
                "'Zwei Wochen' ist eine Dauer. 'Einmal' ist eine Mal-Angabe und beschreibt die Haeufigkeit."
            }),
            erklaerung({
              id: "g6-er",
              title: "Wiederholung begruenden",
              prompt: "Erklaere kurz: Warum ist 'jeden zweiten Tag' eine Mal-Angabe?",
              keywordGroups: [["wiederholung", "regelmaessig", "haeufigkeit"], ["tag"]],
              acceptedAnswers: [
                "es beschreibt eine regelmaessige wiederholung an verschiedenen tagen.",
                "jeden zweiten tag sagt, wie oft etwas wieder passiert."
              ],
              hint: "Denke an die wiederholte Handlung.",
              solution:
                "'Jeden zweiten Tag' ist eine Mal-Angabe, weil der Ausdruck eine regelmaessige Wiederholung beschreibt.",
              explanation:
                "Nicht nur Woerter wie 'oft' oder 'nie' sind Mal-Angaben. Auch wiederholte Muster koennen Haeufigkeit ausdruecken."
            })
          ]
        }
      ]
    },
    {
      id: "profi",
      rank: "04",
      title: "Profi",
      subtitle: "Nuancen, Kombinationen und sichere Anwendung im Text",
      description:
        "Hier werden mehrere Mal-Angaben verglichen, kombiniert und in anspruchsvolleren Saetzen angewendet.",
      modules: [
        {
          id: "nuancen",
          title: "Nuancen verstehen",
          summary: "Feine Bedeutungsunterschiede erklaeren und korrekt in Saetzen nutzen.",
          tasks: [
            freitext({
              id: "g7-ft",
              title: "Abgestufte Angabe finden",
              prompt: "Schreibe eine Mal-Angabe, die bedeutet: fast immer, aber nicht ganz.",
              acceptedAnswers: ["meistens", "fast immer"],
              hint: "Die gesuchte Form ist staerker als 'oft', aber schwaecher als 'immer'.",
              solution: "meistens",
              explanation:
                "'Meistens' ist eine abgestufte Mal-Angabe. Sie bedeutet: in den meisten Faellen."
            }),
            lueckentext({
              id: "g7-lt",
              title: "Zwei Mal-Angaben kombinieren",
              prompt: "Ergaenze die Luecken passend.",
              context: "1 = fast immer. 2 = kein einziges Mal.",
              segments: ["In Pruefungswochen lerne ich ", ", aber in den Ferien lerne ich ", "."],
              blanks: [
                { id: "b1", label: "Luecke 1", answers: ["meistens", "fast immer"] },
                { id: "b2", label: "Luecke 2", answers: ["nie"] }
              ],
              hint: "Die beiden Angaben stehen in starkem Gegensatz.",
              solution: "In Pruefungswochen lerne ich meistens, aber in den Ferien lerne ich nie.",
              explanation:
                "Beide Woerter sind Mal-Angaben. Zusammen zeigen sie einen klaren Gegensatz in der Haeufigkeit."
            }),
            dragdrop({
              id: "g7-dd",
              title: "Komplexeren Satz ordnen",
              prompt: "Ordne die Teile zu einem richtigen Satz.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Wenn wir Gruppenarbeit haben," },
                { id: "o2", label: "spricht Nora" },
                { id: "o3", label: "meistens zuerst." },
                { id: "o4", label: "um 9 Uhr" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe steht hier hinter dem Verbteil.",
              solution: "Wenn wir Gruppenarbeit haben, spricht Nora meistens zuerst.",
              explanation:
                "'Meistens' beschreibt die Haeufigkeit der Handlung 'spricht zuerst'. Der Nebensatz veraendert das nicht."
            }),
            fehlertext({
              id: "g7-fe",
              title: "Widerspruch beseitigen",
              prompt: "Im Satz widersprechen sich die Mal-Angaben. Schreibe ihn sinnvoll neu auf.",
              context: "Ich komme immer manchmal zu spaet.",
              acceptedAnswers: [
                "ich komme manchmal zu spaet.",
                "ich komme immer zu spaet."
              ],
              hint: "Eine starke und eine schwache Angabe passen hier nicht zusammen.",
              solution: "Ich komme manchmal zu spaet.",
              explanation:
                "'Immer' und 'manchmal' widersprechen sich in einem einfachen Satz. Eine klare Mal-Angabe muss eindeutig sein."
            }),
            erklaerung({
              id: "g7-er",
              title: "Zwei Angaben unterscheiden",
              prompt: "Erklaere kurz: Wie kann in einem Satz sowohl eine Zeitangabe als auch eine Mal-Angabe stehen?",
              keywordGroups: [["wann", "zeitpunkt"], ["wie oft", "haeufigkeit"]],
              acceptedAnswers: [
                "eine zeitangabe beantwortet wann und eine mal-angabe beantwortet wie oft.",
                "in einem satz kann man sagen wann etwas passiert und wie oft es passiert."
              ],
              hint: "Die beiden Angaben beantworten verschiedene Fragen.",
              solution:
                "Eine Zeitangabe beantwortet 'Wann?'. Eine Mal-Angabe beantwortet 'Wie oft?'. Beides kann im selben Satz stehen.",
              explanation:
                "Zum Beispiel in 'Jeden Montag um 8 Uhr beginnt der Kurs' ist 'jeden Montag' die Mal-Angabe und 'um 8 Uhr' die Zeitangabe."
            })
          ]
        },
        {
          id: "transfer-text",
          title: "Sichere Anwendung im Text",
          summary: "Mal-Angaben in kleinen Texten praezise und reflektiert einsetzen.",
          tasks: [
            freitext({
              id: "g8-ft",
              title: "Satz aus Stichwoertern bilden",
              prompt: "Schreibe den Satz richtig auf: am Wochenende / wir / meistens / zusammen fruehstuecken",
              acceptedAnswers: [
                "am wochenende fruehstuecken wir meistens zusammen.",
                "wir fruehstuecken am wochenende meistens zusammen."
              ],
              hint: "Die Mal-Angabe kann im Vorfeld oder im Mittelfeld stehen.",
              solution: "Am Wochenende fruehstuecken wir meistens zusammen.",
              explanation:
                "Der Satz enthaelt eine Zeitangabe und eine Mal-Angabe. 'Meistens' beantwortet die Frage 'Wie oft?'."
            }),
            lueckentext({
              id: "g8-lt",
              title: "Mini-Text mit Abstufungen",
              prompt: "Ergaenze den kurzen Text.",
              context: "1 = an jedem Abend. 2 = haeufig. 3 = kein einziges Mal.",
              segments: [
                "Vor Pruefungen wiederhole ich ",
                " den Stoff. Meine Schwester lernt ",
                ", aber mein Bruder lernt ",
                "."
              ],
              blanks: [
                { id: "b1", label: "Luecke 1", answers: ["jeden abend"] },
                { id: "b2", label: "Luecke 2", answers: ["oft"] },
                { id: "b3", label: "Luecke 3", answers: ["nie"] }
              ],
              hint: "Die drei Luecken zeigen drei verschiedene Stufen der Haeufigkeit.",
              solution:
                "Vor Pruefungen wiederhole ich jeden Abend den Stoff. Meine Schwester lernt oft, aber mein Bruder lernt nie.",
              explanation:
                "Der Text zeigt eine genaue, eine mittlere und eine totale Verneinung als Mal-Angaben."
            }),
            dragdrop({
              id: "g8-dd",
              title: "Abschluss-Satz ordnen",
              prompt: "Ordne die Teile so, dass ein klarer Satz entsteht.",
              slots: [
                { id: "start", label: "Anfang" },
                { id: "mitte", label: "Mitte" },
                { id: "ende", label: "Ende" }
              ],
              options: [
                { id: "o1", label: "Im Sprachkurs" },
                { id: "o2", label: "arbeiten wir" },
                { id: "o3", label: "mehrmals pro Woche in Tandems." },
                { id: "o4", label: "zwei Stunden" }
              ],
              correctMap: {
                start: "o1",
                mitte: "o2",
                ende: "o3"
              },
              hint: "Die Mal-Angabe mit 'pro Woche' ist die richtige Wahl.",
              solution: "Im Sprachkurs arbeiten wir mehrmals pro Woche in Tandems.",
              explanation:
                "'Mehrmals pro Woche' ist eine klare Mal-Angabe. 'Zwei Stunden' wuerde wieder nur eine Dauer nennen."
            }),
            fehlertext({
              id: "g8-fe",
              title: "Fehlerhaften Textsatz korrigieren",
              prompt: "Korrigiere den Satz so, dass eine saubere Mal-Angabe verwendet wird.",
              context: "Unsere Lerngruppe trifft sich monatlich im Monat.",
              acceptedAnswers: [
                "unsere lerngruppe trifft sich monatlich.",
                "unsere lerngruppe trifft sich einmal im monat."
              ],
              hint: "Der Satz sagt dieselbe Information doppelt.",
              solution: "Unsere Lerngruppe trifft sich monatlich.",
              explanation:
                "'Monatlich' und 'im Monat' transportieren hier dieselbe Information. Eine klare Formulierung reicht aus."
            }),
            erklaerung({
              id: "g8-er",
              title: "Reflexion zum Sprachgebrauch",
              prompt: "Erklaere kurz den Unterschied zwischen 'monatlich' und 'einmal im Monat'.",
              keywordGroups: [["gleiche", "aehnlich", "bedeutung"], ["stil", "knapper", "ausfuehrlicher"]],
              acceptedAnswers: [
                "beides meint ungefaehr das gleiche. monatlich ist knapper, einmal im monat ist ausfuehrlicher.",
                "die bedeutung ist fast gleich. monatlich ist kurz, einmal im monat ist laenger."
              ],
              hint: "Es geht um Bedeutung und Stil, nicht um richtig oder falsch.",
              solution:
                "'Monatlich' und 'einmal im Monat' meinen fast dasselbe. 'Monatlich' klingt knapper, 'einmal im Monat' etwas ausfuehrlicher.",
              explanation:
                "Fortgeschrittene Lernende muessen nicht nur richtig entscheiden, sondern auch sprachliche Nuancen erkennen."
            })
          ]
        }
      ]
    }
  ];

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

  window.MalAngabeWorkshopData = {
    passThreshold: 60,
    maxAttempts: 3,
    taskTypeLabels: {
      freitext: "Freitext",
      lueckentext: "Lueckentext",
      dragdrop: "Drag and Drop",
      fehlertext: "Fehlertext",
      erklaerung: "Erklaerung"
    },
    levels: levels,
    moduleSequence: moduleSequence,
    totalTasks: totalTasks
  };
})();
