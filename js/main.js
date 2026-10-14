/* Admin'Facile — interactions de la page */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* --- En-tête : filet au défilement et menu mobile --- */

  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  function closeMenu() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  /* --- Apparition des blocs au défilement --- */

  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* --- Onglets des forfaits --- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function selectTab(tab) {
    tabs.forEach(function (other) {
      var isSelected = other === tab;
      other.classList.toggle('is-active', isSelected);
      other.setAttribute('aria-selected', String(isSelected));
      other.tabIndex = isSelected ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !isSelected;
    });
  }

  document.querySelectorAll('[data-onglet]').forEach(function (link) {
    link.addEventListener('click', function () {
      selectTab(document.getElementById(link.getAttribute('data-onglet')));
    });
  });

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab); });

    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      var step = event.key === 'ArrowRight' ? 1 : -1;
      var next = tabs[(index + step + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* --- Simulateur de crédit d'impôt --- */

  var TAUX_CREDIT = 0.5;
  var montant = document.getElementById('montant');
  var simPrix = document.getElementById('sim-prix');
  var simCredit = document.getElementById('sim-credit');
  var simTotal = document.getElementById('sim-total');

  function euros(value) {
    var decimales = Number.isInteger(value) ? 0 : 2;
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }) + ' €';
  }

  function updateSimulator() {
    var prix = Number(montant.value);
    var credit = prix * TAUX_CREDIT;
    simPrix.textContent = euros(prix);
    simCredit.textContent = '− ' + euros(credit);
    simTotal.textContent = euros(prix - credit);
  }

  montant.addEventListener('input', updateSimulator);
  updateSimulator();

  /* --- Boutons d'offre : présélection dans le formulaire --- */

  var offreSelect = document.getElementById('offre');

  document.querySelectorAll('[data-offre]').forEach(function (link) {
    link.addEventListener('click', function () {
      offreSelect.value = link.getAttribute('data-offre');
    });
  });

  /* --- Formulaire de contact --- */

  // Adresse de réception des demandes. Tant qu'elle est vide, le formulaire
  // valide la saisie mais n'envoie rien.
  var CONTACT_EMAIL = '';

  var form = document.getElementById('formulaire-contact');
  var statut = document.getElementById('statut-formulaire');

  function setStatus(message, type) {
    statut.textContent = message;
    statut.className = 'form-status' + (type ? ' is-' + type : '');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;
    Array.prototype.forEach.call(form.elements, function (field) {
      if (!field.willValidate) return;
      var isValid = field.checkValidity();
      field.classList.toggle('is-invalid', !isValid);
      if (!isValid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      setStatus('Merci de compléter les champs obligatoires.', 'error');
      firstInvalid.focus();
      return;
    }

    if (!CONTACT_EMAIL) {
      setStatus("Le formulaire n'est pas encore relié à une adresse d'envoi.", 'info');
      return;
    }

    var data = new FormData(form);
    var corps = [
      'Nom : ' + data.get('nom'),
      'E-mail : ' + data.get('email'),
      'Téléphone : ' + (data.get('telephone') || 'non renseigné'),
      'Profil : ' + data.get('profil'),
      'Besoin : ' + data.get('offre'),
      '',
      data.get('message')
    ].join('\n');

    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Demande de devis — ' + data.get('offre')) +
      '&body=' + encodeURIComponent(corps);

    setStatus('Votre messagerie va s\'ouvrir pour finaliser l\'envoi.', 'info');
  });

  /* --- Année du pied de page --- */

  document.getElementById('annee').textContent = new Date().getFullYear();
})();
