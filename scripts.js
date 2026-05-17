// scripts.js — Omoki v0.0.1a — с кнопкой Leaking (1% разрешения)
(function() {
  // ---------- СОСТОЯНИЕ ----------
  let currentVolume = 0;
  let maxVolume = 500;
  let pendingMl = 0;
  let timerId = null;
  let userName = "Player";
  let currentLang = "en";
  let isDarkTheme = false;

  // DOM-элементы
  const profileScreen = document.getElementById('profileScreen');
  const mainScreen = document.getElementById('mainScreen');
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
  const langSelectProfile = document.getElementById('langSelectProfile');
  const langSelectMain = document.getElementById('langSelectMain');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleBtnMain = document.getElementById('themeToggleBtnMain');
  const leakingBtn = document.getElementById('leakingBtn');

  // ---------- ФУНКЦИИ ТЕМЫ ----------
  function applyTheme() {
    if (isDarkTheme) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('omoki_theme', isDarkTheme ? 'dark' : 'light');
  }

  function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    applyTheme();
  }

  function loadTheme() {
    const saved = localStorage.getItem('omoki_theme');
    if (saved === 'dark') {
      isDarkTheme = true;
    } else {
      isDarkTheme = false;
    }
    applyTheme();
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

  function updateUITexts() {
    document.getElementById('profileTitle').innerText = getT('profileTitle');
    document.getElementById('nameLabel').innerText = getT('nameLabel');
    document.getElementById('maxVolumeLabel').innerText = getT('maxVolumeLabel');
    saveProfileBtn.innerText = getT('saveBtn');
    document.getElementById('profileNote').innerText = getT('profileNote');
    document.getElementById('bladderTitle').innerText = getT('bladderTitle');
    document.getElementById('drinkLabel').innerText = getT('drinkLabel');
    drinkBtn.innerText = getT('drinkBtn');
    askPermissionBtn.innerText = getT('askBtn');
    peeBtn.innerText = getT('peeBtn');
    cantHoldBtn.innerText = getT('cantBtn');
    resetProgressBtn.innerText = getT('resetBtn');
    editProfileBtn.innerText = getT('editBtn');
    if (leakingBtn) leakingBtn.innerText = getT('leakingBtn');
    const themeText = getT('themeToggle');
    if (themeToggleBtn) themeToggleBtn.innerText = themeText;
    if (themeToggleBtnMain) themeToggleBtnMain.innerText = themeText;
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
    langSelectProfile.innerHTML = options;
    langSelectMain.innerHTML = options;
    langSelectProfile.value = currentLang;
    langSelectMain.value = currentLang;
  }

  function changeLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('omoki_lang', lang);
    updateUITexts();
    updateUI();
    const profile = JSON.parse(localStorage.getItem('omoki_profile') || '{}');
    profile.lang = lang;
    localStorage.setItem('omoki_profile', JSON.stringify(profile));
    langSelectProfile.value = lang;
    langSelectMain.value = lang;
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
      timerId = setInterval(() => processTick(), 3900);
    }
  }

  function drinkAction() {
    let rawAmount = parseInt(drinkSlider.value, 10);
    if (isNaN(rawAmount)) rawAmount = 100;
    let chosenMl = Math.min(1000, Math.max(10, rawAmount));
    if (chosenMl <= 0) return;

    pendingMl += chosenMl;
    ensureTimerRunning();
    updateUI();
    statusMsgSpan.innerHTML = getT('drinkFeedback', { amount: chosenMl });
    setTimeout(() => updateUI(), 1800);
  }

  function askPermission() {
    statusMsgSpan.innerHTML = getT('askWait');
    setTimeout(() => {
      if (currentVolume > maxVolume * 0.9) {
        statusMsgSpan.innerHTML = getT('askDenied');
      } else {
        statusMsgSpan.innerHTML = getT('askGranted');
      }
      setTimeout(() => updateUI(), 2000);
    }, 1500);
  }

  function peeAction() {
    stopTimer();
    currentVolume = 0;
    pendingMl = 0;
    updateUI();
    statusMsgSpan.innerHTML = getT('peeDone');
    setTimeout(() => updateUI(), 2000);
  }

  function cantHoldAction() {
    stopTimer();
    let lostVolume = currentVolume;
    currentVolume = 0;
    pendingMl = 0;
    updateUI();
    statusMsgSpan.innerHTML = getT('cantHoldMsg', { amount: Math.floor(lostVolume) });
    setTimeout(() => updateUI(), 3000);
  }

  // Новая функция для кнопки Leaking (1% шанс)
  function leakingAction() {
    const chance = Math.random() * 100; // 0..100
    if (chance < 1) { // 1% шанс
      statusMsgSpan.innerHTML = getT('leakingGranted');
      // разрешаем опорожнение
      stopTimer();
      currentVolume = 0;
      pendingMl = 0;
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
    stopTimer();
    updateUI();
    const profile = { userName, maxVolume, lang: currentLang };
    localStorage.setItem('omoki_profile', JSON.stringify(profile));
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
          stopTimer();
          return true;
        }
      } catch(e) {}
    }
    return false;
  }

  function editProfile() {
    stopTimer();
    profileNameInput.value = userName;
    profileMaxInput.value = maxVolume;
    profileScreen.classList.add('active');
    mainScreen.classList.remove('active');
    updateUITexts();
  }

  function updateSliderLabel() {
    let val = parseInt(drinkSlider.value, 10);
    drinkAmountSpan.innerText = val;
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ ----------
  function init() {
    loadTheme();
    const savedLang = localStorage.getItem('omoki_lang');
    if (savedLang && translations[savedLang]) currentLang = savedLang;
    populateLanguageSelectors();
    updateUITexts();

    langSelectProfile.addEventListener('change', (e) => changeLanguage(e.target.value));
    langSelectMain.addEventListener('change', (e) => changeLanguage(e.target.value));
    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleBtnMain.addEventListener('click', toggleTheme);
    if (leakingBtn) leakingBtn.addEventListener('click', leakingAction);

    drinkSlider.addEventListener('input', updateSliderLabel);
    updateSliderLabel();
    drinkBtn.addEventListener('click', drinkAction);
    askPermissionBtn.addEventListener('click', askPermission);
    peeBtn.addEventListener('click', peeAction);
    cantHoldBtn.addEventListener('click', cantHoldAction);
    resetProgressBtn.addEventListener('click', resetProgress);
    editProfileBtn.addEventListener('click', editProfile);
    saveProfileBtn.addEventListener('click', saveProfile);

    const hasProfile = loadSavedProfile();
    if (hasProfile) {
      profileScreen.classList.remove('active');
      mainScreen.classList.add('active');
      updateUI();
    } else {
      userName = "";
      maxVolume = 500;
      currentVolume = 0;
      pendingMl = 0;
      profileNameInput.value = "";
      profileMaxInput.value = 500;
      profileScreen.classList.add('active');
      mainScreen.classList.remove('active');
      updateUI();
    }
  }

  init();
})();