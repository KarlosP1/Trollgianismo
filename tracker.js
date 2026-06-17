(function() {
  var SUPA_URL = 'https://jkxhqtvugpbxplsswuut.supabase.co';
  var SUPA_KEY = 'sb_publishable_X008-K40SDB9uSb7h1eS3w_9uTc11yl';

  function getDispositivo() {
    var ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function getNavegador() {
    var ua = navigator.userAgent;
    if (/Edg\//i.test(ua))     return 'Edge';
    if (/OPR\//i.test(ua))     return 'Opera';
    if (/Chrome\//i.test(ua))  return 'Chrome';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Safari\//i.test(ua))  return 'Safari';
    return 'Outro';
  }

  function getSistema() {
    var ua = navigator.userAgent;
    if (/Windows NT 10/i.test(ua)) return 'Windows 10/11';
    if (/Windows NT/i.test(ua))    return 'Windows';
    if (/Android/i.test(ua))       return 'Android';
    if (/iPhone|iPad/i.test(ua))   return 'iOS';
    if (/Mac OS X/i.test(ua))      return 'macOS';
    if (/Linux/i.test(ua))         return 'Linux';
    return 'Outro';
  }

  function getPagina() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function getDeviceId() {
    try {
      var id = localStorage.getItem('tg-device-id');
      if (!id) {
        id = 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
        localStorage.setItem('tg-device-id', id);
      }
      return id;
    } catch(e) {
      return 'dev-' + Math.random().toString(36).slice(2, 9);
    }
  }

  // Garante que só um tracker roda por vez usando uma flag de sessão por página
  function jaRegistrouNestaAba() {
    try {
      var key = 'tg-tracked-' + getPagina();
      if (sessionStorage.getItem(key)) return true;
      sessionStorage.setItem(key, '1');
      return false;
    } catch(e) { return false; }
  }

  async function registrar() {
    if (jaRegistrouNestaAba()) return;

    var deviceId = getDeviceId();
    var pagina   = getPagina();

    // Busca registro existente desse device
    var checkResp = await fetch(
      SUPA_URL + '/rest/v1/visitas?device_id=eq.' + encodeURIComponent(deviceId) + '&select=id,acessos,paginas',
      { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } }
    );
    var existentes = await checkResp.json();

    if (existentes && existentes.length > 0) {
      // Já existe — incrementa acessos, adiciona página se nova
      var reg     = existentes[0];
      var paginas = reg.paginas || [];
      if (paginas.indexOf(pagina) === -1) paginas.push(pagina);
      await fetch(SUPA_URL + '/rest/v1/visitas?id=eq.' + reg.id, {
        method: 'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPA_KEY,
          'Authorization': 'Bearer ' + SUPA_KEY,
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify({
          acessos:       (reg.acessos || 1) + 1,
          paginas:       paginas,
          ultimo_acesso: new Date().toISOString()
        })
      });
    } else {
      // Novo device — busca geo e cria registro
      var geo = {};
      try {
        var r = await fetch('https://ipapi.co/json/');
        geo = await r.json();
      } catch(e) {}

      await fetch(SUPA_URL + '/rest/v1/visitas', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPA_KEY,
          'Authorization': 'Bearer ' + SUPA_KEY,
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify({
          device_id:     deviceId,
          pagina:        pagina,
          paginas:       [pagina],
          pais:          geo.country_name || null,
          cidade:        geo.city         || null,
          regiao:        geo.region       || null,
          dispositivo:   getDispositivo(),
          navegador:     getNavegador(),
          sistema:       getSistema(),
          acessos:       1,
          ultimo_acesso: new Date().toISOString()
        })
      });
    }
  }

  setTimeout(registrar, 2000);
})();
