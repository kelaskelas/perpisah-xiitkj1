AOS.init({ duration: 1200, once: true });
moment.locale('id');

const scriptURL = 'https://script.google.com/macros/s/AKfycbwLoL02ElfVCwWmIwfNAfFRzPTpk9dUvbuZnOWz9uHz9tlLTGxqB4IXfxb8x0nYNvLM/exec';

// FORCE KE ATAS PAS REFRESH
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

document.addEventListener('DOMContentLoaded', () => {
    // Balikin ke atas lagi buat jaga-jaga
    window.scrollTo(0, 0);

    // Jalankan Swiper
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
    
    // Tampilkan Konten
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    
    // Lepas Kunci Scroll
    document.body.classList.remove('no-scroll');
    
    // Scroll ke bagian konten pertama
    setTimeout(() => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    }, 100);
}

// LOGIKA LOAD & KIRIM PESAN SAMA SEPERTI SEBELUMNYA...
// (Pastikan fungsi loadMessages & form submission lu tetap ada di sini)

// KIRIM PESAN
const form = document.getElementById('farewell-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', e => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    const msgID = "ID-" + Date.now();
    const formData = new FormData(form);
    formData.append('Tanggal', new Date().toISOString());
    formData.append('ID', msgID);

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(() => {
            let myKeys = JSON.parse(localStorage.getItem('myMessageIDs') || "[]");
            myKeys.push(msgID);
            localStorage.setItem('myMessageIDs', JSON.stringify(myKeys));

            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Pesan 🎉';
            form.reset();
            Swal.fire('Berhasil!', 'Pesan lu udah tersimpan!', 'success');
            loadMessages();
        })
        .catch(() => {
            submitButton.disabled = false;
            Swal.fire('Gagal!', 'Cek koneksi internet lu.', 'error');
        });
});

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
                div.style = "border-bottom: 1px solid #eee; padding: 20px 0; text-align: left;";
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${item.Nama} <span style="font-weight:normal; color:#999; font-size:0.8rem;">• ${item.Tanggal ? moment(item.Tanggal).fromNow() : 'Baru saja'}</span></strong>
                        ${isOwner ? `<div><button onclick="hapusPesan('${item.ID}')" style="color:red; background:none; border:none; cursor:pointer;">Hapus</button></div>` : ''}
                    </div>
                    <p style="margin-top: 10px; color:#444;">${item.Pesan}</p>
                `;
                container.appendChild(div);
            });
        });
}

function hapusPesan(id) {
    Swal.fire({ title: 'Hapus pesan?', icon: 'warning', showCancelButton: true }).then(res => {
        if (res.isConfirmed) {
            fetch(`${scriptURL}?action=delete&id=${id}`).then(() => {
                Swal.fire('Terhapus!', '', 'success');
                loadMessages();
            });
        }
    });
}