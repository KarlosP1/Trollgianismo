(function() {
  var SUPA_URL = 'https://jkxhqtvugpbxplsswuut.supabase.co';
  var SUPA_KEY = 'sb_publishable_X008-K40SDB9uSb7h1eS3w_9uTc11yl';
  var entradaEm = Date.now();

  function getDispositivo() {
    var ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      if (/iPad|Tablet/i.test(ua)) return 'Tablet';
      return 'Mobile';
    }
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

  // Gera ou recupera um ID único pro dispositivo
  function getDeviceId() {
    var key = 'tg-device-id';
    try {
      var id = localStorage.getItem(key);
      if (!id) {
        id = 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
        localStorage.setItem(key, id);
      }
      return id;
    } catch(e) {
      return 'dev-' + Math.random().toString(36).slice(2, 9);
    }
  }

  async function registrar() {
    var deviceId = getDeviceId();
    var pagina   = getPagina();

    var geo = {};
    try {
      var r = await fetch('https://ipapi.co/json/');
      geo = await r.json();
    } catch(e) {}

    // Verifica se já existe registro desse device nessa página
    try {
      var checkResp = await fetch(
        SUPA_URL + '/rest/v1/visitas?device_id=eq.' + encodeURIComponent(deviceId) + '&pagina=eq.' + encodeURIComponent(pagina) + '&select=id,acessos',
        { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } }
      );
      var existentes = await checkResp.json();

      if (existentes && existentes.length > 0) {
        // Já existe — só incrementa acessos e atualiza ultimo_acesso
        var registro = existentes[0];
        await fetch(
          SUPA_URL + '/rest/v1/visitas?id=eq.' + registro.id,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':  'application/json',
              'apikey':        SUPA_KEY,
              'Authorization': 'Bearer ' + SUPA_KEY,
              'Prefer':        'return=minimal'
            },
            body: JSON.stringify({
              acessos:       (registro.acessos || 1) + 1,
              ultimo_acesso: new Date().toISOString()
            })
          }
        );
      } else {
        // Novo dispositivo — cria registro
        await fetch(SUPA_URL + '/rest/v1/visitas', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        SUPA_KEY,
            'Authorization': 'Bearer ' + SUPA_KEY,
            'Prefer':        'return=minimal'
          },
          body: JSON.stringify({
            device_id:    deviceId,
            pagina:       pagina,
            pais:         geo.country_name || geo.country || null,
            cidade:       geo.city         || null,
            regiao:       geo.region       || null,
            dispositivo:  getDispositivo(),
            navegador:    getNavegador(),
            sistema:      getSistema(),
            acessos:      1,
            ultimo_acesso: new Date().toISOString()
          })
        });
      }
    } catch(e) {}
  }

  // Registra após 2s pra evitar bounces
  setTimeout(registrar, 2000);
})();
