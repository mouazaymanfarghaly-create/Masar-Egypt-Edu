let data = JSON.parse(localStorage.getItem("masar_admin_data") || "null") || JSON.parse(JSON.stringify(TEACHERS));

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem("masar_admin_data", JSON.stringify(data));
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function message(text) {
  $("message").textContent = text;
  $("message").style.display = "block";
  setTimeout(() => $("message").style.display = "none", 2600);
}

function render() {
  $("adminList").innerHTML = data.length ? data.map(t => `
    <div class="admin-item">
      <div>
        <strong>${esc(t.name)}</strong><br>
        <span class="help">${esc(t.subject)} — ${(t.lessons||[]).length} درس</span>
      </div>
      <button class="btn danger" onclick="deleteTeacher(${t.id})">حذف المدرس</button>
    </div>
  `).join("") : `<p class="help">لا يوجد مدرسون.</p>`;

  $("teacherSelect").innerHTML = data.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
}

$("teacherForm").addEventListener("submit", e => {
  e.preventDefault();
  const teacher = {
    id: Date.now(),
    name: $("name").value.trim(),
    subject: $("subject").value.trim(),
    grades: $("grades").value.split(",").map(x=>x.trim()).filter(Boolean),
    stage: $("stage").value,
    image: $("image").value.trim(),
    bio: $("bio").value.trim(),
    youtubeChannel: $("youtubeChannel").value.trim(),
    lessons: []
  };
  data.push(teacher);
  save(); render(); e.target.reset(); message("تمت إضافة المدرس محليًا.");
});

$("lessonForm").addEventListener("submit", e => {
  e.preventDefault();
  const teacher = data.find(t => t.id === Number($("teacherSelect").value));
  if (!teacher) return;
  teacher.lessons = teacher.lessons || [];
  teacher.lessons.push({
    id: Date.now(),
    title: $("lessonTitle").value.trim(),
    description: $("lessonDescription").value.trim(),
    youtubeUrl: $("lessonUrl").value.trim(),
    thumbnail: $("thumbnail").value.trim(),
    published: true
  });
  save(); render(); e.target.reset(); message("تمت إضافة الدرس محليًا.");
});

window.deleteTeacher = function(id) {
  if (!confirm("هل تريد حذف هذا المدرس وكل دروسه من البيانات المحلية؟")) return;
  data = data.filter(t => t.id !== id);
  save(); render(); message("تم حذف المدرس.");
};

$("exportBtn").addEventListener("click", () => {
  const content = `// بيانات منصة مسار — تم إنشاؤها من أداة الإدارة المحلية\nconst TEACHERS = ${JSON.stringify(data, null, 2)};\n`;
  const blob = new Blob([content], {type:"application/javascript;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "teachers.js";
  a.click();
  URL.revokeObjectURL(a.href);
  message("تم تنزيل teachers.js. استبدل الملف القديم داخل المشروع.");
});

$("resetBtn").addEventListener("click", () => {
  if (!confirm("سيتم حذف التعديلات المحلية وإرجاع البيانات التجريبية. هل أنت متأكد؟")) return;
  localStorage.removeItem("masar_admin_data");
  data = JSON.parse(JSON.stringify(TEACHERS));
  render(); message("تمت إعادة البيانات الأصلية.");
});

render();
