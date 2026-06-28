/* ============================================================
   States runtime — Rasafa Service Hub
   ----------------------------------------------------
   Dependency-free controller for the states.css layer:
   toasts, dismissible alerts, and loading-host toggling.
   Exposes a single global: window.RS
   RTL-first, accessible (aria-live / role), reduced-motion aware.
   ============================================================ */
(function (global) {
  "use strict";

  var ICONS = {
    success: "check_circle",
    warn: "warning",
    err: "error",
    info: "info"
  };
  var DEFAULT_DURATION = 4000;
  var stacks = {};

  function reduceMotion() {
    return global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function getStack(position) {
    var pos = position || "bottom-end";
    if (stacks[pos]) return stacks[pos];
    var cls = "rs-toast-stack";
    if (pos.indexOf("top") === 0) cls += " rs-toast-stack--top";
    if (pos.indexOf("start") !== -1) cls += " rs-toast-stack--start";
    var stack = el("div", cls, {
      "aria-live": "polite",
      "aria-atomic": "false",
      "role": "region",
      "aria-label": "إشعارات"
    });
    document.body.appendChild(stack);
    stacks[pos] = stack;
    return stack;
  }

  /* ---------- Toast ---------- */
  function toast(opts) {
    if (typeof opts === "string") opts = { text: opts };
    opts = opts || {};
    var type = ICONS[opts.type] ? opts.type : "info";
    var duration = opts.duration == null ? DEFAULT_DURATION : opts.duration;
    var isError = type === "err";

    var stack = getStack(opts.position);
    stack.setAttribute("aria-live", isError ? "assertive" : "polite");

    var node = el("div", "rs-toast rs-toast--" + type, {
      "role": isError ? "alert" : "status"
    });
    if (duration > 0) node.style.setProperty("--rs-toast-duration", duration + "ms");

    var ico = el("span", "rs-toast__ico");
    ico.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">' +
      (opts.icon || ICONS[type]) + "</span>";

    var body = el("div", "rs-toast__body");
    if (opts.title) {
      var t = el("strong", "rs-toast__title");
      t.textContent = opts.title;
      body.appendChild(t);
    }
    if (opts.text) {
      var p = el("span", "rs-toast__text");
      p.textContent = opts.text;
      body.appendChild(p);
    }

    var close = el("button", "rs-toast__close", { "type": "button", "aria-label": "إغلاق" });
    close.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';

    node.appendChild(ico);
    node.appendChild(body);
    node.appendChild(close);
    if (duration > 0 && !reduceMotion()) {
      node.appendChild(el("span", "rs-toast__timer"));
    }

    var timer = null;
    function dismiss() {
      if (!node.parentNode) return;
      if (timer) { clearTimeout(timer); timer = null; }
      node.classList.add("is-leaving");
      var done = function () { if (node.parentNode) node.parentNode.removeChild(node); };
      node.addEventListener("animationend", done, { once: true });
      setTimeout(done, 400);
    }

    close.addEventListener("click", dismiss);
    if (duration > 0) {
      var start = function () { timer = setTimeout(dismiss, duration); };
      node.addEventListener("mouseenter", function () { if (timer) { clearTimeout(timer); timer = null; } });
      node.addEventListener("mouseleave", function () { if (!timer) start(); });
      node.addEventListener("focusin", function () { if (timer) { clearTimeout(timer); timer = null; } });
      start();
    }

    stack.appendChild(node);
    return { dismiss: dismiss, node: node };
  }

  /* ---------- Alert auto-wiring (dismiss buttons) ---------- */
  function dismissAlert(alertNode) {
    if (!alertNode) return;
    alertNode.style.transition = "opacity 160ms ease, transform 160ms ease";
    alertNode.style.opacity = "0";
    alertNode.style.transform = "translateY(-4px)";
    setTimeout(function () { if (alertNode.parentNode) alertNode.parentNode.removeChild(alertNode); }, 180);
  }

  function bindAlerts(root) {
    (root || document).addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".rs-alert__close");
      if (btn) dismissAlert(btn.closest(".rs-alert"));
    });
  }

  /* ---------- Loading host ---------- */
  function setLoading(host, on) {
    if (typeof host === "string") host = document.querySelector(host);
    if (!host) return;
    host.classList.add("rs-loadhost");
    if (!host.querySelector(":scope > .rs-loading")) {
      var ov = el("div", "rs-loading");
      ov.innerHTML =
        '<span class="rs-spinner rs-spinner--lg" role="status" aria-label="جارٍ التحميل"></span>';
      host.appendChild(ov);
    }
    if (on === false) {
      host.removeAttribute("aria-busy");
      host.classList.remove("is-loading");
    } else {
      host.setAttribute("aria-busy", "true");
      host.classList.add("is-loading");
    }
  }

  /* ---------- Button busy helper ---------- */
  function setButtonBusy(btn, on) {
    if (typeof btn === "string") btn = document.querySelector(btn);
    if (!btn) return;
    if (on === false) { btn.removeAttribute("aria-busy"); btn.disabled = false; }
    else { btn.setAttribute("aria-busy", "true"); btn.disabled = true; }
  }

  var RS = global.RS || {};
  RS.toast = toast;
  RS.toastSuccess = function (o) { return toast(merge(o, "success")); };
  RS.toastError = function (o) { return toast(merge(o, "err")); };
  RS.toastWarn = function (o) { return toast(merge(o, "warn")); };
  RS.toastInfo = function (o) { return toast(merge(o, "info")); };
  RS.dismissAlert = dismissAlert;
  RS.setLoading = setLoading;
  RS.setButtonBusy = setButtonBusy;
  global.RS = RS;

  function merge(o, type) {
    if (typeof o === "string") o = { text: o };
    o = o || {};
    o.type = type;
    return o;
  }

  if (document.readyState !== "loading") bindAlerts();
  else document.addEventListener("DOMContentLoaded", function () { bindAlerts(); });
})(typeof window !== "undefined" ? window : this);
