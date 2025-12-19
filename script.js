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
    fetch(scriptURL + "?action=read")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('container-pesan');
        if (!container) return; // Biar gak error kalau container gak ketemu
        container.innerHTML = '';

        // Kita pakai index (0, 1, 2...) sebagai pengganti ID
        data.forEach((item, index) => { 
            const div = document.createElement('div');
            div.className = 'message-card';
            div.style.position = 'relative'; // Wajib ada buat posisi menu

            div.innerHTML = `
                <div class="menu-container" style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="toggleMenu(this)" class="dot-btn" style="background:none; border:none; cursor:pointer; font-size:20px;">⋮</button>
                    <div class="dropdown-menu" style="display: none; position: absolute; right: 0; background: white; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 100;">
                        <button onclick="editMessage(${index})" style="display: block; width: 100%; padding: 8px 15px; border: none; background: none; text-align: left; cursor: pointer;">Edit</button>
                        <button onclick="deleteMessage(${index})" style="display: block; width: 100%; padding: 8px 15px; border: none; background: none; text-align: left; cursor: pointer; color: red;">Delete</button>
                    </div>
                </div>
                <p><strong>${item.nama}</strong></p>
                <p>${item.pesan}</p>
            `;
            container.appendChild(div);
        });
    })
    .catch(error => console.error('Error loading messages:', error));
}
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

function deleteMessage(id) {
    Swal.fire({
        title: 'Yakin mau hapus?',
        text: "Pesan ini bakal ilang selamanya, cuy!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Taruh kode hapus database lu di sini (fetch ke spreadsheet/PHP)
            
            Swal.fire('Terhapus!', 'Pesan lu udah musnah.', 'success');
        }
    })
}

function toggleMenu(btn) {
    const menu = btn.nextElementSibling;
    // Nutup menu lain kalau ada yang kebuka
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });
    // Buka/tutup menu yang diklik
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}

// Biar kalau klik di mana aja menunya nutup
window.onclick = function(event) {
    if (!event.target.matches('.dot-btn')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
    }
}

function deleteMessage(index) {
    Swal.fire({
        title: 'Hapus Pesan?',
        text: "Pesan urutan ke-" + (index + 1) + " bakal ilang!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Deleted!', 'Pesan berhasil dihapus (simulasi).', 'success');
        }
    });
}

function editMessage(index) {
    Swal.fire({
        title: 'Edit Pesan',
        input: 'textarea',
        inputLabel: 'Ubah pesan lu:',
        showCancelButton: true
    }).then((result) => {
        if (result.value) {
            Swal.fire('Updated!', 'Pesan berhasil diubah (simulasi).', 'success');
        }
    });
}





