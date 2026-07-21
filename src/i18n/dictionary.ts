/** ISO 639-1 — las 5 abreviaturas del selector de idiomas son inmutables y NUNCA se traducen. */
export type Language = "es" | "en" | "de" | "ja" | "ko";

/**
 * Strict dictionary shape. Every language file must implement this exact
 * structure — TypeScript will error if a key is missing or misspelled.
 * Strings may contain `{{placeholders}}` resolved via `interpolate()`.
 */
export type Dictionary = {
  sidebar: {
    brand: string;
    tagline: string;
    planLabel: string;
    planValue: string;
    /** Encabezado del primer bloque del menú: Dashboard, Flashcards, Desafíos. */
    groupManagement: string;
    /** Encabezado del segundo bloque del menú: Análisis, Fuentes, Argumentos, Simulador, Asistente. */
    groupCognition: string;
    /** Aria/title del botón hamburguesa que abre el drawer en móvil. */
    openMenuLabel: string;
    /** Aria/title del botón que cierra el drawer móvil. */
    closeMenuLabel: string;
  };
  nav: {
    dashboard: string;
    flashcards: string;
    analytics: string;
    sources: string;
    challenges: string;
    arguments: string;
    simulator: string;
    assistant: string;
  };
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  /** "El Ritual de Iniciación" — pantalla de único uso que pide el nombre antes de entrar al Dashboard por primera vez (ver `OnboardingView.tsx`). */
  onboarding: {
    heading: string;
    subtitle: string;
    namePlaceholder: string;
    cta: string;
  };
  /** Gate obligatorio de Privacidad y Autonomía (App Store / Play Store). */
  privacyOnboarding: {
    title: string;
    subtitle: string;
    vaultTitle: string;
    vaultBody: string;
    privacyTitle: string;
    privacyBody: string;
    permissionTitle: string;
    permissionBody: string;
    cta: string;
  };
  header: {
    /** Saludo CON nombre — recibe `{{name}}`. Solo se usa cuando `userName` tiene contenido real. */
    welcomeBack: string;
    /** Saludo SIN nombre (usuario nuevo/anónimo) — texto fijo, jamás lleva coma suelta. */
    welcomeGeneric: string;
    role: string;
    /** Fallback del nombre junto al avatar cuando `userName` está vacío/nulo. */
    guestLabel: string;
    languageSelectorLabel: string;
    avatarLabel: string;
    goToProfileLabel: string;
    globalTimerLabel: string;
    timerPauseLabel: string;
    timerResumeLabel: string;
    timerShowLabel: string;
    timerHideLabel: string;
    timerResetLabel: string;
  };
  summary: {
    heading: string;
    subheading: string;
  };
  cards: {
    /** Tarjeta 1 del Resumen — carrusel de "Desafíos" del día (Misión 1). `detail` recibe `{{current}}`/`{{total}}`. */
    challenges: { title: string; detail: string };
    /** Tarjeta 2 — resumen de Flashcards, clickeable hacia `/flashcards` (Misión 2). `detail` recibe `{{count}}`. */
    cardsToday: { title: string; detail: string };
    streak: { title: string; value: string; detail: string };
  };
  /** Bloque inferior del Dashboard — reflexión estoica (sin CTA). */
  continueCard: {
    title: string;
    /** Máxima latina; tipografía Serif/itálica en la vista. */
    maxim: string;
    description: string;
  };
  profile: {
    title: string;
    backLabel: string;
    accountSection: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string;
    copyLabel: string;
    copiedLabel: string;
    subscriptionLabel: string;
    currentPlanLabel: string;
    plans: { basic: string; pro: string };
    upgradeCta: string;
    manageCta: string;
    saveLabel: string;
    preferencesSection: string;
    languageLabel: string;
    accentColorLabel: string;
    accentColorDescription: string;
    accentColorResetLabel: string;
    changePhotoLabel: string;
    uiSpeedLabel: string;
    uiSpeedOptions: { fast: string; smooth: string; luxury: string };
    customizeButton: string;
    /** BYOK — "El Peaje Financiero" (Misión 1). */
    credentialsSection: string;
    apiKeyLabel: string;
    apiKeyPlaceholder: string;
    saveCredentialLabel: string;
    credentialSavedLabel: string;
    credentialsDisclaimer: string;
    /** Paywall / God Mode — "Licencia de Uso". */
    licenseSection: string;
    licenseCodeLabel: string;
    licenseCodePlaceholder: string;
    licenseRedeemLabel: string;
    licenseVipToast: string;
    licenseActiveLabel: string;
    licenseInvalidLabel: string;
    credentialsLockedLabel: string;
  };
  /** Modal Silent Luxury del Paywall (Sidebar / temas bloqueados). */
  paywall: {
    title: string;
    navLockedMessage: string;
    dismissLabel: string;
    themeLockedLabel: string;
  };
  themeView: {
    backLabel: string;
    title: string;
    subtitle: string;
    selectedLabel: string;
    selectLabel: string;
    /** "El Control Maestro" (Misión 2) — segmented control Claro/Oscuro/Automático, arriba del Showroom. */
    modeSectionLabel: string;
    modeGroupLabel: string;
    modeOptions: { light: string; dark: string; system: string };
  };
  flashcards: {
    heading: string;
    createDeck: string;
    emptyState: string;
    newDeckName: string;
    editHint: string;
    selectMode: string;
    cancelSelection: string;
    deleteSelectedButton: string;
    deleteSelectedConfirm: string;
    editAction: string;
    shareAction: string;
    shareComingSoon: string;
    deleteAction: string;
    deleteDeckConfirm: string;
    deleteConfirmTitle: string;
    cancelLabel: string;
    deckMenuLabel: string;
  };
  comingSoon: {
    title: string;
    description: string;
  };
  /**
   * "La Consola Clínica" — Asistente Cognitivo en Modo Inquisidor
   * (Método Socrático). Ver `AssistantView.tsx` y el submenú hover del
   * ítem "Asistente" en el Sidebar (`DashboardLayout.tsx`).
   */
  assistant: {
    title: string;
    modeLabel: string;
    modeInquisitor: string;
    modeInquisitorMethod: string;
    modeProfessor: string;
    modeProfessorMethod: string;
    modeFacilitator: string;
    comingSoonBadge: string;
    submenuLabel: string;
    inputPlaceholder: string;
    sendLabel: string;
    mockUserMessage: string;
    mockAssistantMessage: string;
    /** "El Nuevo Catedrático" — formulario de simulacro (no chat). */
    professor: {
      sourceLabel: string;
      sourcePlaceholder: string;
      pageRangeLabel: string;
      pageRangePlaceholder: string;
      examTypeLabel: string;
      examTypes: {
        clinical: string;
        multiple: string;
        active: string;
      };
      generateButton: string;
      evaluateButton: string;
      examTitle: string;
      noSourceHint: string;
      scoreLabel: string;
      resetButton: string;
    };
  };
  /** "Sellado de la Memoria" (Misión 1): ventana de carga inicial de `decks` desde la Bóveda de Titanio. */
  loadingVault: {
    decksLabel: string;
  };
  studyCard: {
    /** Calidad 0 (SM-2) — "Olvidado". */
    rateAgain: string;
    /** Calidad 1 (SM-2) — "Difícil". */
    rateHard: string;
    /** Calidad 2 (SM-2) — "Bueno". */
    rateGood: string;
    /** Calidad 3 (SM-2) — "Fácil". */
    rateEasy: string;
    backToDecks: string;
    /** aria-label de la Tarjeta Monolítica 3D cuando está boca abajo (front). */
    flipToAnswer: string;
    /** aria-label de la Tarjeta Monolítica 3D cuando ya está volteada (back). */
    flipToQuestion: string;
    /** Microcopy bajo la pregunta, invitando al giro 3D. */
    tapToFlip: string;
  };
  studyView: {
    addCardButton: string;
    emptyDeckTitle: string;
    emptyDeckDescription: string;
    /** Misión 3 (Filtro del Olvido): mazo con tarjetas, pero ninguna vencida hoy. */
    allCaughtUpTitle: string;
    allCaughtUpDescription: string;
    queueCounterLabel: string;
    /** "Tarjeta {{current}} de {{total}}" — progreso del Quirófano Matemático. */
    progressLabel: string;
    resetDeckButton: string;
  };
  addCardModal: {
    title: string;
    questionLabel: string;
    questionPlaceholder: string;
    imageLabel: string;
    noImageLabel: string;
    hintLabel: string;
    hintPlaceholder: string;
    answerLabel: string;
    answerPlaceholder: string;
    cancelLabel: string;
    saveLabel: string;
  };
  analytics: {
    title: string;
    global: string;
    selectDeck: string;
    deckAnalysis: string;
    noDecksState: string;
    totalReviewsLabel: string;
    resetButton: string;
    resetConfirm: string;
    performanceTab: string;
    timeTab: string;
    labTab: string;
  };
  /** "El Laboratorio" — Santuario de Datos de neuro-métricas, ver `LaboratoryView.tsx`. */
  laboratory: {
    title: string;
    subtitle: string;
    cognitiveLoadLabel: string;
    cognitiveLoadDetail: string;
    retentionIndexLabel: string;
    retentionIndexDetail: string;
    synapticStabilityLabel: string;
    synapticStabilityDetail: string;
    curveTitle: string;
    curveSubtitle: string;
    curveDayLabel: string;
    curveRetentionLabel: string;
  };
  timeAnalytics: {
    totalTimeLabel: string;
    totalTimeCaption: string;
    last7DaysLabel: string;
    perDeckTitle: string;
    perDeckEmptyState: string;
  };
  deckEditor: {
    subtitle: string;
    questionLabel: string;
    questionPlaceholder: string;
    hintLabel: string;
    hintPlaceholder: string;
    answerLabel: string;
    answerPlaceholder: string;
    addImageButton: string;
    changeImageButton: string;
    removeImageLabel: string;
    cardNumberLabel: string;
    addCardButton: string;
    deleteCardLabel: string;
    deleteCardConfirm: string;
    emptyDeckDescription: string;
    saveChangesButton: string;
    unsavedIndicator: string;
    exitUnsavedConfirm: string;
    deckNotFoundTitle: string;
    deckNotFoundDescription: string;
    /** Botón destructivo en la cabecera del editor (Misión 2). */
    deleteDeckButton: string;
  };
  challenges: {
    title: string;
    today: string;
    tomorrow: string;
    /** Aria-label/title del botón "+" de la barra de captura. */
    addTask: string;
    capturePlaceholder: string;
    emptyState: string;
    menuLabel: string;
    editAction: string;
    deleteAction: string;
    completedShowLabel: string;
    completedHideLabel: string;
  };
};

const es: Dictionary = {
  sidebar: {
    brand: "Estudio",
    tagline: "Panel avanzado",
    planLabel: "Plan actual",
    planValue: "Pro",
    groupManagement: "Gestión",
    groupCognition: "Soporte y Cognición",
    openMenuLabel: "Abrir menú de navegación",
    closeMenuLabel: "Cerrar menú de navegación",
  },
  nav: {
    dashboard: "Dashboard",
    flashcards: "Flashcards",
    analytics: "Análisis",
    sources: "Fuentes",
    challenges: "Desafíos",
    arguments: "Argumentos",
    simulator: "Simulador",
    assistant: "Asistente",
  },
  greeting: {
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
  },
  onboarding: {
    heading: "Bienvenido/a",
    subtitle: "Personalicemos tu experiencia antes de comenzar.",
    namePlaceholder: "Ingresa tu nombre...",
    cta: "Comenzar",
  },
  privacyOnboarding: {
    title: "🛡️ Privacidad y Autonomía Absoluta",
    subtitle: "Nosotros diseñamos la arquitectura, tú tienes el control total.",
    vaultTitle: "Soberanía",
    vaultBody:
      "Eres el único dueño de tu información. Tus mazos y progreso se guardan en tu dispositivo y en tu nube personal (iCloud/Drive). Tu bóveda es tuya.",
    privacyTitle: "Privacidad",
    privacyBody:
      "Privacidad garantizada sin rastreos. No analizamos métricas ni recopilamos datos en segundo plano. Tu estudio es privado.",
    permissionTitle: "Sincronización",
    permissionBody:
      "Sincronización transparente. La app pedirá permiso de archivos única y exclusivamente para guardar tu progreso local de forma segura.",
    cta: "Entendido y Aceptado",
  },
  header: {
    welcomeBack: "Te damos la bienvenida, {{name}}",
    welcomeGeneric: "Te damos la bienvenida",
    role: "Estudiante",
    guestLabel: "Nuevo usuario",
    languageSelectorLabel: "Selector de idioma",
    avatarLabel: "Avatar de usuario",
    goToProfileLabel: "Ir a mi perfil",
    globalTimerLabel: "Cronómetro de la sesión",
    timerPauseLabel: "Pausar cronómetro",
    timerResumeLabel: "Reanudar cronómetro",
    timerShowLabel: "Mostrar cronómetro",
    timerHideLabel: "Ocultar cronómetro",
    timerResetLabel: "Restablecer sesión actual",
  },
  summary: {
    heading: "Resumen",
    subheading: "Tu actividad de estudio de hoy de un vistazo.",
  },
  cards: {
    challenges: {
      title: "Desafíos",
      detail: "Tarea {{current}} de {{total}}",
    },
    cardsToday: {
      title: "Flashcards",
      detail: "{{count}} pendientes de revisión",
    },
    streak: {
      title: "Racha de días de estudio",
      value: "{{count}} días",
      detail: "¡Sigue así, vas muy bien!",
    },
  },
  continueCard: {
    title: "Recuerda",
    maxim: "Respice finem.",
    description:
      "Considera el final. Una invitación implacable a reflexionar sobre las consecuencias a largo plazo de tus acciones antes de emprenderlas. Que el objetivo dicte el sacrificio.",
  },
  profile: {
    title: "Perfil de usuario",
    backLabel: "Volver",
    accountSection: "Cuenta",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre",
    codeLabel: "Código de usuario",
    copyLabel: "Copiar al portapapeles",
    copiedLabel: "¡Copiado!",
    subscriptionLabel: "Suscripción",
    currentPlanLabel: "Plan actual",
    plans: { basic: "Básico", pro: "Pro" },
    upgradeCta: "Mejorar a Pro",
    manageCta: "Gestionar Suscripción",
    saveLabel: "Guardar cambios",
    preferencesSection: "Preferencias de Interfaz",
    languageLabel: "Idioma",
    accentColorLabel: "Color de Acento",
    accentColorDescription:
      "Elige un color libre para personalizar los acentos de toda la interfaz.",
    accentColorResetLabel: "Restablecer al color del tema",
    changePhotoLabel: "Cambiar Fotografía",
    uiSpeedLabel: "Velocidad de Interfaz",
    uiSpeedOptions: {
      fast: "Rápido (Productividad)",
      smooth: "Suave (Estándar)",
      luxury: "Lujo (Fluidez Premium)",
    },
    customizeButton: "Personalizar Entorno de Estudio",
    credentialsSection: "Credenciales de Inteligencia Cognitiva",
    apiKeyLabel: "Clave de API (OpenAI / Anthropic)",
    apiKeyPlaceholder: "sk-…",
    saveCredentialLabel: "Guardar Credencial",
    credentialSavedLabel: "Credencial guardada en la Bóveda",
    credentialsDisclaimer:
      "El procesamiento avanzado requiere su propia credencial. Las llaves se almacenan localmente y jamás se comparten.",
    licenseSection: "Licencia de Uso",
    licenseCodeLabel: "Código de licencia",
    licenseCodePlaceholder: "XXXX-XXXX",
    licenseRedeemLabel: "Canjear",
    licenseVipToast: "Acceso VIP Concedido. Bienvenido, Arquitecto.",
    licenseActiveLabel: "Licencia Pro activa",
    licenseInvalidLabel: "Código no válido",
    credentialsLockedLabel:
      "El motor de inteligencia personalizada es exclusivo para usuarios Pro.",
  },
  paywall: {
    title: "Función bloqueada",
    navLockedMessage:
      "Función bloqueada. Adquiera la licencia Pro para acceder al razonamiento avanzado y cartografía.",
    dismissLabel: "Entendido",
    themeLockedLabel: "Exclusivo Pro",
  },
  themeView: {
    backLabel: "Volver al Perfil",
    title: "Showroom de Apariencia",
    subtitle:
      "Previsualiza cada tema antes de aplicarlo: así se verán tu barra lateral y tus zócalos de estadísticas.",
    selectedLabel: "Tema activo",
    selectLabel: "Aplicar este tema",
    modeSectionLabel: "Modo de Interfaz",
    modeGroupLabel: "Elegir modo de iluminación",
    modeOptions: {
      light: "Claro",
      dark: "Oscuro",
      system: "Automático",
    },
  },
  flashcards: {
    heading: "Mis Mazos",
    createDeck: "Crear Mazo",
    emptyState:
      "Tu bóveda de conocimiento está vacía. Crea un mazo para comenzar.",
    newDeckName: "Nuevo Mazo",
    editHint: "Editar nombre del mazo",
    selectMode: "Seleccionar",
    cancelSelection: "Cancelar",
    deleteSelectedButton: "Eliminar ({{count}})",
    deleteSelectedConfirm: "¿Eliminar los mazos seleccionados?",
    editAction: "Editar",
    shareAction: "Compartir",
    shareComingSoon: "(Próximamente)",
    deleteAction: "Eliminar",
    deleteDeckConfirm: '¿Eliminar el mazo "{{name}}"? Esta acción no se puede deshacer.',
    deleteConfirmTitle: "Eliminar mazo",
    cancelLabel: "Cancelar",
    deckMenuLabel: "Opciones del mazo",
  },
  loadingVault: {
    decksLabel: "Cargando tus mazos desde la Bóveda…",
  },
  comingSoon: {
    title: "Próximamente",
    description: "Esta sección está en desarrollo.",
  },
  assistant: {
    title: "Asistente Cognitivo",
    modeLabel: "Modo",
    modeInquisitor: "Inquisidor",
    modeInquisitorMethod: "Método Socrático",
    modeProfessor: "Catedrático",
    modeFacilitator: "Facilitador",
    comingSoonBadge: "Próximamente",
    submenuLabel: "Modos del Asistente",
    inputPlaceholder: "Formula tu razonamiento…",
    sendLabel: "Enviar",
    mockUserMessage:
      "Dame los síntomas de una lesión en la neurona motora superior.",
    mockAssistantMessage:
      "Demasiado fácil. Antes de enumerártelos, razona la fisiopatología: si eliminas el control inhibitorio de la corteza sobre la médula espinal, ¿cómo esperas que reaccionen los reflejos miotáticos? Explícamelo antes de que te dé la respuesta.",
    modeProfessorMethod: "Simulacro de Grado",
    professor: {
      sourceLabel: "Fuente (PDF)",
      sourcePlaceholder: "Seleccionar documento de Fuentes…",
      pageRangeLabel: "Rango de páginas",
      pageRangePlaceholder: "ej. 12–28",
      examTypeLabel: "Tipo de Examen",
      examTypes: {
        clinical: "Casos Clínicos",
        multiple: "Opción Múltiple",
        active: "Recuerdo Activo",
      },
      generateButton: "Generar Simulacro",
      evaluateButton: "Evaluar Resultados",
      examTitle: "Simulacro Generado",
      noSourceHint:
        "Sin PDFs en Fuentes. Se usará un documento de demostración.",
      scoreLabel: "Resultado: {{score}} / {{total}}",
      resetButton: "Nuevo simulacro",
    },
  },
  studyCard: {
    rateAgain: "Olvidado",
    rateHard: "Difícil",
    rateGood: "Bueno",
    rateEasy: "Fácil",
    backToDecks: "Volver a Mazos",
    flipToAnswer: "Voltear tarjeta para ver la respuesta",
    flipToQuestion: "Voltear tarjeta para ver la pregunta",
    tapToFlip: "Toca para revelar",
  },
  studyView: {
    addCardButton: "Añadir Tarjeta",
    emptyDeckTitle: "Este mazo está vacío",
    emptyDeckDescription:
      "Aún no has forjado ninguna tarjeta. Añade la primera para empezar a estudiar.",
    allCaughtUpTitle: "¡Estás al día!",
    allCaughtUpDescription:
      "Ninguna tarjeta de este mazo vence su repaso todavía. Vuelve más tarde.",
    queueCounterLabel: "Progreso de la sesión de repaso",
    progressLabel: "Tarjeta {{current}} de {{total}}",
    resetDeckButton: "Reiniciar repetición espaciada del mazo",
  },
  addCardModal: {
    title: "Nueva Tarjeta",
    questionLabel: "Pregunta",
    questionPlaceholder: "Escribe la pregunta o concepto a recordar...",
    imageLabel: "Añadir imagen (Opcional)",
    noImageLabel: "Sin imagen",
    hintLabel: "Pista (Opcional)",
    hintPlaceholder: "Una pista opcional que ayude a recordar la respuesta...",
    answerLabel: "Respuesta",
    answerPlaceholder: "Escribe la respuesta correcta...",
    cancelLabel: "Cancelar",
    saveLabel: "Guardar Tarjeta",
  },
  analytics: {
    title: "Rendimiento y Memoria",
    global: "Global",
    selectDeck: "Selecciona un mazo",
    deckAnalysis: "Análisis por Mazo",
    noDecksState:
      "Crea un mazo y estudia algunas tarjetas para ver tus estadísticas aquí.",
    totalReviewsLabel: "Repasos totales",
    resetButton: "Restablecer Datos",
    resetConfirm: "¿Estás seguro de que deseas borrar todo tu progreso?",
    performanceTab: "Rendimiento",
    timeTab: "Tiempo de Estudio",
    labTab: "Laboratorio",
  },
  laboratory: {
    title: "Neuro-Métricas",
    subtitle: "Análisis Cognitivo",
    cognitiveLoadLabel: "Carga Cognitiva",
    cognitiveLoadDetail: "tarjetas exigidas hoy por el algoritmo",
    retentionIndexLabel: "Índice de Retención",
    retentionIndexDetail: "precisión global de recuerdo",
    synapticStabilityLabel: "Estabilidad Sináptica",
    synapticStabilityDetail: "factor de facilidad promedio del mazo",
    curveTitle: "Monitor de la Curva del Olvido",
    curveSubtitle:
      "Decaimiento de Ebbinghaus estabilizado por repaso espaciado",
    curveDayLabel: "Día",
    curveRetentionLabel: "Retención",
  },
  timeAnalytics: {
    totalTimeLabel: "Tiempo Total de Estudio",
    totalTimeCaption:
      "Acumulado por el cronómetro global desde que abriste la app.",
    last7DaysLabel: "Últimos 7 días",
    perDeckTitle: "Tiempo por Mazo",
    perDeckEmptyState:
      "Crea un mazo para ver aquí su tiempo de estudio estimado.",
  },
  deckEditor: {
    subtitle: "{{count}} tarjetas",
    questionLabel: "Pregunta",
    questionPlaceholder: "Escribe la pregunta o concepto...",
    hintLabel: "Pista",
    hintPlaceholder: "Una pista opcional que ayude a recordar la respuesta...",
    answerLabel: "Respuesta",
    answerPlaceholder: "Escribe la respuesta correcta...",
    addImageButton: "+ Añadir Imagen",
    changeImageButton: "Cambiar imagen",
    removeImageLabel: "Quitar imagen",
    cardNumberLabel: "Tarjeta {{number}}",
    addCardButton: "+ Añadir Tarjeta",
    deleteCardLabel: "Eliminar tarjeta",
    deleteCardConfirm: "¿Eliminar esta tarjeta?",
    emptyDeckDescription:
      "Este mazo aún no tiene tarjetas. Añade la primera para empezar a editarlo.",
    saveChangesButton: "Guardar Cambios",
    unsavedIndicator: "Cambios sin guardar",
    exitUnsavedConfirm: "Tienes cambios sin guardar. ¿Salir de todos modos?",
    deckNotFoundTitle: "Mazo no encontrado",
    deckNotFoundDescription: "Este mazo ya no existe o fue eliminado.",
    deleteDeckButton: "Eliminar Mazo",
  },
  challenges: {
    title: "Desafíos",
    today: "Hoy",
    tomorrow: "Mañana",
    addTask: "Añadir tarea",
    capturePlaceholder: "Ej. 3 horas de anatomía...",
    emptyState: "Aún no tienes desafíos. Escribe uno arriba para empezar.",
    menuLabel: "Opciones de la tarea",
    editAction: "Editar",
    deleteAction: "Eliminar",
    completedShowLabel: "Completadas ({{count}})",
    completedHideLabel: "Ocultar completadas",
  },
};

const en: Dictionary = {
  sidebar: {
    brand: "Estudio",
    tagline: "Advanced Panel",
    planLabel: "Current Plan",
    planValue: "Pro",
    groupManagement: "Management",
    groupCognition: "Support & Cognition",
    openMenuLabel: "Open navigation menu",
    closeMenuLabel: "Close navigation menu",
  },
  nav: {
    dashboard: "Dashboard",
    flashcards: "Flashcards",
    analytics: "Analytics",
    sources: "Sources",
    challenges: "Challenges",
    arguments: "Arguments",
    simulator: "Simulator",
    assistant: "Assistant",
  },
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  },
  onboarding: {
    heading: "Welcome",
    subtitle: "Let's personalize your experience before we begin.",
    namePlaceholder: "Enter your name...",
    cta: "Begin",
  },
  privacyOnboarding: {
    title: "🛡️ Absolute Privacy & Autonomy",
    subtitle: "We design the architecture — you keep total control.",
    vaultTitle: "Sovereignty",
    vaultBody:
      "You are the sole owner of your information. Your decks and progress are saved on your device and in your personal cloud (iCloud/Drive). Your vault is yours.",
    privacyTitle: "Privacy",
    privacyBody:
      "Privacy guaranteed, with no tracking. We don’t analyze metrics or collect data in the background. Your study stays private.",
    permissionTitle: "Sync",
    permissionBody:
      "Transparent sync. The app will request file permission solely to save your local progress securely.",
    cta: "Understood and Accepted",
  },
  header: {
    welcomeBack: "Welcome, {{name}}",
    welcomeGeneric: "Welcome",
    role: "Student",
    guestLabel: "New user",
    languageSelectorLabel: "Language selector",
    avatarLabel: "User avatar",
    goToProfileLabel: "Go to my profile",
    globalTimerLabel: "Session timer",
    timerPauseLabel: "Pause timer",
    timerResumeLabel: "Resume timer",
    timerShowLabel: "Show timer",
    timerHideLabel: "Hide timer",
    timerResetLabel: "Reset current session",
  },
  summary: {
    heading: "Overview",
    subheading: "Your study activity for today at a glance.",
  },
  cards: {
    challenges: {
      title: "Challenges",
      detail: "Task {{current}} of {{total}}",
    },
    cardsToday: {
      title: "Flashcards",
      detail: "{{count}} pending review",
    },
    streak: {
      title: "Study Streak",
      value: "{{count}} days",
      detail: "Keep it up, you're doing great!",
    },
  },
  continueCard: {
    title: "Remember",
    maxim: "Respice finem.",
    description:
      "Consider the end. An implacable invitation to reflect on the long-term consequences of your actions before undertaking them. Let the goal dictate the sacrifice.",
  },
  profile: {
    title: "User Profile",
    backLabel: "Back",
    accountSection: "Account",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    codeLabel: "User Code",
    copyLabel: "Copy to clipboard",
    copiedLabel: "Copied!",
    subscriptionLabel: "Subscription",
    currentPlanLabel: "Current Plan",
    plans: { basic: "Basic", pro: "Pro" },
    upgradeCta: "Upgrade to Pro",
    manageCta: "Manage Subscription",
    saveLabel: "Save changes",
    preferencesSection: "Interface Preferences",
    languageLabel: "Language",
    accentColorLabel: "Accent Color",
    accentColorDescription:
      "Pick a free color to personalize the accent across the whole interface.",
    accentColorResetLabel: "Reset to theme color",
    changePhotoLabel: "Change Photo",
    uiSpeedLabel: "Interface Speed",
    uiSpeedOptions: {
      fast: "Fast (Productivity)",
      smooth: "Smooth (Standard)",
      luxury: "Luxury (Premium Fluidity)",
    },
    customizeButton: "Customize Study Environment",
    credentialsSection: "Cognitive Intelligence Credentials",
    apiKeyLabel: "API Key (OpenAI / Anthropic)",
    apiKeyPlaceholder: "sk-…",
    saveCredentialLabel: "Save Credential",
    credentialSavedLabel: "Credential saved to the Vault",
    credentialsDisclaimer:
      "Advanced processing requires your own credential. Keys are stored locally and are never shared.",
    licenseSection: "Usage License",
    licenseCodeLabel: "License code",
    licenseCodePlaceholder: "XXXX-XXXX",
    licenseRedeemLabel: "Redeem",
    licenseVipToast: "VIP Access Granted. Welcome, Architect.",
    licenseActiveLabel: "Pro license active",
    licenseInvalidLabel: "Invalid code",
    credentialsLockedLabel:
      "The personalized intelligence engine is exclusive to Pro users.",
  },
  paywall: {
    title: "Feature locked",
    navLockedMessage:
      "Feature locked. Purchase a Pro license to access advanced reasoning and cartography.",
    dismissLabel: "Understood",
    themeLockedLabel: "Pro exclusive",
  },
  themeView: {
    backLabel: "Back to Profile",
    title: "Appearance Showroom",
    subtitle:
      "Preview each theme before applying it: this is how your sidebar and stat sockets will look.",
    selectedLabel: "Active theme",
    selectLabel: "Apply this theme",
    modeSectionLabel: "Interface Mode",
    modeGroupLabel: "Choose lighting mode",
    modeOptions: {
      light: "Light",
      dark: "Dark",
      system: "Automatic",
    },
  },
  flashcards: {
    heading: "My Decks",
    createDeck: "Create Deck",
    emptyState: "Your knowledge vault is empty. Create a deck to get started.",
    newDeckName: "New Deck",
    editHint: "Edit deck name",
    selectMode: "Select",
    cancelSelection: "Cancel",
    deleteSelectedButton: "Delete ({{count}})",
    deleteSelectedConfirm: "Delete the selected decks?",
    editAction: "Edit",
    shareAction: "Share",
    shareComingSoon: "(Coming soon)",
    deleteAction: "Delete",
    deleteDeckConfirm: 'Delete the deck "{{name}}"? This cannot be undone.',
    deleteConfirmTitle: "Delete deck",
    cancelLabel: "Cancel",
    deckMenuLabel: "Deck options",
  },
  loadingVault: {
    decksLabel: "Loading your decks from the Vault…",
  },
  comingSoon: {
    title: "Coming Soon",
    description: "This section is under development.",
  },
  assistant: {
    title: "Cognitive Assistant",
    modeLabel: "Mode",
    modeInquisitor: "Inquisitor",
    modeInquisitorMethod: "Socratic Method",
    modeProfessor: "Professor",
    modeFacilitator: "Facilitator",
    comingSoonBadge: "Coming Soon",
    submenuLabel: "Assistant Modes",
    inputPlaceholder: "State your reasoning…",
    sendLabel: "Send",
    mockUserMessage:
      "Give me the symptoms of an upper motor neuron lesion.",
    mockAssistantMessage:
      "Too easy. Before I list them, reason through the pathophysiology: if you remove the cortex's inhibitory control over the spinal cord, how do you expect the myotatic reflexes to react? Explain that before I give you the answer.",
    modeProfessorMethod: "Degree Mock Exam",
    professor: {
      sourceLabel: "Source (PDF)",
      sourcePlaceholder: "Select a document from Sources…",
      pageRangeLabel: "Page range",
      pageRangePlaceholder: "e.g. 12–28",
      examTypeLabel: "Exam Type",
      examTypes: {
        clinical: "Clinical Cases",
        multiple: "Multiple Choice",
        active: "Active Recall",
      },
      generateButton: "Generate Mock Exam",
      evaluateButton: "Evaluate Results",
      examTitle: "Generated Mock Exam",
      noSourceHint: "No PDFs in Sources. A demonstration document will be used.",
      scoreLabel: "Score: {{score}} / {{total}}",
      resetButton: "New mock exam",
    },
  },
  studyCard: {
    rateAgain: "Forgot",
    rateHard: "Hard",
    rateGood: "Good",
    rateEasy: "Easy",
    backToDecks: "Back to Decks",
    flipToAnswer: "Flip card to see the answer",
    flipToQuestion: "Flip card to see the question",
    tapToFlip: "Tap to reveal",
  },
  studyView: {
    addCardButton: "Add Card",
    emptyDeckTitle: "This deck is empty",
    emptyDeckDescription:
      "You haven't forged any cards yet. Add the first one to start studying.",
    allCaughtUpTitle: "You're all caught up!",
    allCaughtUpDescription:
      "No card in this deck is due for review yet. Check back later.",
    queueCounterLabel: "Review session progress",
    progressLabel: "Card {{current}} of {{total}}",
    resetDeckButton: "Reset deck's spaced repetition",
  },
  addCardModal: {
    title: "New Card",
    questionLabel: "Question",
    questionPlaceholder: "Write the question or concept to remember...",
    imageLabel: "Add image (Optional)",
    noImageLabel: "No image",
    hintLabel: "Hint (Optional)",
    hintPlaceholder: "An optional hint to help recall the answer...",
    answerLabel: "Answer",
    answerPlaceholder: "Write the correct answer...",
    cancelLabel: "Cancel",
    saveLabel: "Save Card",
  },
  analytics: {
    title: "Performance & Memory",
    global: "Global",
    selectDeck: "Select a deck",
    deckAnalysis: "Deck Analysis",
    noDecksState: "Create a deck and study a few cards to see your stats here.",
    totalReviewsLabel: "Total reviews",
    resetButton: "Reset Data",
    resetConfirm: "Are you sure you want to erase all your progress?",
    performanceTab: "Performance",
    timeTab: "Study Time",
    labTab: "Laboratory",
  },
  laboratory: {
    title: "Neuro-Metrics",
    subtitle: "Cognitive Analysis",
    cognitiveLoadLabel: "Cognitive Load",
    cognitiveLoadDetail: "cards demanded today by the algorithm",
    retentionIndexLabel: "Retention Index",
    retentionIndexDetail: "global recall accuracy",
    synapticStabilityLabel: "Synaptic Stability",
    synapticStabilityDetail: "average ease factor of the deck",
    curveTitle: "Forgetting Curve Monitor",
    curveSubtitle: "Ebbinghaus decay stabilized by spaced review",
    curveDayLabel: "Day",
    curveRetentionLabel: "Retention",
  },
  timeAnalytics: {
    totalTimeLabel: "Total Study Time",
    totalTimeCaption: "Accumulated by the global timer since you opened the app.",
    last7DaysLabel: "Last 7 days",
    perDeckTitle: "Time per Deck",
    perDeckEmptyState: "Create a deck to see its estimated study time here.",
  },
  deckEditor: {
    subtitle: "{{count}} cards",
    questionLabel: "Question",
    questionPlaceholder: "Write the question or concept...",
    hintLabel: "Hint",
    hintPlaceholder: "An optional hint to help recall the answer...",
    answerLabel: "Answer",
    answerPlaceholder: "Write the correct answer...",
    addImageButton: "+ Add Image",
    changeImageButton: "Change image",
    removeImageLabel: "Remove image",
    cardNumberLabel: "Card {{number}}",
    addCardButton: "+ Add Card",
    deleteCardLabel: "Delete card",
    deleteCardConfirm: "Delete this card?",
    emptyDeckDescription:
      "This deck has no cards yet. Add the first one to start editing it.",
    saveChangesButton: "Save Changes",
    unsavedIndicator: "Unsaved changes",
    exitUnsavedConfirm: "You have unsaved changes. Exit anyway?",
    deckNotFoundTitle: "Deck not found",
    deckNotFoundDescription: "This deck no longer exists or was deleted.",
    deleteDeckButton: "Delete Deck",
  },
  challenges: {
    title: "Challenges",
    today: "Today",
    tomorrow: "Tomorrow",
    addTask: "Add task",
    capturePlaceholder: "E.g. 3 hours of anatomy...",
    emptyState: "You don't have any challenges yet. Write one above to start.",
    menuLabel: "Task options",
    editAction: "Edit",
    deleteAction: "Delete",
    completedShowLabel: "Completed ({{count}})",
    completedHideLabel: "Hide completed",
  },
};

const de: Dictionary = {
  sidebar: {
    brand: "Estudio",
    tagline: "Erweitertes Panel",
    planLabel: "Aktueller Plan",
    planValue: "Pro",
    groupManagement: "Verwaltung",
    groupCognition: "Unterstützung & Kognition",
    openMenuLabel: "Navigationsmenü öffnen",
    closeMenuLabel: "Navigationsmenü schließen",
  },
  nav: {
    dashboard: "Dashboard",
    flashcards: "Karteikarten",
    analytics: "Analyse",
    sources: "Quellen",
    challenges: "Herausforderungen",
    arguments: "Argumente",
    simulator: "Simulator",
    assistant: "Assistent",
  },
  greeting: {
    morning: "Guten Morgen",
    afternoon: "Guten Tag",
    evening: "Guten Abend",
  },
  onboarding: {
    heading: "Willkommen",
    subtitle: "Lass uns dein Erlebnis personalisieren, bevor wir beginnen.",
    namePlaceholder: "Gib deinen Namen ein...",
    cta: "Beginnen",
  },
  privacyOnboarding: {
    title: "🛡️ Absolute Privatsphäre & Autonomie",
    subtitle: "Wir gestalten die Architektur — du behältst die volle Kontrolle.",
    vaultTitle: "Souveränität",
    vaultBody:
      "Du bist der alleinige Eigentümer deiner Informationen. Deine Decks und dein Fortschritt werden auf deinem Gerät und in deiner persönlichen Cloud (iCloud/Drive) gespeichert. Dein Tresor gehört dir.",
    privacyTitle: "Privatsphäre",
    privacyBody:
      "Garantierte Privatsphäre ohne Tracking. Wir analysieren keine Metriken und sammeln keine Daten im Hintergrund. Dein Lernen bleibt privat.",
    permissionTitle: "Synchronisierung",
    permissionBody:
      "Transparente Synchronisierung. Die App fragt die Dateiberechtigung ausschließlich an, um deinen lokalen Fortschritt sicher zu speichern.",
    cta: "Verstanden und akzeptiert",
  },
  header: {
    welcomeBack: "Willkommen, {{name}}",
    welcomeGeneric: "Willkommen",
    role: "Student",
    guestLabel: "Neuer Nutzer",
    languageSelectorLabel: "Sprachauswahl",
    avatarLabel: "Benutzeravatar",
    goToProfileLabel: "Zu meinem Profil",
    globalTimerLabel: "Sitzungstimer",
    timerPauseLabel: "Timer pausieren",
    timerResumeLabel: "Timer fortsetzen",
    timerShowLabel: "Timer anzeigen",
    timerHideLabel: "Timer ausblenden",
    timerResetLabel: "Aktuelle Sitzung zurücksetzen",
  },
  summary: {
    heading: "Übersicht",
    subheading: "Deine heutige Lernaktivität auf einen Blick.",
  },
  cards: {
    challenges: {
      title: "Herausforderungen",
      detail: "Aufgabe {{current}} von {{total}}",
    },
    cardsToday: {
      title: "Karteikarten",
      detail: "{{count}} zur Wiederholung ausstehend",
    },
    streak: {
      title: "Lernserie",
      value: "{{count}} Tage",
      detail: "Weiter so, du machst das großartig!",
    },
  },
  continueCard: {
    title: "Erinnere dich",
    maxim: "Respice finem.",
    description:
      "Bedenke das Ende. Eine unnachgiebige Einladung, über die langfristigen Folgen deiner Handlungen nachzudenken, bevor du sie unternimmst. Das Ziel soll das Opfer bestimmen.",
  },
  profile: {
    title: "Benutzerprofil",
    backLabel: "Zurück",
    accountSection: "Konto",
    nameLabel: "Name",
    namePlaceholder: "Dein Name",
    codeLabel: "Benutzercode",
    copyLabel: "In die Zwischenablage kopieren",
    copiedLabel: "Kopiert!",
    subscriptionLabel: "Abonnement",
    currentPlanLabel: "Aktueller Plan",
    plans: { basic: "Basis", pro: "Pro" },
    upgradeCta: "Auf Pro upgraden",
    manageCta: "Abonnement verwalten",
    saveLabel: "Änderungen speichern",
    preferencesSection: "Oberflächeneinstellungen",
    languageLabel: "Sprache",
    accentColorLabel: "Akzentfarbe",
    accentColorDescription:
      "Wähle eine freie Farbe, um die Akzente der gesamten Oberfläche zu personalisieren.",
    accentColorResetLabel: "Auf Themenfarbe zurücksetzen",
    changePhotoLabel: "Foto ändern",
    uiSpeedLabel: "Oberflächengeschwindigkeit",
    uiSpeedOptions: {
      fast: "Schnell (Produktivität)",
      smooth: "Sanft (Standard)",
      luxury: "Luxus (Premium-Flüssigkeit)",
    },
    customizeButton: "Lernumgebung anpassen",
    credentialsSection: "Zugangsdaten der kognitiven Intelligenz",
    apiKeyLabel: "API-Schlüssel (OpenAI / Anthropic)",
    apiKeyPlaceholder: "sk-…",
    saveCredentialLabel: "Zugangsdaten speichern",
    credentialSavedLabel: "Zugangsdaten im Tresor gespeichert",
    credentialsDisclaimer:
      "Erweiterte Verarbeitung erfordert Ihre eigene Zugangsdaten. Schlüssel werden lokal gespeichert und niemals geteilt.",
    licenseSection: "Nutzungslizenz",
    licenseCodeLabel: "Lizenzcode",
    licenseCodePlaceholder: "XXXX-XXXX",
    licenseRedeemLabel: "Einlösen",
    licenseVipToast: "VIP-Zugang gewährt. Willkommen, Architekt.",
    licenseActiveLabel: "Pro-Lizenz aktiv",
    licenseInvalidLabel: "Ungültiger Code",
    credentialsLockedLabel:
      "Die personalisierte Intelligenz-Engine ist ausschließlich für Pro-Nutzer.",
  },
  paywall: {
    title: "Funktion gesperrt",
    navLockedMessage:
      "Funktion gesperrt. Erwerben Sie die Pro-Lizenz für erweiterte Argumentation und Kartografie.",
    dismissLabel: "Verstanden",
    themeLockedLabel: "Nur Pro",
  },
  themeView: {
    backLabel: "Zurück zum Profil",
    title: "Erscheinungsbild-Showroom",
    subtitle:
      "Sieh dir jedes Thema an, bevor du es anwendest: So werden deine Seitenleiste und Statistikkacheln aussehen.",
    selectedLabel: "Aktives Thema",
    selectLabel: "Dieses Thema anwenden",
    modeSectionLabel: "Oberflächenmodus",
    modeGroupLabel: "Beleuchtungsmodus wählen",
    modeOptions: {
      light: "Hell",
      dark: "Dunkel",
      system: "Automatisch",
    },
  },
  flashcards: {
    heading: "Meine Stapel",
    createDeck: "Stapel erstellen",
    emptyState: "Dein Wissensspeicher ist leer. Erstelle einen Stapel, um zu beginnen.",
    newDeckName: "Neuer Stapel",
    editHint: "Stapelnamen bearbeiten",
    selectMode: "Auswählen",
    cancelSelection: "Abbrechen",
    deleteSelectedButton: "Löschen ({{count}})",
    deleteSelectedConfirm: "Ausgewählte Stapel löschen?",
    editAction: "Bearbeiten",
    shareAction: "Teilen",
    shareComingSoon: "(Demnächst)",
    deleteAction: "Löschen",
    deleteDeckConfirm: 'Stapel "{{name}}" löschen? Dies kann nicht rückgängig gemacht werden.',
    deleteConfirmTitle: "Stapel löschen",
    cancelLabel: "Abbrechen",
    deckMenuLabel: "Stapeloptionen",
  },
  loadingVault: {
    decksLabel: "Deine Stapel werden aus dem Tresor geladen…",
  },
  comingSoon: {
    title: "Demnächst verfügbar",
    description: "Dieser Bereich befindet sich in Entwicklung.",
  },
  assistant: {
    title: "Kognitiver Assistent",
    modeLabel: "Modus",
    modeInquisitor: "Inquisitor",
    modeInquisitorMethod: "Sokratische Methode",
    modeProfessor: "Lehrstuhl",
    modeFacilitator: "Facilitator",
    comingSoonBadge: "Demnächst",
    submenuLabel: "Assistenten-Modi",
    inputPlaceholder: "Formuliere deine Begründung…",
    sendLabel: "Senden",
    mockUserMessage:
      "Nenne mir die Symptome einer Läsion des oberen Motoneurons.",
    mockAssistantMessage:
      "Zu einfach. Bevor ich sie aufzähle, erkläre die Pathophysiologie: Wenn du die inhibitorische Kontrolle der Rinde über das Rückenmark aufhebst — wie erwartest du, dass die myotatischen Reflexe reagieren? Erkläre das, bevor ich dir die Antwort gebe.",
    modeProfessorMethod: "Prüfungs-Simulation",
    professor: {
      sourceLabel: "Quelle (PDF)",
      sourcePlaceholder: "Dokument aus Quellen wählen…",
      pageRangeLabel: "Seitenbereich",
      pageRangePlaceholder: "z. B. 12–28",
      examTypeLabel: "Prüfungstyp",
      examTypes: {
        clinical: "Klinische Fälle",
        multiple: "Multiple Choice",
        active: "Aktiver Abruf",
      },
      generateButton: "Simulation erstellen",
      evaluateButton: "Ergebnisse bewerten",
      examTitle: "Erstellte Simulation",
      noSourceHint:
        "Keine PDFs in Quellen. Es wird ein Demodokument verwendet.",
      scoreLabel: "Ergebnis: {{score}} / {{total}}",
      resetButton: "Neue Simulation",
    },
  },
  studyCard: {
    rateAgain: "Vergessen",
    rateHard: "Schwer",
    rateGood: "Gut",
    rateEasy: "Einfach",
    backToDecks: "Zurück zu den Stapeln",
    flipToAnswer: "Karte umdrehen, um die Antwort zu sehen",
    flipToQuestion: "Karte umdrehen, um die Frage zu sehen",
    tapToFlip: "Tippen, um aufzudecken",
  },
  studyView: {
    addCardButton: "Karte hinzufügen",
    emptyDeckTitle: "Dieser Stapel ist leer",
    emptyDeckDescription:
      "Du hast noch keine Karten erstellt. Füge die erste hinzu, um mit dem Lernen zu beginnen.",
    allCaughtUpTitle: "Du bist auf dem neuesten Stand!",
    allCaughtUpDescription:
      "Keine Karte in diesem Stapel ist derzeit zur Wiederholung fällig. Schau später wieder vorbei.",
    queueCounterLabel: "Fortschritt der Lernsitzung",
    progressLabel: "Karte {{current}} von {{total}}",
    resetDeckButton: "Verteiltes Wiederholen des Stapels zurücksetzen",
  },
  addCardModal: {
    title: "Neue Karte",
    questionLabel: "Frage",
    questionPlaceholder: "Schreibe die Frage oder das zu merkende Konzept...",
    imageLabel: "Bild hinzufügen (Optional)",
    noImageLabel: "Kein Bild",
    hintLabel: "Hinweis (Optional)",
    hintPlaceholder: "Ein optionaler Hinweis, der beim Erinnern der Antwort hilft...",
    answerLabel: "Antwort",
    answerPlaceholder: "Schreibe die richtige Antwort...",
    cancelLabel: "Abbrechen",
    saveLabel: "Karte speichern",
  },
  analytics: {
    title: "Leistung & Gedächtnis",
    global: "Global",
    selectDeck: "Wähle einen Stapel",
    deckAnalysis: "Stapelanalyse",
    noDecksState:
      "Erstelle einen Stapel und lerne ein paar Karten, um hier deine Statistiken zu sehen.",
    totalReviewsLabel: "Wiederholungen insgesamt",
    resetButton: "Daten zurücksetzen",
    resetConfirm: "Bist du sicher, dass du deinen gesamten Fortschritt löschen möchtest?",
    performanceTab: "Leistung",
    timeTab: "Lernzeit",
    labTab: "Labor",
  },
  laboratory: {
    title: "Neuro-Metriken",
    subtitle: "Kognitive Analyse",
    cognitiveLoadLabel: "Kognitive Last",
    cognitiveLoadDetail: "heute vom Algorithmus geforderte Karten",
    retentionIndexLabel: "Retentionsindex",
    retentionIndexDetail: "globale Erinnerungsgenauigkeit",
    synapticStabilityLabel: "Synaptische Stabilität",
    synapticStabilityDetail: "durchschnittlicher Ease-Faktor des Stapels",
    curveTitle: "Vergessenskurven-Monitor",
    curveSubtitle:
      "Ebbinghaus-Zerfall, stabilisiert durch verteilte Wiederholung",
    curveDayLabel: "Tag",
    curveRetentionLabel: "Retention",
  },
  timeAnalytics: {
    totalTimeLabel: "Gesamte Lernzeit",
    totalTimeCaption: "Angesammelt durch den globalen Timer, seit du die App geöffnet hast.",
    last7DaysLabel: "Letzte 7 Tage",
    perDeckTitle: "Zeit pro Stapel",
    perDeckEmptyState: "Erstelle einen Stapel, um hier seine geschätzte Lernzeit zu sehen.",
  },
  deckEditor: {
    subtitle: "{{count}} Karten",
    questionLabel: "Frage",
    questionPlaceholder: "Schreibe die Frage oder das Konzept...",
    hintLabel: "Hinweis",
    hintPlaceholder: "Ein optionaler Hinweis, der beim Erinnern der Antwort hilft...",
    answerLabel: "Antwort",
    answerPlaceholder: "Schreibe die richtige Antwort...",
    addImageButton: "+ Bild hinzufügen",
    changeImageButton: "Bild ändern",
    removeImageLabel: "Bild entfernen",
    cardNumberLabel: "Karte {{number}}",
    addCardButton: "+ Karte hinzufügen",
    deleteCardLabel: "Karte löschen",
    deleteCardConfirm: "Diese Karte löschen?",
    emptyDeckDescription:
      "Dieser Stapel hat noch keine Karten. Füge die erste hinzu, um mit der Bearbeitung zu beginnen.",
    saveChangesButton: "Änderungen speichern",
    unsavedIndicator: "Ungespeicherte Änderungen",
    exitUnsavedConfirm: "Du hast ungespeicherte Änderungen. Trotzdem beenden?",
    deckNotFoundTitle: "Stapel nicht gefunden",
    deckNotFoundDescription: "Dieser Stapel existiert nicht mehr oder wurde gelöscht.",
    deleteDeckButton: "Stapel löschen",
  },
  challenges: {
    title: "Herausforderungen",
    today: "Heute",
    tomorrow: "Morgen",
    addTask: "Aufgabe hinzufügen",
    capturePlaceholder: "Z. B. 3 Stunden Anatomie...",
    emptyState: "Du hast noch keine Herausforderungen. Schreibe oben eine, um zu beginnen.",
    menuLabel: "Aufgabenoptionen",
    editAction: "Bearbeiten",
    deleteAction: "Löschen",
    completedShowLabel: "Abgeschlossen ({{count}})",
    completedHideLabel: "Abgeschlossene ausblenden",
  },
};

const ja: Dictionary = {
  sidebar: {
    brand: "Estudio",
    tagline: "アドバンストパネル",
    planLabel: "現在のプラン",
    planValue: "Pro",
    groupManagement: "管理",
    groupCognition: "サポートと認知",
    openMenuLabel: "ナビゲーションメニューを開く",
    closeMenuLabel: "ナビゲーションメニューを閉じる",
  },
  nav: {
    dashboard: "ダッシュボード",
    flashcards: "フラッシュカード",
    analytics: "分析",
    sources: "ソース",
    challenges: "チャレンジ",
    arguments: "論拠",
    simulator: "シミュレーター",
    assistant: "アシスタント",
  },
  greeting: {
    morning: "おはようございます",
    afternoon: "こんにちは",
    evening: "こんばんは",
  },
  onboarding: {
    heading: "ようこそ",
    subtitle: "始める前に、あなた専用の体験を整えましょう。",
    namePlaceholder: "お名前を入力してください...",
    cta: "はじめる",
  },
  privacyOnboarding: {
    title: "🛡️ 絶対的なプライバシーと自律",
    subtitle: "アーキテクチャは私たちが設計し、コントロールはすべてあなたに。",
    vaultTitle: "主権",
    vaultBody:
      "情報の唯一の所有者はあなたです。デッキと進捗は端末と個人クラウド（iCloud/Drive）に保存されます。保管庫はあなたのものです。",
    privacyTitle: "プライバシー",
    privacyBody:
      "追跡なしのプライバシーを保証します。指標の分析やバックグラウンドでのデータ収集は行いません。学習はプライベートです。",
    permissionTitle: "同期",
    permissionBody:
      "透明な同期。アプリがファイル許可を求めるのは、ローカル進捗を安全に保存するためだけです。",
    cta: "理解して同意する",
  },
  header: {
    welcomeBack: "ようこそ、{{name}}さん",
    welcomeGeneric: "ようこそ",
    role: "学生",
    guestLabel: "新規ユーザー",
    languageSelectorLabel: "言語選択",
    avatarLabel: "ユーザーアバター",
    goToProfileLabel: "プロフィールへ移動",
    globalTimerLabel: "セッションタイマー",
    timerPauseLabel: "タイマーを一時停止",
    timerResumeLabel: "タイマーを再開",
    timerShowLabel: "タイマーを表示",
    timerHideLabel: "タイマーを隠す",
    timerResetLabel: "現在のセッションをリセット",
  },
  summary: {
    heading: "概要",
    subheading: "今日の学習アクティビティを一目で確認。",
  },
  cards: {
    challenges: {
      title: "チャレンジ",
      detail: "タスク {{current}} / {{total}}",
    },
    cardsToday: {
      title: "フラッシュカード",
      detail: "復習待ち {{count}} 件",
    },
    streak: {
      title: "学習の継続日数",
      value: "{{count}} 日",
      detail: "そのまま頑張って！絶好調です！",
    },
  },
  continueCard: {
    title: "思い出せ",
    maxim: "Respice finem.",
    description:
      "終わりを見据えよ。行動を起こす前に、その長期的な帰結を省みるよう促す、容赦ない呼びかけ。目的が犠牲を定めよ。",
  },
  profile: {
    title: "ユーザープロフィール",
    backLabel: "戻る",
    accountSection: "アカウント",
    nameLabel: "名前",
    namePlaceholder: "あなたの名前",
    codeLabel: "ユーザーコード",
    copyLabel: "クリップボードにコピー",
    copiedLabel: "コピーしました！",
    subscriptionLabel: "サブスクリプション",
    currentPlanLabel: "現在のプラン",
    plans: { basic: "ベーシック", pro: "Pro" },
    upgradeCta: "Proにアップグレード",
    manageCta: "サブスクリプションを管理",
    saveLabel: "変更を保存",
    preferencesSection: "インターフェース設定",
    languageLabel: "言語",
    accentColorLabel: "アクセントカラー",
    accentColorDescription:
      "インターフェース全体のアクセントをカスタマイズするための自由な色を選択してください。",
    accentColorResetLabel: "テーマの色にリセット",
    changePhotoLabel: "写真を変更",
    uiSpeedLabel: "インターフェース速度",
    uiSpeedOptions: {
      fast: "高速（生産性重視）",
      smooth: "スムーズ（標準）",
      luxury: "ラグジュアリー（プレミアムな滑らかさ）",
    },
    customizeButton: "学習環境をカスタマイズ",
    credentialsSection: "認知インテリジェンスの認証情報",
    apiKeyLabel: "APIキー（OpenAI / Anthropic）",
    apiKeyPlaceholder: "sk-…",
    saveCredentialLabel: "認証情報を保存",
    credentialSavedLabel: "認証情報を保管庫に保存しました",
    credentialsDisclaimer:
      "高度な処理にはご自身の認証情報が必要です。キーはローカルに保存され、共有されることはありません。",
    licenseSection: "利用ライセンス",
    licenseCodeLabel: "ライセンスコード",
    licenseCodePlaceholder: "XXXX-XXXX",
    licenseRedeemLabel: "引き換え",
    licenseVipToast: "VIPアクセスを付与しました。ようこそ、アーキテクト。",
    licenseActiveLabel: "Proライセンス有効",
    licenseInvalidLabel: "無効なコード",
    credentialsLockedLabel:
      "パーソナライズされた知能エンジンはProユーザー限定です。",
  },
  paywall: {
    title: "機能がロックされています",
    navLockedMessage:
      "機能がロックされています。高度な推論と地図機能にはProライセンスが必要です。",
    dismissLabel: "了解",
    themeLockedLabel: "Pro限定",
  },
  themeView: {
    backLabel: "プロフィールに戻る",
    title: "外観ショールーム",
    subtitle:
      "適用する前に各テーマを確認できます。サイドバーと統計カードの見え方がわかります。",
    selectedLabel: "現在のテーマ",
    selectLabel: "このテーマを適用",
    modeSectionLabel: "インターフェースモード",
    modeGroupLabel: "表示モードを選択",
    modeOptions: {
      light: "ライト",
      dark: "ダーク",
      system: "自動",
    },
  },
  flashcards: {
    heading: "マイデッキ",
    createDeck: "デッキを作成",
    emptyState: "知識の保管庫が空です。デッキを作成して始めましょう。",
    newDeckName: "新しいデッキ",
    editHint: "デッキ名を編集",
    selectMode: "選択",
    cancelSelection: "キャンセル",
    deleteSelectedButton: "削除 ({{count}})",
    deleteSelectedConfirm: "選択したデッキを削除しますか？",
    editAction: "編集",
    shareAction: "共有",
    shareComingSoon: "（近日公開）",
    deleteAction: "削除",
    deleteDeckConfirm: "デッキ「{{name}}」を削除しますか？この操作は元に戻せません。",
    deleteConfirmTitle: "デッキを削除",
    cancelLabel: "キャンセル",
    deckMenuLabel: "デッキオプション",
  },
  loadingVault: {
    decksLabel: "ボールトからデッキを読み込んでいます…",
  },
  comingSoon: {
    title: "近日公開",
    description: "このセクションは開発中です。",
  },
  assistant: {
    title: "認知アシスタント",
    modeLabel: "モード",
    modeInquisitor: "審問官",
    modeInquisitorMethod: "ソクラテス式問答法",
    modeProfessor: "教授",
    modeFacilitator: "ファシリテーター",
    comingSoonBadge: "近日公開",
    submenuLabel: "アシスタントのモード",
    inputPlaceholder: "あなたの推論を述べてください…",
    sendLabel: "送信",
    mockUserMessage: "上位運動ニューロン病変の症状を教えてください。",
    mockAssistantMessage:
      "簡単すぎる。列挙する前に病態生理を論じなさい。皮質の脊髄に対する抑制性制御を取り除けば、筋伸張反射はどう反応すると予想するか？答えを出す前に説明せよ。",
    modeProfessorMethod: "学位模擬試験",
    professor: {
      sourceLabel: "ソース（PDF）",
      sourcePlaceholder: "ソースから文書を選択…",
      pageRangeLabel: "ページ範囲",
      pageRangePlaceholder: "例：12–28",
      examTypeLabel: "試験タイプ",
      examTypes: {
        clinical: "臨床症例",
        multiple: "多肢選択",
        active: "能動的想起",
      },
      generateButton: "模擬試験を生成",
      evaluateButton: "結果を評価",
      examTitle: "生成された模擬試験",
      noSourceHint: "ソースにPDFがありません。デモ文書を使用します。",
      scoreLabel: "結果：{{score}} / {{total}}",
      resetButton: "新しい模擬試験",
    },
  },
  studyCard: {
    rateAgain: "忘れた",
    rateHard: "難しい",
    rateGood: "普通",
    rateEasy: "簡単",
    backToDecks: "デッキ一覧へ戻る",
    flipToAnswer: "カードを裏返して答えを見る",
    flipToQuestion: "カードを裏返して質問を見る",
    tapToFlip: "タップして表示",
  },
  studyView: {
    addCardButton: "カードを追加",
    emptyDeckTitle: "このデッキは空です",
    emptyDeckDescription: "まだカードを作成していません。最初のカードを追加して学習を始めましょう。",
    allCaughtUpTitle: "すべて完了しました!",
    allCaughtUpDescription: "このデッキには今復習が必要なカードはありません。後でまた確認してください。",
    queueCounterLabel: "復習セッションの進捗",
    progressLabel: "カード {{current}} / {{total}}",
    resetDeckButton: "デッキの間隔反復をリセット",
  },
  addCardModal: {
    title: "新しいカード",
    questionLabel: "問題",
    questionPlaceholder: "覚えたい質問や概念を入力してください...",
    imageLabel: "画像を追加（任意）",
    noImageLabel: "画像なし",
    hintLabel: "ヒント（任意）",
    hintPlaceholder: "答えを思い出すのに役立つヒント（任意）...",
    answerLabel: "答え",
    answerPlaceholder: "正しい答えを入力してください...",
    cancelLabel: "キャンセル",
    saveLabel: "カードを保存",
  },
  analytics: {
    title: "成績と記憶",
    global: "全体",
    selectDeck: "デッキを選択",
    deckAnalysis: "デッキ分析",
    noDecksState: "デッキを作成していくつかカードを学習すると、ここに統計が表示されます。",
    totalReviewsLabel: "総復習回数",
    resetButton: "データをリセット",
    resetConfirm: "すべての進行状況を削除してもよろしいですか？",
    performanceTab: "成績",
    timeTab: "学習時間",
    labTab: "研究室",
  },
  laboratory: {
    title: "ニューロメトリクス",
    subtitle: "認知分析",
    cognitiveLoadLabel: "認知負荷",
    cognitiveLoadDetail: "アルゴリズムが本日要求するカード数",
    retentionIndexLabel: "記憶保持指数",
    retentionIndexDetail: "全体的な再生精度",
    synapticStabilityLabel: "シナプス安定性",
    synapticStabilityDetail: "デッキの平均イーズファクター",
    curveTitle: "忘却曲線モニター",
    curveSubtitle: "分散反復によって安定化されたエビングハウス減衰",
    curveDayLabel: "日",
    curveRetentionLabel: "保持率",
  },
  timeAnalytics: {
    totalTimeLabel: "総学習時間",
    totalTimeCaption: "アプリを開いてからのグローバルタイマーによる累積時間です。",
    last7DaysLabel: "過去7日間",
    perDeckTitle: "デッキ別の時間",
    perDeckEmptyState: "デッキを作成すると、推定学習時間がここに表示されます。",
  },
  deckEditor: {
    subtitle: "{{count}} 枚のカード",
    questionLabel: "問題",
    questionPlaceholder: "質問や概念を入力してください...",
    hintLabel: "ヒント",
    hintPlaceholder: "答えを思い出すのに役立つヒント（任意）...",
    answerLabel: "答え",
    answerPlaceholder: "正しい答えを入力してください...",
    addImageButton: "+ 画像を追加",
    changeImageButton: "画像を変更",
    removeImageLabel: "画像を削除",
    cardNumberLabel: "カード {{number}}",
    addCardButton: "+ カードを追加",
    deleteCardLabel: "カードを削除",
    deleteCardConfirm: "このカードを削除しますか？",
    emptyDeckDescription: "このデッキにはまだカードがありません。最初のカードを追加して編集を始めましょう。",
    saveChangesButton: "変更を保存",
    unsavedIndicator: "未保存の変更",
    exitUnsavedConfirm: "未保存の変更があります。それでも終了しますか？",
    deckNotFoundTitle: "デッキが見つかりません",
    deckNotFoundDescription: "このデッキはもう存在しないか、削除されました。",
    deleteDeckButton: "デッキを削除",
  },
  challenges: {
    title: "チャレンジ",
    today: "今日",
    tomorrow: "明日",
    addTask: "タスクを追加",
    capturePlaceholder: "例：解剖学を3時間...",
    emptyState: "まだチャレンジがありません。上に入力して始めましょう。",
    menuLabel: "タスクオプション",
    editAction: "編集",
    deleteAction: "削除",
    completedShowLabel: "完了済み ({{count}})",
    completedHideLabel: "完了済みを隠す",
  },
};

const ko: Dictionary = {
  sidebar: {
    brand: "Estudio",
    tagline: "고급 패널",
    planLabel: "현재 플랜",
    planValue: "Pro",
    groupManagement: "관리",
    groupCognition: "지원 및 인지",
    openMenuLabel: "탐색 메뉴 열기",
    closeMenuLabel: "탐색 메뉴 닫기",
  },
  nav: {
    dashboard: "대시보드",
    flashcards: "플래시카드",
    analytics: "분석",
    sources: "소스",
    challenges: "챌린지",
    arguments: "논거",
    simulator: "시뮬레이터",
    assistant: "어시스턴트",
  },
  greeting: {
    morning: "좋은 아침입니다",
    afternoon: "좋은 오후입니다",
    evening: "좋은 저녁입니다",
  },
  onboarding: {
    heading: "환영합니다",
    subtitle: "시작하기 전에 당신만의 경험을 준비해볼까요.",
    namePlaceholder: "이름을 입력하세요...",
    cta: "시작하기",
  },
  privacyOnboarding: {
    title: "🛡️ 절대적 프라이버시와 자율성",
    subtitle: "아키텍처는 우리가 설계하고, 통제권은 온전히 당신에게 있습니다.",
    vaultTitle: "주권",
    vaultBody:
      "정보의 유일한 소유자는 당신입니다. 덱과 진행 상황은 기기와 개인 클라우드(iCloud/Drive)에 저장됩니다. 금고는 당신의 것입니다.",
    privacyTitle: "프라이버시",
    privacyBody:
      "추적 없는 프라이버시를 보장합니다. 지표를 분석하거나 백그라운드에서 데이터를 수집하지 않습니다. 학습은 비공개입니다.",
    permissionTitle: "동기화",
    permissionBody:
      "투명한 동기화. 앱은 로컬 진행 상황을 안전하게 저장하기 위해서만 파일 권한을 요청합니다.",
    cta: "이해했으며 동의합니다",
  },
  header: {
    welcomeBack: "환영합니다, {{name}}님",
    welcomeGeneric: "환영합니다",
    role: "학생",
    guestLabel: "신규 사용자",
    languageSelectorLabel: "언어 선택",
    avatarLabel: "사용자 아바타",
    goToProfileLabel: "내 프로필로 이동",
    globalTimerLabel: "세션 타이머",
    timerPauseLabel: "타이머 일시정지",
    timerResumeLabel: "타이머 재개",
    timerShowLabel: "타이머 표시",
    timerHideLabel: "타이머 숨기기",
    timerResetLabel: "현재 세션 재설정",
  },
  summary: {
    heading: "요약",
    subheading: "오늘의 학습 활동을 한눈에 확인하세요.",
  },
  cards: {
    challenges: {
      title: "챌린지",
      detail: "작업 {{current}} / {{total}}",
    },
    cardsToday: {
      title: "플래시카드",
      detail: "복습 대기 {{count}}개",
    },
    streak: {
      title: "연속 학습일",
      value: "{{count}}일",
      detail: "계속 그렇게! 정말 잘하고 있어요!",
    },
  },
  continueCard: {
    title: "기억하라",
    maxim: "Respice finem.",
    description:
      "끝을 보라. 행동을 시작하기 전에 그 장기적 결과를 성찰하라는 가차 없는 초대. 목표가 희생을 결정하게 하라.",
  },
  profile: {
    title: "사용자 프로필",
    backLabel: "뒤로",
    accountSection: "계정",
    nameLabel: "이름",
    namePlaceholder: "이름을 입력하세요",
    codeLabel: "사용자 코드",
    copyLabel: "클립보드에 복사",
    copiedLabel: "복사됨!",
    subscriptionLabel: "구독",
    currentPlanLabel: "현재 플랜",
    plans: { basic: "베이직", pro: "Pro" },
    upgradeCta: "Pro로 업그레이드",
    manageCta: "구독 관리",
    saveLabel: "변경 사항 저장",
    preferencesSection: "인터페이스 환경설정",
    languageLabel: "언어",
    accentColorLabel: "강조 색상",
    accentColorDescription: "전체 인터페이스의 강조 색상을 사용자화할 자유 색상을 선택하세요.",
    accentColorResetLabel: "테마 색상으로 재설정",
    changePhotoLabel: "사진 변경",
    uiSpeedLabel: "인터페이스 속도",
    uiSpeedOptions: {
      fast: "빠름 (생산성)",
      smooth: "부드러움 (표준)",
      luxury: "럭셔리 (프리미엄 유동성)",
    },
    customizeButton: "학습 환경 사용자화",
    credentialsSection: "인지 인텔리전스 자격 증명",
    apiKeyLabel: "API 키 (OpenAI / Anthropic)",
    apiKeyPlaceholder: "sk-…",
    saveCredentialLabel: "자격 증명 저장",
    credentialSavedLabel: "자격 증명이 보관소에 저장됨",
    credentialsDisclaimer:
      "고급 처리에는 본인 자격 증명이 필요합니다. 키는 로컬에 저장되며 절대 공유되지 않습니다.",
    licenseSection: "사용 라이선스",
    licenseCodeLabel: "라이선스 코드",
    licenseCodePlaceholder: "XXXX-XXXX",
    licenseRedeemLabel: "등록",
    licenseVipToast: "VIP 액세스 부여됨. 환영합니다, 아키텍트.",
    licenseActiveLabel: "Pro 라이선스 활성",
    licenseInvalidLabel: "유효하지 않은 코드",
    credentialsLockedLabel:
      "개인화된 지능 엔진은 Pro 사용자 전용입니다.",
  },
  paywall: {
    title: "기능 잠김",
    navLockedMessage:
      "기능이 잠겨 있습니다. 고급 추론과 지도 기능은 Pro 라이선스가 필요합니다.",
    dismissLabel: "확인",
    themeLockedLabel: "Pro 전용",
  },
  themeView: {
    backLabel: "프로필로 돌아가기",
    title: "외관 쇼룸",
    subtitle: "적용하기 전에 각 테마를 미리 확인하세요: 사이드바와 통계 카드가 이렇게 보입니다.",
    selectedLabel: "활성 테마",
    selectLabel: "이 테마 적용",
    modeSectionLabel: "인터페이스 모드",
    modeGroupLabel: "조명 모드 선택",
    modeOptions: {
      light: "라이트",
      dark: "다크",
      system: "자동",
    },
  },
  flashcards: {
    heading: "내 덱",
    createDeck: "덱 만들기",
    emptyState: "지식 보관소가 비어 있습니다. 덱을 만들어 시작하세요.",
    newDeckName: "새 덱",
    editHint: "덱 이름 수정",
    selectMode: "선택",
    cancelSelection: "취소",
    deleteSelectedButton: "삭제 ({{count}})",
    deleteSelectedConfirm: "선택한 덱을 삭제하시겠습니까?",
    editAction: "수정",
    shareAction: "공유",
    shareComingSoon: "(출시 예정)",
    deleteAction: "삭제",
    deleteDeckConfirm: '"{{name}}" 덱을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    deleteConfirmTitle: "덱 삭제",
    cancelLabel: "취소",
    deckMenuLabel: "덱 옵션",
  },
  loadingVault: {
    decksLabel: "볼트에서 덱을 불러오는 중…",
  },
  comingSoon: {
    title: "출시 예정",
    description: "이 섹션은 개발 중입니다.",
  },
  assistant: {
    title: "인지 어시스턴트",
    modeLabel: "모드",
    modeInquisitor: "심문자",
    modeInquisitorMethod: "소크라테스식 문답법",
    modeProfessor: "교수",
    modeFacilitator: "퍼실리테이터",
    comingSoonBadge: "출시 예정",
    submenuLabel: "어시스턴트 모드",
    inputPlaceholder: "당신의 추론을 기술하세요…",
    sendLabel: "보내기",
    mockUserMessage: "상위운동신경원 병변의 증상을 알려주세요.",
    mockAssistantMessage:
      "너무 쉽다. 나열하기 전에 병태생리를 추론하라. 피질의 척수에 대한 억제성 조절을 제거하면 근신전반사(미오타틱 반사)는 어떻게 반응할 것으로 예상하는가? 답을 주기 전에 설명하라.",
    modeProfessorMethod: "학위 모의고사",
    professor: {
      sourceLabel: "소스 (PDF)",
      sourcePlaceholder: "소스에서 문서 선택…",
      pageRangeLabel: "페이지 범위",
      pageRangePlaceholder: "예: 12–28",
      examTypeLabel: "시험 유형",
      examTypes: {
        clinical: "임상 사례",
        multiple: "객관식",
        active: "능동적 회상",
      },
      generateButton: "모의고사 생성",
      evaluateButton: "결과 평가",
      examTitle: "생성된 모의고사",
      noSourceHint: "소스에 PDF가 없습니다. 데모 문서를 사용합니다.",
      scoreLabel: "결과: {{score}} / {{total}}",
      resetButton: "새 모의고사",
    },
  },
  studyCard: {
    rateAgain: "잊음",
    rateHard: "어려움",
    rateGood: "보통",
    rateEasy: "쉬움",
    backToDecks: "덱으로 돌아가기",
    flipToAnswer: "카드를 뒤집어 답 보기",
    flipToQuestion: "카드를 뒤집어 질문 보기",
    tapToFlip: "탭하여 확인",
  },
  studyView: {
    addCardButton: "카드 추가",
    emptyDeckTitle: "이 덱은 비어 있습니다",
    emptyDeckDescription: "아직 카드를 만들지 않았습니다. 첫 번째 카드를 추가하여 학습을 시작하세요.",
    allCaughtUpTitle: "모두 완료했습니다!",
    allCaughtUpDescription: "이 덱에는 지금 복습이 필요한 카드가 없습니다. 나중에 다시 확인하세요.",
    queueCounterLabel: "복습 세션 진행률",
    progressLabel: "카드 {{current}} / {{total}}",
    resetDeckButton: "덱의 분산 반복 재설정",
  },
  addCardModal: {
    title: "새 카드",
    questionLabel: "질문",
    questionPlaceholder: "기억할 질문이나 개념을 작성하세요...",
    imageLabel: "이미지 추가 (선택)",
    noImageLabel: "이미지 없음",
    hintLabel: "힌트 (선택)",
    hintPlaceholder: "답을 기억하는 데 도움이 되는 선택적 힌트...",
    answerLabel: "답",
    answerPlaceholder: "정답을 작성하세요...",
    cancelLabel: "취소",
    saveLabel: "카드 저장",
  },
  analytics: {
    title: "성과 및 기억력",
    global: "전체",
    selectDeck: "덱 선택",
    deckAnalysis: "덱 분석",
    noDecksState: "덱을 만들고 카드를 몇 개 학습하면 여기에서 통계를 볼 수 있습니다.",
    totalReviewsLabel: "총 복습 횟수",
    resetButton: "데이터 재설정",
    resetConfirm: "모든 진행 상황을 삭제하시겠습니까?",
    performanceTab: "성과",
    timeTab: "학습 시간",
    labTab: "연구실",
  },
  laboratory: {
    title: "뉴로 메트릭스",
    subtitle: "인지 분석",
    cognitiveLoadLabel: "인지 부하",
    cognitiveLoadDetail: "알고리즘이 오늘 요구하는 카드",
    retentionIndexLabel: "기억 유지 지수",
    retentionIndexDetail: "전체 회상 정확도",
    synapticStabilityLabel: "시냅스 안정성",
    synapticStabilityDetail: "덱의 평균 용이도 지수",
    curveTitle: "망각 곡선 모니터",
    curveSubtitle: "분산 복습으로 안정화된 에빙하우스 감쇠",
    curveDayLabel: "일",
    curveRetentionLabel: "기억 유지율",
  },
  timeAnalytics: {
    totalTimeLabel: "총 학습 시간",
    totalTimeCaption: "앱을 연 이후 전체 타이머로 누적된 시간입니다.",
    last7DaysLabel: "최근 7일",
    perDeckTitle: "덱별 시간",
    perDeckEmptyState: "덱을 만들면 예상 학습 시간을 여기에서 볼 수 있습니다.",
  },
  deckEditor: {
    subtitle: "카드 {{count}}개",
    questionLabel: "질문",
    questionPlaceholder: "질문이나 개념을 작성하세요...",
    hintLabel: "힌트",
    hintPlaceholder: "답을 기억하는 데 도움이 되는 선택적 힌트...",
    answerLabel: "답",
    answerPlaceholder: "정답을 작성하세요...",
    addImageButton: "+ 이미지 추가",
    changeImageButton: "이미지 변경",
    removeImageLabel: "이미지 제거",
    cardNumberLabel: "카드 {{number}}",
    addCardButton: "+ 카드 추가",
    deleteCardLabel: "카드 삭제",
    deleteCardConfirm: "이 카드를 삭제하시겠습니까?",
    emptyDeckDescription: "이 덱에는 아직 카드가 없습니다. 첫 번째 카드를 추가하여 편집을 시작하세요.",
    saveChangesButton: "변경 사항 저장",
    unsavedIndicator: "저장되지 않은 변경 사항",
    exitUnsavedConfirm: "저장되지 않은 변경 사항이 있습니다. 그래도 나가시겠습니까?",
    deckNotFoundTitle: "덱을 찾을 수 없음",
    deckNotFoundDescription: "이 덱은 더 이상 존재하지 않거나 삭제되었습니다.",
    deleteDeckButton: "덱 삭제",
  },
  challenges: {
    title: "챌린지",
    today: "오늘",
    tomorrow: "내일",
    addTask: "작업 추가",
    capturePlaceholder: "예: 해부학 3시간...",
    emptyState: "아직 챌린지가 없습니다. 위에 작성하여 시작하세요.",
    menuLabel: "작업 옵션",
    editAction: "수정",
    deleteAction: "삭제",
    completedShowLabel: "완료됨 ({{count}})",
    completedHideLabel: "완료된 항목 숨기기",
  },
};

export const translations: Record<Language, Dictionary> = { es, en, de, ja, ko };

/**
 * "Estándar de Oro" ISO 639-1: estas 5 abreviaturas son universales e
 * INMUTABLES — el `label` NUNCA se traduce ni cambia con el idioma activo,
 * a diferencia del resto del diccionario. Por eso viven fuera de `Dictionary`.
 */
export const languageOptions: { id: Language; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
  { id: "de", label: "DE" },
  { id: "ja", label: "JA" },
  { id: "ko", label: "KO" },
];

/** Replaces `{{key}}` tokens in a template string with the given values. */
export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
