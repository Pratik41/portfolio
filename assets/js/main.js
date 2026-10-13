/* Pratik Sonkusale — portfolio interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = 'pratiksonkusale55@gmail.com';
  var RESUME = 'assets/Pratik_Sonkusale_Resume.pdf';

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    toast(next === 'dark' ? 'Dark mode' : 'Light mode');
  }
  $('#themeBtn').addEventListener('click', toggleTheme);

  /* ---------- Toast & clipboard ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied ✓ ' + text); }, function () { toast(text); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied ✓ ' + text); } catch (e) { toast(text); }
      document.body.removeChild(ta);
    }
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); copy(b.getAttribute('data-copy')); });
  });

  /* ---------- Nav: scrolled state, progress bar, scroll-spy, mobile menu ---------- */
  var nav = $('#nav'), progress = $('#progress');
  var navLinks = $('#navLinks'), menuBtn = $('#menuBtn');
  var links = $$('a', navLinks);
  var targets = links.map(function (a) { return $(a.getAttribute('href')); });
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    var current = -1;
    targets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) current = i; });
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  links.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Cursor glow (desktop only) ---------- */
  var glow = $('#glow');
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var gx = 0, gy = 0, gRaf = 0;
    window.addEventListener('pointermove', function (e) {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('on');
      if (!gRaf) gRaf = requestAnimationFrame(function () {
        glow.style.transform = 'translate3d(' + (gx - 300) + 'px,' + (gy - 300) + 'px,0)';
        gRaf = 0;
      });
    }, { passive: true });
  }

  /* ---------- Headline: split into words for staggered reveal ---------- */
  var h1 = $('.hero h1');
  if (h1 && !reduceMotion) {
    var wi = 0;
    var wrap = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', wi++); s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          n.classList.add('w'); n.style.setProperty('--i', wi++);
        }
      });
    };
    wrap(h1);
    h1.classList.remove('reveal', 'd1');
    h1.classList.add('split');
  }

  /* ---------- Nav: sliding active indicator ---------- */
  var ind = $('#navInd');
  function moveInd(a) {
    if (!ind || !a || !window.matchMedia('(min-width: 1100px)').matches) { if (ind) ind.classList.remove('on'); return; }
    ind.style.width = a.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + a.parentNode.offsetLeft + 'px)';
    ind.classList.add('on');
  }
  function syncInd() { moveInd($('a.active', navLinks)); }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { moveInd(a); });
  });
  navLinks.addEventListener('mouseleave', syncInd);
  window.addEventListener('scroll', function () { requestAnimationFrame(syncInd); }, { passive: true });
  window.addEventListener('resize', syncInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncInd);

  /* ---------- Timeline progress fill ---------- */
  var tl = $('.timeline');
  function tlUpdate() {
    if (!tl) return;
    var r = tl.getBoundingClientRect();
    var p = (window.innerHeight * 0.6 - r.top) / r.height;
    tl.style.setProperty('--tl', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(tlUpdate); }, { passive: true });
  tlUpdate();

  /* ---------- Pointer effects (desktop only): photo tilt + card spotlight ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tilt = $('#tilt');
    if (tilt) {
      tilt.addEventListener('pointermove', function (e) {
        var r = tilt.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)';
      });
      tilt.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
    }
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Tech marquee ---------- */
  var mq = ['Java 17', 'Spring Boot 3', 'Microservices', 'Apache Kafka', 'Redis', 'PostgreSQL', 'Kubernetes', 'Docker', 'AWS',
    'Resilience4j', 'Spring Security', 'JWT · RBAC · ACL', 'LLM Integration', 'AI Agents', 'Temporal', 'GitHub Actions', 'System Design'];
  $('#marquee').innerHTML = mq.concat(mq).map(function (t) { return '<span>' + t + '</span>'; }).join('');

  /* ---------- Periodic table of skills ---------- */
  var cats = {
    core:   { label: 'Core',           color: 'var(--orange)' },
    spring: { label: 'Spring & JVM',   color: 'var(--green)' },
    data:   { label: 'Databases',      color: 'var(--accent)' },
    stream: { label: 'Messaging',      color: 'var(--teal)' },
    sec:    { label: 'Security',       color: 'var(--yellow)' },
    cloud:  { label: 'Cloud & DevOps', color: 'var(--purple)' },
    ai:     { label: 'AI',             color: 'var(--pink)' },
    tools:  { label: 'Tools & UI',     color: 'var(--red)' }
  };
  // [symbol, name, category, dailyDriver]
  var els = [
    ['Jv', 'Java 17', 'core', 1], ['Ms', 'Microservices', 'core', 1], ['Ra', 'REST APIs', 'core', 1], ['Ds', 'Distributed Systems', 'core', 1],
    ['Sd', 'System Design', 'core', 1], ['Mt', 'Multithreading', 'core'], ['Cc', 'Concurrency', 'core'],
    ['Cn', 'Cloud-Native', 'core'], ['Cb', 'Circuit Breaker', 'core'], ['Ht', 'High-Throughput Systems', 'core'],
    ['Sb', 'Spring Boot', 'spring', 1], ['Sc', 'Spring Cloud', 'spring'], ['Bt', 'Spring Batch', 'spring'], ['Hb', 'Hibernate', 'spring', 1],
    ['Jp', 'JPA', 'spring', 1], ['R4', 'Resilience4j', 'spring'], ['Gw', 'API Gateway', 'spring'], ['Fw', 'Flyway', 'spring'],
    ['Pg', 'PostgreSQL', 'data', 1], ['My', 'MySQL', 'data', 1], ['Rd', 'Redis', 'data', 1], ['Mg', 'MongoDB', 'data'],
    ['Mq', 'MSSQL', 'data'], ['Or', 'Oracle', 'data'], ['D2', 'DB2', 'data'], ['Sf', 'Snowflake', 'data'],
    ['Kf', 'Apache Kafka', 'stream', 1], ['Ed', 'Event-Driven', 'stream', 1], ['Se', 'SSE', 'stream'], ['Tp', 'Temporal', 'stream'],
    ['Ss', 'Spring Security', 'sec', 1], ['Jw', 'JWT', 'sec', 1], ['Rb', 'RBAC', 'sec'], ['Ac', 'ACL', 'sec'], ['Vt', 'Vault', 'sec'],
    ['Dk', 'Docker', 'cloud', 1], ['K8', 'Kubernetes', 'cloud', 1], ['Aw', 'AWS', 'cloud'], ['Jk', 'Jenkins', 'cloud'],
    ['Ga', 'GitHub Actions', 'cloud'], ['Az', 'Azure DevOps', 'cloud'], ['Nx', 'Nginx', 'cloud'], ['Gf', 'Grafana', 'cloud'], ['Bg', 'Blue-Green', 'cloud'],
    ['Ll', 'LLM Integration', 'ai', 1], ['Ag', 'AI Agents', 'ai', 1], ['Cl', 'Claude Code', 'ai', 1], ['Cp', 'Copilot', 'ai'], ['Cx', 'Codex', 'ai'],
    ['Ng', 'Angular', 'tools'], ['Ts', 'TypeScript', 'tools'], ['Gt', 'Git', 'tools', 1], ['Pm', 'Postman', 'tools', 1], ['Sw', 'Swagger', 'tools'],
    ['Vs', 'VS Code', 'tools', 1], ['St', 'Spring Tool Suite', 'tools'], ['Ws', 'WinSCP', 'tools'], ['Pt', 'PuTTY', 'tools']
  ];
  var table = $('#ptable');
  table.innerHTML = els.map(function (e, i) {
    var c = cats[e[2]];
    return '<li class="el" data-cat="' + e[2] + '" style="--c:' + c.color + ';--n:' + i + '" title="' + e[1] + ' · ' + c.label + (e[3] ? ' · daily driver' : '') + '">' +
      '<div class="no"><span>' + (i + 1) + '</span>' + (e[3] ? '<span class="core" aria-label="daily driver">★</span>' : '') + '</div>' +
      '<div class="sym" aria-hidden="true">' + e[0] + '</div><div class="nm">' + e[1] + '</div></li>';
  }).join('');

  var filters = $('#filters');
  filters.innerHTML = '<button type="button" class="filter" data-f="all" aria-pressed="true">All · ' + els.length + '</button>' +
    Object.keys(cats).map(function (k) {
      var n = els.filter(function (e) { return e[2] === k; }).length;
      return '<button type="button" class="filter" data-f="' + k + '" aria-pressed="false"><i style="background:' + cats[k].color + '"></i>' + cats[k].label + ' · ' + n + '</button>';
    }).join('');
  filters.addEventListener('click', function (ev) {
    var b = ev.target.closest('.filter'); if (!b) return;
    $$('.filter', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    var f = b.getAttribute('data-f');
    $$('.el', table).forEach(function (el) { el.classList.toggle('dim', f !== 'all' && el.getAttribute('data-cat') !== f); });
  });
  var daily = els.filter(function (e) { return e[3]; }).length;
  $('#legend').innerHTML = '<span>// ' + els.length + ' elements</span><span>★ ' + daily + ' daily drivers</span><span>' + Object.keys(cats).length + ' groups</span>';

  /* ---------- Live GitHub repositories (graceful fallback) ---------- */
  var langColors = { Java: '#b07219', TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B', Kotlin: '#A97BFF', Go: '#00ADD8' };
  var fallbackRepos = [
    { name: 'leadlens', description: 'Lead qualification for SaaSquatch exports: clean, verify, enrich, rank and act. Spring Boot + Angular.', language: 'Java', pushed_at: '2026-10-08T12:27:31Z', html_url: 'https://github.com/Pratik41/leadlens', stargazers_count: 0 },
    { name: 'ziprun-reassignment-engine', description: 'AI Reassignment Engine for ZipRun - Spring Boot + Angular', language: 'Java', pushed_at: '2026-10-06T20:52:29Z', html_url: 'https://github.com/Pratik41/ziprun-reassignment-engine', stargazers_count: 0 },
    { name: 'Connect-Sphere', description: 'Scalable social media backend with Spring Boot, JWT auth, personalized feeds, and event-driven notifications using Kafka and Redis.', language: 'Java', pushed_at: '2025-12-27T19:59:32Z', html_url: 'https://github.com/Pratik41/Connect-Sphere', stargazers_count: 0 }
  ];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 864e5;
    if (d < 1) return 'today';
    if (d < 30) return Math.round(d) + 'd ago';
    if (d < 365) return Math.round(d / 30) + 'mo ago';
    return Math.round(d / 365) + 'y ago';
  }
  // Deep links (/#stack): late content (repos, skills table) shifts layout, so re-align once it settles
  var userScrolled = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, function () { userScrolled = true; }, { once: true, passive: true });
  });
  function fixHashScroll() {
    if (userScrolled || location.hash.length < 2) return;
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView({ behavior: 'instant' });
  }
  window.addEventListener('load', function () { setTimeout(fixHashScroll, 60); });

  function renderRepos(list) {
    $('#repoGrid').innerHTML = list.slice(0, 3).map(function (r) {
      return '<a class="card lift repo" href="' + esc(r.html_url) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="rn">' + esc(r.name) + '</span>' +
        '<span class="rd">' + esc(r.description || 'No description') + '</span>' +
        '<span class="rm">' + (r.language ? '<span><i class="lang-dot" style="background:' + (langColors[r.language] || 'var(--faint)') + '"></i>' + esc(r.language) + '</span>' : '') +
        '<span>★ ' + (r.stargazers_count || 0) + '</span><span>updated ' + ago(r.pushed_at) + '</span></span></a>';
    }).join('');
    requestAnimationFrame(fixHashScroll);
  }
  (function loadRepos() {
    var KEY = 'gh-repos-v1';
    try {
      var cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.t < 36e5) { renderRepos(cached.d); return; }
    } catch (e) {}
    if (!window.fetch) { renderRepos(fallbackRepos); return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    fetch('https://api.github.com/users/Pratik41/repos?per_page=100&sort=pushed', { signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        var list = data.filter(function (r) { return !r.fork && !r.archived && r.name.toLowerCase() !== 'pratik41.github.io' && r.name.toLowerCase() !== 'pratik41'; })
          .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); });
        if (!list.length) throw new Error('empty');
        renderRepos(list);
        try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: list.slice(0, 3) })); } catch (e) {}
      })
      .catch(function () { clearTimeout(timer); renderRepos(fallbackRepos); });
  })();

  /* ---------- Reveal on scroll + counters + bars ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-count');
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1400;
    el.textContent = '0';
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function activate(t) {
    t.classList.add('in');
    $$('[data-count]', t).forEach(countUp);
    $$('[data-w]', t).forEach(function (b) { b.style.transform = 'scaleX(' + (+b.getAttribute('data-w') / 100) + ')'; });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    // Safety net for deep links (e.g. /#projects): reveal anything already on screen once layout settles
    var revealVisible = function () {
      $$('.reveal:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { activate(el); io.unobserve(el); }
      });
    };
    window.addEventListener('load', function () { setTimeout(revealVisible, 120); });
    window.addEventListener('hashchange', function () { setTimeout(revealVisible, 600); });
  } else {
    $$('.reveal').forEach(activate);
  }

  /* ---------- Contact form → FormSubmit (delivers to Gmail), mailto as last resort ---------- */
  var form = $('#contactForm');
  var sendBtn = $('#sendBtn'), sendLabel = $('.send-label', sendBtn), statusEl = $('#formStatus');
  function setStatus(kind, html) {
    statusEl.hidden = false;
    statusEl.className = 'form-status ' + kind;
    statusEl.innerHTML = html;
  }
  function mailtoFallback(name, company) {
    var subject = '[Portfolio] ' + form.topic.value + ' — ' + name + (company ? ' (' + company + ')' : '');
    var body = form.message.value.trim() + '\n\n—\n' + name + (company ? '\n' + company : '') + '\n' + form.email.value.trim();
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form._honey.value) return; // bot

    var name = form.name.value.trim(), company = form.company.value.trim();
    var payload = {
      name: name,
      email: form.email.value.trim(),
      company: company || '—',
      topic: form.topic.value,
      message: form.message.value.trim(),
      _subject: '[Portfolio] ' + form.topic.value + ' from ' + name + (company ? ' (' + company + ')' : ''),
      _replyto: form.email.value.trim(),
      _template: 'table',
      _captcha: 'false'
    };

    sendBtn.disabled = true;
    sendLabel.textContent = 'Sending…';
    statusEl.hidden = true;

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    fetch('https://formsubmit.co/ajax/' + EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        clearTimeout(timer);
        var success = res.ok && (res.d.success === true || res.d.success === 'true');
        if (!success) throw new Error((res.d && res.d.message) || 'send failed');
        form.reset();
        setStatus('ok', '✓ Thanks, ' + esc(name.split(' ')[0]) + '! Your message has been sent. I\'ll get back to you soon.');
        toast('Message sent ✓');
      })
      .catch(function () {
        clearTimeout(timer);
        setStatus('err', 'Couldn\'t send right now. Opening your email app instead, or email me directly at ' +
          '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
        mailtoFallback(name, company);
      })
      .then(function () {
        sendBtn.disabled = false;
        sendLabel.textContent = 'Send message';
      });
  });

  /* ---------- Command palette (Ctrl/⌘ + K) ---------- */
  function go(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  var cmds = [
    { i: '👤', t: 'About', h: '01', run: function () { go('#about'); } },
    { i: '💼', t: 'Experience', h: '02', run: function () { go('#experience'); } },
    { i: '🚀', t: 'Projects & case studies', h: '03', run: function () { go('#projects'); } },
    { i: '🧪', t: 'Tech stack', h: '04', run: function () { go('#stack'); } },
    { i: '🧭', t: 'How I work', h: '05', run: function () { go('#approach'); } },
    { i: '🏆', t: 'Impact & recognition', h: '06', run: function () { go('#recognition'); } },
    { i: '✉️', t: 'Contact', h: '07', run: function () { go('#contact'); } },
    { i: '📋', t: 'Copy email address', h: 'copy', run: function () { copy(EMAIL); } },
    { i: '📄', t: 'Download resume (PDF)', h: 'pdf', run: function () { window.location.href = RESUME; } },
    { i: '🌗', t: 'Toggle light / dark theme', h: 'theme', run: toggleTheme },
    { i: '🐙', t: 'Open GitHub', h: '↗', run: function () { window.open('https://github.com/Pratik41', '_blank', 'noopener'); } },
    { i: '🔗', t: 'Open LinkedIn', h: '↗', run: function () { window.open('https://www.linkedin.com/in/pratik-sonkusale-90b287194/', '_blank', 'noopener'); } }
  ];
  var pbg = $('#paletteBg'), pin = $('#paletteInput'), plist = $('#paletteList');
  var sel = 0, shown = cmds, lastFocus = null;
  function render() {
    var q = pin.value.trim().toLowerCase();
    shown = cmds.filter(function (c) { return c.t.toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    plist.innerHTML = shown.length ? shown.map(function (c, i) {
      return '<li role="option" id="pc-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span class="pi" aria-hidden="true">' + c.i + '</span>' + c.t + '<span class="hint">' + c.h + '</span></li>';
    }).join('') : '<li style="color:var(--faint)">No results</li>';
    pin.setAttribute('aria-activedescendant', shown.length ? 'pc-' + sel : '');
    var cur = $('#pc-' + sel); if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() { lastFocus = document.activeElement; pbg.classList.add('open'); pin.value = ''; sel = 0; render(); setTimeout(function () { pin.focus(); }, 10); }
  function closePalette() { pbg.classList.remove('open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function exec(i) { var c = shown[i]; if (!c) return; closePalette(); c.run(); }
  $('#openPalette').addEventListener('click', openPalette);
  pbg.addEventListener('click', function (e) { if (e.target === pbg) closePalette(); });
  plist.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) exec(+li.getAttribute('data-i')); });
  pin.addEventListener('input', function () { sel = 0; render(); });
  document.addEventListener('keydown', function (e) {
    var open = pbg.classList.contains('open');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (open) closePalette(); else openPalette(); return; }
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    if (!open) return;
    if (e.key === 'Escape') closePalette();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); exec(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); pin.focus(); }
  });

  /* ---------- Console easter egg for curious engineers ---------- */
  if (window.console && console.log) {
    console.log('%c👋 Hey, fellow engineer!', 'font-size:16px;font-weight:700;color:#38bdf8');
    console.log('%cLooking under the hood? No frameworks here, just semantic HTML, modern CSS and vanilla JS.\nLet\'s talk: ' + EMAIL, 'color:#9eabc2');
  }
})();
