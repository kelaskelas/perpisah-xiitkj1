// Inisialisasi AOS
AOS.init({ duration: 1200, once: true });

// URL Web App Google Script Lu
const scriptURL = 'https://script.google.com/macros/s/AKfycbxmjGAGxByHDuekU6mpsHJfFw0ULCmEcZXuhOXHVB6DjjdNAYdk7JKtLWIIFlTG7gK8/exec';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Nama dari URL (?to=XIITKJ1)
    const urlParams = new URLSearchParams(window.location.search);
    const targetName = urlParams.get('to');

    if (targetName) {
        document.getElementById('target-name').innerText = targetName;
        // Bagian input nama dibiarin kosong sesuai request lu
        document.getElementById('nama').value = ""; 
    }

    // 2. Load pesan pas halaman pertama kali dibuka
    loadMessages();
});

function openFarewell() {
    const music = document.getElementById('background-music');
    music.volume = 0.5;
    music.play().catch(e => console.log("Music blocked"));

    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';

    setTimeout(() => {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// 3. Kirim Pesan
const form = document.getElementById('farewell-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', e => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            form.reset();
            
            // TAMPILAN NOTIF DI TENGAH LAYAR
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pesan kenangan lu udah tersimpan cuy!',
                icon: 'success',
                confirmButtonColor: '#2c3e50',
                confirmButtonText: 'Mantap!'
            });

            loadMessages(); // Refresh pesan di bawah
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            
            // NOTIF ERROR DI TENGAH LAYAR
            Swal.fire({
                title: 'Waduh Gagal!',
                text: 'Coba cek koneksi internet lu atau link database-nya.',
                icon: 'error',
                confirmButtonText: 'Oke'
            });
        });
});
// 4. Fungsi Nampilin Pesan (Tampil di Web)
function loadMessages() {
    const messageContainer = document.getElementById('display-messages');
    messageContainer.innerHTML = '<p>Memuat pesan...</p>';

    // Kita panggil Google Script pake method GET
    fetch(scriptURL + '?action=read')
        .then(res => res.json())
        .then(data => {
            messageContainer.innerHTML = ''; // Kosongkan loading
            // Balik urutan biar yang terbaru di atas
            data.reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'message-item';
                div.innerHTML = `<strong>${item.Nama}</strong><p>${item.Pesan}</p><hr>`;
                messageContainer.appendChild(div);
            });
        });

}

const myComments = JSON.parse(localStorage.getItem('my_comments')) || [];

// Contoh saat render
const showOptions = myComments.includes(commentId) ? 'block' : 'none';

commentElement.innerHTML = `
    <div class="comment-text">${text}</div>
    <div class="comment-options" style="display: ${showOptions}">
        <i class="fas fa-ellipsis-v"></i> <div class="dropdown-menu">
            <button onclick="editComment('${commentId}')">Edit</button>
            <button onclick="deleteComment('${commentId}')">Hapus</button>
        </div>
    </div>
`;

// --- BAGIAN 1: FUNGSI KIRIM ---
function kirimKomentar() {
    let token = localStorage.getItem('token_user') || 'TKJ-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('token_user', token); // Simpan kuncinya di HP/PC

    const idKomen = 'id-' + Date.now();
    
    // Kirim data Nama, Pesan, Timestamp, idKomen, dan token ke Google Sheets
}

// --- BAGIAN 2: FUNGSI TAMPIL (LOOPING) ---
function tampilkanKomentar(data) {
    const myToken = localStorage.getItem('token_user');
    
    data.forEach(item => {
        // Cek apakah kolom E (token) di Sheet cocok sama token di browser
        const tombolAksi = (item.token === myToken) ? 
            `<button onclick="toggleMenu('${item.id}')">⋮</button>` : '';
            
        // Gabungin ke HTML kartu komen lo
    });
}

// --- BAGIAN 3: FUNGSI MENU ---
function toggleMenu(id) {
    // Kode buat nampil/sembunyiin menu edit-hapus
}
