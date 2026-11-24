/* Shared bilingual Study Guide renderer for all faculties.
   Modules can call DHPNStudyGuide.render({title,notes,points,tricks,diagrams,examples}).
   Existing module content is never modified or removed by this helper. */
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  const list = items => (items || []).map(item =>
    `<li>${typeof item === "string" ? esc(item) : `<b>${esc(item.title || "")}</b> ${esc(item.text || "")}`}</li>`
  ).join("");
  const cards = (items, kind) => (items || []).map(item => `
    <article class="dhsg-card">
      <h4>${esc(item.title || "")}</h4>
      ${item.en ? `<p>${esc(item.en)}</p>` : ""}
      ${item.ne ? `<p class="dhsg-ne">${esc(item.ne)}</p>` : ""}
      ${item.items ? `<ul>${list(item.items)}</ul>` : ""}
      ${kind === "diagram" && item.html ? `<div class="dhsg-diagram">${item.html}</div>` : ""}
    </article>`).join("");
  function render(data) {
    const d = data || {};
    return `
    <section class="dhsg">
      <header class="dhsg-head"><div><span>COMPLETE STUDY GUIDE</span><h3>${esc(d.title || "Study Guide")}</h3>
      <p>Study Notes • Important Points • Short Tricks • Visual Learning</p></div></header>
      <div class="dhsg-grid">
        <section class="dhsg-section"><h3>📘 Study Notes</h3>${cards(d.notes,"note") || '<p class="dhsg-empty">Notes are being prepared for this subject.</p>'}</section>
        <section class="dhsg-section"><h3>⭐ Important Points</h3>${cards(d.points,"point") || '<p class="dhsg-empty">Exam-focused points will be added.</p>'}</section>
        <section class="dhsg-section"><h3>⚡ Short Tricks</h3>${cards(d.tricks,"trick") || '<p class="dhsg-empty">Memory tricks will be added.</p>'}</section>
        <section class="dhsg-section"><h3>🖼️ Images & Diagrams</h3>${cards(d.diagrams,"diagram") || '<p class="dhsg-empty">Relevant labelled diagrams will be added.</p>'}</section>
        <section class="dhsg-section"><h3>🩺 Practical / Clinical Examples</h3>${cards(d.examples,"example") || '<p class="dhsg-empty">Subject-related practical examples will be added.</p>'}</section>
      </div>
    </section>
    <style>
      .dhsg{margin:14px 0;color:var(--text,#18364b)}.dhsg-head{padding:17px;border-radius:16px;background:linear-gradient(125deg,#e8f5ff,#effaf4);border:1px solid #d6e8ee;margin-bottom:12px}.dhsg-head span{font-size:11px;font-weight:800;letter-spacing:1.2px;color:#087b70}.dhsg-head h3{margin:5px 0;font-size:21px}.dhsg-head p{margin:0;color:#526b78;font-size:13px}.dhsg-grid{display:grid;gap:12px}.dhsg-section{border:1px solid var(--line,#dce6ed);border-radius:15px;padding:13px;background:var(--white,#fff);min-width:0}.dhsg-section>h3{font-size:16px;margin:0 0 10px}.dhsg-card{background:#f7fafc;border:1px solid #e1eaf0;border-radius:11px;padding:11px;margin:8px 0}.dhsg-card h4{font-size:14px;margin:0 0 6px}.dhsg-card p{font-size:13px;line-height:1.65;margin:5px 0}.dhsg-card ul{padding-left:19px;margin:6px 0}.dhsg-card li{font-size:13px;line-height:1.6;margin:4px 0}.dhsg-ne{color:#176044}.dhsg-diagram{overflow:auto;text-align:center}.dhsg-diagram img,.dhsg-diagram svg{max-width:100%;height:auto}.dhsg-empty{font-size:13px;color:var(--muted,#647887);margin:4px 0}@media(min-width:760px){.dhsg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dhsg-section:first-child{grid-column:1/-1}}
    </style>`;
  }
  window.DHPNStudyGuide = Object.freeze({ render });
})();