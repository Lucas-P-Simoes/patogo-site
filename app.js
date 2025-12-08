// ================== CONFIGURAÇÃO BÁSICA ==================

// versão atual (fallback caso não exista update.json)
const CURRENT_VERSION = '1.0.0';

const RELEASES = {
  // se ainda não tiver esse JSON, tudo bem: o código cai no fallback
  latestJson: 'https://patogo.com.br/wpp/update.json',

  // arquivo .zip atual
  defaultZip: 'https://chromewebstore.google.com/detail/patogo/dgemcpbnhifkhdmjfoabbjmmjoeaenkb',

  // página de releases (pode ser a própria página de download)
  releasesPage: 'https://patogo.com.br/#download',

  // arquivo de hashes (pode criar depois)
  sha256Page: 'https://patogo.com.br/wpp/SHA256.txt'
};

// utilidade pra pegar elemento por id
const el = (id) => document.getElementById(id);

// ================== LÓGICA DE RELEASE / DOWNLOAD ==================

async function loadRelease() {
  // ano no rodapé
  const yearEl = el('y');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const stEl = el('st');
  if (stEl) {
    stEl.textContent = 'Verificando…';
  }

  // valores padrão (caso JSON não exista / erro)
  const curVerEl = el('cur-ver');
  const verAEl   = el('ver-a');
  const verBEl   = el('ver-b');
  const dlEl     = el('dl');
  const dl2El    = el('dl2');
  const notesEl  = el('notes');
  const updEl    = el('updated');

  if (curVerEl) curVerEl.textContent = CURRENT_VERSION;
  if (verAEl)   verAEl.textContent   = CURRENT_VERSION;
  if (verBEl)   verBEl.textContent   = CURRENT_VERSION;
  if (dlEl)     dlEl.href            = RELEASES.defaultZip;
  if (dl2El)    dl2El.href           = RELEASES.defaultZip;
  if (notesEl)  notesEl.textContent  = '—';
  if (updEl)    updEl.textContent    = '—';

  try {
    const res = await fetch(RELEASES.latestJson, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();

    const ver     = data.version || CURRENT_VERSION;
    const zip     = data.zip || RELEASES.defaultZip;
    const notes   = data.notes || '—';
    const updated = data.updated || new Date().toISOString().slice(0, 10);

    if (curVerEl) curVerEl.textContent = ver;
    if (verAEl)   verAEl.textContent   = ver;
    if (verBEl)   verBEl.textContent   = ver;
    if (dlEl)     dlEl.href            = zip;
    if (dl2El)    dl2El.href           = zip;
    if (notesEl)  notesEl.textContent  = notes;
    if (updEl)    updEl.textContent    = updated;
    if (stEl)     stEl.innerHTML       = '<span class="ok">Pronto para baixar</span>';
  } catch (err) {
    // se der erro, mantém CURRENT_VERSION + defaultZip
    if (notesEl) notesEl.textContent = 'Sem notas (offline)';
    if (updEl)   updEl.textContent   = '—';
    if (stEl)    stEl.innerHTML      = '<span class="warn">Offline ou indisponível</span>';
  } finally {
    const hashEl    = el('hash');
    const relLinkEl = el('releaseLink');
    if (hashEl)    hashEl.href    = RELEASES.sha256Page;
    if (relLinkEl) relLinkEl.href = RELEASES.releasesPage;
  }
}

// ================== BOOTSTRAP DA PÁGINA ==================

document.addEventListener('DOMContentLoaded', () => {
  loadRelease();

  // scroll suave para "Como instalar"
  const howBtn = el('how');
  if (howBtn) {
    howBtn.addEventListener('click', () => {
      const sec = document.getElementById('instalacao');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ===== TRACKING: cliques nos botões de download =====
  const dlBtn  = el('dl');   // botão principal
  const dlBtn2 = el('dl2');  // link de download na seção "Como instalar"

  function trackDownload(label) {
    if (typeof gtag === 'function') {
      gtag('event', 'download_extensao', {
        event_category: 'download',
        event_label: label
      });
    }
  }

  if (dlBtn) {
    dlBtn.addEventListener('click', () => trackDownload('botao_principal'));
  }
  if (dlBtn2) {
    dlBtn2.addEventListener('click', () => trackDownload('botao_instalacao'));
  }
});
