(function () {
  "use strict";

  var hero = document.getElementById("heroVideo");
  var heroPhone = document.getElementById("heroPhone");
  var tc = document.getElementById("tc");
  var soundBtn = document.getElementById("soundBtn");
  var topbar = document.querySelector(".topbar");
  var lightbox = document.getElementById("lightbox");
  var lbVideo = lightbox ? lightbox.querySelector(".lb-video") : null;
  var lbTitle = lightbox ? lightbox.querySelector(".lb-title") : null;
  var lbClose = lightbox ? lightbox.querySelector(".lb-close") : null;
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var HERO_FPS = 24;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // Timecode in HH:MM:SS:FF, the way an edit timeline reads it.
  function timecode(seconds, fps) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    var f = Math.floor((seconds % 1) * fps);
    return pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }

  // Header: transparent over the dark hero, paper once scrolled past it.
  if (topbar) {
    var heroSection = document.querySelector(".hero");
    var onScroll = function () {
      var limit = heroSection ? heroSection.offsetHeight - topbar.offsetHeight : 8;
      topbar.classList.toggle("is-scrolled", window.scrollY > limit);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  // Hero reel: silent loop with a live timecode readout.
  if (hero && tc) {
    var renderTc = function () { tc.textContent = timecode(hero.currentTime, HERO_FPS); };

    if (reduceMotion) {
      hero.addEventListener("timeupdate", renderTc);
    } else {
      (function tick() {
        if (!hero.paused && !hero.ended) renderTc();
        window.requestAnimationFrame(tick);
      })();
    }

    if (reduceMotion) {
      hero.removeAttribute("autoplay");
      hero.pause();
    } else {
      var attempt = hero.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(function () {});
    }
  }

  function setSoundLabel() {
    if (!soundBtn || !hero) return;
    var on = !hero.muted;
    soundBtn.textContent = on ? "Mute" : "Unmute";
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
      }

  if (soundBtn && hero) {
    soundBtn.addEventListener("click", function () {
      hero.muted = !hero.muted;
      if (!hero.muted) {
        pauseAllWork();
        if (hero.paused) hero.play();
      }
      setSoundLabel();
    });
  }

  function muteHero() {
    if (hero && !hero.muted) {
      hero.muted = true;
      setSoundLabel();
    }
  }

  function pauseAllWork(except) {
    players.forEach(function (p) {
      var v = p.querySelector("video");
      if (v && v !== except && !v.paused) v.pause();
    });
  }

  // Lightbox: the full piece, with sound and native controls.
  function openLightbox(piece) {
    if (!lightbox || !lbVideo) return;
    var source = piece.querySelector("source");
    var url = source ? (source.src || source.getAttribute("src")) : "";
    if (!url) return;

    pauseAllWork();
    muteHero();
    if (hero && !hero.paused) hero.pause();

    lightbox.className = "lightbox " + (piece.classList.contains("portrait") ? "portrait" : "landscape");
    if (lbTitle) lbTitle.textContent = piece.getAttribute("data-title") || "";
    lbVideo.src = url;
    lbVideo.muted = false;

    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");

    var p = lbVideo.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
    else lightbox.removeAttribute("open");
  }

  if (lightbox && lbVideo) {
    lightbox.addEventListener("close", function () {
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.load();
      // The hero loop picks back up, silently.
      if (hero && hero.paused && !reduceMotion) {
        hero.muted = true;
        setSoundLabel();
        var r = hero.play();
        if (r && typeof r.catch === "function") r.catch(function () {});
      }
    });
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    // A click on the backdrop, outside the inner panel, closes it.
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lb-inner")) closeLightbox();
    });
  }

  // Hero reel opens in the lightbox with sound.
  if (heroPhone) {
    heroPhone.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(heroPhone);
    });
  }

  // Work pieces: hover previews silently, click opens the lightbox.
  players.forEach(function (p) {
    var video = p.querySelector("video");
    var button = p.querySelector(".play");
    var bar = p.querySelector(".progress i");
    if (!video || !button) return;

    function preview() {
      if (lightbox && lightbox.open) return;
      video.muted = true;
      var pr = video.play();
      if (pr && typeof pr.catch === "function") pr.catch(function () {});
    }
    function stopPreview() {
      video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
    }

    if (canHover) {
      p.addEventListener("mouseenter", preview);
      p.addEventListener("mouseleave", stopPreview);
    }

    function open(e) {
      e.preventDefault();
      e.stopPropagation();
      stopPreview();
      openLightbox(p);
    }
    button.addEventListener("click", open);
    video.addEventListener("click", open);

    video.addEventListener("timeupdate", function () {
      if (!bar || !video.duration) return;
      bar.style.transform = "scaleX(" + (video.currentTime / video.duration) + ")";
      p.classList.toggle("has-progress", video.currentTime > 0 && !video.ended);
    });
    video.addEventListener("ended", function () {
      video.currentTime = 0;
      p.classList.remove("has-progress");
      if (bar) bar.style.transform = "scaleX(0)";
    });
  });
})();
