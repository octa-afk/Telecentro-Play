function selectNav(el) {
  const sec = el.getAttribute('data-section');
  const decoder = document.querySelector('.decoder');
  if (decoder) decoder.classList.remove('settings-mode');
  if (decoder) decoder.classList.remove('settings-usuario-active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('.section').forEach(s => s.classList.remove('visible'));
  const target = document.getElementById('sec-' + sec);
  if (target) target.classList.add('visible');

  centerNavItem(el);

if (sec === 'ajustes') {
    clearSettingPreview();
    centerFirstSetting();
    // Fuerza a que el primer elemento sepa que está listo para ser navegado
    var firstSetting = document.querySelector('.subnav-item');
    if (firstSetting) firstSetting.classList.add('active'); 
  }
}

function selectSetting(el) {
  const decoder = document.querySelector('.decoder');
  if (decoder) decoder.classList.add('settings-mode');

  document.querySelectorAll('.subnav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('visible'));
  const setting = el.getAttribute('data-settings');
  const target = document.getElementById('settings-' + setting);
  if (target) target.classList.add('visible');
  // mark decoder when 'usuario' settings are active so CSS can show sub-options
  centerNavItem(el, 'settingsNav');
  var decoder = getDecoder();
  if (decoder) {
    if (setting === 'usuario') decoder.classList.add('settings-usuario-active');
    else decoder.classList.remove('settings-usuario-active');
  }
}

function centerNavItem(el, navId) {
  var nav = document.getElementById(navId || 'navBar');
  if (!nav || !el) return;
  var navRect = nav.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  var navCenter = navRect.left + navRect.width / 2;
  var elCenter = elRect.left + elRect.width / 2;
  var delta = Math.round(elCenter - navCenter);
  var desired = nav.scrollLeft + delta;
  // clamp
  var maxScroll = nav.scrollWidth - nav.clientWidth;
  if (desired < 0) desired = 0;
  if (desired > maxScroll) desired = maxScroll;
  nav.scrollTo({ left: desired, behavior: 'smooth' });
}

function clearSettingPreview() {
  document.querySelectorAll('.subnav-item').forEach(function(item) {
    item.classList.remove('active');
  });
  var decoder = getDecoder();
  if (decoder) decoder.classList.remove('settings-usuario-active');
}

function centerFirstSetting() {
  var firstSetting = document.querySelector('.subnav-item');
  if (firstSetting) centerNavItem(firstSetting, 'settingsNav');
}

function getDecoder() {
  return document.querySelector('.decoder');
}

function isSettingsMode() {
  var decoder = getDecoder();
  return !!(decoder && decoder.classList.contains('settings-mode'));
}

function getVisibleSectionId() {
  var visible = document.querySelector('.section.visible');
  return visible ? visible.id : '';
}

function moveActiveItem(selector, direction) {
  var items = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!items.length) return;

  var activeIndex = items.findIndex(function(item) {
    return item.classList.contains('active');
  });
  if (activeIndex < 0) activeIndex = 0;

  var nextIndex = activeIndex + direction;
  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= items.length) nextIndex = items.length - 1;
  if (nextIndex === activeIndex) return;

  if (selector === '.subnav-item') {
    selectSetting(items[nextIndex]);
  } else {
    selectNav(items[nextIndex]);
  }
}

function moveSettingsOption(direction) {
  var items = Array.prototype.slice.call(document.querySelectorAll('.settings-option'));
  if (!items.length || !isSettingsMode()) return;

  var activeIndex = items.findIndex(function(item) {
    return item.classList.contains('active');
  });
  if (activeIndex < 0) activeIndex = 0;

  var nextIndex = activeIndex + direction;
  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= items.length) nextIndex = items.length - 1;
  if (nextIndex === activeIndex) return;

  items[activeIndex].classList.remove('active');
  items[nextIndex].classList.add('active');
}

function goHome() {
  var home = document.querySelector('.nav-item[data-section="home"]');
  if (home) selectNav(home);
}

function remoteBack() {
  var decoder = getDecoder();
  if (isSettingsMode()) {
    decoder.classList.remove('settings-mode');
    clearSettingPreview();
    centerFirstSetting();
    return;
  }

  if (getVisibleSectionId() !== 'sec-home') goHome();
}

function remoteOk() {
  if (isSettingsMode()) return;

  var activeNav = document.querySelector('.nav-item.active');
  if (activeNav && activeNav.getAttribute('data-section') === 'ajustes') {
    var activeSetting = document.querySelector('.subnav-item.active') || document.querySelector('.subnav-item');
    if (activeSetting) selectSetting(activeSetting);
  }
}

function handleRemoteAction(action) {
  // Si no estamos en modo ajustes, la navegación horizontal maneja el menú principal
  if (!isSettingsMode()) {
    if (action === 'left')  moveActiveItem('.nav-item', -1);
    if (action === 'right') moveActiveItem('.right', 1); // Nota: arreglado abajo en la lógica limpia
  }

  // --- NUEVA LÓGICA DE CONTROL CORREGIDA ---
  
  // 1. Navegación Izquierda / Derecha
  if (action === 'left') {
    if (isSettingsMode()) {
      // Si estás metido en las opciones de la derecha (General, Idioma), volvés a la lista de Ajustes
      var activeOption = document.querySelector('.settings-option.active');
      if (activeOption && document.querySelector('.settings-section.visible')) {
         // Opcional: quitar foco de las opciones si querés regresar al submenú
      } else {
         remoteBack(); // Si no, sale del modo ajustes al menú principal
      }
    } else {
      moveActiveItem('.nav-item', -1);
    }
  }

  if (action === 'right') {
    if (isSettingsMode()) {
      // Si estás en el submenú de ajustes, 'right' te mete a configurar las opciones internas (General, Idioma)
      var firstOption = document.querySelector('.settings-section.visible .settings-option');
      if (firstOption && !document.querySelector('.settings-section.visible .settings-option.active')) {
        firstOption.classList.add('active');
      }
    } else {
      moveActiveItem('.nav-item', 1);
    }
  }

  // 2. Navegación Arriba / Abajo (El cambio clave)
  if (action === 'up') {
    // Si estás interactuando con las opciones de la derecha (General, Idioma...)
    if (isSettingsMode() && document.activeElement.classList && document.activeElement.classList.contains('settings-option')) {
      moveSettingsOption(-1);
    } else if (isSettingsMode()) {
      // Si estás en la lista vertical de Ajustes (Usuario, Video, Sistema...)
      moveActiveItem('.subnav-item', -1);
    }
  }

  if (action === 'down') {
    if (isSettingsMode() && document.activeElement.classList && document.activeElement.classList.contains('settings-option')) {
      moveSettingsOption(1);
    } else if (isSettingsMode()) {
      moveActiveItem('.subnav-item', 1);
    }
  }

  // 3. Botones de acción directa
  if (action === 'ok') {
    // Si estás parado en la pestaña AJUSTES pero no entraste, OK te mete adentro
    var activeNav = document.querySelector('.nav-item.active');
    if (activeNav && activeNav.getAttribute('data-section') === 'ajustes' && !isSettingsMode()) {
      var firstSetting = document.querySelector('.subnav-item');
      if (firstSetting) selectSetting(firstSetting);
    } else {
      remoteOk();
    }
  }
  
  if (action === 'back') remoteBack();
  if (action === 'home' || action === 'exit') goHome();
}

document.addEventListener('keydown', function(event) {
  var keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'ok',
    Escape: 'back',
    Home: 'home'
  };
  var action = keyMap[event.key];
  if (!action) return;

  event.preventDefault();
  handleRemoteAction(action);
});

// center active on load and on resize
document.addEventListener('DOMContentLoaded', function() {
  // Add click listeners to remote buttons
  document.querySelectorAll('[data-remote]').forEach(function(button) {
    button.addEventListener('click', function() {
      handleRemoteAction(this.getAttribute('data-remote'));
    });
  });

  var active = document.querySelector('.nav-item.active');
  var decoder = document.querySelector('.decoder');
  if (active && (!decoder || !decoder.classList.contains('settings-mode'))) centerNavItem(active);

  var activeSettings = document.querySelector('.subnav-item.active');
  if (activeSettings) centerNavItem(activeSettings, 'settingsNav');
  else centerFirstSetting();
});
window.addEventListener('resize', function() {
  var active = document.querySelector('.nav-item.active');
  var decoder = document.querySelector('.decoder');
  if (active && (!decoder || !decoder.classList.contains('settings-mode'))) centerNavItem(active);

  var activeSettings = document.querySelector('.subnav-item.active');
  if (activeSettings) centerNavItem(activeSettings, 'settingsNav');
  else if (getVisibleSectionId() === 'sec-ajustes') centerFirstSetting();
});

var pinInputs = document.querySelectorAll('.pin-digit');
pinInputs.forEach(function(input, i) {
  input.addEventListener('input', function() {
    if (this.value.length === 1 && i < pinInputs.length - 1) {
      pinInputs[i + 1].focus();
    }
  });
});
