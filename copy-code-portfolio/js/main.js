/**
 * COPY CODE - JavaScript principal
 * Interacoes: menu mobile, scroll reveal, header dinamico,
 * modal de portfolio, formulario de contato e navegacao ativa.
 */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '5500000000000';

  const body = document.body;
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const navLinks = Array.from(document.querySelectorAll('.header__link'));
  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  const conceptModal = document.getElementById('conceptModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalCta = document.getElementById('modalCta');
  const contactForm = document.getElementById('contactForm');
  const portfolioBtns = Array.from(document.querySelectorAll('.portfolio-card__btn'));
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const lightSections = ['destaques', 'servicos', 'processo', 'faq']
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  let lastFocusedElement = null;

  function setBodyLocked(isLocked) {
    body.classList.toggle('is-locked', isLocked);
  }

  function setMenuState(isOpen) {
    if (!menuBtn || !nav) return;

    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', isOpen);
    setBodyLocked(isOpen);
  }

  function toggleMenu() {
    setMenuState(!nav.classList.contains('open'));
  }

  function closeMenu() {
    setMenuState(false);
  }

  function updateHeader() {
    if (!header) return;

    const isLight = lightSections.some(function (section) {
      const rect = section.getBoundingClientRect();
      return rect.top <= 80 && rect.bottom >= 80;
    });

    header.classList.toggle('header--light', window.scrollY >= 100 && isLight);
  }

  function updateActiveNav() {
    let current = '';

    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function initReveal() {
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function openModal(conceptName) {
    if (!conceptModal || !modalTitle) return;

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = conceptName || 'Projeto';
    conceptModal.classList.add('active');
    conceptModal.setAttribute('aria-hidden', 'false');
    setBodyLocked(true);

    requestAnimationFrame(function () {
      if (modalClose) modalClose.focus();
    });
  }

  function closeModal() {
    if (!conceptModal) return;

    conceptModal.classList.remove('active');
    conceptModal.setAttribute('aria-hidden', 'true');
    setBodyLocked(false);

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    );
  }

  function trapModalFocus(event) {
    if (!conceptModal || !conceptModal.classList.contains('active') || event.key !== 'Tab') return;

    const focusable = getFocusableElements(conceptModal);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function buildWhatsAppUrl(message) {
    const params = new URLSearchParams({ text: message });
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?' + params.toString();
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10) {
      return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    }
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }

  function initContactForm() {
    if (!contactForm) return;

    const phoneInput = contactForm.querySelector('#whatsapp');

    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        phoneInput.value = formatPhone(phoneInput.value);
      });
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const projectSelect = contactForm.querySelector('#tipo');
      const projectType = projectSelect && projectSelect.selectedIndex >= 0
        ? projectSelect.options[projectSelect.selectedIndex].text
        : formData.get('tipo');

      const message = [
        'Olá! Gostaria de solicitar um orçamento.',
        '',
        '*Nome:* ' + String(formData.get('nome')).trim(),
        '*E-mail:* ' + String(formData.get('email')).trim(),
        '*WhatsApp:* ' + String(formData.get('whatsapp')).trim(),
        '*Tipo de projeto:* ' + projectType,
        '*Mensagem:* ' + String(formData.get('mensagem')).trim()
      ].join('\n');

      window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
      contactForm.reset();
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initEvents() {
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', toggleMenu);
      setMenuState(false);
    }

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    portfolioBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn.dataset.concept);
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalCta) {
      modalCta.addEventListener('click', closeModal);
    }

    if (conceptModal) {
      const overlay = conceptModal.querySelector('.modal__overlay');
      if (overlay) overlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && conceptModal && conceptModal.classList.contains('active')) {
        closeModal();
      }
      trapModalFocus(event);
    });
  }

  function initScrollHandlers() {
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;

      window.requestAnimationFrame(function () {
        updateHeader();
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  initEvents();
  initReveal();
  initContactForm();
  initSmoothScroll();
  initScrollHandlers();
  updateHeader();
  updateActiveNav();
})();
