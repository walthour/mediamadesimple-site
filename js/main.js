// Media Made Simple — site JS
// 1. Mobile nav toggle
// 2. Contact form -> mailto handoff
// 3. Auto-update copyright year

(function () {
  // Copyright year
  document.querySelectorAll('#year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Mobile nav toggle
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Contact form -> mailto
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var website = (data.get('website') || '').toString().trim();
      var offer = (data.get('offer') || '').toString().trim();
      var budget = (data.get('budget') || '').toString().trim();
      var notes = (data.get('notes') || '').toString().trim();

      if (!name || !email) {
        if (status) status.textContent = 'Please add your name and email so we can reply.';
        return;
      }

      var subject = 'New strategy call request — ' + name;
      var body = [
        'Name: ' + name,
        'Email: ' + email,
        'Website: ' + website,
        '',
        'Products / services:',
        offer,
        '',
        'Marketing budget:',
        budget,
        '',
        'Anything else:',
        notes
      ].join('\n');

      var href = 'mailto:hello@mediamadesimple.co'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      if (status) status.textContent = 'Opening your email client…';
      window.location.href = href;
    });
  }
})();
