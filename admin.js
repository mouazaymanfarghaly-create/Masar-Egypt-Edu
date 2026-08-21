let data = [];

const $ = id => document.getElementById(id);

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]);
}

function message(text) {
  $("message").textContent = text;
  $("message").style.display = "block";

  setTimeout(() => {
    $("message").style.display = "none";
  }, 2600);
}

async function loadTeachers() {
  const { data: teachers, error } = await supabaseClient
    .from("teachers")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    message("حدث خطأ في تحميل المدرسين.");
    return;
  }

  data = teachers || [];
  render();
}

function render() {
  $("adminList").innerHTML = data.length
    ? data.map(t => `
      <div class="admin-item">
        <div>
          <strong>${esc(t.name)}</strong><br>
          <span class="help">${esc(t.subject)}</span>
        </div>

        <button class="btn danger" onclick="deleteTeacher('${t.id}')">
          حذف المدرس
        </button>
      </div>
    `).join("")
    : `<p class="help">لا يوجد مدرسون.</p>`;

  $("teacherSelect").innerHTML = data.length
    ? data.map(t => `
      <option value="${t.id}">
        ${esc(t.name)}
      </option>
    `).join("")
    : `<option value="">لا يوجد مدرسون</option>`;
}

$("teacherForm").addEventListener("submit", async e => {
  e.preventDefault();

  const teacher = {
    name: $("name").value.trim(),
    subject: $("subject").value.trim(),
    grades: $("grades").value.trim(),
    stage: $("stage").value,
    image: $("image").value.trim(),
    bio: $("bio").value.trim(),
    youtube_channel: $("youtubeChannel").value.trim()
  };

  if (!teacher.name || !teacher.subject) {
    message("اكتب اسم المدرس والمادة أولًا.");
    return;
  }

  const { data: newTeacher, error } = await supabaseClient
    .from("teachers")
    .insert(teacher)
    .select()
    .single();

  if (error) {
    console.error(error);
    message("حدث خطأ أثناء إضافة المدرس.");
    return;
  }

  data.push(newTeacher);

  render();
  e.target.reset();

  message("تمت إضافة المدرس بنجاح.");
});

window.deleteTeacher = async function(id) {
  if (!confirm("هل تريد حذف هذا المدرس؟")) {
    return;
  }

  const { error } = await supabaseClient
    .from("teachers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    message("حدث خطأ أثناء حذف المدرس.");
    return;
  }

  data = data.filter(t => t.id !== id);

  render();

  message("تم حذف المدرس.");
};

$("lessonForm").addEventListener("submit", e => {
  e.preventDefault();

  message("إضافة الدروس سنربطها بقاعدة البيانات في الخطوة التالية.");
});

loadTeachers();
