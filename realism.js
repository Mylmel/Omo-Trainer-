// realism.js — v1.3 с полной интеграцией всех параметров

const RealismEngine = (function() {
  let params = {
    enabled: false,
    elasticity: 70,
    sphincterTone: 80,
    nerveSensitivity: 60,
    residualCapacity: false,
    urethralVolume: false,
    absorptionMultiplier: 1.0,
    diureticEffect: false,
    firstUrgeDelay: 1.0,
    temperature: 'normal',
    waterSounds: false,
    shyBladder: 30,
    lockedDoor: false,
    postureEffect: false,
    currentPosture: 'standing',
    activity: 'calm',
    breathingTechniques: false,
    age: 'young',
    prostatitis: false,
    cystitis: false,
    pregnancy: false,
    menstrualCycle: false
  };

  let temporaryModifiers = {
    postMicturitionTimer: null,
    breathingActive: false,
    breathingEndTime: 0
  };

  function load() {
    const saved = localStorage.getItem('omoki_realism_params');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.assign(params, data);
      } catch(e) {}
    }
  }
  function save() { localStorage.setItem('omoki_realism_params', JSON.stringify(params)); }
  function setEnabled(val) { params.enabled = val; save(); }

  function getFillRateModifier() {
    if (!params.enabled) return 1.0;
    let mod = 1.0;
    if (params.temperature === 'cold') mod *= 1.2;
    if (params.temperature === 'hot') mod *= 0.9;
    if (params.activity === 'walking') mod *= 1.05;
    if (params.activity === 'running') mod *= 1.15;
    if (params.activity === 'jumping') mod *= 1.25;
    return mod;
  }

  function getPermissionThreshold(maxVolume, currentVolume) {
    if (!params.enabled) return 0.9;
    let threshold = 0.85;
    threshold -= (100 - params.elasticity) / 100 * 0.1;
    threshold -= (100 - params.sphincterTone) / 100 * 0.1;
    if (params.cystitis) threshold -= 0.2;
    if (params.pregnancy) threshold -= 0.15;
    if (params.lockedDoor && currentVolume / maxVolume > 0.6) threshold -= 0.1;
    if (params.age === 'elderly') threshold -= 0.1;
    return Math.min(0.95, Math.max(0.5, threshold));
  }

  function getLeakProbability(currentVolume, maxVolume) {
    if (!params.enabled) return 0.01;
    let fillPercent = currentVolume / maxVolume;
    if (fillPercent < 0.7) return 0.0;
    let baseChance = fillPercent > 0.9 ? 0.1 : (fillPercent > 0.8 ? 0.05 : 0.02);
    baseChance += (100 - params.sphincterTone) / 100 * 0.15;
    if (params.activity === 'running') baseChance += 0.1;
    if (params.activity === 'jumping') baseChance += 0.2;
    if (params.activity === 'walking') baseChance += 0.03;
    if (params.pregnancy) baseChance += 0.1;
    if (params.prostatitis && fillPercent > 0.75) baseChance += 0.08;
    return Math.min(0.6, baseChance);
  }

  function getPostVoidResidual(currentVolume) {
    if (!params.enabled) return 0;
    let residual = 0;
    if (params.residualCapacity) residual += 5 + Math.random() * 5;
    if (params.prostatitis) residual += 10 + Math.random() * 10;
    if (params.age === 'elderly') residual += 8;
    if (params.cystitis) residual = Math.min(residual + 5, 20);
    return Math.min(residual, currentVolume);
  }

  function schedulePostMicturitionDribble(callback) {
    if (!params.enabled || !params.urethralVolume) return;
    if (temporaryModifiers.postMicturitionTimer) clearTimeout(temporaryModifiers.postMicturitionTimer);
    temporaryModifiers.postMicturitionTimer = setTimeout(() => {
      callback(3 + Math.random() * 7);
      temporaryModifiers.postMicturitionTimer = null;
    }, 60000 + Math.random() * 60000);
  }

  function getDiureticModifier(drinkType) {
    if (!params.enabled || !params.diureticEffect) return 1.0;
    switch(drinkType) {
      case 'coffee': return 1.4;
      case 'tea': return 1.3;
      case 'beer': return 1.5;
      case 'soda': return 1.2;
      default: return 1.0;
    }
  }

  function getAbsorptionDelayMultiplier() { return params.enabled ? params.absorptionMultiplier : 1.0; }

  function getPerceivedVolume(currentVolume, maxVolume) {
    if (!params.enabled) return currentVolume;
    let perceived = currentVolume;
    perceived += currentVolume * (100 - params.elasticity) / 100 * 0.3;
    perceived = perceived * (0.5 + params.nerveSensitivity / 100 * 0.8);
    if (params.cystitis && currentVolume > 50) perceived += 50;
    if (params.waterSounds) perceived *= 1.1;
    if (params.shyBladder > 0) perceived *= (1 + params.shyBladder / 200);
    if (params.menstrualCycle) perceived *= 1.05;
    return Math.min(maxVolume * 1.5, perceived);
  }

  function getUrgencyStatus(currentVolume, maxVolume) {
    if (!params.enabled) {
      let p = currentVolume / maxVolume;
      if (p >= 1.5) return 'critical';
      if (p >= 1.0) return 'overflow';
      if (p >= 0.85) return 'urgent';
      if (p >= 0.65) return 'hard';
      if (p >= 0.35) return 'moderate';
      return 'calm';
    }
    const perceived = getPerceivedVolume(currentVolume, maxVolume);
    const ratio = perceived / maxVolume;
    if (ratio >= 1.3 || (params.cystitis && currentVolume > 120)) return 'critical';
    if (ratio >= 1.0) return 'overflow';
    if (ratio >= 0.75) return 'urgent';
    if (ratio >= 0.55) return 'hard';
    if (ratio >= 0.3) return 'moderate';
    return 'calm';
  }

  function activateBreathing() {
    if (!params.enabled || !params.breathingTechniques) return false;
    const now = Date.now();
    if (temporaryModifiers.breathingActive && temporaryModifiers.breathingEndTime > now) return false;
    temporaryModifiers.breathingActive = true;
    temporaryModifiers.breathingEndTime = now + 8000;
    setTimeout(() => { temporaryModifiers.breathingActive = false; }, 8000);
    return true;
  }

  function isBreathingActive() {
    return temporaryModifiers.breathingActive && temporaryModifiers.breathingEndTime > Date.now();
  }

  function getBreathingRelief() { return isBreathingActive() ? 0.85 : 1.0; }

  // UI привязка
  function bindUI() {
    const ids = ['elasticitySlider','sphincterSlider','sensitivitySlider','absorptionSlider','delaySlider','shyBladderSlider'];
    ids.forEach(id => { const el = document.getElementById(id); if(el && params[el.id.replace('Slider','')]) el.value = params[el.id.replace('Slider','')]; });
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => { if(params.hasOwnProperty(cb.id)) cb.checked = params[cb.id]; });
    document.querySelectorAll('select').forEach(sel => { if(params.hasOwnProperty(sel.id)) sel.value = params[sel.id]; });
    updateSliderDisplay();
    attachSliderEvents();
    enablePostureDependency();
  }

  function updateSliderDisplay() {
    const map = {elasticityValue: 'elasticity', sphincterValue: 'sphincterTone', sensitivityValue: 'nerveSensitivity', shyBladderValue: 'shyBladder', absorptionValue: 'absorptionMultiplier', delayValue: 'firstUrgeDelay'};
    for (let [id, key] of Object.entries(map)) {
      let el = document.getElementById(id);
      if (!el) continue;
      if (key === 'absorptionMultiplier' || key === 'firstUrgeDelay') el.innerText = params[key].toFixed(1) + 'x';
      else el.innerText = params[key] + '%';
    }
  }

  function attachSliderEvents() {
    const sliders = ['elasticitySlider','sphincterSlider','sensitivitySlider','shyBladderSlider'];
    sliders.forEach(id => {
      const s = document.getElementById(id);
      if(s) s.addEventListener('input', () => { params[id.replace('Slider','')] = parseFloat(s.value); updateSliderDisplay(); });
    });
    const abs = document.getElementById('absorptionSlider');
    if(abs) abs.addEventListener('input', () => { let r = (parseFloat(abs.value)-5)/15; params.absorptionMultiplier = Math.round((0.5+r*1.5)*10)/10; updateSliderDisplay(); });
    const dly = document.getElementById('delaySlider');
    if(dly) dly.addEventListener('input', () => { let r = (parseFloat(dly.value)-5)/15; params.firstUrgeDelay = Math.round((0.5+r*1.5)*10)/10; updateSliderDisplay(); });
  }

  function collectFromUI() {
    params.elasticity = parseFloat(document.getElementById('elasticitySlider')?.value || 70);
    params.sphincterTone = parseFloat(document.getElementById('sphincterSlider')?.value || 80);
    params.nerveSensitivity = parseFloat(document.getElementById('sensitivitySlider')?.value || 60);
    params.shyBladder = parseFloat(document.getElementById('shyBladderSlider')?.value || 30);
    params.residualCapacity = document.getElementById('residualCapacityToggle')?.checked || false;
    params.urethralVolume = document.getElementById('urethralVolumeToggle')?.checked || false;
    params.diureticEffect = document.getElementById('diureticEffectToggle')?.checked || false;
    params.waterSounds = document.getElementById('waterSoundsToggle')?.checked || false;
    params.lockedDoor = document.getElementById('lockedDoorToggle')?.checked || false;
    params.postureEffect = document.getElementById('postureEffectToggle')?.checked || false;
    params.breathingTechniques = document.getElementById('breathingTechToggle')?.checked || false;
    params.prostatitis = document.getElementById('prostateToggle')?.checked || false;
    params.cystitis = document.getElementById('cystitisToggle')?.checked || false;
    params.pregnancy = document.getElementById('pregnancyToggle')?.checked || false;
    params.menstrualCycle = document.getElementById('menstrualToggle')?.checked || false;
    params.temperature = document.getElementById('temperatureSelect')?.value || 'normal';
    params.currentPosture = document.getElementById('postureSelect')?.value || 'standing';
    params.activity = document.getElementById('activitySelect')?.value || 'calm';
    params.age = document.getElementById('ageSelect')?.value || 'young';
    const absSlider = document.getElementById('absorptionSlider');
    if(absSlider) { let r = (parseFloat(absSlider.value)-5)/15; params.absorptionMultiplier = Math.round((0.5+r*1.5)*10)/10; }
    const delaySlider = document.getElementById('delaySlider');
    if(delaySlider) { let r = (parseFloat(delaySlider.value)-5)/15; params.firstUrgeDelay = Math.round((0.5+r*1.5)*10)/10; }
    updateSliderDisplay();
    save();
  }

  function enablePostureDependency() {
    const ps = document.getElementById('postureSelect');
    if(ps) ps.disabled = !params.postureEffect;
  }

  return {
    load, save, setEnabled,
    getFillRateModifier, getPermissionThreshold, getLeakProbability,
    getPostVoidResidual, schedulePostMicturitionDribble,
    getDiureticModifier, getAbsorptionDelayMultiplier,
    getUrgencyStatus, activateBreathing, getBreathingRelief,
    bindUI, collectFromUI, enablePostureDependency,
    isEnabled: () => params.enabled
  };
})();