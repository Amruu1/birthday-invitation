/**
 * INTERACTIVE DIGITAL BIRTHDAY INVITATION — SCRIPT.JS (NO NAVBAR)
 * Perpindahan halaman menggunakan tombol Next pada setiap kartu.
 */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. ELEMEN DOM UTAMA
  ========================================================== */
  const openingScreen = document.getElementById("openingScreen");
  const coverStep = document.getElementById("coverStep");
  const passcodeStep = document.getElementById("passcodeStep");
  const btnOpenInvitationBottom = document.getElementById("btnOpenInvitationBottom");

  const passcodeOptions = document.querySelectorAll(".passcode-option");
  const passcodeModal = document.getElementById("passcodeModal");
  const modalFaceIcon = document.getElementById("modalFaceIcon");
  const modalFeedbackText = document.getElementById("modalFeedbackText");
  const modalActionBtn = document.getElementById("modalActionBtn");

  const mainContent = document.getElementById("mainContent");
  const sections = document.querySelectorAll(".inv-section");
  const nextButtons = document.querySelectorAll(".section-next-btn[data-goto]");

  /* =========================================================
     2. KONTROL MUSIK (Play / Off) — memakai <audio id="bgMusic"> yang sudah ada
  ========================================================== */
  const bgMusic = document.getElementById("bgMusic");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  let musicAutoStartDone = false; // auto-play via Next hanya sekali
  let musicUserStopped = false;   // true jika pengguna menekan Off -> Next tidak boleh menyalakan lagi

  // Tombol selalu mengikuti kondisi audio sebenarnya (bukan flag terpisah)
  function syncMusicButton() {
    if (!bgMusic || !musicToggleBtn) return;
    const isPlaying = !bgMusic.paused && !bgMusic.ended;
    musicToggleBtn.classList.toggle("playing", isPlaying);
    musicToggleBtn.setAttribute("aria-pressed", String(isPlaying));
    musicToggleBtn.setAttribute("aria-label", isPlaying ? "Matikan musik (Off)" : "Putar musik (Play)");
    musicToggleBtn.title = isPlaying ? "Off" : "Play";
  }

  function playMusic() {
    if (!bgMusic) return Promise.resolve(false);
    try {
      const result = bgMusic.play();
      if (result && typeof result.then === "function") {
        return result.then(() => true).catch(() => { syncMusicButton(); return false; });
      }
    } catch (err) {
      syncMusicButton();
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  // Dipanggil saat tombol Next ditekan: hanya menyalakan musik pada Next pertama
  function autoStartMusicOnNext() {
    if (musicAutoStartDone || musicUserStopped) return;
    musicAutoStartDone = true;
    playMusic().then((ok) => { if (!ok && !musicUserStopped) musicAutoStartDone = false; });
  }

  if (bgMusic && musicToggleBtn) {
    ["play", "playing", "pause", "ended", "error", "emptied", "abort"].forEach((evt) =>
      bgMusic.addEventListener(evt, syncMusicButton)
    );

    musicToggleBtn.addEventListener("click", () => {
      musicAutoStartDone = true;
      if (bgMusic.paused) {
        musicUserStopped = false;
        playMusic(); // melanjutkan dari posisi terakhir
      } else {
        musicUserStopped = true;
        bgMusic.pause();
      }
      syncMusicButton();
    });

    syncMusicButton();
  }

  /* =========================================================
     3. OPENING SCREEN & PASSCODE GATE (Sesuai 00:07 - 00:27)
  ========================================================== */
  function goToPasscodeStep() {
    coverStep.classList.remove("active-step");
    passcodeStep.classList.add("active-step");
  }

  btnOpenInvitationBottom.addEventListener("click", () => {
    autoStartMusicOnNext(); // Next paling awal (cover, sebelum passcode)
    goToPasscodeStep();
  });


  const sadFaceSVG = `
    <svg viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="34" stroke="#F4F1EA" stroke-width="3.5"/>
      <circle cx="28" cy="32" r="3.5" fill="#F4F1EA"/>
      <circle cx="52" cy="32" r="3.5" fill="#F4F1EA"/>
      <path d="M26,56 C32,46 48,46 54,56" stroke="#F4F1EA" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
  `;

  const happyFaceSVG = `
    <svg viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="34" stroke="#F4F1EA" stroke-width="3.5"/>
      <circle cx="28" cy="32" r="3.5" fill="#F4F1EA"/>
      <circle cx="52" cy="32" r="3.5" fill="#F4F1EA"/>
      <path d="M26,46 C32,58 48,58 54,46" stroke="#F4F1EA" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
  `;

  let passcodeUnlocked = false;

  passcodeOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";
      passcodeUnlocked = isCorrect;

      if (isCorrect) {
        modalFaceIcon.innerHTML = happyFaceSVG;
        modalFeedbackText.textContent = "Yayy Berhasill !!";
        modalActionBtn.textContent = "Next";
      } else {
        modalFaceIcon.innerHTML = sadFaceSVG;
        modalFeedbackText.textContent = "! Kata Kunci Salah !";
        modalActionBtn.textContent = "Coba Lagi";
      }

      passcodeModal.classList.remove("hidden");
    });
  });

  modalActionBtn.addEventListener("click", () => {
    passcodeModal.classList.add("hidden");
    if (passcodeUnlocked) {
      autoStartMusicOnNext(); // Next paling awal (setelah passcode benar)
      enterMainInvitation();
    }
  });

  function enterMainInvitation() {
    openingScreen.classList.add("hidden");
    mainContent.classList.remove("hidden");
    switchSection("section-home");
  }

  /* =========================================================
     4. PERPINDAHAN HALAMAN (NEXT SAJA)
  ========================================================== */
  function switchSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection || !targetSection.classList.contains("inv-section")) {
      console.warn(`Bagian tujuan tidak ditemukan: ${targetId}`);
      return;
    }

    sections.forEach((sec) => {
      if (sec.id === targetId) {
        sec.classList.add("active-section");
      } else {
        sec.classList.remove("active-section");
      }
    });

    const activeCard = targetSection.querySelector(".stage-card");
    if (activeCard) activeCard.scrollTo({ top: 0, behavior: "smooth" });

    if (targetId === "section-wishes") {
      runTypewriterEffect();
    }
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-goto");
      autoStartMusicOnNext();
      switchSection(targetId);
    });
  });

  function runTypewriterEffect() {
    const container = document.getElementById("wishesTypewriter");
    if (!container || container.getAttribute("data-typed") === "true") return;

    container.setAttribute("data-typed", "true");
    const paragraphs = container.querySelectorAll("p");

    paragraphs.forEach((p, idx) => {
      p.style.opacity = "0";
      p.style.transform = "translateY(8px)";
      p.style.transition = "opacity 0.6s ease, transform 0.6s ease";

      setTimeout(() => {
        p.style.opacity = "1";
        p.style.transform = "translateY(0)";
      }, idx * 450);
    });
  }

  /* =========================================================
     5. LIGHTBOX PADA GALLERY
  ========================================================== */
  const galleryItems = document.querySelectorAll(".gallery-polaroid");
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const imgEl = item.querySelector("img");
      const captionText = item.getAttribute("data-caption") || "";

      lightboxImage.src = imgEl.src;
      lightboxImage.alt = imgEl.alt;
      lightboxCaption.textContent = captionText;
      lightboxModal.classList.remove("hidden");
    });
  });

  function closeLightbox() {
    lightboxModal.classList.add("hidden");
    lightboxImage.src = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightboxModal.classList.contains("hidden")) {
      closeLightbox();
    }
  });

  /* =========================================================
     6. SPECIAL GIFT UNBOXING & MAKE A WISH INTERACTION
  ========================================================== */
  const btnUnboxGift = document.getElementById("btnUnboxGift");
  const giftClosedView = document.getElementById("giftClosedView");
  if (btnUnboxGift) {
    btnUnboxGift.addEventListener("click", () => {
      btnUnboxGift.classList.add("unboxing");
      btnUnboxGift.disabled = true;
      setTimeout(() => {
        switchSection("section-flowers");
        btnUnboxGift.classList.remove("unboxing");
        btnUnboxGift.disabled = false;
      }, 550);
    });
  }

  const btnBlowCandle = document.getElementById("btnBlowCandle");
  const candleFlames = document.getElementById("candleFlames");
  const candleStatusText = document.getElementById("candleStatusText");

  if (btnBlowCandle && candleFlames) {
    btnBlowCandle.addEventListener("click", () => {
      candleFlames.classList.toggle("extinguished");
      const isOut = candleFlames.classList.contains("extinguished");
      if (isOut) {
        candleStatusText.textContent =
          "✨ Yayyyy lilin ditiup, semoga seluruh harapan terbaikmu terkabul yaaa. ✨";
      } else {
        candleStatusText.textContent =
          "Sentuh kue ulang tahun di atas untuk meniup lilin dan membuat harapan";
      }
    });
  }
});