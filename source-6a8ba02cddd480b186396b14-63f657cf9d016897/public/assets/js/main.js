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
    var navCloseTimer = null;
    var MOBILE_NAV_CLOSE_MS = 300;

    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = toggle.querySelector('.nav-toggle-label');
      if (label) label.textContent = open ? 'Close' : 'Menu';

      if (navCloseTimer) {
        clearTimeout(navCloseTimer);
        navCloseTimer = null;
      }

      if (open) {
        mobileNav.hidden = false;
        var target = mobileNav.scrollHeight;
        mobileNav.style.maxHeight = '0px';
        // Force a reflow so the max-height change below transitions
        // instead of jumping straight to its end value.
        void mobileNav.offsetHeight;
        mobileNav.style.maxHeight = target + 'px';
        mobileNav.classList.add('is-open');
      } else {
        mobileNav.style.maxHeight = mobileNav.scrollHeight + 'px';
        void mobileNav.offsetHeight;
        mobileNav.classList.remove('is-open');
        mobileNav.style.maxHeight = '0px';
        navCloseTimer = setTimeout(function () {
          mobileNav.hidden = true;
          mobileNav.style.maxHeight = '';
          navCloseTimer = null;
        }, MOBILE_NAV_CLOSE_MS);
      }
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

  /* ---------------- Scroll reveal ---------------- */
  (function () {
    if (!document.documentElement.classList.contains('js')) return;

    var selector = [
      '.section-head', '.why-intro', '.proof-band', '.about-copy',
      '.about-side .side-block', '.form-card', '.contact-intro',
      '.demo-grid > li', '.price-grid > li', '.why-list > li',
      '.process-grid > li', '.service-rows > li'
    ].join(', ');

    var targets;
    try {
      targets = Array.prototype.slice.call(document.querySelectorAll(selector));
    } catch (e) {
      return;
    }
    if (!targets.length) return;

    var revealAll = function () {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    };

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    try {
      // Stagger items that share a parent (grid/list children), capped so no
      // single item waits more than 150ms behind the first in its group.
      var groupCounts = [];
      var groupParents = [];
      targets.forEach(function (el) {
        var parent = el.parentElement;
        var idx = groupParents.indexOf(parent);
        if (idx === -1) {
          idx = groupParents.length;
          groupParents.push(parent);
          groupCounts.push(0);
        }
        var position = groupCounts[idx];
        groupCounts[idx] = position + 1;
        if (position > 0) {
          el.style.transitionDelay = Math.min(position * 60, 150) + 'ms';
        }
      });

      var io = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

      targets.forEach(function (el) { io.observe(el); });
    } catch (e) {
      revealAll();
    }
  })();

  /* ---------------- FAQ accordion (animated) ---------------- */
  (function () {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length || !window.Element || !Element.prototype.animate) return;

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    Array.prototype.forEach.call(items, function (details) {
      var summary = details.querySelector('summary');
      var answer = details.querySelector('.faq-answer');
      if (!summary || !answer) return;

      var heightAnim = null;

      var finish = function (opening) {
        details.open = opening;
        details.classList.remove('is-collapsing');
        details.style.overflow = '';
        heightAnim = null;
      };

      var expand = function () {
        details.classList.remove('is-collapsing');
        details.style.overflow = 'hidden';
        details.open = true;
        var startHeight = summary.getBoundingClientRect().height;
        var endHeight = startHeight + answer.getBoundingClientRect().height;
        if (heightAnim) heightAnim.cancel();
        heightAnim = details.animate(
          { height: [startHeight + 'px', endHeight + 'px'] },
          { duration: 220, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
        );
        answer.animate({ opacity: [0, 1] }, { duration: 200, easing: 'ease' });
        heightAnim.onfinish = function () { finish(true); };
      };

      var collapse = function () {
        details.classList.add('is-collapsing');
        details.style.overflow = 'hidden';
        var startHeight = details.getBoundingClientRect().height;
        var endHeight = summary.getBoundingClientRect().height;
        if (heightAnim) heightAnim.cancel();
        heightAnim = details.animate(
          { height: [startHeight + 'px', endHeight + 'px'] },
          { duration: 200, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
        );
        answer.animate({ opacity: [1, 0] }, { duration: 140, easing: 'ease' });
        heightAnim.onfinish = function () { finish(false); };
      };

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (reduceMotion) {
          details.open = !details.open;
          return;
        }
        if (details.open) collapse();
        else expand();
      });
    });
  })();

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
