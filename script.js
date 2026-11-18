
"use strict";

// ======================================
// MATH & PROGRAMMING ACADEMY
// ======================================

const $ = id => document.getElementById(id);

let currentUser = null;
let currentLesson = null;
let exerciseIndex = 0;
let exerciseAnswered = false;
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let calcExpression = "";

// ======================================
// DATABASE LOCALSTORAGE
// ======================================

function getUsers() {
    return JSON.parse(localStorage.getItem("mpa_users") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("mpa_users", JSON.stringify(users));
}

function dataKey() {
    return "mpa_data_" + currentUser;
}

function getData() {
    return JSON.parse(localStorage.getItem(dataKey()) ||
        '{"completed":[],"history":[],"scores":[],"quizCount":0}');
}

function saveData(data) {
    localStorage.setItem(dataKey(), JSON.stringify(data));
}

function addHistory(message) {
    const data = getData();

    data.history.unshift({
        message,
        date: new Date().toLocaleString("id-ID")
    });

    data.history = data.history.slice(0, 50);
    saveData(data);
}

// ======================================
// AUTHENTICATION
// ======================================

$("toRegister").onclick = () => {
    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");
};

$("toLogin").onclick = () => {
    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
};

$("registerBtn").onclick = register;
$("loginBtn").onclick = login;
$("logoutBtn").onclick = logout;

function register() {
    const name = $("regName").value.trim();
    const username = $("regUsername").value.trim();
    const password = $("regPassword").value;

    if (!name || !username || !password) {
        return notify("Semua kolom wajib diisi!");
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return notify("Username 3-20 karakter, gunakan huruf, angka, atau _.");
    }

    if (password.length < 4) {
        return notify("Password minimal 4 karakter!");
    }

    const users = getUsers();

    if (users[username]) {
        return notify("Username sudah digunakan!");
    }

    users[username] = { name, password };
    saveUsers(users);

    localStorage.setItem("mpa_data_" + username,
        JSON.stringify({
            completed: [],
            history: [],
            scores: [],
            quizCount: 0
        })
    );

    notify("Akun berhasil dibuat. Silakan login!");

    $("regName").value = "";
    $("regUsername").value = "";
    $("regPassword").value = "";

    $("toLogin").click();
}

function login() {
    const username = $("loginUsername").value.trim();
    const password = $("loginPassword").value;
    const users = getUsers();

    if (!users[username] || users[username].password !== password) {
        return notify("Username atau password salah!");
    }

    currentUser = username;
    localStorage.setItem("mpa_session", username);
    openApp();
}

function logout() {
    localStorage.removeItem("mpa_session");
    currentUser = null;

    $("app").classList.add("hidden");
    $("authPage").classList.remove("hidden");
    notify("Kamu berhasil keluar.");
}

function openApp() {
    const user = getUsers()[currentUser];

    if (!user) return logout();

    $("authPage").classList.add("hidden");
    $("app").classList.remove("hidden");

    $("welcomeName").textContent = user.name;
    $("topName").textContent = user.name;
    $("sidebarName").textContent = user.name;
    $("avatar").textContent = user.name.charAt(0).toUpperCase();

    renderLessons();
    updateDashboard();
    showPage("dashboard");
}

// ======================================
// MATERI PEMBELAJARAN
// ======================================

const mathLessons = [
    {
        id: "m1",
        title: "Aljabar",
        description: "Variabel, persamaan, dan pertidaksamaan.",
        content: `Aljabar merupakan cabang matematika yang menggunakan huruf dan simbol untuk mewakili bilangan.

Variabel adalah simbol yang nilainya belum diketahui.

Persamaan linear satu variabel memiliki bentuk umum:
ax + b = 0

Langkah penyelesaian:
1. Sederhanakan persamaan.
2. Pindahkan konstanta.
3. Bagi dengan koefisien variabel.`,
        example: `2x + 4 = 10
2x = 10 - 4
2x = 6
x = 3`
    },
    {
        id: "m2",
        title: "Kalkulus",
        description: "Limit, turunan, dan integral.",
        content: `Kalkulus mempelajari perubahan dan akumulasi.

Turunan digunakan untuk mengetahui laju perubahan suatu fungsi.

Integral digunakan untuk menghitung luas dan akumulasi.

Aturan turunan pangkat:
Jika f(x) = x^n, maka f'(x) = n x^(n-1).`,
        example: `f(x) = x^3
f'(x) = 3x^2

Jika x = 2:
f'(2) = 3(2)^2 = 12`
    },
    {
        id: "m3",
        title: "Statistika Deskriptif",
        description: "Mean, median, modus, variansi.",
        content: `Statistika deskriptif digunakan untuk menggambarkan karakteristik suatu kumpulan data.

Mean adalah rata-rata.
Median adalah nilai tengah.
Modus adalah nilai yang paling sering muncul.

Variansi mengukur tingkat penyebaran data dari rata-ratanya.`,
        example: `Data: 70, 80, 90

Mean = (70 + 80 + 90) / 3
Mean = 80`
    },
    {
        id: "m4",
        title: "Matriks",
        description: "Operasi, determinan, dan invers.",
        content: `Matriks adalah susunan bilangan dalam baris dan kolom.

Determinan matriks 2x2:
A = [a b]
    [c d]

det(A) = ad - bc

Invers matriks dapat dihitung jika determinannya tidak sama dengan nol.`,
        example: `A = [1 2]
    [3 4]

det(A) = (1 × 4) - (2 × 3)
det(A) = -2`
    },
    {
        id: "m5",
        title: "Persamaan Diferensial",
        description: "Persamaan yang melibatkan turunan.",
        content: `Persamaan diferensial merupakan persamaan matematika yang mengandung fungsi dan turunannya.

Contoh model pertumbuhan eksponensial:
dP/dt = kP

Solusi:
P(t) = P0 e^(kt)

P0 adalah populasi awal dan k adalah konstanta pertumbuhan.`,
        example: `P0 = 100
k = 0.5
t = 2

P(2) = 100e^(0.5 × 2)
P(2) = 100e
P(2) ≈ 271.83`
    },
    {
        id: "m6",
        title: "Teori Graf",
        description: "Simpul, sisi, Dijkstra, Prim, Kruskal.",
        content: `Graf merupakan struktur yang terdiri atas simpul (vertex) dan sisi (edge).

Jenis graf:
1. Graf berarah.
2. Graf tidak berarah.
3. Graf berbobot.

Algoritma Dijkstra digunakan untuk mencari lintasan terpendek pada graf dengan bobot nonnegatif.`,
        example: `V = {A, B, C}
E = {(A,B), (B,C)}

Bobot:
A-B = 4
B-C = 3

Jarak A ke C = 4 + 3 = 7`
    }
];

const programLessons = [
    {
        id: "p1",
        title: "Dasar Python",
        description: "Pengenalan bahasa pemrograman Python.",
        content: `Python adalah bahasa pemrograman tingkat tinggi yang mudah dipahami.

Python digunakan untuk:
- Analisis data.
- Komputasi matematika.
- Machine Learning.
- Otomatisasi.`,
        example: `nama = "Irfan"
print("Halo", nama)`
    },
    {
        id: "p2",
        title: "Variabel dan Tipe Data",
        description: "String, integer, float, boolean.",
        content: `Variabel digunakan untuk menyimpan nilai.

Jenis tipe data:
String: teks.
Integer: bilangan bulat.
Float: bilangan desimal.
Boolean: True atau False.`,
        example: `nama = "Irfan"
umur = 20
ipk = 3.75
aktif = True

print(nama)
print(umur)`
    },
    {
        id: "p3",
        title: "Percabangan If Else",
        description: "Membuat keputusan dalam program.",
        content: `Percabangan digunakan untuk menjalankan perintah berdasarkan kondisi.

Struktur:
if kondisi:
    perintah
else:
    perintah lainnya`,
        example: `nilai = 85

if nilai >= 75:
    print("Lulus")
else:
    print("Tidak Lulus")`
    },
    {
        id: "p4",
        title: "Perulangan For dan While",
        description: "Mengulang perintah dalam program.",
        content: `For digunakan untuk mengulang berdasarkan urutan data atau rentang.

While mengulang selama kondisi bernilai True.`,
        example: `for i in range(1, 6):
    print(i)

i = 1
while i <= 5:
    print(i)
    i += 1`
    },
    {
        id: "p5",
        title: "Function",
        description: "Membuat fungsi dan parameter.",
        content: `Function merupakan blok kode yang memiliki tugas tertentu.

Function membantu:
- Mengurangi pengulangan kode.
- Membuat program lebih terstruktur.
- Mempermudah pemeliharaan.`,
        example: `def tambah(a, b):
    return a + b

hasil = tambah(5, 3)
print(hasil)`
    },
    {
        id: "p6",
        title: "HTML dan CSS",
        description: "Membuat struktur dan tampilan website.",
        content: `HTML adalah bahasa markup untuk membangun struktur halaman website.

CSS digunakan untuk mengatur tampilan, warna, ukuran, dan tata letak halaman.`,
        example: `<h1>Halo Dunia</h1>

<style>
h1 {
    color: blue;
}
</style>`
    },
    {
        id: "p7",
        title: "JavaScript",
        description: "Membuat website interaktif.",
        content: `JavaScript adalah bahasa pemrograman yang membuat halaman web menjadi interaktif.

JavaScript dapat mengolah data, merespons klik, memvalidasi formulir, dan memperbarui halaman.`,
        example: `let nilai = 90;

if (nilai >= 75) {
    console.log("Lulus");
} else {
    console.log("Tidak Lulus");
}`
    },
    {
        id: "p8",
        title: "Algoritma dan Sorting",
        description: "Bubble sort, selection sort, searching.",
        content: `Algoritma merupakan langkah sistematis untuk menyelesaikan masalah.

Sorting adalah proses mengurutkan data.

Searching adalah proses mencari data.`,
        example: `let angka = [5, 2, 8, 1];

angka.sort((a, b) => a - b);

console.log(angka);`
    },
    {
        id: "p9",
        title: "NumPy dan Komputasi",
        description: "Array dan operasi matematika Python.",
        content: `NumPy adalah library Python untuk komputasi numerik.

Fitur:
- Array multidimensi.
- Operasi matriks.
- Aljabar linear.
- Operasi statistik.`,
        example: `import numpy as np

data = np.array([10, 20, 30])

print(np.mean(data))
print(np.sum(data))`
    },
    {
        id: "p10",
        title: "Data Science",
        description: "Analisis data dan visualisasi.",
        content: `Data Science menggabungkan pemrograman, matematika, dan statistika untuk mendapatkan informasi dari data.

Library yang sering digunakan:
Pandas, NumPy, dan Matplotlib.`,
        example: `import pandas as pd

data = {
    "Nama": ["Ali", "Budi"],
    "Nilai": [80, 90]
}

df = pd.DataFrame(data)
print(df)`
    }
];

function allLessons() {
    return [...mathLessons, ...programLessons];
}

function renderLessons() {
    renderLessonList(mathLessons, "mathList");
    renderLessonList(programLessons, "programList");
}

function renderLessonList(lessons, containerId) {
    const container = $(containerId);
    const completed = getData().completed;

    container.innerHTML = "";

    lessons.forEach(lesson => {
        const card = document.createElement("article");
        card.className = "lesson-card";

        const title = document.createElement("h3");
        title.textContent = lesson.title;

        const desc = document.createElement("p");
        desc.textContent = lesson.description;

        const btn = document.createElement("button");
        btn.textContent = completed.includes(lesson.id)
            ? "✓ Selesai — Buka Materi"
            : "Pelajari Materi →";

        btn.onclick = () => openLesson(lesson.id);

        card.append(title, desc, btn);
        container.appendChild(card);
    });
}

function openLesson(id) {
    const lesson = allLessons().find(item => item.id === id);
    if (!lesson) return;

    currentLesson = lesson;

    $("detailTitle").textContent = lesson.title;
    $("detailDescription").textContent = lesson.description;
    $("detailContent").textContent = lesson.content;
    $("detailExample").textContent = lesson.example;

    $("completeLessonBtn").textContent =
        getData().completed.includes(id)
            ? "✓ Materi Sudah Selesai"
            : "✓ Tandai Selesai";

    showPage("lessonDetail");
}

$("completeLessonBtn").onclick = () => {
    if (!currentLesson) return;

    const data = getData();

    if (!data.completed.includes(currentLesson.id)) {
        data.completed.push(currentLesson.id);
        data.history.unshift({
            message: "Menyelesaikan materi " + currentLesson.title,
            date: new Date().toLocaleString("id-ID")
        });
        saveData(data);
        notify("Materi berhasil diselesaikan!");
    } else {
        notify("Materi ini sudah selesai.");
    }

    $("completeLessonBtn").textContent = "✓ Materi Sudah Selesai";
    renderLessons();
    updateDashboard();
};

$("backLessons").onclick = () => {
    showPage(currentLesson && currentLesson.id.startsWith("m")
        ? "mathematics" : "programming");
};

// PENCARIAN
function searchLessons(inputId, lessons, containerId) {
    const query = $(inputId).value.toLowerCase();

    const filtered = lessons.filter(item =>
        (item.title + " " + item.description).toLowerCase().includes(query)
    );

    renderLessonList(filtered, containerId);
}

$("mathSearch").addEventListener("input", () =>
    searchLessons("mathSearch", mathLessons, "mathList")
);

$("programSearch").addEventListener("input", () =>
    searchLessons("programSearch", programLessons, "programList")
);

// ======================================
// NAVIGASI
// ======================================

const pageNames = {
    dashboard: "Dashboard",
    mathematics: "Matematika",
    programming: "Pemrograman",
    playground: "Code Playground",
    lessonDetail: "Detail Materi",
    exercises: "Latihan Soal",
    quiz: "Kuis Akademik",
    calculator: "Kalkulator Ilmiah",
    progress: "Progres Belajar"
};

function showPage(id) {
    document.querySelectorAll(".page").forEach(page =>
        page.classList.add("hidden")
    );

    $(id).classList.remove("hidden");
    $("pageTitle").textContent = pageNames[id] || "Academy";

    document.querySelectorAll(".nav-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.page === id)
    );

    if (id === "progress") updateProgress();
    if (id === "dashboard") updateDashboard();
    if (id === "quiz") startQuiz();
    if (id === "exercises") loadExercise();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.go));
});

// ======================================
// DASHBOARD & PROGRES
// ======================================

function updateDashboard() {
    const data = getData();
    const total = allLessons().length;
    const done = data.completed.length;

    $("totalLessons").textContent = total;
    $("completedLessons").textContent = done;
    $("quizAttempts").textContent = data.quizCount;

    const best = data.scores.length
        ? Math.max(...data.scores.map(s => s.score))
        : 0;

    $("bestScore").textContent = best;

    $("recentActivity").innerHTML = "";

    if (!data.history.length) {
        $("recentActivity").innerHTML = "<li>Belum ada aktivitas.</li>";
    } else {
        data.history.slice(0, 5).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.date + " — " + item.message;
            $("recentActivity").appendChild(li);
        });
    }
}

function updateProgress() {
    const data = getData();
    const total = allLessons().length;
    const done = data.completed.length;
    const percent = Math.round(done / total * 100);

    $("overallProgress").style.width = percent + "%";
    $("progressLabel").textContent = percent + "% Selesai";
    $("progressDescription").textContent =
        done + " dari " + total + " materi telah diselesaikan.";

    $("allActivity").innerHTML = "";

    if (!data.history.length) {
        $("allActivity").innerHTML = "<li>Belum ada aktivitas.</li>";
    } else {
        data.history.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.date + " — " + item.message;
            $("allActivity").appendChild(li);
        });
    }

    $("scoreHistory").innerHTML = "";

    if (!data.scores.length) {
        $("scoreHistory").textContent = "Belum ada nilai kuis.";
    } else {
        data.scores.forEach(item => {
            const row = document.createElement("div");
            row.className = "score-row";

            const date = document.createElement("span");
            date.textContent = item.date;

            const score = document.createElement("strong");
            score.textContent = item.score + "/100";

            row.append(date, score);
            $("scoreHistory").appendChild(row);
        });
    }

    updateDashboard();
}

// ======================================
// CODE PLAYGROUND
// ======================================

const defaultJS = `// Program JavaScript Pertamamu

const nama = "Mahasiswa";
const nilai = 90;

if (nilai >= 75) {
    console.log("Halo " + nama);
    console.log("Kamu dinyatakan LULUS!");
} else {
    console.log("Kamu harus belajar lagi.");
}`;

const defaultHTML = `<!DOCTYPE html>
<html>
<head>
<style>
body {
    font-family: Arial;
    text-align: center;
    padding: 30px;
}
h1 { color: purple; }
button { padding: 10px 20px; }
</style>
</head>
<body>
<h1>Halo Mahasiswa!</h1>
<p>Selamat datang di Code Playground.</p>
<button onclick="alert('Berhasil!')">Klik Saya</button>
</body>
</html>`;

$("editorLanguage").onchange = () => {
    $("codeEditor").value =
        $("editorLanguage").value === "javascript"
            ? defaultJS : defaultHTML;

    $("codeOutput").textContent = "Kode siap dijalankan.";
    $("htmlPreview").classList.add("hidden");
};

$("resetCode").onclick = () => {
    $("codeEditor").value =
        $("editorLanguage").value === "javascript"
            ? defaultJS : defaultHTML;

    $("codeOutput").textContent = "Editor berhasil direset.";
};

$("runCode").onclick = runCode;

function runCode() {
    const language = $("editorLanguage").value;
    const code = $("codeEditor").value;

    if (language === "html") {
        const preview = $("htmlPreview");
        preview.classList.remove("hidden");

        // Preview diisolasi menggunakan sandbox iframe.
        preview.srcdoc = code;
        $("codeOutput").textContent = "HTML berhasil dimuat di preview.";
        addHistory("Menjalankan HTML di Code Playground");
        return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    const encoded = JSON.stringify(code);

    iframe.srcdoc = `
    <script>
    const logs = [];
    console.log = (...args) => logs.push(args.map(value =>
        typeof value === "object" ? JSON.stringify(value) : String(value)
    ).join(" "));

    console.error = (...args) => logs.push("ERROR: " + args.join(" "));

    try {
        new Function(${encoded})();
    } catch (error) {
        logs.push("ERROR: " + error.message);
    }

    parent.postMessage({
        type: "mpa-result",
        output: logs.join("\\n") || "Program berhasil dijalankan."
    }, "*");
    <\/script>`;

    const handler = event => {
        if (event.source !== iframe.contentWindow) return;
        if (event.data?.type !== "mpa-result") return;

        $("codeOutput").textContent = event.data.output;
        window.removeEventListener("message", handler);
        iframe.remove();
    };

    window.addEventListener("message", handler);
    document.body.appendChild(iframe);

    setTimeout(() => {
        if (iframe.isConnected) {
            window.removeEventListener("message", handler);
            iframe.remove();
            $("codeOutput").textContent = "Eksekusi dihentikan karena batas waktu.";
        }
    }, 3000);

    addHistory("Menjalankan JavaScript di Code Playground");
}

// ======================================
// LATIHAN SOAL
// ======================================

const exercises = [
    {
        q: "Berapakah hasil 15 × 4?",
        options: ["45", "50", "60", "65"],
        answer: 2
    },
    {
        q: "Turunan dari f(x) = x³ adalah?",
        options: ["3x²", "2x", "x²", "3x"],
        answer: 0
    },
    {
        q: "Berapakah mean dari 2, 4, 6?",
        options: ["3", "4", "5", "6"],
        answer: 1
    },
    {
        q: "Apa fungsi dari variabel?",
        options: [
            "Menghapus program",
            "Menyimpan data",
            "Menutup aplikasi",
            "Mengganti komputer"
        ],
        answer: 1
    }
];

function loadExercise() {
    exerciseAnswered = false;

    const q = exercises[exerciseIndex];

    $("exerciseQuestion").textContent = q.q;
    $("exerciseFeedback").textContent = "";
    $("exerciseNext").disabled = true;
    $("exerciseNext").textContent =
        exerciseIndex === exercises.length - 1
            ? "Selesai →" : "Soal Selanjutnya →";

    $("exerciseOptions").innerHTML = "";

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;
        btn.onclick = () => answerExercise(index);
        $("exerciseOptions").appendChild(btn);
    });
}

function answerExercise(index) {
    if (exerciseAnswered) return;
    exerciseAnswered = true;

    const q = exercises[exerciseIndex];
    const buttons = document.querySelectorAll("#exerciseOptions button");

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.answer) btn.classList.add("correct");
        if (i === index && index !== q.answer) btn.classList.add("wrong");
    });

    $("exerciseFeedback").textContent =
        index === q.answer
            ? "✓ Jawaban benar! Bagus sekali."
            : "✗ Jawaban salah. Jawaban yang benar: " + q.options[q.answer];

    $("exerciseFeedback").style.color =
        index === q.answer ? "#4ade80" : "#f87171";

    $("exerciseNext").disabled = false;
}

$("exerciseNext").onclick = () => {
    if (!exerciseAnswered) return;

    if (exerciseIndex < exercises.length - 1) {
        exerciseIndex++;
        loadExercise();
    } else {
        exerciseIndex = 0;
        notify("Latihan soal selesai!");
        loadExercise();
    }
};

// ======================================
// KUIS
// ======================================

const questions = [
    { q: "Hasil dari 8 + 12 adalah?", options: ["18", "20", "22", "24"], a: 1 },
    { q: "Turunan dari x² adalah?", options: ["x", "2x", "x²", "2"], a: 1 },
    { q: "Bahasa pemrograman yang menggunakan print() adalah?", options: ["Python", "CSS", "HTML", "SQL"], a: 0 },
    { q: "Apa fungsi HTML?", options: ["Struktur web", "Database", "Antivirus", "Jaringan"], a: 0 },
    { q: "Apa fungsi for loop?", options: ["Mengulang perintah", "Menghapus data", "Menghentikan program", "Mengubah warna"], a: 0 },
    { q: "Berapakah determinan matriks [[1,2],[3,4]]?", options: ["2", "-2", "4", "10"], a: 1 },
    { q: "Apa fungsi CSS?", options: ["Mengatur tampilan", "Menyimpan akun", "Mengolah database", "Menghitung data"], a: 0 },
    { q: "Nilai dari 5² adalah?", options: ["10", "15", "20", "25"], a: 3 },
    { q: "Apa itu variabel?", options: ["Tempat menyimpan data", "Jenis komputer", "Bahasa markup", "Browser"], a: 0 },
    { q: "Apa fungsi algoritma?", options: ["Menyelesaikan masalah secara sistematis", "Menghias tampilan", "Mencetak gambar", "Membuka internet"], a: 0 }
];

function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    loadQuizQuestion();
}

function loadQuizQuestion() {
    quizAnswered = false;

    const q = questions[quizIndex];

    $("quizNumber").textContent =
        "Soal " + (quizIndex + 1) + " / " + questions.length;

    $("quizPoints").textContent = "Skor: " + quizScore;
    $("quizQuestion").textContent = q.q;
    $("quizFeedback").textContent = "";
    $("quizNext").disabled = true;

    $("quizProgressBar").style.width =
        (quizIndex / questions.length * 100) + "%";

    $("quizNext").textContent =
        quizIndex === questions.length - 1
            ? "Lihat Hasil" : "Selanjutnya →";

    $("quizOptions").innerHTML = "";

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;
        btn.onclick = () => answerQuiz(index);
        $("quizOptions").appendChild(btn);
    });
}

function answerQuiz(index) {
    if (quizAnswered) return;
    quizAnswered = true;

    const q = questions[quizIndex];
    const buttons = document.querySelectorAll("#quizOptions button");

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.a) btn.classList.add("correct");
        if (i === index && index !== q.a) btn.classList.add("wrong");
    });

    if (index === q.a) {
        quizScore += 10;
        $("quizFeedback").textContent = "✓ Jawaban benar!";
        $("quizFeedback").style.color = "#4ade80";
    } else {
        $("quizFeedback").textContent =
            "✗ Jawaban benar: " + q.options[q.a];
        $("quizFeedback").style.color = "#f87171";
    }

    $("quizPoints").textContent = "Skor: " + quizScore;
    $("quizNext").disabled = false;
}

$("quizNext").onclick = () => {
    if (!quizAnswered) return;

    if (quizIndex < questions.length - 1) {
        quizIndex++;
        loadQuizQuestion();
    } else {
        finishQuiz();
    }
};

function finishQuiz() {
    const data = getData();

    data.quizCount++;
    data.scores.unshift({
        score: quizScore,
        date: new Date().toLocaleString("id-ID")
    });

    data.scores = data.scores.slice(0, 30);
    data.history.unshift({
        message: "Menyelesaikan kuis dengan nilai " + quizScore,
        date: new Date().toLocaleString("id-ID")
    });

    saveData(data);

    $("quizProgressBar").style.width = "100%";
    $("quizQuestion").textContent =
        "Kuis Selesai! Nilai kamu: " + quizScore + "/100";

    $("quizOptions").innerHTML = "";
    $("quizFeedback").textContent =
        quizScore >= 80
            ? "🏆 Sangat baik! Pertahankan prestasimu."
            : "Tetap semangat! Pelajari kembali materi.";

    $("quizNext").textContent = "Ulangi Kuis";
    $("quizNext").disabled = false;
    $("quizNext").onclick = startQuiz;

    updateDashboard();
};

// ======================================
// KALKULATOR ILMIAH
// ======================================

function updateCalcDisplay() {
    $("calcDisplay").value = calcExpression || "0";
}

document.querySelectorAll("[data-calc]").forEach(btn => {
    btn.onclick = () => {
        calcExpression += btn.dataset.calc;
        updateCalcDisplay();
    };
});

document.querySelector('[data-action="clear"]').onclick = () => {
    calcExpression = "";
    $("calcExpression").textContent = "";
    updateCalcDisplay();
};

document.querySelector('[data-action="delete"]').onclick = () => {
    calcExpression = calcExpression.slice(0, -1);
    updateCalcDisplay();
};

document.querySelector('[data-action="calculate"]').onclick = calculateExpression;

function calculateExpression() {
    if (!calcExpression) return;

    let expression = calcExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**")
        .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")
        .replace(/sin\(/g, "Math.sin(Math.PI/180*")
        .replace(/cos\(/g, "Math.cos(Math.PI/180*")
        .replace(/tan\(/g, "Math.tan(Math.PI/180*")
        .replace(/sqrt\(/g, "Math.sqrt(");

    if (!/^[0-9+\-*/().\sMathPI]+$/.test(expression)) {
        notify("Ekspresi tidak valid!");
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expression + ')')();

        if (!Number.isFinite(result)) throw new Error("Hasil tidak valid");

        $("calcExpression").textContent = calcExpression + " =";
        calcExpression = String(Number(result.toFixed(10)));
        updateCalcDisplay();
    } catch {
        $("calcDisplay").value = "Error";
        calcExpression = "";
    }
}

// ======================================
// NOTIFIKASI
// ======================================

let toastTimer;

function notify(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ======================================
// INISIALISASI
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    $("codeEditor").value = defaultJS;

    const session = localStorage.getItem("mpa_session");
    const users = getUsers();

    if (session && users[session]) {
        currentUser = session;
        openApp();
    }

    updateCalcDisplay();
});
