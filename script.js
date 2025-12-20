AOS.init({ duration: 1200, once: true });
moment.locale('id');

const scriptURL = 'https://script.google.com/macros/s/AKfycbwLoL02ElfVCwWmIwfNAfFRzPTpk9dUvbuZnOWz9uHz9tlLTGxqB4IXfxb8x0nYNvLM/exec';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetName = urlParams.get('to');
    if (targetName) {
        document.getElementById('target-name').innerText = targetName;
    }
    loadMessages();
    setInterval(loadMessages, 30000); // Update setiap 30 detik agar real-time
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

// --- LOGIKA KIRIM PESAN ---
const form = document.getElementById('farewell-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', e => {
    e.preventDefault(); // KUNCI: Biar gak reload halaman!
    
    submitButton.disabled = true;
    submitButton.innerText = 'Memproses...';

    // Buat ID unik untuk pesan ini (agar bisa diedit oleh pengirim saja)
    const msgID = "ID-" + Date.now();
    const formData = new FormData(form);
    formData.append('Tanggal', new Date().toISOString());
    formData.append('ID', msgID);

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
            // Simpan ID ke browser lokal sebagai tanda kepemilikan
            let myKeys = JSON.parse(localStorage.getItem('myMessageIDs') || "[]");
            myKeys.push(msgID);
            localStorage.setItem('myMessageIDs', JSON.stringify(myKeys));

            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            form.reset();
            
            Swal.fire({ title: 'Berhasil!', text: 'Pesan lu masuk ke database!', icon: 'success' });
            loadMessages();
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            Swal.fire({ title: 'Waduh!', text: 'Gagal kirim, cek koneksi atau scriptURL lu.', icon: 'error' });
        });
});

// --- LOAD PESAN & HAK AKSES ---
function loadMessages() {
    const container = document.getElementById('display-messages');
    const myIDs = JSON.parse(localStorage.getItem('myMessageIDs') || "[]");

    fetch(scriptURL + '?action=read')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';
            data.reverse().forEach(item => {
                const waktuRelatif = item.Tanggal ? moment(item.Tanggal).fromNow() : 'Baru saja';
                
                // Cek apakah ID di database sama dengan ID di localStorage kita
                const isOwner = myIDs.includes(item.ID);

                const div = document.createElement('div');
                div.className = 'message-item';
                div.style = "border-bottom: 1px solid #eee; padding: 15px 0; position: relative;";
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${item.Nama} <span style="font-weight: normal; font-size: 0.75rem; color: #999;">• ${waktuRelatif}</span></strong>
                        ${isOwner ? `
                        <div>
                            <button onclick="editPesan('${item.ID}', '${item.Pesan}')" style="color: blue; border: none; background: none; cursor: pointer; font-size: 0.8rem;">Edit</button>
                            <button onclick="hapusPesan('${item.ID}')" style="color: red; border: none; background: none; cursor: pointer; font-size: 0.8rem; margin-left: 10px;">Hapus</button>
                        </div>` : ''}
                    </div>
                    <p style="margin: 8px 0 0 0; color: #444;">${item.Pesan}</p>
                `;
                container.appendChild(div);
            });
        });
}

// --- FUNGSI EDIT & HAPUS ---
function hapusPesan(id) {
    Swal.fire({
        title: 'Hapus pesan ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${scriptURL}?action=delete&id=${id}`)
                .then(() => {
                    Swal.fire('Terhapus!', '', 'success');
                    loadMessages();
                });
        }
    });
}

function editPesan(id, pesanLama) {
    Swal.fire({
        title: 'Edit Pesan Lu',
        input: 'textarea',
        inputValue: pesanLama,
        showCancelButton: true
    }).then((result) => {
        if (result.value) {
            fetch(`${scriptURL}?action=update&id=${id}&pesanBaru=${encodeURIComponent(result.value)}`)
                .then(() => {
                    Swal.fire('Berhasil!', 'Pesan sudah diubah.', 'success');
                    loadMessages();
                });
        }
    });
}