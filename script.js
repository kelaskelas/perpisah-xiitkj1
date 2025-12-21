AOS.init({ duration: 1200, once: true });
moment.locale('id');

// Pakai Script URL yang ini (Pastikan Google Script lu sudah di-deploy sebagai 'Anyone')
const scriptURL = 'https://script.google.com/macros/s/AKfycbxF16vu_Kb-itsb0aJ9hsEQcKKvYE3Dvs8Lci4W-eZq_zjYkqFsQTouqk4E91kmTQfr/exec';

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    new Swiper(".mySwiper", {
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
    });

    const urlParams = new URLSearchParams(window.location.search);
    const targetName = urlParams.get('to');
    if (targetName) document.getElementById('target-name').innerText = targetName;
    
    loadMessages();
});

function openFarewell() {
    const music = document.getElementById('background-music');
    music.volume = 0.5;
    music.play().catch(e => console.log("Music blocked"));
    
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    document.body.classList.remove('no-scroll');
    
    setTimeout(() => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }, 100);
}

// KIRIM PESAN (Benerin Error Refresh)
const form = document.getElementById('farewell-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', e => {
    e.preventDefault(); // Biar gak mental ke halaman utama
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    const msgID = "ID-" + Date.now();
    const formData = new FormData(form);
    formData.append('Tanggal', new Date().toISOString());
    formData.append('ID', msgID);

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(() => {
            // Simpan ID di local storage buat fitur edit/hapus
            let myKeys = JSON.parse(localStorage.getItem('myMessageIDs') || "[]");
            myKeys.push(msgID);
            localStorage.setItem('myMessageIDs', JSON.stringify(myKeys));

            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            form.reset();
            Swal.fire('Berhasil!', 'Pesan lu udah masuk database!', 'success');
            loadMessages(); // Refresh tampilan pesan
        })
        .catch(error => {
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            Swal.fire('Gagal!', 'Cek Google Script lu atau koneksi internet.', 'error');
        });
});

function toggleMenu(id) {
    document.getElementById("dropdown-" + id).classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dots-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('show');
        }
    }
}

function loadMessages() {
    const container = document.getElementById('display-messages');
    const myIDs = JSON.parse(localStorage.getItem('myMessageIDs') || "[]");

    fetch(scriptURL + '?action=read')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';
            data.reverse().forEach(item => {
                const isOwner = myIDs.includes(item.ID);
                const div = document.createElement('div');
                div.className = 'message-item';
                div.style = "border-bottom: 1px solid #eee; padding: 20px 0; text-align: left;";
                
                div.innerHTML = `
                    <div class="message-header" style="display:flex; justify-content:space-between;">
                        <strong>${item.Nama} <span style="font-weight:normal; color:#999; font-size:0.8rem;">• ${item.Tanggal ? moment(item.Tanggal).fromNow() : 'Baru saja'}</span></strong>
                        ${isOwner ? `
                        <div class="menu-dropdown">
                            <button class="dots-btn" onclick="toggleMenu('${item.ID}')">⋮</button>
                            <div id="dropdown-${item.ID}" class="dropdown-content">
                                <button class="btn-edit" onclick="editPesan('${item.ID}', '${item.Pesan.replace(/'/g, "\\'")}')">Edit</button>
                                <button class="btn-delete" onclick="hapusPesan('${item.ID}')">Hapus</button>
                            </div>
                        </div>` : ''}
                    </div>
                    <p style="margin-top: 10px; color:#444;">${item.Pesan}</p>
                `;
                container.appendChild(div);
            });
        });
}

function editPesan(id, pesanLama) {
    Swal.fire({
        title: 'Edit Pesan Kamu',
        input: 'textarea',
        inputValue: pesanLama,
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            fetch(`${scriptURL}?action=update&id=${id}&pesanBaru=${encodeURIComponent(result.value)}`)
                .then(() => {
                    Swal.fire('Berhasil!', 'Pesan diupdate.', 'success');
                    loadMessages();
                });
        }
    });
}

function hapusPesan(id) {
    Swal.fire({
        title: 'Hapus pesan ini?',
        icon: 'warning',
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${scriptURL}?action=delete&id=${id}`).then(() => {
                Swal.fire('Terhapus!', '', 'success');
                loadMessages();
            });
        }
    });
}