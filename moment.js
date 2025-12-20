AOS.init({ duration: 1200, once: true });
moment.locale('id'); // Set waktu ke Bahasa Indonesia

const scriptURL = 'https://script.google.com/macros/s/AKfycbw-raDTSpK81f6n0JCVcSSgXkxhpn9Wi9ISFRde_NDnXfn5z9Ob2s4Mnqn7v9fBWBt7/exec';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetName = urlParams.get('to');
    if (targetName) {
        document.getElementById('target-name').innerText = targetName;
        document.getElementById('nama').value = ""; 
    }
    loadMessages();
    
    // Update waktu setiap 1 menit agar tetap "real-time"
    setInterval(loadMessages, 60000); 
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

// KIRIM PESAN
const form = document.getElementById('farewell-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', e => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    // Tambahkan timestamp saat kirim
    const formData = new FormData(form);
    formData.append('Tanggal', new Date().toISOString());

    fetch(scriptURL, { method: 'POST', body: formData})
        .then(response => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            form.reset();
            Swal.fire({ title: 'Berhasil!', text: 'Pesan lu udah tersimpan!', icon: 'success' });
            loadMessages();
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            Swal.fire({ title: 'Gagal!', text: 'Cek koneksi lu.', icon: 'error' });
        });
});

// LOAD & TAMPILKAN PESAN
function loadMessages() {
    const messageContainer = document.getElementById('display-messages');
    
    fetch(scriptURL + '?action=read')
        .then(res => res.json())
        .then(data => {
            messageContainer.innerHTML = '';
            data.reverse().forEach((item, index) => {
                // Logika Waktu Relatif
                const waktuRelatif = item.Tanggal ? moment(item.Tanggal).fromNow() : 'Baru saja';
                
                const div = document.createElement('div');
                div.className = 'message-item';
                div.style = "border-bottom: 1px solid #eee; padding: 10px 0;";
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${item.Nama} <span style="font-weight: normal; font-size: 0.8rem; color: #888;">• ${waktuRelatif}</span></strong>
                        <div>
                            <button onclick="editPesan('${item.Nama}', '${item.Pesan}', ${index})" style="background:none; border:none; cursor:pointer; color:blue; font-size:0.8rem;">Edit</button>
                            <button onclick="hapusPesan('${item.Nama}', ${index})" style="background:none; border:none; cursor:pointer; color:red; font-size:0.8rem;">Hapus</button>
                        </div>
                    </div>
                    <p style="margin: 5px 0;">${item.Pesan}</p>
                `;
                messageContainer.appendChild(div);
            });
        });
}

// FUNGSI HAPUS (Butuh penyesuaian di Google Script)
function hapusPesan(nama, id) {
    Swal.fire({
        title: 'Yakin mau hapus?',
        text: "Pesan lu bakal ilang permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proses delete ke Google Script
            fetch(`${scriptURL}?action=delete&nama=${nama}`, { method: 'GET' })
                .then(() => {
                    Swal.fire('Terhapus!', 'Pesan lu udah ilang.', 'success');
                    loadMessages();
                });
        }
    });
}

// FUNGSI EDIT
function editPesan(nama, pesanLama, id) {
    Swal.fire({
        title: 'Edit Pesan Lu',
        input: 'textarea',
        inputValue: pesanLama,
        showCancelButton: true,
        confirmButtonText: 'Simpan'
    }).then((result) => {
        if (result.value) {
            fetch(`${scriptURL}?action=update&nama=${nama}&pesanBaru=${result.value}`, { method: 'GET' })
                .then(() => {
                    Swal.fire('Berhasil!', 'Pesan berhasil diubah.', 'success');
                    loadMessages();
                });
        }
    });
}