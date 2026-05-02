AOS.init({ duration: 1000, once: true });
moment.locale('id');

const scriptURL = 'https://script.google.com/macros/s/AKfycbzsBkDO8vI4qhsEQlIvpQ2aeS30IcBEiFtrp_UGMqug4eTpZFuQ2_cmAxW9xvfeid_4/exec';

function openFarewell() {
    document.getElementById('main-content').style.display = 'block';
    document.body.classList.remove('no-scroll');
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
}

function loadVideos() {
    const container = document.getElementById('display-videos');
    fetch(scriptURL + '?type=videos')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';
            data.forEach(item => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `
                    <video class="video-element" loop playsinline onclick="togglePlay(this)">
                        <source src="${item.MediaURL}" type="video/mp4">
                    </video>
                    <div class="source-credit">Source: ${item.SC}</div>
                `;
                container.appendChild(slide);
            });

            // INISIALISASI SWIPER DENGAN LOOP
            new Swiper(".videoSwiper", {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto",
                loop: true, // AKTIFKAN LOOP SLIDER
                coverflowEffect: {
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2,
                    slideShadows: true,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
            });
        });
}

// FUNGSI PLAY DENGAN SUARA
function togglePlay(video) {
    // Matikan semua video lain agar suara tidak tabrakan
    document.querySelectorAll('video').forEach(v => {
        if (v !== video) {
            v.pause();
            v.muted = true;
        }
    });

    if (video.paused) {
        video.muted = false; // Aktifkan suara saat diklik
        video.play();
    } else {
        video.pause();
    }
}

// KIRIM & LOAD PESAN
const form = document.getElementById('farewell-form');
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submit-button');
    btn.disabled = true;
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(() => {
            Swal.fire('Terkirim!', 'Pesan lu aman.', 'success');
            form.reset();
            loadMessages();
        }).finally(() => btn.disabled = false);
});

function loadMessages() {
    const container = document.getElementById('display-messages');
    fetch(scriptURL + '?type=messages')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';
            data.reverse().forEach(item => {
                const div = document.createElement('div');
                div.style = "border-bottom: 1px solid #eee; padding: 10px 0; text-align: left;";
                div.innerHTML = `<strong>${item.Nama}</strong> <small style="color:#999">${moment(item.Tanggal).fromNow()}</small><p>${item.Pesan}</p>`;
                container.appendChild(div);
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    loadMessages();
});