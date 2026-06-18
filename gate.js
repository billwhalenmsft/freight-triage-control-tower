/*
 * SE OS leave-behind SHARE GATE — client-side password + expiration.
 *
 * Reusable across customer leave-behinds. Referenced as the first <script> in
 * <body> of each page you want gated (the hub and the prototype).
 *
 * ⚠️ SCOPE: this is a DISPLAY / controlled-distribution gate, not a
 * confidentiality boundary. The site is on public GitHub Pages, so a determined
 * person could still pull assets directly. Use it for DEMO-DATA-ONLY content
 * (no real customer data). For confidential content use PageDrop (single HTML,
 * server-side password) or Azure Static Web Apps / Cloudflare Access (real auth).
 *
 * To change the password: compute the SHA-256 of the new passphrase and replace
 * CFG.passHash below. PowerShell one-liner:
 *   $p="newpass"; ([Security.Cryptography.SHA256]::Create().ComputeHash(
 *     [Text.Encoding]::UTF8.GetBytes($p)) | %{ $_.ToString('x2') }) -join ''
 * To change expiry: set CFG.expires (YYYY-MM-DD, hides after end of that day).
 */
(function () {
  var CFG = {
    title: "Freight Triage Control Tower",
    subtitle: "Prepared for TE Connectivity by Microsoft",
    // SHA-256 of the share passphrase (passphrase itself is shared out-of-band).
    passHash: "844bd72576cb9a374783378d0dcb8d518ac227a3cc4185c2653c53f4c2793204",
    expires: "2026-07-18", // preview hidden after end of this day
    contact: "your Microsoft contact",
  };
  var KEY = "seos_share_gate_ok";
  var root = document.documentElement;
  root.style.visibility = "hidden";

  function reveal() { root.style.visibility = "visible"; }
  function mount(el) {
    if (document.body) document.body.appendChild(el);
    else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(el); });
  }
  function isExpired() { return new Date() > new Date(CFG.expires + "T23:59:59"); }
  async function sha256(s) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  function wall(inner) {
    var ov = document.createElement("div");
    ov.id = "seos-gate";
    ov.style.cssText =
      "visibility:visible;position:fixed;inset:0;z-index:2147483647;background:#0d1b2e;color:#fff;" +
      "font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;" +
      "padding:24px;box-sizing:border-box;";
    ov.innerHTML = "<div style='max-width:420px;width:100%;text-align:center'>" + inner + "</div>";
    mount(ov);
    return ov;
  }
  function showExpired() {
    wall(
      "<div style='font-size:46px;margin-bottom:12px'>\u23F3</div>" +
      "<h1 style='font-size:22px;margin:0 0 8px'>This preview has expired</h1>" +
      "<p style='color:rgba(255,255,255,.7);margin:0;font-size:15px;line-height:1.5'>Please contact " +
      CFG.contact + " for an updated link.</p>"
    );
  }
  function showPrompt(err) {
    wall(
      "<div style='display:flex;justify-content:center;margin-bottom:14px'>" +
      "<div style='width:46px;height:46px;border-radius:11px;background:#e98300;color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center'>TE</div></div>" +
      "<h1 style='font-size:21px;margin:0 0 4px'>" + CFG.title + "</h1>" +
      "<p style='color:rgba(255,255,255,.6);margin:0 0 18px;font-size:13px'>" + CFG.subtitle + "</p>" +
      "<input id='seos-pw' type='password' autocomplete='off' placeholder='Password' " +
      "style='width:100%;padding:11px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.25);" +
      "background:rgba(255,255,255,.08);color:#fff;font-size:15px;box-sizing:border-box;margin-bottom:10px'/>" +
      (err ? "<div style='color:#ff9a9a;font-size:13px;margin-bottom:10px'>Incorrect password. Try again.</div>" : "") +
      "<button id='seos-go' style='width:100%;padding:11px;border:0;border-radius:9px;background:#0078d4;" +
      "color:#fff;font-weight:700;font-size:15px;cursor:pointer'>View preview \u2192</button>"
    );
    function submit() {
      var v = document.getElementById("seos-pw").value;
      sha256(v).then(function (h) {
        var g = document.getElementById("seos-gate");
        if (h === CFG.passHash) {
          try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
          if (g) g.remove();
          reveal();
        } else {
          if (g) g.remove();
          showPrompt(true);
        }
      });
    }
    var go = document.getElementById("seos-go");
    if (go) go.addEventListener("click", submit);
    var pw = document.getElementById("seos-pw");
    if (pw) {
      pw.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      pw.focus();
    }
  }

  if (isExpired()) { showExpired(); return; }
  var ok = false;
  try { ok = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  if (ok) { reveal(); return; }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { showPrompt(false); });
  else showPrompt(false);
})();
