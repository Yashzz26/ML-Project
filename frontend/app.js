const API = "http://127.0.0.1:5000/api";

const statusEl = document.getElementById("status");
const silhouetteEl = document.getElementById("silhouette");
const segmentsEl = document.getElementById("segments");
const evaluationEl = document.getElementById("evaluation");
const predictionEl = document.getElementById("prediction");

function money(value) {
  return `$${Number(value).toFixed(1)}k`;
}

async function getDashboard() {
  const res = await fetch(`${API}/dashboard`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Backend unavailable");
  return data;
}

function renderSegments(data) {
  segmentsEl.innerHTML = data.cluster_summary.map(row => {
    const cluster = String(row.Cluster);
    const label = data.cluster_labels[cluster] || {};
    return `
      <article class="segment">
        <div class="cluster-number">CLUSTER ${Number(row.Cluster) + 1}</div>
        <h3>${label.name || `Cluster ${row.Cluster}`}</h3>
        <div class="segment-stat"><span>Customers</span><strong>${row.Customer_Count}</strong></div>
        <div class="segment-stat"><span>Avg income</span><strong>${money(row.Average_Income)}</strong></div>
        <div class="segment-stat"><span>Avg spending</span><strong>${Number(row.Average_Spending_Score).toFixed(1)}</strong></div>
        <p>${label.strategy || ""}</p>
      </article>
    `;
  }).join("");
}

function renderEvaluation(data) {
  const best = Math.max(...data.evaluations.map(x => x.silhouette));
  evaluationEl.innerHTML = `
    <div class="eval-row">
      <strong>K</strong><strong>Inertia</strong><strong>Silhouette</strong>
    </div>
    ${data.evaluations.map(x => `
      <div class="eval-row ${x.k === 5 ? "best" : ""}">
        <span>${x.k}${x.k === 5 ? " ★" : ""}</span>
        <span>${x.inertia.toFixed(2)}</span>
        <span>${x.silhouette.toFixed(4)}${x.silhouette === best ? " · best" : ""}</span>
      </div>
    `).join("")}
  `;
}

async function init() {
  try {
    const data = await getDashboard();
    statusEl.textContent = "Model online";
    statusEl.style.color = "#1e7b4d";
    silhouetteEl.textContent = data.silhouette_score.toFixed(4);
    renderSegments(data);
    renderEvaluation(data);
  } catch (err) {
    statusEl.textContent = "Backend setup needed";
    statusEl.style.color = "#a93636";
    silhouetteEl.textContent = "—";
    segmentsEl.innerHTML = `<div class="card"><strong>${err.message}</strong><p class="muted">Train the model first, then start Flask.</p></div>`;
  }
}

document.getElementById("predictForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    income: Number(document.getElementById("income").value),
    spending_score: Number(document.getElementById("spending").value),
  };

  predictionEl.classList.remove("hidden");
  predictionEl.innerHTML = "<strong>Predicting…</strong>";

  try {
    const res = await fetch(`${API}/predict`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Prediction failed");

    predictionEl.innerHTML = `
      <div class="eyebrow">PREDICTED SEGMENT</div>
      <div class="result">${data.segment}</div>
      <p>${data.recommendation}</p>
      <p class="muted">
        Cluster ${data.cluster + 1} · centroid distance ${data.distance_to_centroid}
        · model silhouette ${data.silhouette_score}
      </p>
      <p class="muted">${data.note}</p>
    `;
  } catch (err) {
    predictionEl.innerHTML = `<strong>${err.message}</strong>`;
  }
});

init();
