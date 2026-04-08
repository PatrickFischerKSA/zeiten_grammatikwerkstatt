(function () {
  const data = window.SprachwerkstattZeitenData;
  const STORAGE_KEY = "sprachwerkstatt-zeiten-state-v2";
  const TEACHER_PASSWORD = "zeiten";
  const TEACHER_SESSION_KEY = "sprachwerkstatt-zeiten-teacher-session";

  const catalog = buildCatalog();
  const elements = cacheElements();

  let state = loadState();
  let currentSession = null;
  let timerHandle = null;
  let teacherAuthenticated = loadTeacherSession();
  let teacherReturnView = "identity";

  function buildCatalog() {
    const levelsById = {};
    const modulesById = {};
    const tasksById = {};
    const moduleOrder = data.moduleSequence.slice();

    data.levels.forEach(function (level) {
      levelsById[level.id] = level;
      level.modules.forEach(function (module) {
        modulesById[module.id] = module;
        module.tasks.forEach(function (task) {
          tasksById[task.id] = {
            task: task,
            moduleId: module.id,
            levelId: level.id
          };
        });
      });
    });

    return {
      levelsById: levelsById,
      modulesById: modulesById,
      tasksById: tasksById,
      moduleOrder: moduleOrder
    };
  }

  function cacheElements() {
    return {
      identityView: document.getElementById("identityView"),
      studentDashboardView: document.getElementById("studentDashboardView"),
      sessionView: document.getElementById("sessionView"),
      completionView: document.getElementById("completionView"),
      teacherAccessView: document.getElementById("teacherAccessView"),
      teacherDashboardView: document.getElementById("teacherDashboardView"),
      studentNameInput: document.getElementById("studentNameInput"),
      studentList: document.getElementById("studentList"),
      studentDashboardTitle: document.getElementById("studentDashboardTitle"),
      studentMetrics: document.getElementById("studentMetrics"),
      studentProgressText: document.getElementById("studentProgressText"),
      studentProgressBar: document.getElementById("studentProgressBar"),
      levelSections: document.getElementById("levelSections"),
      teacherSummary: document.getElementById("teacherSummary"),
      teacherStudents: document.getElementById("teacherStudents"),
      sessionLevelBadge: document.getElementById("sessionLevelBadge"),
      sessionModuleBadge: document.getElementById("sessionModuleBadge"),
      sessionTypeBadge: document.getElementById("sessionTypeBadge"),
      sessionStudentName: document.getElementById("sessionStudentName"),
      sessionTaskCounter: document.getElementById("sessionTaskCounter"),
      sessionCorrectCounter: document.getElementById("sessionCorrectCounter"),
      sessionAttemptText: document.getElementById("sessionAttemptText"),
      sessionTimer: document.getElementById("sessionTimer"),
      sessionProgressText: document.getElementById("sessionProgressText"),
      sessionProgressBar: document.getElementById("sessionProgressBar"),
      taskEyebrow: document.getElementById("taskEyebrow"),
      taskTitle: document.getElementById("taskTitle"),
      taskPrompt: document.getElementById("taskPrompt"),
      taskContext: document.getElementById("taskContext"),
      taskWorkspace: document.getElementById("taskWorkspace"),
      feedbackPanel: document.getElementById("feedbackPanel"),
      attemptBadge: document.getElementById("attemptBadge"),
      completionTitle: document.getElementById("completionTitle"),
      completionLead: document.getElementById("completionLead"),
      completionBadgeRow: document.getElementById("completionBadgeRow"),
      completionMetrics: document.getElementById("completionMetrics"),
      registerButton: document.getElementById("registerButton"),
      heroTeacherButton: document.getElementById("heroTeacherButton"),
      openTeacherButton: document.getElementById("openTeacherButton"),
      studentTeacherButton: document.getElementById("studentTeacherButton"),
      switchStudentButton: document.getElementById("switchStudentButton"),
      resetStudentButton: document.getElementById("resetStudentButton"),
      backToDashboardButton: document.getElementById("backToDashboardButton"),
      checkButton: document.getElementById("checkButton"),
      resetAnswerButton: document.getElementById("resetAnswerButton"),
      retryTaskButton: document.getElementById("retryTaskButton"),
      nextTaskButton: document.getElementById("nextTaskButton"),
      replayModuleButton: document.getElementById("replayModuleButton"),
      nextModuleButton: document.getElementById("nextModuleButton"),
      completionTeacherButton: document.getElementById("completionTeacherButton"),
      completionDashboardButton: document.getElementById("completionDashboardButton"),
      teacherPasswordInput: document.getElementById("teacherPasswordInput"),
      teacherAccessError: document.getElementById("teacherAccessError"),
      unlockTeacherButton: document.getElementById("unlockTeacherButton"),
      cancelTeacherAccessButton: document.getElementById("cancelTeacherAccessButton"),
      closeTeacherButton: document.getElementById("closeTeacherButton"),
      logoutTeacherButton: document.getElementById("logoutTeacherButton"),
      resetAllButton: document.getElementById("resetAllButton")
    };
  }

  function createModuleState(moduleId, unlocked) {
    return {
      moduleId: moduleId,
      unlocked: Boolean(unlocked),
      completed: false,
      passed: false,
      bestScore: 0,
      lastScore: 0,
      runs: 0,
      totalSeconds: 0,
      lastPlayedAt: null,
      taskStats: {}
    };
  }

  function createStudent(name) {
    const student = {
      id: "student-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      name: name,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      moduleStates: {}
    };

    catalog.moduleOrder.forEach(function (moduleId, index) {
      student.moduleStates[moduleId] = createModuleState(moduleId, index === 0);
    });

    return student;
  }

  function createDefaultState() {
    return {
      version: 1,
      activeStudentId: null,
      students: {}
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureStateShape(input) {
    const safe = input && typeof input === "object" ? clone(input) : createDefaultState();

    if (!safe.students || typeof safe.students !== "object") {
      safe.students = {};
    }

    Object.keys(safe.students).forEach(function (studentId) {
      const student = safe.students[studentId];
      if (!student.moduleStates || typeof student.moduleStates !== "object") {
        student.moduleStates = {};
      }

      catalog.moduleOrder.forEach(function (moduleId, index) {
        if (!student.moduleStates[moduleId]) {
          student.moduleStates[moduleId] = createModuleState(moduleId, index === 0);
        }

        const moduleState = student.moduleStates[moduleId];
        moduleState.unlocked = Boolean(moduleState.unlocked || index === 0);
        moduleState.completed = Boolean(moduleState.completed);
        moduleState.passed = Boolean(moduleState.passed);
        moduleState.bestScore = Number(moduleState.bestScore) || 0;
        moduleState.lastScore = Number(moduleState.lastScore) || 0;
        moduleState.runs = Number(moduleState.runs) || 0;
        moduleState.totalSeconds = Number(moduleState.totalSeconds) || 0;
        moduleState.lastPlayedAt = moduleState.lastPlayedAt || null;
        moduleState.taskStats =
          moduleState.taskStats && typeof moduleState.taskStats === "object" ? moduleState.taskStats : {};
      });

      student.name = String(student.name || "").trim();
      student.createdAt = student.createdAt || new Date().toISOString();
      student.lastActiveAt = student.lastActiveAt || student.createdAt;
    });

    if (safe.activeStudentId && !safe.students[safe.activeStudentId]) {
      safe.activeStudentId = null;
    }

    return safe;
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState();
      }
      return ensureStateShape(JSON.parse(raw));
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState() {
    state = ensureStateShape(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadTeacherSession() {
    try {
      return window.sessionStorage.getItem(TEACHER_SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function saveTeacherSession(isActive) {
    teacherAuthenticated = Boolean(isActive);

    try {
      if (teacherAuthenticated) {
        window.sessionStorage.setItem(TEACHER_SESSION_KEY, "1");
      } else {
        window.sessionStorage.removeItem(TEACHER_SESSION_KEY);
      }
    } catch (error) {
      teacherAuthenticated = Boolean(isActive);
    }
  }

  function getStudentsSorted() {
    return Object.values(state.students).sort(function (left, right) {
      return new Date(right.lastActiveAt).getTime() - new Date(left.lastActiveAt).getTime();
    });
  }

  function getActiveStudent() {
    return state.activeStudentId ? state.students[state.activeStudentId] : null;
  }

  function getModule(moduleId) {
    return catalog.modulesById[moduleId];
  }

  function getLevel(levelId) {
    return catalog.levelsById[levelId];
  }

  function getModuleState(student, moduleId) {
    return student && student.moduleStates ? student.moduleStates[moduleId] : null;
  }

  function isTeacherModeActive() {
    return teacherAuthenticated;
  }

  function isModuleAccessible(moduleState) {
    return Boolean(moduleState && (moduleState.unlocked || isTeacherModeActive()));
  }

  function getNextModuleId(moduleId) {
    const index = catalog.moduleOrder.indexOf(moduleId);
    return index >= 0 ? catalog.moduleOrder[index + 1] || null : null;
  }

  function registerStudent() {
    const name = String(elements.studentNameInput.value || "").trim();
    if (!name) {
      window.alert("Bitte gib zuerst einen Namen ein.");
      return;
    }

    const student = createStudent(name);
    state.students[student.id] = student;
    state.activeStudentId = student.id;
    saveState();
    elements.studentNameInput.value = "";
    renderApp();
  }

  function selectStudent(studentId) {
    if (!state.students[studentId]) {
      return;
    }

    state.activeStudentId = studentId;
    state.students[studentId].lastActiveAt = new Date().toISOString();
    saveState();
    renderApp();
  }

  function resetStudentProgress() {
    const student = getActiveStudent();
    if (!student) {
      return;
    }

    const confirmed = window.confirm(
      "Soll der gesamte Fortschritt dieses Profils wirklich gelöscht werden?"
    );
    if (!confirmed) {
      return;
    }

    state.students[student.id] = createStudent(student.name);
    state.students[student.id].id = student.id;
    state.students[student.id].createdAt = student.createdAt;
    state.activeStudentId = student.id;
    saveState();
    renderApp();
  }

  function resetAllData() {
    const confirmed = window.confirm(
      "Soll wirklich der komplette Lernstand aller Profile gelöscht werden?"
    );
    if (!confirmed) {
      return;
    }

    state = createDefaultState();
    saveState();
    currentSession = null;
    stopTimer();
    renderApp("identity");
  }

  function makeAnswerState(task) {
    if (task.type === "freitext" || task.type === "fehlertext" || task.type === "erklaerung") {
      return { text: "" };
    }

    if (task.type === "lueckentext") {
      return { blankValues: {} };
    }

    if (task.type === "dragdrop") {
      return { dragMap: {}, selectedOptionId: null };
    }

    return {};
  }

  function prepareTaskView(task) {
    const cloned = clone(task);
    if (cloned.options) {
      cloned.options = shuffle(cloned.options);
    }
    return cloned;
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[Ää]/g, "ae")
      .replace(/[Öö]/g, "oe")
      .replace(/[Üü]/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[„“”«»]/g, '"')
      .replace(/[‚‘’]/g, "'")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatGermanText(value) {
    const replacements = [
      ["Anfaenger", "Anfänger"],
      ["anfaenger", "anfänger"],
      ["Alltagssaetze", "Alltagssätze"],
      ["alltagssaetze", "alltagssätze"],
      ["Ausdruecke", "Ausdrücke"],
      ["ausdruecken", "ausdrücken"],
      ["Lueckentext", "Lückentext"],
      ["Luecken", "Lücken"],
      ["Luecke", "Lücke"],
      ["Loesung", "Lösung"],
      ["loesung", "lösung"],
      ["Musterloesung", "Musterlösung"],
      ["Erklaerung", "Erklärung"],
      ["erklaerung", "erklärung"],
      ["Erklaere", "Erkläre"],
      ["erklaere", "erkläre"],
      ["Ergaenze", "Ergänze"],
      ["ergaenze", "ergänze"],
      ["Fuellen", "Füllen"],
      ["fuellen", "füllen"],
      ["fuelle", "fülle"],
      ["fuer", "für"],
      ["Fuer", "Für"],
      ["frueher", "früher"],
      ["Frueher", "Früher"],
      ["gegenueberstellen", "gegenüberstellen"],
      ["gegenueber", "gegenüber"],
      ["Gegenueber", "Gegenüber"],
      ["haeufigkeit", "häufigkeit"],
      ["Haeufigkeit", "Häufigkeit"],
      ["Haeufigkeiten", "Häufigkeiten"],
      ["Haeufigkeitsangabe", "Häufigkeitsangabe"],
      ["haeufig", "häufig"],
      ["Haeufig", "Häufig"],
      ["Faellen", "Fällen"],
      ["Staerke", "Stärke"],
      ["Woerter", "Wörter"],
      ["Stichwoertern", "Stichwörtern"],
      ["Saetze", "Sätze"],
      ["Saetzen", "Sätzen"],
      ["Zusammenhaengen", "Zusammenhängen"],
      ["ungefaehr", "ungefähr"],
      ["aehnlich", "ähnlich"],
      ["ausfuehrlicher", "ausführlicher"],
      ["laengeren", "längeren"],
      ["laenger", "länger"],
      ["staerker", "stärker"],
      ["schwaecher", "schwächer"],
      ["praezise", "präzise"],
      ["waere", "wäre"],
      ["koennen", "können"],
      ["Koennen", "Können"],
      ["regelmaessig", "regelmäßig"],
      ["regelmaessige", "regelmäßige"],
      ["Pruefungswochen", "Prüfungswochen"],
      ["Pruefungen", "Prüfungen"],
      ["Buecher", "Bücher"],
      ["fruehstuecken", "frühstücken"],
      ["Schueler", "Schüler"],
      ["schueler", "schüler"],
      ["Uebersicht", "Übersicht"],
      ["ueber", "über"],
      ["Ueber", "Über"],
      ["Naechste", "Nächste"],
      ["naechste", "nächste"],
      ["Fuss", "Fuß"],
      ["fuss", "fuß"],
      ["muessen", "müssen"],
      ["Muessen", "Müssen"],
      ["taeglich", "täglich"],
      ["wuerde", "würde"],
      ["begruenden", "begründen"],
      ["enthaelt", "enthält"],
      ["zu spaet", "zu spät"],
      ["Zu spaet", "Zu spät"],
      ["vollstaendige", "vollständige"],
      ["unvollstaendig", "unvollständig"],
      ["schliessen", "schließen"],
      ["Schliessen", "Schließen"],
      ["geloescht", "gelöscht"],
      ["geloest", "gelöst"],
      ["Geloest", "Gelöst"]
    ];

    return replacements.reduce(function (text, entry) {
      return text.split(entry[0]).join(entry[1]);
    }, String(value || ""));
  }

  function getBadgeForScore(score) {
    if (score >= 95) {
      return { key: "gold", label: "Gold", className: "award-gold" };
    }

    if (score >= 80) {
      return { key: "silver", label: "Silber", className: "award-silver" };
    }

    if (score >= data.passThreshold) {
      return { key: "bronze", label: "Bronze", className: "award-bronze" };
    }

    return null;
  }

  function renderAwardBadge(badge, suffix) {
    if (!badge) {
      return "";
    }

    const label = suffix ? badge.label + " · " + suffix : badge.label;
    return (
      '<span class="award-badge ' +
      escapeHtml(badge.className) +
      '">' +
      escapeHtml(label) +
      "</span>"
    );
  }

  function shuffle(items) {
    const list = items.slice();
    for (let index = list.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const current = list[index];
      list[index] = list[randomIndex];
      list[randomIndex] = current;
    }
    return list;
  }

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;

    if (hours > 0) {
      return (
        String(hours).padStart(2, "0") +
        ":" +
        String(restMinutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
      );
    }

    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function matchesAcceptedAnswer(value, acceptedAnswers) {
    const normalizedValue = normalizeText(value);
    return (acceptedAnswers || []).some(function (answer) {
      return normalizeText(answer) === normalizedValue;
    });
  }

  function matchesKeywordGroups(value, keywordGroups) {
    if (!Array.isArray(keywordGroups) || keywordGroups.length === 0) {
      return false;
    }

    const normalizedValue = normalizeText(value);

    return keywordGroups.every(function (group) {
      return group.some(function (keyword) {
        return normalizedValue.includes(normalizeText(keyword));
      });
    });
  }

  function isTaskComplete(task, answerState) {
    if (task.type === "freitext" || task.type === "fehlertext" || task.type === "erklaerung") {
      return normalizeText(answerState.text).length > 0;
    }

    if (task.type === "lueckentext") {
      return task.blanks.every(function (blank) {
        return normalizeText(answerState.blankValues[blank.id]).length > 0;
      });
    }

    if (task.type === "dragdrop") {
      return task.slots.every(function (slot) {
        return Boolean(answerState.dragMap[slot.id]);
      });
    }

    return false;
  }

  function evaluateTask(task, answerState) {
    if (!isTaskComplete(task, answerState)) {
      return { complete: false, correct: false };
    }

    if (task.type === "freitext" || task.type === "fehlertext") {
      return {
        complete: true,
        correct: matchesAcceptedAnswer(answerState.text, task.acceptedAnswers)
      };
    }

    if (task.type === "erklaerung") {
      return {
        complete: true,
        correct:
          matchesAcceptedAnswer(answerState.text, task.acceptedAnswers) ||
          matchesKeywordGroups(answerState.text, task.keywordGroups)
      };
    }

    if (task.type === "lueckentext") {
      return {
        complete: true,
        correct: task.blanks.every(function (blank) {
          return matchesAcceptedAnswer(answerState.blankValues[blank.id], blank.answers);
        })
      };
    }

    if (task.type === "dragdrop") {
      return {
        complete: true,
        correct: task.slots.every(function (slot) {
          return answerState.dragMap[slot.id] === task.correctMap[slot.id];
        })
      };
    }

    return { complete: false, correct: false };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function metricCard(label, value) {
    return (
      '<article class="metric-card">' +
      "<span>" +
      escapeHtml(label) +
      "</span>" +
      "<strong>" +
      escapeHtml(value) +
      "</strong>" +
      "</article>"
    );
  }

  function renderMetrics(container, items) {
    container.innerHTML = items
      .map(function (item) {
        return metricCard(item.label, item.value);
      })
      .join("");
  }

  function getStudentSummary(student) {
    const moduleStates = catalog.moduleOrder.map(function (moduleId) {
      return getModuleState(student, moduleId);
    });

    const unlockedCount = moduleStates.filter(function (moduleState) {
      return moduleState.unlocked;
    }).length;
    const passedCount = moduleStates.filter(function (moduleState) {
      return moduleState.passed;
    }).length;
    const completedCount = moduleStates.filter(function (moduleState) {
      return moduleState.completed;
    }).length;
    const totalSeconds = moduleStates.reduce(function (sum, moduleState) {
      return sum + moduleState.totalSeconds;
    }, 0);
    const averageBestScore =
      moduleStates.length === 0
        ? 0
        : Math.round(
            moduleStates.reduce(function (sum, moduleState) {
              return sum + moduleState.bestScore;
            }, 0) / moduleStates.length
          );
    const badgeCounts = {
      bronze: 0,
      silver: 0,
      gold: 0
    };

    moduleStates.forEach(function (moduleState) {
      const badge = getBadgeForScore(moduleState.bestScore);
      if (badge) {
        badgeCounts[badge.key] += 1;
      }
    });

    return {
      totalModules: catalog.moduleOrder.length,
      unlockedCount: unlockedCount,
      passedCount: passedCount,
      completedCount: completedCount,
      totalSeconds: totalSeconds,
      averageBestScore: averageBestScore,
      badgeCounts: badgeCounts
    };
  }

  function renderStudentList() {
    const students = getStudentsSorted();

    if (students.length === 0) {
      elements.studentList.innerHTML =
        '<p class="helper-text">Noch keine Profile vorhanden. Lege oben das erste Profil an.</p>';
      return;
    }

    elements.studentList.innerHTML = students
      .map(function (student) {
        const summary = getStudentSummary(student);
        const activeClass = state.activeStudentId === student.id ? " active" : "";
        return (
          '<article class="student-card' +
          activeClass +
          '">' +
          "<div>" +
          "<strong>" +
          escapeHtml(student.name) +
          "</strong>" +
          '<p class="helper-text">' +
          escapeHtml(
            summary.passedCount +
              " / " +
              summary.totalModules +
              " Module bestanden · " +
              formatDuration(summary.totalSeconds)
          ) +
          "</p>" +
          "</div>" +
          '<button class="button button-secondary student-select-button" data-student-id="' +
          escapeHtml(student.id) +
          '" type="button">Öffnen</button>' +
          "</article>"
        );
      })
      .join("");

    Array.from(elements.studentList.querySelectorAll("[data-student-id]")).forEach(function (button) {
      button.addEventListener("click", function () {
        selectStudent(button.getAttribute("data-student-id"));
      });
    });
  }

  function renderStudentDashboard() {
    const student = getActiveStudent();
    if (!student) {
      return;
    }

    const summary = getStudentSummary(student);
    elements.studentDashboardTitle.textContent = "Werkstatt von " + student.name;

    renderMetrics(elements.studentMetrics, [
      { label: "Freigeschaltet", value: summary.unlockedCount + " / " + summary.totalModules },
      { label: "Bestanden", value: summary.passedCount + " / " + summary.totalModules },
      { label: "Bronze", value: String(summary.badgeCounts.bronze) },
      { label: "Silber", value: String(summary.badgeCounts.silver) },
      { label: "Gold", value: String(summary.badgeCounts.gold) },
      { label: "Lernzeit", value: formatDuration(summary.totalSeconds) }
    ]);

    const progressPercent =
      summary.totalModules === 0 ? 0 : Math.round((summary.passedCount / summary.totalModules) * 100);
    elements.studentProgressText.textContent =
      summary.passedCount + " / " + summary.totalModules + " Module bestanden";
    elements.studentProgressBar.style.width = progressPercent + "%";

    elements.levelSections.innerHTML = data.levels
      .map(function (level) {
        return (
          '<section class="level-section">' +
          '<div class="section-head compact">' +
          "<div>" +
          '<p class="section-label">Level ' +
          escapeHtml(level.rank) +
          "</p>" +
          "<h3>" +
          escapeHtml(formatGermanText(level.title)) +
          "</h3>" +
          "<p>" +
          escapeHtml(formatGermanText(level.subtitle)) +
          "</p>" +
          "</div>" +
          "</div>" +
          '<div class="module-grid">' +
          level.modules
            .map(function (module) {
              const moduleState = getModuleState(student, module.id);
              const unlocked = isModuleAccessible(moduleState);
              const statusLabel = unlocked
                ? moduleState.passed
                  ? "Bestanden"
                  : moduleState.completed
                    ? "Noch nicht bestanden"
                    : "Freigeschaltet"
                : "Gesperrt";
              const moduleBadge = getBadgeForScore(moduleState.bestScore);
              const statusClass = unlocked
                ? moduleState.passed
                  ? "status-pass"
                  : moduleState.completed
                    ? "status-retry"
                    : "status-open"
                : "status-lock";

              return (
                '<article class="module-card ' +
                statusClass +
                '">' +
                '<div class="module-head">' +
                "<div>" +
                "<h4>" +
                escapeHtml(formatGermanText(module.title)) +
                "</h4>" +
                "<p>" +
                escapeHtml(formatGermanText(module.summary)) +
                "</p>" +
                "</div>" +
                '<div class="module-badge-row">' +
                '<span class="badge badge-outline">' +
                escapeHtml(statusLabel) +
                "</span>" +
                renderAwardBadge(moduleBadge, "") +
                "</div>" +
                "</div>" +
                '<div class="module-meta">' +
                "<span>" +
                escapeHtml(module.tasks.length + " Aufgaben") +
                "</span>" +
                "<span>" +
                escapeHtml("bester Wert: " + moduleState.bestScore + " %") +
                "</span>" +
                "<span>" +
                escapeHtml("Lernzeit: " + formatDuration(moduleState.totalSeconds)) +
                "</span>" +
                "</div>" +
                '<div class="meter-track tiny">' +
                '<div class="meter-fill" style="width:' +
                moduleState.bestScore +
                '%"></div>' +
                "</div>" +
                '<div class="tasktype-row">' +
                module.tasks
                  .map(function (task) {
                    return (
                      '<span class="tasktype-chip">' +
                      escapeHtml(formatGermanText(data.taskTypeLabels[task.type])) +
                      "</span>"
                    );
                  })
                  .join("") +
                "</div>" +
                '<div class="control-row">' +
                '<button class="button button-primary module-start-button" data-module-id="' +
                escapeHtml(module.id) +
                '" type="button" ' +
                (unlocked ? "" : "disabled") +
                ">" +
                escapeHtml(moduleState.completed ? "Modul wiederholen" : "Modul starten") +
                "</button>" +
                "</div>" +
                '<p class="helper-text">' +
                escapeHtml(
                  isTeacherModeActive()
                    ? "Lehrer*innen-Modus: Alle Module sind zur Einsicht und Bearbeitung geöffnet."
                    : unlocked
                      ? "Nächstes Modul wird ab " + data.passThreshold + " % freigeschaltet."
                      : "Dieses Modul wird erst freigeschaltet, wenn das vorige Modul mindestens " +
                          data.passThreshold +
                          " % erreicht."
                ) +
                "</p>" +
                "</article>"
              );
            })
            .join("") +
          "</div>" +
          "</section>"
        );
      })
      .join("");

    Array.from(elements.levelSections.querySelectorAll("[data-module-id]")).forEach(function (button) {
      button.addEventListener("click", function () {
        startModule(button.getAttribute("data-module-id"));
      });
    });
  }

  function renderTeacherDashboard() {
    const students = getStudentsSorted();
    const totalSeconds = students.reduce(function (sum, student) {
      return sum + getStudentSummary(student).totalSeconds;
    }, 0);
    const totalPassed = students.reduce(function (sum, student) {
      return sum + getStudentSummary(student).passedCount;
    }, 0);
    const totalBadges = students.reduce(
      function (sum, student) {
        const badgeCounts = getStudentSummary(student).badgeCounts;
        sum.bronze += badgeCounts.bronze;
        sum.silver += badgeCounts.silver;
        sum.gold += badgeCounts.gold;
        return sum;
      },
      { bronze: 0, silver: 0, gold: 0 }
    );
    const averageScore =
      students.length === 0
        ? 0
        : Math.round(
            students.reduce(function (sum, student) {
              return sum + getStudentSummary(student).averageBestScore;
            }, 0) / students.length
          );

    renderMetrics(elements.teacherSummary, [
      { label: "Profile", value: String(students.length) },
      { label: "Bestandene Module", value: String(totalPassed) },
      { label: "Bronze", value: String(totalBadges.bronze) },
      { label: "Silber", value: String(totalBadges.silver) },
      { label: "Gold", value: String(totalBadges.gold) },
      { label: "Gesamte Lernzeit", value: formatDuration(totalSeconds) }
    ]);

    if (students.length === 0) {
      elements.teacherStudents.innerHTML =
        '<p class="helper-text">Noch keine Schülerprofile vorhanden.</p>';
      return;
    }

    elements.teacherStudents.innerHTML = students
      .map(function (student) {
        const summary = getStudentSummary(student);
        const progressPercent =
          summary.totalModules === 0 ? 0 : Math.round((summary.passedCount / summary.totalModules) * 100);

        return (
          '<article class="teacher-card">' +
          '<div class="teacher-head">' +
          "<div>" +
          "<h3>" +
          escapeHtml(student.name) +
          "</h3>" +
          '<p class="helper-text">Zuletzt aktiv: ' +
          escapeHtml(new Date(student.lastActiveAt).toLocaleString("de-CH")) +
          "</p>" +
          "</div>" +
          '<button class="button button-secondary teacher-open-student" data-student-id="' +
          escapeHtml(student.id) +
          '" type="button">Als Profil öffnen</button>' +
          "</div>" +
          '<div class="metric-row compact-metrics">' +
          metricCard("Bestanden", summary.passedCount + " / " + summary.totalModules) +
          metricCard("Bronze", String(summary.badgeCounts.bronze)) +
          metricCard("Silber", String(summary.badgeCounts.silver)) +
          metricCard("Gold", String(summary.badgeCounts.gold)) +
          metricCard("Lernzeit", formatDuration(summary.totalSeconds)) +
          "</div>" +
          '<div class="meter-block top-meter">' +
          '<div class="meter-head"><span>Modulfortschritt</span><strong>' +
          escapeHtml(progressPercent + "%") +
          "</strong></div>" +
          '<div class="meter-track"><div class="meter-fill" style="width:' +
          progressPercent +
          '%"></div></div></div>' +
          '<div class="teacher-module-grid">' +
          catalog.moduleOrder
            .map(function (moduleId) {
              const module = getModule(moduleId);
              const moduleState = getModuleState(student, moduleId);
              const moduleBadge = getBadgeForScore(moduleState.bestScore);
              const className = moduleState.passed
                ? "teacher-module-chip pass"
                : moduleState.unlocked
                  ? "teacher-module-chip open"
                  : "teacher-module-chip lock";

              return (
                '<div class="' +
                className +
                '">' +
                "<strong>" +
                escapeHtml(formatGermanText(module.title)) +
                "</strong>" +
                "<span>" +
                escapeHtml(moduleState.bestScore + " %") +
                "</span>" +
                renderAwardBadge(moduleBadge, "") +
                "</div>"
              );
            })
            .join("") +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    Array.from(elements.teacherStudents.querySelectorAll("[data-student-id]")).forEach(function (button) {
      button.addEventListener("click", function () {
        selectStudent(button.getAttribute("data-student-id"));
      });
    });
  }

  function setView(viewName) {
    elements.identityView.hidden = viewName !== "identity";
    elements.studentDashboardView.hidden = viewName !== "dashboard";
    elements.sessionView.hidden = viewName !== "session";
    elements.completionView.hidden = viewName !== "completion";
    elements.teacherAccessView.hidden = viewName !== "teacher-access";
    elements.teacherDashboardView.hidden = viewName !== "teacher";
  }

  function detectVisibleView() {
    if (!elements.teacherDashboardView.hidden) {
      return "teacher";
    }

    if (!elements.teacherAccessView.hidden) {
      return "teacher-access";
    }

    if (!elements.completionView.hidden) {
      return "completion";
    }

    if (!elements.sessionView.hidden) {
      return "session";
    }

    if (!elements.studentDashboardView.hidden) {
      return "dashboard";
    }

    return "identity";
  }

  function defaultReturnView() {
    const visibleView = detectVisibleView();

    if (visibleView !== "teacher" && visibleView !== "teacher-access") {
      return visibleView;
    }

    if (currentSession) {
      return "session";
    }

    return getActiveStudent() ? "dashboard" : "identity";
  }

  function renderApp(preferredView) {
    renderStudentList();

    const student = getActiveStudent();

    if (preferredView === "teacher") {
      if (teacherAuthenticated) {
        renderTeacherDashboard();
        setView("teacher");
      } else {
        setView("teacher-access");
      }
      return;
    }

    if (preferredView === "teacher-access") {
      setView("teacher-access");
      return;
    }

    if (!student) {
      stopTimer();
      currentSession = null;
      setView("identity");
      return;
    }

    renderStudentDashboard();
    setView(preferredView === "completion" ? "completion" : "dashboard");
  }

  function currentTaskEntry() {
    if (!currentSession) {
      return null;
    }
    return currentSession.tasks[currentSession.index] || null;
  }

  function currentTask() {
    const entry = currentTaskEntry();
    return entry ? entry.task : null;
  }

  function startModule(moduleId) {
    const student = getActiveStudent();
    const module = getModule(moduleId);
    const moduleState = getModuleState(student, moduleId);

    if (!student || !module || !moduleState || !isModuleAccessible(moduleState)) {
      return;
    }

    currentSession = {
      studentId: student.id,
      moduleId: moduleId,
      tasks: module.tasks.map(function (task) {
        return { task: task };
      }),
      index: 0,
      attempts: 0,
      resolved: false,
      answerState: makeAnswerState(module.tasks[0]),
      feedbackPayload: null,
      results: [],
      startedAt: Date.now(),
      completionReady: false,
      currentViewTask: prepareTaskView(module.tasks[0])
    };

    state.students[student.id].lastActiveAt = new Date().toISOString();
    saveState();
    startTimer();
    renderSession();
  }

  function startTimer() {
    stopTimer();
    timerHandle = window.setInterval(function () {
      if (!currentSession) {
        return;
      }
      const elapsed = Math.round((Date.now() - currentSession.startedAt) / 1000);
      elements.sessionTimer.textContent = formatDuration(elapsed);
    }, 1000);
  }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function renderSession() {
    const student = getActiveStudent();
    const module = getModule(currentSession.moduleId);
    const level = getLevel(module.levelId);
    const task = currentTask();
    const taskNumber = currentSession.index + 1;
    const taskLabel = formatGermanText(data.taskTypeLabels[task.type]);
    const resolvedCount = currentSession.results.length;
    const percent = Math.round((resolvedCount / currentSession.tasks.length) * 100);
    const correctCount = currentSession.results.filter(function (entry) {
      return entry.outcome === "solved";
    }).length;

    elements.sessionLevelBadge.textContent = level.title;
    elements.sessionModuleBadge.textContent = module.title;
    elements.sessionTypeBadge.textContent = taskLabel;
    elements.sessionStudentName.textContent = student.name;
    elements.sessionTaskCounter.textContent = taskNumber + " / " + currentSession.tasks.length;
    elements.sessionCorrectCounter.textContent = String(correctCount);
    elements.sessionAttemptText.textContent =
      Math.min(currentSession.attempts + 1, data.maxAttempts) + " von " + data.maxAttempts;
    elements.sessionProgressText.textContent = percent + " %";
    elements.sessionProgressBar.style.width = percent + "%";
    elements.taskEyebrow.textContent =
      formatGermanText(level.title) + " · " + formatGermanText(module.title);
    elements.taskTitle.textContent = formatGermanText(task.title);
    elements.taskPrompt.textContent = formatGermanText(task.prompt);
    elements.attemptBadge.textContent =
      "Versuch " + Math.min(currentSession.attempts + 1, data.maxAttempts) + " von " + data.maxAttempts;

    if (task.context) {
      elements.taskContext.hidden = false;
      elements.taskContext.textContent = formatGermanText(task.context);
    } else {
      elements.taskContext.hidden = true;
      elements.taskContext.textContent = "";
    }

    renderTaskWorkspace(task, currentSession.answerState, currentSession.currentViewTask);
    renderFeedback(task, currentSession.feedbackPayload);
    bindTaskInteractions();

    elements.checkButton.disabled = Boolean(currentSession.resolved);
    elements.nextTaskButton.disabled = !currentSession.resolved;
    setView("session");
  }

  function renderTaskWorkspace(task, answerState, viewTask) {
    const taskForView = viewTask || task;
    let markup = "";

    if (task.type === "freitext" || task.type === "fehlertext") {
      markup =
        '<div class="input-stack">' +
        '<label class="field-label" for="textAnswerField">' +
        escapeHtml(formatGermanText(task.inputLabel || "Antwort")) +
        "</label>" +
        '<input id="textAnswerField" class="text-field" type="text" autocomplete="off" spellcheck="false" placeholder="' +
        escapeHtml(formatGermanText(task.placeholder || "Antwort")) +
        '" value="' +
        escapeHtml(answerState.text || "") +
        '">' +
        "</div>";
    }

    if (task.type === "erklaerung") {
      markup =
        '<div class="input-stack">' +
        '<label class="field-label" for="textAnswerField">' +
        escapeHtml(formatGermanText(task.inputLabel || "Erklärung")) +
        "</label>" +
        '<textarea id="textAnswerField" class="text-area" spellcheck="false" placeholder="' +
        escapeHtml(formatGermanText(task.placeholder || "Erklärung")) +
        '">' +
        escapeHtml(answerState.text || "") +
        "</textarea>" +
        "</div>";
    }

    if (task.type === "lueckentext") {
      markup =
        '<div class="gap-card">' +
        '<div class="gap-flow">' +
        task.segments
          .map(function (segment, index) {
            const blank = task.blanks[index];
            const segmentMarkup =
              '<span class="gap-segment">' + escapeHtml(formatGermanText(segment)) + "</span>";

            if (!blank) {
              return segmentMarkup;
            }

            return (
              segmentMarkup +
              '<label class="gap-inline">' +
              '<span class="sr-only">' +
              escapeHtml(formatGermanText(blank.label)) +
              "</span>" +
              '<input class="gap-input" data-blank-id="' +
              escapeHtml(blank.id) +
              '" type="text" autocomplete="off" spellcheck="false" value="' +
              escapeHtml(answerState.blankValues[blank.id] || "") +
              '" placeholder="...">' +
              "</label>"
            );
          })
          .join("") +
        "</div>" +
        '<div class="gap-legend">' +
        task.blanks
          .map(function (blank) {
            return '<span class="tasktype-chip">' + escapeHtml(formatGermanText(blank.label)) + "</span>";
          })
          .join("") +
        "</div>" +
        "</div>";
    }

    if (task.type === "dragdrop") {
      const assignedIds = Object.keys(answerState.dragMap).map(function (slotId) {
        return answerState.dragMap[slotId];
      });

      markup =
        '<div class="drag-slots">' +
        task.slots
          .map(function (slot) {
            const optionId = answerState.dragMap[slot.id];
            const option = taskForView.options.find(function (item) {
              return item.id === optionId;
            });

            return (
              '<div class="slot-card" data-slot-id="' +
              escapeHtml(slot.id) +
              '">' +
              '<span class="slot-label">' +
              escapeHtml(formatGermanText(slot.label)) +
              "</span>" +
              '<div class="slot-value" data-slot-target="' +
              escapeHtml(slot.id) +
              '">' +
              (option
                ? '<span class="slot-chip">' +
                  escapeHtml(formatGermanText(option.label)) +
                  "</span>" +
                  '<button class="button button-ghost mini-button" data-clear-slot="' +
                  escapeHtml(slot.id) +
                  '" type="button">Lösen</button>'
                : '<span class="slot-empty">Hier ablegen</span>') +
              "</div>" +
              "</div>"
            );
          })
          .join("") +
        "</div>" +
        '<div class="drag-options">' +
        taskForView.options
          .filter(function (option) {
            return !assignedIds.includes(option.id);
          })
          .map(function (option) {
            const selected = answerState.selectedOptionId === option.id ? " selected" : "";
            return (
              '<button class="option-card' +
              selected +
              '" data-option-id="' +
              escapeHtml(option.id) +
              '" draggable="true" type="button">' +
              escapeHtml(formatGermanText(option.label)) +
              "</button>"
            );
          })
          .join("") +
        "</div>";
    }

    elements.taskWorkspace.innerHTML = markup;
  }

  function renderFeedback(task, payload) {
    if (!payload) {
      elements.feedbackPanel.hidden = true;
      elements.feedbackPanel.className = "feedback-panel";
      elements.feedbackPanel.innerHTML = "";
      return;
    }

    let markup =
      '<div class="feedback-head">' +
      "<h3>" +
      escapeHtml(formatGermanText(payload.title)) +
      "</h3>" +
      (payload.badge
        ? '<span class="badge badge-outline">' + escapeHtml(formatGermanText(payload.badge)) + "</span>"
        : "") +
      "</div>" +
      (payload.message
        ? '<p class="feedback-copy">' + escapeHtml(formatGermanText(payload.message)) + "</p>"
        : "");

    if (payload.hint) {
      markup +=
        '<div class="feedback-box hint-box"><strong>Tipp:</strong> ' +
        escapeHtml(formatGermanText(payload.hint)) +
        "</div>";
    }

    if (payload.showSolution) {
      markup +=
        '<div class="solution-grid">' +
        '<div class="solution-card">' +
        "<h4>Musterlösung</h4>" +
        '<p class="feedback-copy">' +
        escapeHtml(formatGermanText(task.solution)) +
        "</p>" +
        "</div>" +
        '<div class="solution-card">' +
        "<h4>Genaue Erklärung</h4>" +
        '<p class="feedback-copy">' +
        escapeHtml(formatGermanText(task.explanation)) +
        "</p>" +
        "</div>" +
        "</div>";
    }

    elements.feedbackPanel.hidden = false;
    elements.feedbackPanel.className = "feedback-panel " + payload.statusClass;
    elements.feedbackPanel.innerHTML = markup;
  }

  function bindTaskInteractions() {
    const task = currentTask();

    if (task.type === "freitext" || task.type === "fehlertext" || task.type === "erklaerung") {
      const input = document.getElementById("textAnswerField");
      if (input) {
        input.addEventListener("input", function () {
          currentSession.answerState.text = input.value;
        });
      }
    }

    if (task.type === "lueckentext") {
      Array.from(elements.taskWorkspace.querySelectorAll("[data-blank-id]")).forEach(function (input) {
        input.addEventListener("input", function () {
          currentSession.answerState.blankValues[input.getAttribute("data-blank-id")] = input.value;
        });
      });
    }

    if (task.type === "dragdrop") {
      Array.from(elements.taskWorkspace.querySelectorAll("[data-option-id]")).forEach(function (button) {
        button.addEventListener("click", function () {
          currentSession.answerState.selectedOptionId = button.getAttribute("data-option-id");
          renderSession();
        });

        button.addEventListener("dragstart", function (event) {
          currentSession.answerState.selectedOptionId = button.getAttribute("data-option-id");
          event.dataTransfer.setData("text/plain", currentSession.answerState.selectedOptionId);
        });
      });

      Array.from(elements.taskWorkspace.querySelectorAll("[data-slot-target]")).forEach(function (target) {
        target.addEventListener("click", function () {
          const selectedOptionId = currentSession.answerState.selectedOptionId;
          if (!selectedOptionId) {
            return;
          }
          currentSession.answerState.dragMap[target.getAttribute("data-slot-target")] = selectedOptionId;
          currentSession.answerState.selectedOptionId = null;
          renderSession();
        });

        target.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        target.addEventListener("drop", function (event) {
          event.preventDefault();
          const optionId =
            event.dataTransfer.getData("text/plain") || currentSession.answerState.selectedOptionId;
          if (!optionId) {
            return;
          }
          currentSession.answerState.dragMap[target.getAttribute("data-slot-target")] = optionId;
          currentSession.answerState.selectedOptionId = null;
          renderSession();
        });
      });

      Array.from(elements.taskWorkspace.querySelectorAll("[data-clear-slot]")).forEach(function (button) {
        button.addEventListener("click", function () {
          const slotId = button.getAttribute("data-clear-slot");
          delete currentSession.answerState.dragMap[slotId];
          renderSession();
        });
      });
    }
  }

  function feedbackPayload(kind) {
    if (kind === "correct") {
      return {
        title: "Richtig.",
        message: "Die Antwort passt.",
        badge: "gelöst",
        showSolution: false,
        statusClass: "status-correct"
      };
    }

    if (kind === "wrong-1") {
      return {
        title: "Falsch.",
        message: "",
        badge: "1. Fehler",
        showSolution: false,
        statusClass: "status-wrong"
      };
    }

    if (kind === "wrong-2") {
      return {
        title: "Noch nicht richtig.",
        message: "Jetzt wird ein Tipp eingeblendet.",
        badge: "2. Fehler",
        hint: currentTask().hint,
        showSolution: false,
        statusClass: "status-hint"
      };
    }

    return {
      title: "Musterlösung und Erklärung",
      message: "Nach dem dritten Fehler wird die Lösung freigeschaltet.",
      badge: "3. Fehler",
      showSolution: true,
      statusClass: "status-solution"
    };
  }

  function evaluateCurrentTask() {
    const task = currentTask();
    const result = evaluateTask(task, currentSession.answerState);

    if (!result.complete) {
      currentSession.feedbackPayload = {
        title: "Antwort unvollständig.",
        message: "Bitte fülle alle nötigen Felder aus.",
        badge: "",
        showSolution: false,
        statusClass: "status-hint"
      };
      renderSession();
      return;
    }

    currentSession.attempts += 1;

    if (result.correct) {
      currentSession.resolved = true;
      currentSession.feedbackPayload = feedbackPayload("correct");
      currentSession.results.push({
        taskId: task.id,
        outcome: "solved",
        attempts: currentSession.attempts
      });
      renderSession();
      return;
    }

    if (currentSession.attempts === 1) {
      currentSession.feedbackPayload = feedbackPayload("wrong-1");
      renderSession();
      return;
    }

    if (currentSession.attempts === 2) {
      currentSession.feedbackPayload = feedbackPayload("wrong-2");
      renderSession();
      return;
    }

    currentSession.resolved = true;
    currentSession.feedbackPayload = feedbackPayload("wrong-3");
    currentSession.results.push({
      taskId: task.id,
      outcome: "failed",
      attempts: currentSession.attempts
    });
    renderSession();
  }

  function resetCurrentAnswer() {
    if (!currentSession) {
      return;
    }

    currentSession.answerState = makeAnswerState(currentTask());
    currentSession.feedbackPayload = null;
    if (!currentSession.resolved) {
      renderSession();
    } else {
      renderSession();
    }
  }

  function reloadCurrentTask() {
    if (!currentSession || currentSession.resolved) {
      return;
    }

    currentSession.answerState = makeAnswerState(currentTask());
    currentSession.feedbackPayload = null;
    currentSession.currentViewTask = prepareTaskView(currentTask());
    renderSession();
  }

  function goToNextTask() {
    if (!currentSession || !currentSession.resolved) {
      return;
    }

    if (currentSession.index === currentSession.tasks.length - 1) {
      completeModule();
      return;
    }

    currentSession.index += 1;
    currentSession.attempts = 0;
    currentSession.resolved = false;
    currentSession.feedbackPayload = null;
    currentSession.answerState = makeAnswerState(currentTask());
    currentSession.currentViewTask = prepareTaskView(currentTask());
    renderSession();
  }

  function upsertTaskStat(moduleState, taskId) {
    if (!moduleState.taskStats[taskId]) {
      moduleState.taskStats[taskId] = {
        solvedCount: 0,
        failedCount: 0,
        bestAttempts: null,
        lastOutcome: "unseen"
      };
    }

    return moduleState.taskStats[taskId];
  }

  function completeModule() {
    const student = getActiveStudent();
    const module = getModule(currentSession.moduleId);
    const moduleState = getModuleState(student, module.id);
    const seconds = Math.round((Date.now() - currentSession.startedAt) / 1000);
    const solvedCount = currentSession.results.filter(function (entry) {
      return entry.outcome === "solved";
    }).length;
    const failedCount = currentSession.results.filter(function (entry) {
      return entry.outcome === "failed";
    }).length;
    const score = Math.round((solvedCount / module.tasks.length) * 100);
    const passed = score >= data.passThreshold;

    moduleState.completed = true;
    moduleState.passed = Boolean(moduleState.passed || passed);
    moduleState.lastScore = score;
    moduleState.bestScore = Math.max(moduleState.bestScore, score);
    moduleState.runs += 1;
    moduleState.totalSeconds += seconds;
    moduleState.lastPlayedAt = new Date().toISOString();

    currentSession.results.forEach(function (result) {
      const stat = upsertTaskStat(moduleState, result.taskId);
      stat.lastOutcome = result.outcome;
      if (result.outcome === "solved") {
        stat.solvedCount += 1;
        stat.bestAttempts =
          stat.bestAttempts === null ? result.attempts : Math.min(stat.bestAttempts, result.attempts);
      } else {
        stat.failedCount += 1;
      }
    });

    const nextModuleId = getNextModuleId(module.id);
    if (passed && nextModuleId) {
      moduleState.unlocked = true;
      student.moduleStates[nextModuleId].unlocked = true;
    }

    student.lastActiveAt = new Date().toISOString();
    saveState();
    stopTimer();

    renderMetrics(elements.completionMetrics, [
      { label: "Richtig", value: String(solvedCount) + " / " + String(module.tasks.length) },
      { label: "Falsch", value: String(failedCount) },
      { label: "Modulergebnis", value: score + " %" },
      { label: "Freischaltung", value: passed ? "nächstes Modul offen" : "noch gesperrt" },
      { label: "Zeit", value: formatDuration(seconds) }
    ]);

    const earnedBadge = getBadgeForScore(score);

    elements.completionTitle.textContent = formatGermanText(module.title) + " abgeschlossen";
    elements.completionLead.textContent = passed
      ? "Das Modul ist bestanden. Das nächste Modul wurde freigeschaltet."
      : "Das Modul ist bearbeitet, aber noch nicht bestanden. Wiederhole es, um mindestens 60 % zu erreichen.";
    elements.completionBadgeRow.innerHTML = earnedBadge
      ? renderAwardBadge(earnedBadge, "für dieses Modul")
      : '<span class="badge badge-outline">Noch kein Badge</span>';
    elements.nextModuleButton.disabled = !(passed && nextModuleId);
    elements.nextModuleButton.setAttribute("data-next-module-id", nextModuleId || "");

    currentSession = null;
    setView("completion");
  }

  function showTeacherAccess() {
    elements.teacherPasswordInput.value = "";
    elements.teacherAccessError.hidden = true;
    setView("teacher-access");
    window.requestAnimationFrame(function () {
      elements.teacherPasswordInput.focus();
    });
  }

  function openTeacherView() {
    teacherReturnView = defaultReturnView();

    if (teacherAuthenticated) {
      renderTeacherDashboard();
      setView("teacher");
      return;
    }

    showTeacherAccess();
  }

  function unlockTeacherAccess() {
    const password = String(elements.teacherPasswordInput.value || "").trim().toLowerCase();

    if (password !== TEACHER_PASSWORD) {
      elements.teacherAccessError.hidden = false;
      elements.teacherPasswordInput.focus();
      elements.teacherPasswordInput.select();
      return;
    }

    saveTeacherSession(true);
    elements.teacherAccessError.hidden = true;
    elements.teacherPasswordInput.value = "";
    renderTeacherDashboard();
    setView("teacher");
  }

  function closeTeacherAccess() {
    renderApp(teacherReturnView);
  }

  function logoutTeacher() {
    saveTeacherSession(false);
    teacherReturnView = getActiveStudent() ? "dashboard" : "identity";
    renderApp(teacherReturnView);
  }

  function leaveSessionToDashboard() {
    if (!currentSession) {
      renderApp();
      return;
    }

    const confirmed = window.confirm(
      "Das aktuelle Modul ist noch nicht abgeschlossen. Wirklich zur Übersicht wechseln?"
    );
    if (!confirmed) {
      return;
    }

    currentSession = null;
    stopTimer();
    renderApp();
  }

  function bindStaticEvents() {
    elements.registerButton.addEventListener("click", registerStudent);
    elements.studentNameInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        registerStudent();
      }
    });

    elements.heroTeacherButton.addEventListener("click", openTeacherView);
    elements.openTeacherButton.addEventListener("click", openTeacherView);
    elements.studentTeacherButton.addEventListener("click", openTeacherView);
    elements.completionTeacherButton.addEventListener("click", openTeacherView);
    elements.teacherPasswordInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        unlockTeacherAccess();
      }
    });
    elements.unlockTeacherButton.addEventListener("click", unlockTeacherAccess);
    elements.cancelTeacherAccessButton.addEventListener("click", closeTeacherAccess);
    elements.closeTeacherButton.addEventListener("click", function () {
      renderApp(teacherReturnView);
    });
    elements.logoutTeacherButton.addEventListener("click", logoutTeacher);

    elements.switchStudentButton.addEventListener("click", function () {
      state.activeStudentId = null;
      saveState();
      renderApp("identity");
    });

    elements.resetStudentButton.addEventListener("click", resetStudentProgress);
    elements.resetAllButton.addEventListener("click", resetAllData);
    elements.backToDashboardButton.addEventListener("click", leaveSessionToDashboard);
    elements.checkButton.addEventListener("click", evaluateCurrentTask);
    elements.resetAnswerButton.addEventListener("click", resetCurrentAnswer);
    elements.retryTaskButton.addEventListener("click", reloadCurrentTask);
    elements.nextTaskButton.addEventListener("click", goToNextTask);

    elements.replayModuleButton.addEventListener("click", function () {
      const student = getActiveStudent();
      if (!student) {
        renderApp();
        return;
      }

      const lastModuleId = findMostRecentModuleId(student);
      if (lastModuleId) {
        startModule(lastModuleId);
      } else {
        renderApp();
      }
    });

    elements.nextModuleButton.addEventListener("click", function () {
      const nextModuleId = elements.nextModuleButton.getAttribute("data-next-module-id");
      if (nextModuleId) {
        startModule(nextModuleId);
      }
    });

    elements.completionDashboardButton.addEventListener("click", function () {
      renderApp();
    });
  }

  function findMostRecentModuleId(student) {
    let latest = null;

    catalog.moduleOrder.forEach(function (moduleId) {
      const moduleState = getModuleState(student, moduleId);
      if (!moduleState.lastPlayedAt) {
        return;
      }

      if (!latest || new Date(moduleState.lastPlayedAt).getTime() > new Date(latest.lastPlayedAt).getTime()) {
        latest = {
          moduleId: moduleId,
          lastPlayedAt: moduleState.lastPlayedAt
        };
      }
    });

    return latest ? latest.moduleId : catalog.moduleOrder[0];
  }

  bindStaticEvents();
  renderApp();
})();
