// ==== CONFIGURE AQUI AS SUAS URLs ====
const RELEASES = {
  // se ainda não tiver esse JSON, deixa assim mesmo.
  // ele vai falhar no fetch e cair no fallback, sem problema.
  latestJson: 'https://patogo.com.br/wpp/update.json', 

  // AQUI é o principal:
  defaultZip: 'https://patogo.com.br/downloads/PatoGo-1.0.0.zip',

  // pode apontar pra própria página de download
  releasesPage: 'https://patogo.com.br/#download',

  // se ainda não tiver SHA256, pode deixar pra depois ou apontar pra um txt vazio
  sha256Page: 'https://patogo.com.br/wpp/SHA256.txt'
};


// util
const el = (id) => document.getElementById(id);

async function loadRelease(){
  el('y').textContent = new Date().getFullYear();
  el('st').textContent = 'Verificando…';
  try{
    const res = await fetch(RELEASES.latestJson, { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();

    const ver = data.version || '—';
    const zip = data.zip || RELEASES.defaultZip;
    const notes = data.notes || '—';
    const updated = data.updated || new Date().toISOString().slice(0,10);

    el('cur-ver').textContent = ver;
    el('ver-a').textContent = ver;
    el('ver-b').textContent = ver;
    //el('dl').href = zip;
    //el('dl2').href = zip;
    el('notes').textContent = notes;
    el('updated').textContent = updated;
    el('st').innerHTML = '<span class="ok">Pronto para baixar</span>';
  }catch(err){
    // fallback offline
    el('cur-ver').textContent = 'indisponível';
    el('ver-a').textContent = 'indisponível';
    el('ver-b').textContent = 'indisponível';
    el('dl').href = RELEASES.defaultZip;
    el('dl2').href = RELEASES.defaultZip;
    el('notes').textContent = 'Sem notas (offline)';
    el('updated').textContent = '—';
    el('st').innerHTML = '<span class="warn">Offline ou indisponível</span>';
  }finally{
    el('hash').href = RELEASES.sha256Page;
    el('releaseLink').href = RELEASES.releasesPage;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRelease();

  // scroll suave para "Como instalar"
  const howBtn = el('how');
  if (howBtn){
    howBtn.addEventListener('click', () => {
      const sec = document.getElementById('instalacao');
      if (sec) sec.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  }
});
