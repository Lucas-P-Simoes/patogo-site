// uninstall-feedback/app.js
// Coleta o feedback de desinstalação e envia ao Worker do PatoGo.

(function () {
  "use strict";

  const WORKER_URL = "https://divine-smoke-0c82.lucaspsimoes22.workers.dev";
  const ENDPOINT   = `${WORKER_URL}/uninstall-feedback`;

  // ── Lê dados da query string (preenchidos pela extensão via setUninstallURL) ──
  const params = new URLSearchParams(window.location.search);
  const userEmail   = (params.get("email") || "").trim();
  const userName    = (params.get("name")  || "").trim();
  const userPlan    = (params.get("plan")  || "").trim() || "free";
  const extVersion  = (params.get("v")     || "").trim();

  const form         = document.getElementById("feedbackForm");
  const submitBtn    = document.getElementById("submitBtn");
  const errorMessage = document.getElementById("errorMessage");
  const formWrapper  = document.getElementById("formWrapper");
  const successMsg   = document.getElementById("successMessage");

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add("visible");
  }

  function hideError() {
    errorMessage.classList.remove("visible");
    errorMessage.textContent = "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const reason          = document.getElementById("reason").value.trim();
    const missingFeature  = document.getElementById("missingFeature").value.trim();
    const desiredFeature  = document.getElementById("desiredFeature").value.trim();
    const comment         = document.getElementById("comment").value.trim();

    if (!reason) {
      showError("Por favor, selecione um motivo.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    const payload = {
      name:              userName,
      email:             userEmail,
      plan:              userPlan,
      reason:            reason,
      missing_feature:   missingFeature,
      desired_feature:   desiredFeature,
      comment:           comment,
      extension_version: extVersion,
      created_at:        new Date().toISOString(),
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const detail = data.error === "rate_limited"
          ? "Muitos envios em pouco tempo. Aguarde alguns minutos e tente novamente."
          : (data.detail || data.error || `Erro HTTP ${res.status}`);
        throw new Error(detail);
      }

      // Sucesso: esconde o formulário e mostra a mensagem
      formWrapper.style.display = "none";
      successMsg.classList.add("visible");

    } catch (err) {
      showError("Não foi possível enviar seu feedback: " + (err.message || "erro desconhecido"));
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar feedback";
    }
  });
})();
