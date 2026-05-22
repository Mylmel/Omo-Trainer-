// realism.js — v1.5 (добавлена техника дыхания)

const RealismEngine = (function() {
  let params = {
    enabled: false,
    temperature: 'normal',
    waterSounds: false,
    lockedDoor: false,
    age: 'young',
    prostatitis: false,
    cystitis: false,
    pregnancy: false,
    menstrualCycle: false,
    breathingTechnique: false
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
  function isBreathingEnabled() { return params.enabled && params.breathingTechnique; }

  function getFillRateModifier() {
    if (!params.enabled) return 1.0;
    let mod = 1.0;
    if (params.temperature === 'cold') mod *= 1.2;
    if (params.temperature === 'hot') mod *= 0.9;
    return mod;
  }

  function getPermissionThreshold(maxVolume, currentVolume) {
    if (!params.enabled) return 0.9;
    let threshold = 0.85;
    if (params.cystitis) threshold -= 0.2;
    if (params.pregnancy) threshold -= 0.15;
    if (params.lockedDoor && (currentVolume / maxVolume) > 0.6) threshold -= 0.1;
    if (params.age === 'elderly') threshold -= 0.1;
    return Math.min(0.95, Math.max(0.5, threshold));
  }

  function getLeakProbability(currentVolume, maxVolume) {
    if (!params.enabled) return 0.01;
    let fillPercent = currentVolume / maxVolume;
    if (fillPercent < 0.7) return 0.0;
    let baseChance = fillPercent > 0.9 ? 0.1 : (fillPercent > 0.8 ? 0.05 : 0.02);
    if (params.pregnancy) baseChance += 0.1;
    if (params.prostatitis && fillPercent > 0.75) baseChance += 0.08;
    return Math.min(0.6, baseChance);
  }

  function getPostVoidResidual(currentVolume) {
    if (!params.enabled) return 0;
    let residual = 0;
    if (params.prostatitis) residual += 5 + Math.random() * 10;
    if (params.age === 'elderly') residual += 5;
    if (params.cystitis) residual = Math.min(residual + 5, 20);
    return Math.min(residual, currentVolume);
  }

  function schedulePostMicturitionDribble(callback) {
    if (!params.enabled) return;
    if (Math.random() < 0.05) {
      setTimeout(() => {
        callback(2 + Math.random() * 6);
      }, 30000 + Math.random() * 60000);
    }
  }

  function getDiureticModifier(drinkType) {
    if (!params.enabled) return 1.0;
    switch(drinkType) {
      case 'coffee': return 1.4;
      case 'tea': return 1.3;
      case 'beer': return 1.5;
      case 'soda': return 1.2;
      default: return 1.0;
    }
  }

  function getAbsorptionDelayMultiplier() { return 1.0; }

  function getPerceivedVolume(currentVolume, maxVolume) {
    if (!params.enabled) return currentVolume;
    let perceived = currentVolume;
    if (params.waterSounds) perceived *= 1.1;
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
    if (!isBreathingEnabled()) return false;
    return true;
  }

  function bindUI() {
    const tempSel = document.getElementById('temperatureSelect');
    if (tempSel) tempSel.value = params.temperature;
    const ageSel = document.getElementById('ageSelect');
    if (ageSel) ageSel.value = params.age;
    const waterSoundsCb = document.getElementById('waterSoundsToggle');
    if (waterSoundsCb) waterSoundsCb.checked = params.waterSounds;
    const lockedDoorCb = document.getElementById('lockedDoorToggle');
    if (lockedDoorCb) lockedDoorCb.checked = params.lockedDoor;
    const prostateCb = document.getElementById('prostateToggle');
    if (prostateCb) prostateCb.checked = params.prostatitis;
    const cystitisCb = document.getElementById('cystitisToggle');
    if (cystitisCb) cystitisCb.checked = params.cystitis;
    const pregnancyCb = document.getElementById('pregnancyToggle');
    if (pregnancyCb) pregnancyCb.checked = params.pregnancy;
    const menstrualCb = document.getElementById('menstrualToggle');
    if (menstrualCb) menstrualCb.checked = params.menstrualCycle;
    const breathingCb = document.getElementById('breathingTechniqueToggle');
    if (breathingCb) breathingCb.checked = params.breathingTechnique;
  }

  function collectFromUI() {
    const tempSel = document.getElementById('temperatureSelect');
    if (tempSel) params.temperature = tempSel.value;
    const ageSel = document.getElementById('ageSelect');
    if (ageSel) params.age = ageSel.value;
    const waterSoundsCb = document.getElementById('waterSoundsToggle');
    if (waterSoundsCb) params.waterSounds = waterSoundsCb.checked;
    const lockedDoorCb = document.getElementById('lockedDoorToggle');
    if (lockedDoorCb) params.lockedDoor = lockedDoorCb.checked;
    const prostateCb = document.getElementById('prostateToggle');
    if (prostateCb) params.prostatitis = prostateCb.checked;
    const cystitisCb = document.getElementById('cystitisToggle');
    if (cystitisCb) params.cystitis = cystitisCb.checked;
    const pregnancyCb = document.getElementById('pregnancyToggle');
    if (pregnancyCb) params.pregnancy = pregnancyCb.checked;
    const menstrualCb = document.getElementById('menstrualToggle');
    if (menstrualCb) params.menstrualCycle = menstrualCb.checked;
    const breathingCb = document.getElementById('breathingTechniqueToggle');
    if (breathingCb) params.breathingTechnique = breathingCb.checked;
    save();
  }

  return {
    load, save, setEnabled, isBreathingEnabled,
    getFillRateModifier, getPermissionThreshold, getLeakProbability,
    getPostVoidResidual, schedulePostMicturitionDribble,
    getDiureticModifier, getAbsorptionDelayMultiplier,
    getUrgencyStatus, activateBreathing,
    bindUI, collectFromUI,
    isEnabled: () => params.enabled
  };
})();