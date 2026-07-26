/** ISO 639-1 — las abreviaturas del selector de idiomas son inmutables y NUNCA se traducen. */
export type Language = "es" | "fr" | "en" | "de" | "ja" | "ko";

/** Clave compartida entre LanguageContext y react-i18next. */
export const LANGUAGE_STORAGE_KEY = "estudio-language";

/**
 * Strict dictionary shape. Locale JSON files in `/locales` must match this
 * structure. Strings may contain `{{placeholders}}` resolved via `interpolate()`.
 */
export type Dictionary = {
  common: {
    confirmTitle: string;
    confirmPermanentMessage: string;
    confirmAction: string;
    cancelLabel: string;
    deleteAction: string;
  };
  sidebar: {
    brand: string;
    tagline: string;
    planLabel: string;
    planValue: string;
    groupManagement: string;
    groupCognition: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    /** App Store 5.1.1 — enlace a la Política de Privacidad pública. */
    privacyPolicyLabel: string;
  };
  nav: {
    dashboard: string;
    flashcards: string;
    analytics: string;
    sources: string;
    challenges: string;
    simulator: string;
    assistant: string;
    profile: string;
    more: string;
  };
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  onboarding: {
    heading: string;
    subtitle: string;
    namePlaceholder: string;
    cta: string;
  };
  privacyOnboarding: {
    title: string;
    intro: string;
    photosTitle: string;
    photosBody: string;
    storageTitle: string;
    storageBody: string;
    privacyNote: string;
    cta: string;
  };
  header: {
    welcomeBack: string;
    welcomeGeneric: string;
    role: string;
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
    challenges: { title: string; detail: string };
    cardsToday: { title: string; detail: string };
    streak: { title: string; value: string; detail: string };
  };
  continueCard: {
    title: string;
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
    /** Sección IAP — Tienda de Estudio (temas visuales). */
    storeSectionLabel: string;
    storeProductTitle: string;
    storeProductDescription: string;
    unlockThemesCta: string;
    /** Exacto en ES: «Restaurar Compras» (App Store). */
    restorePurchasesCta: string;
    themesUnlockedBadge: string;
    storeBusyLabel: string;
    restoreEmptyMessage: string;
    purchaseErrorMessage: string;
    /** @deprecated — conservar claves por compatibilidad de JSON. */
    subscriptionLabel: string;
    currentPlanLabel: string;
    plans: { basic: string; pro: string; excellence: string };
    planBadgeLabel: string;
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
    credentialsSection: string;
    apiKeyLabel: string;
    apiKeyPlaceholder: string;
    saveCredentialLabel: string;
    credentialSavedLabel: string;
    credentialsDisclaimer: string;
    credentialsLockedLabel: string;
  };
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
    modeSectionLabel: string;
    modeGroupLabel: string;
    modeOptions: { light: string; dark: string; system: string };
  };
  librarySearch: {
    placeholder: string;
    label: string;
    noResults: string;
    clearFilter: string;
  };
  flashcards: {
    heading: string;
    createDeck: string;
    importAnki: string;
    importAnkiLoading: string;
    importAnkiSuccess: string;
    importAnkiEmpty: string;
    importAnkiError: string;
    importModalTitle: string;
    importModalSubtitle: string;
    importDeckNameLabel: string;
    importPasteLabel: string;
    importPastePlaceholder: string;
    importFileLabel: string;
    importFileButton: string;
    importConfirmButton: string;
    importAnkiHelpLink: string;
    importAnkiHelpTitle: string;
    importAnkiHelpStep1Label: string;
    importAnkiHelpStep1Body: string;
    importAnkiHelpStep2Label: string;
    importAnkiHelpStep2Body: string;
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
    cardCountOne: string;
    cardCountMany: string;
  };
  comingSoon: {
    title: string;
    description: string;
  };
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
      generateLocked: string;
      evaluateButton: string;
      examTitle: string;
      noSourceHint: string;
      scoreLabel: string;
      resetButton: string;
    };
  };
  loadingVault: {
    decksLabel: string;
  };
  studyCard: {
    rateAgain: string;
    rateHard: string;
    rateGood: string;
    rateEasy: string;
    backToDecks: string;
    flipToAnswer: string;
    flipToQuestion: string;
    tapToFlip: string;
  };
  studyView: {
    addCardButton: string;
    emptyDeckTitle: string;
    emptyDeckDescription: string;
    allCaughtUpTitle: string;
    allCaughtUpDescription: string;
    queueCounterLabel: string;
    progressLabel: string;
    resetDeckButton: string;
  };
  addCardModal: {
    title: string;
    questionLabel: string;
    questionPlaceholder: string;
    attachImageLabel: string;
    removeImageLabel: string;
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
    curveTooltip: string;
    curveTooltipLabel: string;
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
    deleteDeckButton: string;
  };
  challenges: {
    title: string;
    today: string;
    tomorrow: string;
    addTask: string;
    capturePlaceholder: string;
    emptyState: string;
    menuLabel: string;
    editAction: string;
    deleteAction: string;
    completedShowLabel: string;
    completedHideLabel: string;
  };
  simulator: {
    title: string;
    subtitle: string;
    trainingComplete: string;
    precisionLabel: string;
    backToLibrary: string;
    preparingSession: string;
    checkAnswer: string;
    sessionHint: string;
    scoreLabel: string;
    attemptsSuffix: string;
    library: string;
    newFolder: string;
    newDeckRoot: string;
    newDeckInFolder: string;
    defaultFolderName: string;
    defaultDeckName: string;
    emptyDecks: string;
    noFolder: string;
    selectDeckHint: string;
    deckShort: string;
    deleteFolder: string;
    folderHelp: string;
    train: string;
    delete: string;
    cardLabel: string;
    remove: string;
    distractorsLabel: string;
    editAnswer: string;
    distractorsComma: string;
    newManualCard: string;
    syntaxHelp: string;
    helpTitle: string;
    helpBody: string;
    helpExample: string;
    helpDistractors: string;
    sentencePlaceholder: string;
    syntaxError: string;
    preview: string;
    previewEmpty: string;
    distractors: string;
    falseOption: string;
    saveCard: string;
    exportButton: string;
    exportModalTitle: string;
    exportModalSubtitle: string;
    exportSelectAll: string;
    exportDeselectAll: string;
    exportSelectedCount: string;
    exportDeckMeta: string;
    exportConfirm: string;
    exportBusy: string;
    exportNoDecks: string;
    exportEmptySelection: string;
    exportError: string;
    importButton: string;
    importDropHint: string;
    importSuccess: string;
    importInvalidFormat: string;
  };
  sources: {
    title: string;
    newFolder: string;
    createFolder: string;
    searchPlaceholder: string;
    clearSearch: string;
    loadingVault: string;
    addFile: string;
    emptyFolder: string;
    emptyVault: string;
    rename: string;
    delete: string;
    download: string;
    backToSources: string;
    fileCountOne: string;
    fileCountMany: string;
    deleteFolderConfirm: string;
    defaultFolderName: string;
    noResults: string;
    closeViewer: string;
    close: string;
    folderOptions: string;
    noResultsFor: string;
  };
  proUpgrade: {
    title: string;
    benefitAi: string;
    benefitPdf: string;
    benefitHeatmap: string;
    cta: string;
    keyLabel: string;
    keyPlaceholder: string;
    activate: string;
    keyError: string;
    closeLabel: string;
  };
  time: {
    hoursMinutes: string;
    minutes: string;
    seconds: string;
  };
  profileDev: {
    toolsTitle: string;
    toolsBody: string;
    resetConfirm: string;
    resetButton: string;
  };
  emptyStates: {
    noDecks: string;
    noMetrics: string;
    noChallenges: string;
    createFirstDeck: string;
    startSessionForMetrics: string;
  };
};

import de from "../../locales/de.json" with { type: "json" };
import en from "../../locales/en.json" with { type: "json" };
import es from "../../locales/es.json" with { type: "json" };
import fr from "../../locales/fr.json" with { type: "json" };
import ja from "../../locales/ja.json" with { type: "json" };
import ko from "../../locales/ko.json" with { type: "json" };

export const translations: Record<Language, Dictionary> = {
  es: es as Dictionary,
  fr: fr as Dictionary,
  en: en as Dictionary,
  de: de as Dictionary,
  ja: ja as Dictionary,
  ko: ko as Dictionary,
};

/**
 * "Estándar de Oro" ISO 639-1: abreviaturas universales e INMUTABLES —
 * el `label` NUNCA se traduce ni cambia con el idioma activo.
 * Orden visual: ES, FR, EN, DE, JA, KO.
 */
export const languageOptions: { id: Language; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "fr", label: "FR" },
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
