// scripts.js — Omo Trainer v0.51 — исправлена локализация настроек
(function() {
  const MIN_INTERVAL_MS = 100, MAX_INTERVAL_MS = 60000;
  let currentVolume = 0, maxVolume = 500, pendingMl = 0, timerId = null, userName = "Player", currentLang = "en", isDarkTheme = false, permissionGranted = false, fillIntervalMs = 3800, realismEnabled = false, isEditing = false, absorptionTimeout = null;

  // DOM элементы
  const profileScreen = document.getElementById('profileScreen'), mainScreen = document.getElementById('mainScreen'), settingsScreen = document.getElementById('settingsScreen'), realismSettingsScreen = document.getElementById('realismSettingsScreen');
  const profileNameInput = document.getElementById('profileName'), profileMaxInput = document.getElementById('profileMaxVolume'), saveProfileBtn = document.getElementById('saveProfileBtn'), greetingSpan = document.getElementById('greetingName'), volumeMainSpan = document.getElementById('volumeMain'), progressFill = document.getElementById('progressFill'), statusMsgSpan = document.getElementById('statusMsg'), drinkSlider = document.getElementById('drinkSlider'), drinkAmountSpan = document.getElementById('drinkAmountValue'), drinkBtn = document.getElementById('drinkButton'), askPermissionBtn = document.getElementById('askPermissionBtn'), peeBtn = document.getElementById('peeButton'), cantHoldBtn = document.getElementById('cantHoldBtn'), resetProgressBtn = document.getElementById('resetProgressBtn'), settingsBtn = document.getElementById('settingsBtn'), leakingBtn = document.getElementById('leakingBtn'), editProfileFromSettingsBtn = document.getElementById('editProfileFromSettingsBtn'), settingsLangSelect = document.getElementById('settingsLangSelect'), settingsThemeSelect = document.getElementById('settingsThemeSelect'), settingsIntervalInput = document.getElementById('settingsIntervalInput'), closeSettingsBtn = document.getElementById('closeSettingsBtn'), realismToggle = document.getElementById('realismToggle'), openRealismSettingsBtn = document.getElementById('openRealismSettingsBtn'), saveRealismSettingsBtn = document.getElementById('saveRealismSettingsBtn'), cancelRealismSettingsBtn = document.getElementById('cancelRealismSettingsBtn'), drinkTypeSelect = document.getElementById('drinkTypeSelect'), breathingBtn = document.getElementById('breathingBtn');

  function applyTheme() { document.body.classList.toggle('dark', isDarkTheme); localStorage.setItem('omoki_theme', isDarkTheme ? 'dark' : 'light'); if(settingsThemeSelect) settingsThemeSelect.value = isDarkTheme ? 'dark' : 'light'; }
  function loadTheme() { isDarkTheme = (localStorage.getItem('omoki_theme') === 'dark'); applyTheme(); }
  function loadRealismEnabled() { realismEnabled = localStorage.getItem('omoki_realism') === 'true'; if(realismToggle) realismToggle.checked = realismEnabled; RealismEngine.setEnabled(realismEnabled); }
  function toggleRealism() { realismEnabled = realismToggle.checked; localStorage.setItem('omoki_realism', realismEnabled); RealismEngine.setEnabled(realismEnabled); }
  function stopTimer() { if(timerId) { clearInterval(timerId); timerId = null; } }
  function restartTimer() { stopTimer(); if(pendingMl > 0) timerId = setInterval(() => processTick(), fillIntervalMs); }
  function setFillInterval(ms) { fillIntervalMs = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, ms)); localStorage.setItem('omoki_fill_interval_ms', fillIntervalMs); if(settingsIntervalInput) settingsIntervalInput.value = fillIntervalMs; restartTimer(); }
  function loadFillInterval() { const saved = localStorage.getItem('omoki_fill_interval_ms'); if(saved && !isNaN(parseInt(saved))) fillIntervalMs = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, parseInt(saved))); if(settingsIntervalInput) settingsIntervalInput.value = fillIntervalMs; }

  function getT(key, ph={}) { let t = translations[currentLang] || translations.en; let val = key.split('.').reduce((o,p)=> o?.[p], t); if(!val) val = key.split('.').reduce((o,p)=> o?.[p], translations.en); if(!val) return key;
    let str = val; for(let [k,v] of Object.entries(ph)) str = str.replace(`{${k}}`, v); return str; }

  function populateLanguageSelect() { if(!settingsLangSelect) return; const codes = Object.keys(translations); settingsLangSelect.innerHTML = codes.map(code => `<option value="${code}">${getT(`langName.${code}`,{}) || code.toUpperCase()}</option>`).join(''); settingsLangSelect.value = currentLang; }

  function updateSelectOptions() {
    const drinkSelect = document.getElementById('drinkTypeSelect');
    if(drinkSelect) {
      const options = ['water','coffee','tea','beer','soda'];
      const currentVal = drinkSelect.value;
      drinkSelect.innerHTML = options.map(opt => `<option value="${opt}">${getT(`drinkType.${opt}`)}</option>`).join('');
      if(currentVal && options.includes(currentVal)) drinkSelect.value = currentVal;
    }
    const tempSelect = document.getElementById('temperatureSelect');
    if(tempSelect) {
      const options = ['cold','normal','hot'];
      const currentVal = tempSelect.value;
      tempSelect.innerHTML = options.map(opt => `<option value="${opt}">${getT(`temperature.${opt}`)}</option>`).join('');
      if(currentVal && options.includes(currentVal)) tempSelect.value = currentVal;
    }
    const ageSelect = document.getElementById('ageSelect');
    if(ageSelect) {
      const options = ['young','mature','elderly'];
      const currentVal = ageSelect.value;
      ageSelect.innerHTML = options.map(opt => `<option value="${opt}">${getT(`age.${opt}`)}</option>`).join('');
      if(currentVal && options.includes(currentVal)) ageSelect.value = currentVal;
    }
  }

  function updateUITexts() {
    // Исправленный маппинг: key в translations → id элемента
    const textElements = {
      bladderTitle: 'bladderTitle',
      drinkLabel: 'drinkLabel',
      drinkBtn: 'drinkButton',
      askBtn: 'askPermissionBtn',
      peeBtn: 'peeButton',
      cantBtn: 'cantHoldBtn',
      resetBtn: 'resetProgressBtn',
      settingsBtn: 'settingsBtn',
      leakingBtn: 'leakingBtn',
      breathingBtn: 'breathingBtn',
      profileTitle: 'profileTitle',
      nameLabel: 'nameLabel',
      maxVolumeLabel: 'maxVolumeLabel',
      profileNote: 'profileNote',
      settingsTitle: 'settingsTitle',
      languageLabel: 'settingsLangLabel',       // было settingsLangLabel → languageLabel
      themeLabel: 'settingsThemeLabel',         // было settingsThemeLabel → themeLabel
      intervalLabel: 'settingsIntervalLabel',   // было settingsIntervalLabel → intervalLabel
      intervalNote: 'settingsIntervalNote',     // было settingsIntervalNote → intervalNote
      realismLabel: 'realismLabel',
      realismNote: 'realismNote',
      editProfileLabel: 'editProfileFromSettingsBtn', // было editProfileFromSettingsBtn → editProfileLabel
      closeSettings: 'closeSettingsBtn',               // было closeSettingsBtn → closeSettings
      realismSettingsTitle: 'realismSettingsTitle',
      externalConditionsTitle: 'externalConditionsTitle',
      temperatureLabel: 'temperatureLabel',
      waterSoundsLabel: 'waterSoundsLabel',
      lockedDoorLabel: 'lockedDoorLabel',
      medicalTitle: 'medicalTitle',
      ageLabel: 'ageLabel',
      prostateLabel: 'prostateLabel',
      cystitisLabel: 'cystitisLabel',
      pregnancyLabel: 'pregnancyLabel',
      menstrualLabel: 'menstrualLabel',
      drinkTypeLabel: 'drinkTypeLabel',
      saveRealismSettingsBtn: 'saveRealismSettingsBtn',
      cancelRealismSettingsBtn: 'cancelRealismSettingsBtn',
      realismSettingsBtn: 'openRealismSettingsBtn'   // добавлено для кнопки "REALISM SETTINGS"
    };
    for (const [key, id] of Object.entries(textElements)) {
      const el = document.getElementById(id);
      if(el && el.tagName !== 'SELECT' && el.tagName !== 'INPUT') el.innerText = getT(key);
    }
    if(saveProfileBtn) saveProfileBtn.innerText = isEditing ? getT('updateBtn') : getT('saveBtn');
    if(settingsThemeSelect) {
      let lo = settingsThemeSelect.querySelector('option[value="light"]'); if(lo) lo.text = getT('themeLight');
      let dk = settingsThemeSelect.querySelector('option[value="dark"]'); if(dk) dk.text = getT('themeDark');
    }
    updateSelectOptions();
  }

  function changeLanguage(lang) { if(!translations[lang]) return; currentLang = lang; localStorage.setItem('omoki_lang', lang); updateUITexts(); populateLanguageSelect(); }

  function updateUI() { volumeMainSpan.innerHTML = `${Math.floor(currentVolume)} mL / ${maxVolume} mL`; greetingSpan.innerText = userName; let percent = Math.min(100, (currentVolume / maxVolume) * 100); progressFill.style.width = `${percent}%`; let statusKey = RealismEngine.getUrgencyStatus(currentVolume, maxVolume); statusMsgSpan.innerHTML = getT(`status.${statusKey}`); }

  function processTick() {
    if(pendingMl <= 0) { stopTimer(); updateUI(); return; }
    let speed = realismEnabled ? RealismEngine.getFillRateModifier() : 1.0;
    let increment = Math.min(2.0, Math.max(0.5, speed));
    currentVolume += increment;
    pendingMl -= increment;
    if(pendingMl < 0) pendingMl = 0;
    updateUI();
    if(pendingMl === 0) stopTimer();
    if(realismEnabled && currentVolume > 0) {
      let leakProb = RealismEngine.getLeakProbability(currentVolume, maxVolume);
      if(Math.random() < leakProb) { let leaked = Math.min(20, currentVolume); statusMsgSpan.innerHTML = getT('leakAccident', { amount: Math.floor(leaked) }); currentVolume = Math.max(0, currentVolume - leaked); updateUI(); }
    }
  }

  function ensureTimerRunning() { if(!timerId && pendingMl > 0) timerId = setInterval(() => processTick(), fillIntervalMs); }

  function drinkAction() {
    let amount = Math.min(1000, Math.max(10, parseInt(drinkSlider.value) || 100));
    let drinkType = drinkTypeSelect ? drinkTypeSelect.value : 'water';
    if(absorptionTimeout) clearTimeout(absorptionTimeout);
    if(realismEnabled) {
      let diu = RealismEngine.getDiureticModifier(drinkType);
      let effective = amount * diu;
      let absorbed = Math.max(1, Math.floor(effective * (0.5 + Math.random() * 0.3)));
      let delayMs = 5000 * RealismEngine.getAbsorptionDelayMultiplier();
      statusMsgSpan.innerHTML = getT('realismFeedback', { absorbed: absorbed, drank: amount });
      absorptionTimeout = setTimeout(() => { pendingMl += absorbed; ensureTimerRunning(); updateUI(); statusMsgSpan.innerHTML = getT('drinkFeedback', { amount: absorbed }); setTimeout(() => updateUI(), 2000); absorptionTimeout = null; }, delayMs);
    } else { pendingMl += amount; ensureTimerRunning(); statusMsgSpan.innerHTML = getT('drinkFeedback', { amount }); setTimeout(() => updateUI(), 1800); }
    updateUI();
  }

  function askPermission() { permissionGranted = false; let threshold = realismEnabled ? RealismEngine.getPermissionThreshold(maxVolume, currentVolume) : 0.9; statusMsgSpan.innerHTML = getT('askWait'); setTimeout(() => { if(currentVolume > maxVolume * threshold) statusMsgSpan.innerHTML = getRandomTrainerPhrase(currentLang, userName); else { statusMsgSpan.innerHTML = getT('askGranted'); permissionGranted = true; } setTimeout(() => updateUI(), 2000); }, 1500); }
  function peeAction() { if(!permissionGranted && realismEnabled) { statusMsgSpan.innerHTML = getT('peeWithoutPermission'); setTimeout(() => updateUI(), 2000); return; } stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } let residual = realismEnabled ? RealismEngine.getPostVoidResidual(currentVolume) : 0; currentVolume = residual; pendingMl = 0; permissionGranted = false; updateUI(); statusMsgSpan.innerHTML = getT('peeDone'); RealismEngine.schedulePostMicturitionDribble((extra) => { currentVolume += extra; updateUI(); statusMsgSpan.innerHTML = getT('postDribble', { amount: extra }); setTimeout(() => updateUI(), 2000); }); setTimeout(() => updateUI(), 2000); }
  function cantHoldAction() { stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } let lost = currentVolume; currentVolume = 0; pendingMl = 0; permissionGranted = false; updateUI(); statusMsgSpan.innerHTML = getT('cantHoldMsg', { amount: Math.floor(lost) }); setTimeout(() => updateUI(), 3000); }
  function leakingAction() { let prob = realismEnabled ? RealismEngine.getLeakProbability(currentVolume, maxVolume) : 0.1; if(Math.random() < prob) { statusMsgSpan.innerHTML = getT('leakingGranted'); stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } currentVolume = 0; pendingMl = 0; permissionGranted = false; updateUI(); } else statusMsgSpan.innerHTML = getT('leakingDenied'); setTimeout(() => updateUI(), 1500); }
  function resetProgress() { stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } currentVolume = 0; pendingMl = 0; permissionGranted = false; updateUI(); statusMsgSpan.innerHTML = getT('resetMsg'); setTimeout(() => updateUI(), 1500); }
  function breathingAction() { if(realismEnabled && RealismEngine.activateBreathing()) statusMsgSpan.innerHTML = getT('breathingActive'); else statusMsgSpan.innerHTML = getT('breathingNotAvailable'); setTimeout(() => updateUI(), 2000); }

  function saveProfile() { let newName = profileNameInput.value.trim(); if(newName === "") newName = "Player"; let newMax = Math.min(5000, Math.max(100, parseInt(profileMaxInput.value) || 500)); userName = newName; maxVolume = newMax; currentVolume = 0; pendingMl = 0; permissionGranted = false; stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } updateUI(); localStorage.setItem('omoki_profile', JSON.stringify({ userName, maxVolume, lang: currentLang })); isEditing = false; updateUITexts(); switchToScreen('mainScreen'); }
  function loadSavedProfile() { const raw = localStorage.getItem('omoki_profile'); if(raw) try { const data = JSON.parse(raw); if(data.userName && typeof data.maxVolume === 'number') { userName = data.userName; maxVolume = Math.min(5000, Math.max(100, data.maxVolume)); if(data.lang && translations[data.lang]) currentLang = data.lang; currentVolume = 0; pendingMl = 0; permissionGranted = false; stopTimer(); if(absorptionTimeout) { clearTimeout(absorptionTimeout); absorptionTimeout = null; } return true; } } catch(e){} return false; }

  function switchToScreen(id) { ['profileScreen','mainScreen','settingsScreen','realismSettingsScreen'].forEach(s => { let el = document.getElementById(s); if(el) el.classList.toggle('active', s === id); }); }
  function openSettings() { switchToScreen('settingsScreen'); }
  function closeSettings() { if(loadSavedProfile()) { switchToScreen('mainScreen'); updateUI(); } else switchToScreen('profileScreen'); }
  function openRealismSettings() { RealismEngine.bindUI(); switchToScreen('realismSettingsScreen'); }
  function saveRealismSettings() { RealismEngine.collectFromUI(); switchToScreen('settingsScreen'); }
  function cancelRealismSettings() { switchToScreen('settingsScreen'); }
  function editProfile() { isEditing = true; profileNameInput.value = userName; profileMaxInput.value = maxVolume; updateUITexts(); switchToScreen('profileScreen'); }

  function init() {
    loadTheme(); loadFillInterval(); RealismEngine.load(); loadRealismEnabled();
    const savedLang = localStorage.getItem('omoki_lang'); if(savedLang && translations[savedLang]) currentLang = savedLang;
    updateUITexts(); populateLanguageSelect();
    if(settingsLangSelect) settingsLangSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
    if(settingsThemeSelect) settingsThemeSelect.addEventListener('change', (e) => { isDarkTheme = e.target.value === 'dark'; applyTheme(); });
    if(settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if(closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if(openRealismSettingsBtn) openRealismSettingsBtn.addEventListener('click', openRealismSettings);
    if(saveRealismSettingsBtn) saveRealismSettingsBtn.addEventListener('click', saveRealismSettings);
    if(cancelRealismSettingsBtn) cancelRealismSettingsBtn.addEventListener('click', cancelRealismSettings);
    if(editProfileFromSettingsBtn) editProfileFromSettingsBtn.addEventListener('click', editProfile);
    if(realismToggle) realismToggle.addEventListener('change', toggleRealism);
    if(drinkSlider) drinkSlider.addEventListener('input', () => { if(drinkAmountSpan) drinkAmountSpan.innerText = drinkSlider.value; });
    if(drinkBtn) drinkBtn.addEventListener('click', drinkAction);
    if(askPermissionBtn) askPermissionBtn.addEventListener('click', askPermission);
    if(peeBtn) peeBtn.addEventListener('click', peeAction);
    if(cantHoldBtn) cantHoldBtn.addEventListener('click', cantHoldAction);
    if(resetProgressBtn) resetProgressBtn.addEventListener('click', resetProgress);
    if(leakingBtn) leakingBtn.addEventListener('click', leakingAction);
    if(breathingBtn) breathingBtn.addEventListener('click', breathingAction);
    if(settingsIntervalInput) settingsIntervalInput.addEventListener('change', () => setFillInterval(parseInt(settingsIntervalInput.value)));
    const hasProfile = loadSavedProfile();
    if(hasProfile) { switchToScreen('mainScreen'); updateUI(); }
    else { userName = ""; maxVolume = 500; currentVolume = 0; pendingMl = 0; if(profileNameInput) profileNameInput.value = ""; if(profileMaxInput) profileMaxInput.value = 500; isEditing = false; updateUITexts(); switchToScreen('profileScreen'); }
  }
  init();
})();