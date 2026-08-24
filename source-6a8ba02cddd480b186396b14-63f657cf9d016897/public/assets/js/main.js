/* NexalField — site behaviour: mobile navigation, footer year, enquiry form */
(function () {
  'use strict';

  /* ---------------- Current year in footer ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Mobile navigation ---------------- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (toggle && mobileNav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.hidden = !open;
      var label = toggle.querySelector('.nav-toggle-label');
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    // Reset to the desktop state if the viewport grows past the mobile breakpoint.
    var mq = window.matchMedia('(min-width: 901px)');
    var onChange = function (e) { if (e.matches) setNav(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------------- Enquiry form ---------------- */
  var form = document.getElementById('enquiryForm');
  if (!form) return;

  var submitBtn = document.getElementById('submitBtn');
  var statusEl = document.getElementById('formStatus');
  var errorEl = document.getElementById('formError');
  var successEl = document.getElementById('formSuccess');
  var submitting = false;

  // Take over validation from the browser only once the script is running,
  // so a no-JavaScript submit still gets native required-field checks.
  form.noValidate = true;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  var fieldError = function (input, show) {
    var wrap = input.closest('.field');
    var msg = wrap ? wrap.querySelector('.field-error') : null;
    if (wrap) wrap.classList.toggle('has-error', show);
    if (msg) msg.hidden = !show;
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
  };

  var checkField = function (input) {
    var value = (input.value || '').trim();
    var valid = value !== '';
    if (valid && input.type === 'email') valid = EMAIL_RE.test(value);
    fieldError(input, !valid);
    return valid;
  };

  var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));

  required.forEach(function (input) {
    input.addEventListener('blur', function () { checkField(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('has-error')) checkField(input);
    });
    input.addEventListener('change', function () {
      if (input.closest('.field').classList.contains('has-error')) checkField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;

    if (errorEl) errorEl.hidden = true;

    var firstInvalid = null;
    required.forEach(function (input) {
      if (!checkField(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      if (statusEl) statusEl.textContent = 'Please check the highlighted fields and try again.';
      firstInvalid.focus();
      return;
    }

    submitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    if (statusEl) statusEl.textContent = 'Sending your enquiry…';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (response) {
        if (!response.ok) {
          // The request reached the server but was rejected. Fall back to a plain
          // form post so the enquiry still gets through (it lands on /thank-you).
          submitBtn && submitBtn.removeAttribute('disabled');
          form.submit();
          return;
        }
        form.hidden = true;
        if (successEl) {
          successEl.hidden = false;
          successEl.focus();
        }
      })
      .catch(function () {
        // Network-level failure: keep the visitor here and let them retry.
        submitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Enquiry';
        }
        if (statusEl) statusEl.textContent = '';
        if (errorEl) errorEl.hidden = false;
      });
  });
})();
