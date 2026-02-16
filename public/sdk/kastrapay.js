/**
 * KastraPay Inline Checkout SDK v1.0.0
 *
 * Usage:
 *   <script src="https://your-domain.com/sdk/kastrapay.js"></script>
 *   <script>
 *     const handler = KastraPay.setup({
 *       key: "kp_live_xxxx",           // Your public/API key
 *       amount: 5000,                   // Amount in smallest unit
 *       currency: "KES",
 *       email: "customer@example.com",
 *       phone: "+254712345678",
 *       name: "John Doe",
 *       description: "Order #12345",
 *       metadata: { orderId: "12345" },
 *       methods: ["MPESA_STK", "FLUTTERWAVE_CARD", "PAYSTACK_CARD"],
 *       onSuccess: function(response) { ... },
 *       onClose: function() { ... },
 *       onError: function(error) { ... },
 *     });
 *     handler.open();
 *   </script>
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.KastraPay = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SDK_VERSION = "1.0.0";
  var BASE_URL = "";
  var CHECKOUT_PATH = "/checkout/inline";

  function getBaseUrl() {
    if (BASE_URL) return BASE_URL;
    // Auto-detect from script src
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || "";
      if (src.indexOf("kastrapay.js") !== -1) {
        var url = new URL(src);
        BASE_URL = url.origin;
        return BASE_URL;
      }
    }
    return "";
  }

  function generateIdempotencyKey() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "kp_idem_";
    for (var i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function validateConfig(config) {
    if (!config.key) throw new Error("KastraPay: 'key' is required");
    if (!config.amount || config.amount <= 0) throw new Error("KastraPay: 'amount' must be a positive number");
    if (!config.email && !config.phone) throw new Error("KastraPay: 'email' or 'phone' is required");
  }

  function createOverlay() {
    var overlay = document.createElement("div");
    overlay.id = "kastrapay-overlay";
    overlay.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:100%",
      "height:100%",
      "background:rgba(0,0,0,0.6)",
      "z-index:999999",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "opacity:0",
      "transition:opacity 0.3s ease",
    ].join(";");
    return overlay;
  }

  function createIframe(url) {
    var iframe = document.createElement("iframe");
    iframe.id = "kastrapay-iframe";
    iframe.src = url;
    iframe.style.cssText = [
      "width:420px",
      "max-width:95vw",
      "height:620px",
      "max-height:90vh",
      "border:none",
      "border-radius:12px",
      "background:#fff",
      "box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)",
      "transform:scale(0.95)",
      "transition:transform 0.3s ease",
    ].join(";");
    iframe.setAttribute("allow", "payment");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation");
    return iframe;
  }

  function createCloseButton() {
    var btn = document.createElement("button");
    btn.innerHTML = "&times;";
    btn.style.cssText = [
      "position:absolute",
      "top:12px",
      "right:12px",
      "width:36px",
      "height:36px",
      "border-radius:50%",
      "border:none",
      "background:rgba(255,255,255,0.9)",
      "color:#333",
      "font-size:20px",
      "cursor:pointer",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "z-index:1000001",
      "box-shadow:0 2px 8px rgba(0,0,0,0.15)",
    ].join(";");
    return btn;
  }

  /**
   * Main SDK setup
   */
  function setup(config) {
    validateConfig(config);

    var baseUrl = config.baseUrl || getBaseUrl();
    var overlay = null;
    var iframe = null;
    var messageHandler = null;
    var isOpen = false;

    function buildCheckoutUrl() {
      var params = new URLSearchParams();
      params.set("key", config.key);
      params.set("amount", String(config.amount));
      params.set("currency", config.currency || "KES");
      if (config.email) params.set("email", config.email);
      if (config.phone) params.set("phone", config.phone);
      if (config.name) params.set("name", config.name);
      if (config.description) params.set("description", config.description);
      if (config.ref) params.set("ref", config.ref);
      if (config.methods) params.set("methods", config.methods.join(","));
      if (config.metadata) params.set("metadata", JSON.stringify(config.metadata));
      params.set("idem", config.idempotencyKey || generateIdempotencyKey());
      params.set("sdk", SDK_VERSION);
      return baseUrl + CHECKOUT_PATH + "?" + params.toString();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;

      if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(function () {
          if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          overlay = null;
          iframe = null;
        }, 300);
      }

      if (messageHandler) {
        window.removeEventListener("message", messageHandler);
        messageHandler = null;
      }

      if (typeof config.onClose === "function") {
        config.onClose();
      }
    }

    function open() {
      if (isOpen) return;
      isOpen = true;

      var url = buildCheckoutUrl();
      overlay = createOverlay();
      iframe = createIframe(url);
      var closeBtn = createCloseButton();

      var container = document.createElement("div");
      container.style.cssText = "position:relative;";
      container.appendChild(iframe);
      container.appendChild(closeBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // Animate in
      requestAnimationFrame(function () {
        overlay.style.opacity = "1";
        iframe.style.transform = "scale(1)";
      });

      // Close button
      closeBtn.addEventListener("click", close);

      // Click outside to close
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });

      // Escape key
      document.addEventListener("keydown", function escHandler(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", escHandler);
        }
      });

      // Listen for messages from iframe
      messageHandler = function (event) {
        if (event.origin !== new URL(baseUrl).origin) return;

        var data = event.data;
        if (!data || data.source !== "kastrapay") return;

        switch (data.type) {
          case "payment.success":
            if (typeof config.onSuccess === "function") {
              config.onSuccess({
                transactionId: data.transactionId,
                reference: data.reference,
                status: data.status,
                amount: data.amount,
                currency: data.currency,
                method: data.method,
              });
            }
            close();
            break;

          case "payment.failed":
            if (typeof config.onError === "function") {
              config.onError({
                message: data.message || "Payment failed",
                code: data.code,
              });
            }
            break;

          case "payment.close":
            close();
            break;

          case "checkout.ready":
            // Checkout iframe is loaded and ready
            break;
        }
      };

      window.addEventListener("message", messageHandler);
    }

    return {
      open: open,
      close: close,
    };
  }

  /**
   * Direct redirect checkout (non-popup)
   */
  function redirect(config) {
    validateConfig(config);
    var baseUrl = config.baseUrl || getBaseUrl();
    var params = new URLSearchParams();
    params.set("key", config.key);
    params.set("amount", String(config.amount));
    params.set("currency", config.currency || "KES");
    if (config.email) params.set("email", config.email);
    if (config.phone) params.set("phone", config.phone);
    if (config.name) params.set("name", config.name);
    if (config.description) params.set("description", config.description);
    if (config.ref) params.set("ref", config.ref);
    if (config.methods) params.set("methods", config.methods.join(","));
    if (config.metadata) params.set("metadata", JSON.stringify(config.metadata));
    if (config.callbackUrl) params.set("callback_url", config.callbackUrl);
    params.set("idem", config.idempotencyKey || generateIdempotencyKey());
    params.set("sdk", SDK_VERSION);
    params.set("mode", "redirect");
    window.location.href = baseUrl + CHECKOUT_PATH + "?" + params.toString();
  }

  return {
    setup: setup,
    redirect: redirect,
    version: SDK_VERSION,
  };
});
