// scripts.js — Omo Trainer v0.31 — шаг ползунка 10 мл, интервал в мс
(function() {
  // ---------- КОНСТАНТЫ ----------
  const MIN_INTERVAL_MS = 100;    // минимальное значение интервала (мс)
  const MAX_INTERVAL_MS = 60000;  // максимальное значение интервала (мс)
  
  // ---------- СОСТОЯНИЕ ----------
  let currentVolume = 0;
  let maxVolume = 500;
  let pendingMl = 0;
  let timerId = null;
  let userName = "Player";
  let currentLang = "en";
  let isDarkTheme = false;
  let permissionGranted = false;
  let fillIntervalMs = 3800;   // миллисекунд на 1 мл

  // DOM-элементы
  const profileScreen = document.getElementById('profileScreen');
  const mainScreen = document.getElementById('mainScreen');
  const settingsScreen = document.getElementById('settingsScreen');
  
  const profileNameInput = document.getElementById('profileName');
  const profileMaxInput = document.getElementById('profileMaxVolume');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const greetingSpan = document.getElementById('greetingName');
  const volumeMainSpan = document.getElementById('volumeMain');
  const progressFill = document.getElementById('progressFill');
  const statusMsgSpan = document.getElementById('statusMsg');
  const drinkSlider = document.getElementById('drinkSlider');
  const drinkAmountSpan = document.getElementById('drinkAmountValue');
  const drinkBtn = document.getElementById('drinkButton');
  const askPermissionBtn = document.getElementById('askPermissionBtn');
  const peeBtn = document.getElementById('peeButton');
  const cantHoldBtn = document.getElementById('cantHoldBtn');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const leakingBtn = document.getElementById('leakingBtn');
  
  // Элементы настроек
  const settingsLangSelect = document.getElementById('settingsLangSelect');
  const settingsThemeSelect = document.getElementById('settingsThemeSelect');
  const settingsIntervalInput = document.getElementById('settingsIntervalInput');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  
  // ---------- ФУНКЦИИ ТЕМЫ ----------
  function applyTheme() {
    if (isDarkTheme) {
      document.body.classList.add('dark');
      if (settingsThemeSelect) settingsThemeSelect.value = 'dark';
    } else {
      document.body.classList.remove('dark');
      if (settingsThemeSelect) settingsThemeSelect.value = 'light';
    }
    localStorage.setItem('omoki_theme', isDarkTheme ? 'dark' : 'light');
  }

  function setThemeFromSelect(value) {
    isDarkTheme = (value === 'dark');
    applyTheme();
  }

  function loadTheme() {
    const saved = localStorage.getItem('omoki_theme');
    isDarkTheme = (saved === 'dark');
    applyTheme();
  }
  
  // ---------- ИНТЕРВАЛ НАПОЛНЕНИЯ ----------
  function restartTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    if (pendingMl > 0) {
      timerId = setInterval(() => processTick(), fillIntervalMs);
    }
  }
  
  function setFillInterval(ms) {
    let newMs = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, ms));
    if (fillIntervalMs === newMs) return;
    fillIntervalMs = newMs;
    localStorage.setItem('omoki_fill_interval_ms', fillIntervalMs);
    if (settingsIntervalInput) settingsIntervalInput.value = fillIntervalMs;
    restartTimer();
  }
  
  function loadFillInterval() {
    const saved = localStorage.getItem('omoki_fill_interval_ms');
    if (saved && !isNaN(parseInt(saved))) {
      fillIntervalMs = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, parseInt(saved)));
    } else {
      fillIntervalMs = 3800;
    }
    if (settingsIntervalInput) settingsIntervalInput.value = fillIntervalMs;
  }
  
  function onIntervalInputChange() {
    if (!settingsIntervalInput) return;
    let raw = parseInt(settingsIntervalInput.value, 10);
    if (isNaN(raw)) raw = fillIntervalMs;
    setFillInterval(raw);
  }
  
  // ---------- ЯЗЫК ----------
  function getT(key, placeholders = {}) {
    let t = translations[currentLang];
    let str = t && t[key] ? t[key] : translations.en[key] || key;
    for (let [k, v] of Object.entries(placeholders)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }
  
  function populateLanguageSelectors() {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
      { code: 'it', name: 'Italiano' },
      { code: 'zh', name: '中文' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'tr', name: 'Türkçe' }
    ];
    const options = languages.map(l => `<option value="${l.code}">${l.name}</option>`).join('');
    if (settingsLangSelect) settingsLangSelect.innerHTML = options;
  }
  
  function updateUITexts() {
    // Главный экран
    const bladderTitle = document.getElementById('bladderTitle');
    if (bladderTitle) bladderTitle.innerText = getT('bladderTitle');
    const drinkLabel = document.getElementById('drinkLabel');
    if (drinkLabel) drinkLabel.innerText = getT('drinkLabel');
    if (drinkBtn) drinkBtn.innerText = getT('drinkBtn');
    if (askPermissionBtn) askPermissionBtn.innerText = getT('askBtn');
    if (peeBtn) peeBtn.innerText = getT('peeBtn');
    if (cantHoldBtn) cantHoldBtn.innerText = getT('cantBtn');
    if (resetProgressBtn) resetProgressBtn.innerText = getT('resetBtn');
    if (editProfileBtn) editProfileBtn.innerText = getT('editBtn');
    if (settingsBtn) settingsBtn.innerText = getT('settingsBtn');
    if (leakingBtn) leakingBtn.innerText = getT('leakingBtn');
    
    // Экран профиля
    const profileTitle = document.getElementById('profileTitle');
    if (profileTitle) profileTitle.innerText = getT('profileTitle');
    const nameLabel = document.getElementById('nameLabel');
    if (nameLabel) nameLabel.innerText = getT('nameLabel');
    const maxVolumeLabel = document.getElementById('maxVolumeLabel');
    if (maxVolumeLabel) maxVolumeLabel.innerText = getT('maxVolumeLabel');
    if (saveProfileBtn) saveProfileBtn.innerText = getT('saveBtn');
    const profileNote = document.getElementById('profileNote');
    if (profileNote) profileNote.innerText = getT('profileNote');
    
    // Экран настроек
    const settingsTitle = document.getElementById('settingsTitle');
    if (settingsTitle) settingsTitle.innerText = getT('settingsTitle');
    const settingsLangLabel = document.getElementById('settingsLangLabel');
    if (settingsLangLabel) settingsLangLabel.innerText = getT('languageLabel');
    const settingsThemeLabel = document.getElementById('settingsThemeLabel');
    if (settingsThemeLabel) settingsThemeLabel.innerText = getT('themeLabel');
    const settingsIntervalLabel = document.getElementById('settingsIntervalLabel');
    if (settingsIntervalLabel) settingsIntervalLabel.innerText = getT('intervalLabel');
    const settingsIntervalNote = document.getElementById('settingsIntervalNote');
    if (settingsIntervalNote) settingsIntervalNote.innerText = getT('intervalNote');
    if (closeSettingsBtn) closeSettingsBtn.innerText = getT('closeSettings');
    
    // Опции темы
    if (settingsThemeSelect) {
      const lightOpt = settingsThemeSelect.querySelector('option[value="light"]');
      const darkOpt = settingsThemeSelect.querySelector('option[value="dark"]');
      if (lightOpt) lightOpt.text = getT('themeLight');
      if (darkOpt) darkOpt.text = getT('themeDark');
    }
  }
  
  function changeLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('omoki_lang', lang);
    const profile = JSON.parse(localStorage.getItem('omoki_profile') || '{}');
    profile.lang = lang;
    localStorage.setItem('omoki_profile', JSON.stringify(profile));
    
    updateUITexts();
    updateUI();
    if (settingsLangSelect) settingsLangSelect.value = lang;
  }
  
  // ---------- ОСНОВНАЯ ЛОГИКА ----------
  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  
  function updateUI() {
    volumeMainSpan.innerHTML = `${Math.floor(currentVolume)} mL / ${maxVolume} mL`;
    greetingSpan.innerText = userName;
    let percent = (currentVolume / maxVolume) * 100;
    if (percent > 100) percent = 100;
    progressFill.style.width = `${percent}%`;
    
    let statusKey = 'moderate';
    if (currentVolume >= maxVolume * 1.5) statusKey = 'critical';
    else if (currentVolume >= maxVolume) statusKey = 'overflow';
    else if (currentVolume >= maxVolume * 0.85) statusKey = 'urgent';
    else if (currentVolume >= maxVolume * 0.65) statusKey = 'hard';
    else if (currentVolume >= maxVolume * 0.35) statusKey = 'moderate';
    else statusKey = 'calm';
    statusMsgSpan.innerHTML = getT(`status.${statusKey}`);
  }
  
  function processTick() {
    if (pendingMl <= 0) {
      stopTimer();
      updateUI();
      return;
    }
    currentVolume += 1;
    pendingMl -= 1;
    if (pendingMl < 0) pendingMl = 0;
    updateUI();
    if (pendingMl === 0) stopTimer();
  }
  
  function ensureTimerRunning() {
    if (timerId) return;
    if (pendingMl > 0) {
      timerId = setInterval(() => processTick(), fillIntervalMs);
    }
  }
  
  function drinkAction() {
    let rawAmount = parseInt(drinkSlider.value, 10);
    if (isNaN(rawAmount)) rawAmount = 100;
    let chosenMl = Math.floor(Math.min(1000, Math.max(10, rawAmount)));
    if (chosenMl <= 0) return;
    
    pendingMl = Math.floor(pendingMl + chosenMl);
    ensureTimerRunning();
    updateUI();
    statusMsgSpan.innerHTML = getT('drinkFeedback', { amount: chosenMl });
    setTimeout(() => updateUI(), 1800);
  }
  
  function askPermission() {
    statusMsgSpan.innerHTML = getT('askWait');
    setTimeout(() => {
      if (currentVolume > maxVolume * 0.9) {
        const denialPhrase = getRandomTrainerPhrase(currentLang, userName);
        statusMsgSpan.innerHTML = denialPhrase;
        permissionGranted = false;
      } else {
        statusMsgSpan.innerHTML = getT('askGranted');
        permissionGranted = true;
      }
      setTimeout(() => updateUI(), 2000);
    }, 1500);
  }
  
  function peeAction() {
    if (!permissionGranted) {
      statusMsgSpan.innerHTML = getT('peeWithoutPermission');
      setTimeout(() => updateUI(), 2000);
      return;
    }
    stopTimer();
    currentVolume = 0;
    pendingMl = 0;
    permissionGranted = false;
    updateUI();
    statusMsgSpan.innerHTML = getT('peeDone');
    setTimeout(() => updateUI(), 2000);
  }
  
  function cantHoldAction() {
    stopTimer();
    let lostVolume = currentVolume;
    currentVolume = 0;
    pendingMl = 0;
    permissionGranted = false;
    updateUI();
    statusMsgSpan.innerHTML = getT('cantHoldMsg', { amount: Math.floor(lostVolume) });
    setTimeout(() => updateUI(), 3000);
  }
  
  function leakingAction() {
    const chance = Math.random() * 100;
    if (chance < 1) {
      statusMsgSpan.innerHTML = getT('leakingGranted');
      stopTimer();
      currentVolume = 0;
      pendingMl = 0;
      permissionGranted = false;
      updateUI();
      setTimeout(() => updateUI(), 2000);
    } else {
      statusMsgSpan.innerHTML = getT('leakingDenied');
      setTimeout(() => updateUI(), 1500);
    }
  }
  
  function resetProgress() {
    stopTimer();
    currentVolume = 0;
    pendingMl = 0;
    permissionGranted = false;
    updateUI();
    statusMsgSpan.innerHTML = getT('resetMsg');
    setTimeout(() => updateUI(), 1500);
  }
  
  function saveProfile() {
    let newName = profileNameInput.value.trim();
    if (newName === "") newName = "Player";
    userName = newName;
    let newMax = parseInt(profileMaxInput.value, 10);
    if (isNaN(newMax)) newMax = 500;
    newMax = Math.min(5000, Math.max(100, newMax));
    maxVolume = newMax;
    currentVolume = 0;
    pendingMl = 0;
    permissionGranted = false;
    stopTimer();
    updateUI();
    const profile = { userName, maxVolume, lang: currentLang };
    try {
      localStorage.setItem('omoki_profile', JSON.stringify(profile));
    } catch(e) { console.warn("LocalStorage save failed", e); }
    profileScreen.classList.remove('active');
    mainScreen.classList.add('active');
    updateUI();
  }
  
  function loadSavedProfile() {
    const raw = localStorage.getItem('omoki_profile');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.userName && typeof data.maxVolume === 'number') {
          userName = data.userName;
          maxVolume = Math.min(5000, Math.max(100, data.maxVolume));
          if (data.lang && translations[data.lang]) currentLang = data.lang;
          currentVolume = 0;
          pendingMl = 0;
          permissionGranted = false;
          stopTimer();
          return true;
        }
      } catch(e) {}
    }
    return false;
  }
  
  function editProfile() {
    stopTimer();
    permissionGranted = false;
    profileNameInput.value = userName;
    profileMaxInput.value = maxVolume;
    profileScreen.classList.add('active');
    mainScreen.classList.remove('active');
    settingsScreen.classList.remove('active');
    updateUITexts();
  }
  
  function openSettings() {
    if (settingsLangSelect) settingsLangSelect.value = currentLang;
    if (settingsThemeSelect) settingsThemeSelect.value = isDarkTheme ? 'dark' : 'light';
    if (settingsIntervalInput) settingsIntervalInput.value = fillIntervalMs;
    settingsScreen.classList.add('active');
    mainScreen.classList.remove('active');
    profileScreen.classList.remove('active');
  }
  
  function closeSettings() {
    // Применяем язык и тему
    if (settingsLangSelect) {
      const newLang = settingsLangSelect.value;
      if (newLang !== currentLang && translations[newLang]) {
        changeLanguage(newLang);
      }
    }
    if (settingsThemeSelect) {
      setThemeFromSelect(settingsThemeSelect.value);
    }
    if (settingsIntervalInput) {
      let newInterval = parseInt(settingsIntervalInput.value, 10);
      if (!isNaN(newInterval) && newInterval >= MIN_INTERVAL_MS && newInterval <= MAX_INTERVAL_MS) {
        setFillInterval(newInterval);
      } else {
        settingsIntervalInput.value = fillIntervalMs;
      }
    }
    settingsScreen.classList.remove('active');
    const hasProfile = localStorage.getItem('omoki_profile');
    if (hasProfile) {
      mainScreen.classList.add('active');
    } else {
      profileScreen.classList.add('active');
    }
  }
  
  function updateSliderLabel() {
    let val = parseInt(drinkSlider.value, 10);
    drinkAmountSpan.innerText = val;
  }
  
  // ---------- ИНИЦИАЛИЗАЦИЯ ----------
  function init() {
    loadTheme();
    loadFillInterval();
    const savedLang = localStorage.getItem('omoki_lang');
    if (savedLang && translations[savedLang]) currentLang = savedLang;
    populateLanguageSelectors();
    updateUITexts();
    
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (settingsIntervalInput) {
      settingsIntervalInput.addEventListener('input', onIntervalInputChange);
      settingsIntervalInput.addEventListener('change', onIntervalInputChange);
    }
    
    drinkSlider.addEventListener('input', updateSliderLabel);
    updateSliderLabel();
    drinkBtn.addEventListener('click', drinkAction);
    askPermissionBtn.addEventListener('click', askPermission);
    peeBtn.addEventListener('click', peeAction);
    cantHoldBtn.addEventListener('click', cantHoldAction);
    resetProgressBtn.addEventListener('click', resetProgress);
    editProfileBtn.addEventListener('click', editProfile);
    saveProfileBtn.addEventListener('click', saveProfile);
    if (leakingBtn) leakingBtn.addEventListener('click', leakingAction);
    
    const hasProfile = loadSavedProfile();
    if (hasProfile) {
      updateUITexts();
      profileScreen.classList.remove('active');
      mainScreen.classList.add('active');
      settingsScreen.classList.remove('active');
      updateUI();
    } else {
      userName = "";
      maxVolume = 500;
      currentVolume = 0;
      pendingMl = 0;
      permissionGranted = false;
      profileNameInput.value = "";
      profileMaxInput.value = 500;
      profileScreen.classList.add('active');
      mainScreen.classList.remove('active');
      settingsScreen.classList.remove('active');
      updateUI();
    }
  }
  
  init();
})();