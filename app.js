// ======================================================
// Supabase
// ======================================================

const SUPABASE_URL = "https://meftmrgkqvdvurvrkrkc.supabase.co";

const SUPABASE_KEY = "sb_publishable_IFLpHM_wfabV4dYtQXRTiA_CjFm-a5j";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================================================
// Application State
// ======================================================

const state = {
  query: "",
  subject: "",
  grade: ""
};

const $ = (id) => document.getElementById(id);


// ======================================================
// Data Helpers
// ======================================================

function allLessons() {
  return TEACHERS.flatMap(t =>
    (t.lessons || []).map(l => ({
      ...l,
      teacher: t
    }))
  );
}

function subjects() {
  return [
    ...new Set(
      TEACHERS
        .map(t => t.subject)
        .filter(Boolean)
    )
  ].sort();
}

function grades() {
  return [
    ...new Set(
      TEACHERS.flatMap(t => t.grades || [])
    )
  ].sort();
}

function initials(name) {
  return (name || "م")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0])
    .join("");
}


// ======================================================
// YouTube
// ======================================================

function youtubeId(url) {
  if (!url) return "";

  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
  );

  return m ? m[1] : "";
}

function youtubeEmbed(url) {
  const id = youtubeId(url);

  return id
    ? `<div class="video-wrap">
        <iframe
          src="https://www.youtube.com/embed/${id}"
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>`
    : "";
}


// ======================================================
// Security
// ======================================================

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}


// ======================================================
// Statistics
// ======================================================

function renderStats() {
  $("teacherCount").textContent = TEACHERS.length;
  $("lessonCount").textContent = allLessons().length;
  $("subjectCount").textContent = subjects().length;
}


// ======================================================
// Filters
// ======================================================

function populateFilters() {
  $("subjectFilter").innerHTML =
    `<option value="">كل المواد</option>` +
    subjects()
      .map(s =>
        `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`
      )
      .join("");

  $("gradeFilter").innerHTML =
    `<option value="">كل الصفوف</option>` +
    grades()
      .map(g =>
        `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
      )
      .join("");
}


// ======================================================
// Filtering
// ======================================================

function filteredTeachers() {
  const q = state.query.trim().toLowerCase();

  return TEACHERS.filter(t => {
    const text = [
      t.name,
      t.subject,
      t.stage,
      t.bio,
      ...(t.grades || []),
      ...(t.lessons || []).map(l =>
        `${l.title} ${l.description}`
      )
    ]
      .join(" ")
      .toLowerCase();

    const queryOk =
      !q || text.includes(q);

    const subjectOk =
      !state.subject || t.subject === state.subject;

    const gradeOk =
      !state.grade ||
      (t.grades || []).includes(state.grade);

    return queryOk && subjectOk && gradeOk;
  });
}


// ======================================================
// Teacher Card
// ======================================================

function teacherCard(t) {
  const photo = t.image
    ? `<img src="${escapeHtml(t.image)}" alt="${escapeHtml(t.name)}">`
    : `<span>${escapeHtml(initials(t.name))}</span>`;

  const tags = (t.grades || [])
    .slice(0, 3)
    .map(g =>
      `<span class="tag">${escapeHtml(g)}</span>`
    )
    .join("");

  return `
    <article class="teacher-card">
      <div class="teacher-photo">
        ${photo}
      </div>

      <div class="teacher-body">
        <div class="teacher-subject">
          ${escapeHtml(t.subject || "مادة تعليمية")}
        </div>

        <h3>
          ${escapeHtml(t.name)}
        </h3>

        <div class="tag-row">
          ${tags}
        </div>

        <p class="teacher-bio">
          ${escapeHtml(
            t.bio || "لا توجد نبذة مضافة حتى الآن."
          )}
        </p>

        <div class="card-actions">

          <button
            class="btn btn-primary"
            onclick="openTeacher(${t.id})">
            عرض المدرس
          </button>

          ${
            t.youtubeChannel
              ? `<a
                  class="btn btn-outline"
                  target="_blank"
                  rel="noopener"
                  href="${escapeHtml(t.youtubeChannel)}">
                  YouTube
                </a>`
              : ""
          }

        </div>
      </div>
    </article>
  `;
}


// ======================================================
// Render Teachers
// ======================================================

function renderTeachers() {
  const list = filteredTeachers();

  $("teacherGrid").innerHTML =
    list.map(teacherCard).join("");

  $("emptyState").hidden =
    list.length !== 0;

  $("resultsText").textContent =
    `${list.length} مدرس متاح حاليًا`;
}


// ======================================================
// Render Subjects
// ======================================================

function renderSubjects() {
  $("subjectGrid").innerHTML =
    subjects()
      .map(s => {

        const count =
          TEACHERS.filter(t => t.subject === s).length;

        return `
          <button
            class="subject-card"
            onclick="filterBySubject('${escapeHtml(s).replace(/'/g, "\\'")}')">

            ${escapeHtml(s)}

            <span>
              ${count} مدرس
            </span>

          </button>
        `;
      })
      .join("");
}


// ======================================================
// Subject Filter
// ======================================================

function filterBySubject(subject) {
  state.subject = subject;

  $("subjectFilter").value = subject;

  renderTeachers();

  document
    .querySelector("#teachers")
    .scrollIntoView({
      behavior: "smooth"
    });
}


// ======================================================
// Teacher Modal
// ======================================================

function openTeacher(id) {
  const t = TEACHERS.find(x => x.id === id);

  if (!t) return;

  const lessons =
    (t.lessons || [])
      .filter(l => l.published !== false);

  $("modalContent").innerHTML = `
    <div class="teacher-modal-head">

      <span class="eyebrow">
        ${escapeHtml(t.stage || "منصة مسار")}
      </span>

      <h2>
        ${escapeHtml(t.name)}
      </h2>

      <p>
        <strong>
          ${escapeHtml(t.subject || "")}
        </strong>
      </p>

      <p>
        ${escapeHtml(t.bio || "")}
      </p>

      ${
        t.youtubeChannel
          ? `<a
              class="btn btn-outline"
              target="_blank"
              rel="noopener"
              href="${escapeHtml(t.youtubeChannel)}">
              قناة YouTube
            </a>`
          : ""
      }

    </div>

    <hr>

    <h3>
      الدروس والفيديوهات (${lessons.length})
    </h3>

    ${
      lessons.length
        ? lessons.map(l => `
            <div class="lesson">

              <h4>
                ${escapeHtml(l.title)}
              </h4>

              <p>
                ${escapeHtml(l.description || "")}
              </p>

              ${youtubeEmbed(l.youtubeUrl)}

              ${
                l.youtubeUrl
                  ? `<a
                      class="btn btn-outline btn-small"
                      target="_blank"
                      rel="noopener"
                      href="${escapeHtml(l.youtubeUrl)}">
                      مشاهدة على YouTube
                    </a>`
                  : ""
              }

            </div>
          `).join("")
        : `
          <div class="empty">
            <p>
              لم تتم إضافة دروس لهذا المدرس بعد.
            </p>
          </div>
        `
    }

  `;

  $("teacherModal").hidden = false;

  document.body.style.overflow = "hidden";
}


// ======================================================
// Close Modal
// ======================================================

function closeModal() {
  $("teacherModal").hidden = true;
  document.body.style.overflow = "";
}


// ======================================================
// Search
// ======================================================

function runSearch(value) {
  state.query = value;
  renderTeachers();
}


// ======================================================
// Events
// ======================================================

$("globalSearch").addEventListener(
  "input",
  e => runSearch(e.target.value)
);

$("subjectFilter").addEventListener(
  "change",
  e => {
    state.subject = e.target.value;
    renderTeachers();
  }
);

$("gradeFilter").addEventListener(
  "change",
  e => {
    state.grade = e.target.value;
    renderTeachers();
  }
);

$("clearFilters").addEventListener(
  "click",
  () => {
    state.query = "";
    state.subject = "";
    state.grade = "";

    $("globalSearch").value = "";
    $("subjectFilter").value = "";
    $("gradeFilter").value = "";

    renderTeachers();
  }
);

$("modalClose").addEventListener(
  "click",
  closeModal
);

$("teacherModal").addEventListener(
  "click",
  e => {
    if (e.target.dataset.close) {
      closeModal();
    }
  }
);

$("menuBtn").addEventListener(
  "click",
  () => {
    document
      .querySelector(".navbar")
      .classList.toggle("menu-open");
  }
);

document
  .querySelectorAll(".filter-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        state.grade =
          btn.dataset.grade;

        $("gradeFilter").value =
          state.grade;

        renderTeachers();

        document
          .querySelector("#teachers")
          .scrollIntoView({
            behavior: "smooth"
          });
      }
    );

  });


// ======================================================
// Start Application
// ======================================================

renderStats();
populateFilters();
renderTeachers();
renderSubjects();
