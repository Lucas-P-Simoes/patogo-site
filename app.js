// ================== CONFIGURAÇÃO BÁSICA ==================

// versão atual (fallback caso não exista update.json)
const CURRENT_VERSION = '2.0.0';

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
    stEl.className = 'status-loading';
    stEl.textContent = 'Verificando…';
  }

  // valores padrão (caso JSON não exista / erro)
  const curVerEl = el('cur-ver');
  const verAEl   = el('ver-a');
  const verBEl   = el('ver-b');
  const verCEl   = el('ver-c');
  const dlEl     = el('dl');
  const dl2El    = el('dl2');
  const updEl    = el('updated');

  if (curVerEl) curVerEl.textContent = CURRENT_VERSION;
  if (verAEl)   verAEl.textContent   = CURRENT_VERSION;
  if (verBEl)   verBEl.textContent   = CURRENT_VERSION;
  if (verCEl)   verCEl.textContent   = CURRENT_VERSION;
  if (dlEl)     dlEl.href            = RELEASES.defaultZip;
  if (dl2El)    dl2El.href           = RELEASES.defaultZip;
  if (updEl)    updEl.textContent    = '—';

  try {
    const res = await fetch(RELEASES.latestJson, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();

    const ver     = data.version || CURRENT_VERSION;
    const zip     = data.zip || RELEASES.defaultZip;
    const updated = data.updated || new Date().toISOString().slice(0, 10);

    if (curVerEl) curVerEl.textContent = ver;
    if (verAEl)   verAEl.textContent   = ver;
    if (verBEl)   verBEl.textContent   = ver;
    if (verCEl)   verCEl.textContent   = ver;
    if (dlEl)     dlEl.href            = zip;
    if (dl2El)    dl2El.href           = zip;
    if (updEl)    updEl.textContent    = formatDate(updated);
    
    if (stEl) {
      stEl.className = 'status-ready';
      stEl.textContent = '✓ Pronto para baixar';
      stEl.style.color = '#00ff00';
    }
  } catch (err) {
    // se der erro, mantém CURRENT_VERSION + defaultZip
    if (updEl)   updEl.textContent   = '—';
    if (stEl) {
      stEl.className = 'status-offline';
      stEl.textContent = '⚠ Offline';
      stEl.style.color = '#ffa500';
    }
  } finally {
    const relLinkEl = el('releaseLink');
    if (relLinkEl) relLinkEl.href = RELEASES.releasesPage;
  }
}

// Formatar data para pt-BR
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// ================== SCROLL ANIMATIONS ==================

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Animar cards ao entrar na viewport
  const cards = document.querySelectorAll('.feature-card, .testimonial-card, .step-card, .faq-item');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// ================== SMOOTH SCROLL ==================

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const offset = 100; // altura da navbar + margem
        const targetPosition = target.offsetTop - offset;
        
        console.log('Scrolling to:', href, 'Position:', targetPosition);
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        console.warn('Target not found:', href);
      }
    });
  });
}

// ================== NAVBAR SCROLL EFFECT ==================

function setupNavbarEffect() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.background = 'rgba(0, 0, 0, 0.95)';
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.8)';
      navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });
}

// ================== TRACKING DE CONVERSÃO ==================

function setupConversionTracking() {
  // Tracking: cliques nos botões de download
  const downloadButtons = [
    el('dl'),   // botão hero
    el('dl2'),  // botão download section
  ];

  downloadButtons.forEach((btn, index) => {
    if (btn) {
      btn.addEventListener('click', () => {
        const labels = ['hero_primary', 'download_section'];
        trackDownload(labels[index] || 'unknown');
        
        // Feedback visual
        const originalText = btn.innerHTML;
        btn.innerHTML = btn.innerHTML.replace('Baixar', 'Baixando...');
        
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      });
    }
  });

  // Tracking: visualização de vídeo
  const videoSection = document.querySelector('#video-instalar');
  if (videoSection) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent('video_view', 'engagement', 'installation_video');
          videoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    videoObserver.observe(videoSection);
  }

  // Tracking: scroll até depoimentos
  const testimonialsSection = document.querySelector('#depoimentos');
  if (testimonialsSection) {
    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent('testimonials_view', 'engagement', 'social_proof');
          testimonialsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    testimonialsObserver.observe(testimonialsSection);
  }
}

function trackDownload(label) {
  if (typeof gtag === 'function') {
    gtag('event', 'download_extensao', {
      event_category: 'conversion',
      event_label: label,
      value: 1
    });
  }
  console.log('Download tracked:', label);
}

function trackEvent(action, category, label) {
  if (typeof gtag === 'function') {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
  console.log('Event tracked:', action, category, label);
}

// ================== ANIMAÇÃO DE NÚMEROS (Counter) ==================

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const text = counter.textContent;
        
        // Extrair número e sufixo (ex: "10k+" -> 10 e "k+")
        const match = text.match(/^([\d.]+)([k+★]*)$/i);
        if (!match) return;
        
        const targetNum = parseFloat(match[1]);
        const suffix = match[2];
        const duration = 2000;
        const steps = 60;
        const increment = targetNum / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= targetNum) {
            counter.textContent = targetNum + suffix;
            clearInterval(timer);
          } else {
            counter.textContent = current.toFixed(1) + suffix;
          }
        }, duration / steps);
        
        observer.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

// ================== MOBILE MENU (se necessário no futuro) ==================

function setupMobileMenu() {
  // Placeholder para menu mobile
  // Pode ser implementado depois se necessário
}

// ================== BOOTSTRAP DA PÁGINA ==================

document.addEventListener('DOMContentLoaded', () => {
  // Carregar informações de release
  loadRelease();
  
  // Setup de funcionalidades
  setupSmoothScroll();
  setupNavbarEffect();
  setupScrollAnimations();
  setupConversionTracking();
  animateCounters();
  setupMobileMenu();
  
  console.log('PatoGo website loaded successfully! 🦆');
});

// ================== PERFORMANCE ==================

// Preload de imagens importantes
window.addEventListener('load', () => {
  const criticalImages = [
    'icons/pato.png'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});
