let data = [];

const $ = id => document.getElementById(id);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}

function message(text) {
  const box = $("message");

  if (!box) return;

  box.textContent = text;
  box.style.display = "block";

  setTimeout(function () {
    box.style.display = "none";
  }, 2600);
}

async function loadTeachers() {
  const result = await supabaseClient
    .from("teachers")
    .select("*")
    .order("name");

  if (result.error) {
    console.error(result.error);
    message("حدث خطأ في تحميل المدرسين.");
    return;
  }

  data = result.data || [];
  render();
}

function render() {
  const list = $("adminList");
  const select = $("teacherSelect");

  if (!list || !select) return;

  list.innerHTML = data.length
    ? data.map(function (teacher) {
        return `
          <div class="admin-item">
            <div>
              <strong>${esc(teacher.name)}</strong><br>
              <span class="help">${esc(teacher.subject)}</span>
            </div>
          </div>
        `;
      }).join("")
    : `<p class="help">لا يوجد مدرسون.</p>`;

  select.innerHTML = data.length
    ? data.map(function (teacher) {
        return `<option value="${teacher.id}">${esc(teacher.name)}</option>`;
      }).join("")
    : `<option value="">لا يوجد مدرسون</option>`;
}

$("teacherForm").addEventListener("submit", async function (e) {
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
    message("اكتب اسم المدرس والمادة.");
    return;
  }

  const result = await supabaseClient
    .from("teachers")
    .insert(teacher)
    .select()
    .single();

  if (result.error) {
    console.error(result.error);
    message("حدث خطأ أثناء إضافة المدرس.");
    return;
  }

  data.push(result.data);

  render();
  e.target.reset();

  message("تمت إضافة المدرس بنجاح.");
});

loadTeachers();
