// Media Made Simple — site JS
// 1. Mobile nav toggle
// 2. Contact form -> POST /api/contact -> Slack DM to Walt
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
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Contact form -> /api/contact (Slack)
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var defaultLabel = submit ? submit.textContent : 'Send';

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg || '';
    status.style.color = kind === 'error' ? '#c0392b'
      : kind === 'success' ? '#1e7a3a'
      : 'var(--color-text-muted)';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email) {
      setStatus('Please add your name and email so we can reply.', 'error');
      return;
    }

    if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
    setStatus('');

    try {
      var res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      var body = await res.json().catch(function () { return {}; });

      if (res.ok && body.ok) {
        form.reset();
        setStatus("Thanks — we got it. We'll be in touch within 48 hours.", 'success');
      } else {
        var msg = body.error === 'invalid_input'
          ? 'Please double-check your name and email.'
          : 'Something went wrong on our end. Email hello@mediamadesimple.co and we\'ll take care of it.';
        setStatus(msg, 'error');
      }
    } catch (err) {
      setStatus('Network error. Email hello@mediamadesimple.co and we\'ll take care of it.', 'error');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = defaultLabel; }
    }
  });
})();
