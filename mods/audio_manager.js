(function(){
    const tracks = [
        'assets/music/echoes-of-the-past_91124.mp3',
        'assets/music/strings-of-the-past_91098.mp3',
        'assets/music/enchanted-twilight_91115.mp3',
        'assets/music/tavern-revelry_93088.mp3'
    ];

    let playlist = [];
    let currentAudio = new Audio();
    currentAudio.volume = 0.15; // ТИХАЯ ГРОМКОСТЬ (15%)
    let isPlaying = false;
    let hasStarted = false;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function nextTrack() {
        if (playlist.length === 0) {
            playlist = shuffle([...tracks]); 
        }
        const track = playlist.pop();
        currentAudio.src = track;
        currentAudio.play().catch(e => console.log('Ошибка аудио:', e));
        isPlaying = true;
        updateButton();
    }

    currentAudio.onended = () => {
        if (isPlaying) nextTrack();
    };

    // ПИКСЕЛЬНЫЕ ИКОНКИ (SVG)
    const svgOn = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#c87b32" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;"><path d="M2 6h3l3-3v10l-3-3H2V6z"/><rect x="10" y="6" width="1" height="4"/><rect x="12" y="4" width="1" height="8"/><rect x="14" y="2" width="1" height="12"/></svg>`;
    const svgOff = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#7a6b4a" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;"><path d="M2 6h3l3-3v10l-3-3H2V6z"/><path d="M10 6l4 4M14 6l-4 4" stroke="#7a6b4a" stroke-width="1.5"/></svg>`;

    function createUI() {
        if (document.getElementById('music-toggle-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'music-toggle-btn';
        btn.innerHTML = svgOff;
        
        // МАЛЕНЬКАЯ КНОПКА В ПРАВОМ ВЕРХНЕМ УГЛУ (чтобы не мешать)
        btn.style.cssText = 'position:fixed; top:55px; right:10px; width:24px; height:24px; background:#1e1a16; border:2px solid #5a4a3a; display:flex; justify-content:center; align-items:center; cursor:pointer; z-index:999999; user-select:none; box-shadow: inset -2px -2px 0 #000, inset 2px 2px 0 rgba(255,255,255,0.1);';
        
        btn.onclick = (e) => {
            e.stopPropagation();
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                if (!currentAudio.src) {
                    nextTrack();
                } else {
                    currentAudio.play();
                    isPlaying = true;
                }
            }
            updateButton();
        };
        document.body.appendChild(btn);
        updateButton();
    }

    function updateButton() {
        const btn = document.getElementById('music-toggle-btn');
        if (btn) btn.innerHTML = isPlaying ? svgOn : svgOff;
    }

    function startMusic() {
        if (!hasStarted) {
            hasStarted = true;
            nextTrack();
        }
    }

    setTimeout(() => {
        createUI();
        const startBtn = document.getElementById('btn-start');
        if (startBtn) {
            const oldClick = startBtn.onclick;
            startBtn.onclick = (e) => {
                startMusic();
                if (oldClick) oldClick(e);
            };
        }
        document.body.addEventListener('click', startMusic, { once: true });
        if (window.Reg) Reg.on('world_init', startMusic);
    }, 1000);
})();
