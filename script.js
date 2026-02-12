// ============================================
// CONFIG & STATE
// ============================================
const EMAILJS_CONFIG = {
    enabled: true,
    serviceId: 'service_jscol8t',
    templateId: 'template_4z6don2',
    publicKey: 'f1Jytx3IU_81XPHZZ'
};

const CELEBRATION_GIF_URL = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW1rdHlsYmJ1YWwxN2tsdWJlY3MxZzJlYmducjczc3g4bzh6YzZkZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bAAnsIJUqwBKoqasx2/giphy.gif';

let nickname = '';
let interactionStartTime = null;
let yesBtnScale = 1;
let noBtnScale = 1;
let hasEscaped = false; // Tracks if the button has started flying

const MAX_YES_SCALE = 1.8;
const MIN_NO_SCALE = 0.5;

// DOM Elements
const envelopeContainer = document.getElementById('envelopeContainer');
const cardScene = document.getElementById('cardScene');
const nicknameScreen = document.getElementById('nicknameScreen');
const nicknameInput = document.getElementById('nicknameInput');
const continueBtn = document.getElementById('continueBtn');
const questionScreen = document.getElementById('questionScreen');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const noButtonWrapper = noBtn.closest('.button-wrapper');
const successScene = document.getElementById('successScene');
const successMessage = document.getElementById('successMessage');
const gifContainer = document.getElementById('gifContainer');

// ============================================
// FLOW LOGIC
// ============================================
envelopeContainer.addEventListener('click', () => {
    envelopeContainer.classList.add('opening');
    setTimeout(() => {
        envelopeContainer.style.display = 'none';
        cardScene.classList.add('show');
        nicknameInput.focus();
    }, 1200);
});

continueBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        nicknameScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
    }
});

// ============================================
// THE "NO" EVASION (REWRITTEN)
// ============================================
document.addEventListener('mousemove', (e) => {
    if (questionScreen.classList.contains('hidden')) return;

    const noRect = noButtonWrapper.getBoundingClientRect();
    const bx = noRect.left + noRect.width / 2;
    const by = noRect.top + noRect.height / 2;

    const dist = Math.sqrt(Math.pow(e.clientX - bx, 2) + Math.pow(e.clientY - by, 2));

    if (dist < 100) {
        escape(e.clientX, e.clientY);
    }
});

function escape(mouseX, mouseY) {
    if (!interactionStartTime) interactionStartTime = Date.now();

    const bw = noButtonWrapper.offsetWidth;
    const bh = noButtonWrapper.offsetHeight;
    const yesRect = yesBtn.getBoundingClientRect();

    let newX, newY;
    let safe = false;

    // Calculate a safe random spot
    for (let i = 0; i < 30; i++) {
        newX = Math.random() * (window.innerWidth - bw - 40) + 20;
        newY = Math.random() * (window.innerHeight - bh - 40) + 20;

        // Check if spot is far from mouse and not on top of YES
        const distToMouse = Math.sqrt(Math.pow(newX + bw/2 - mouseX, 2) + Math.pow(newY + bh/2 - mouseY, 2));
        const overlapsYes = (
            newX < yesRect.right + 50 &&
            newX + bw > yesRect.left - 50 &&
            newY < yesRect.bottom + 50 &&
            newY + bh > yesRect.top - 50
        );

        if (distToMouse > 150 && !overlapsYes) {
            safe = true;
            break;
        }
    }

    // BREAK OUT: This is where we force it to become 'fixed' 
    if (!hasEscaped) {
        noButtonWrapper.style.position = 'fixed';
        hasEscaped = true;
    }

    noButtonWrapper.style.left = `${newX}px`;
    noButtonWrapper.style.top = `${newY}px`;
    noButtonWrapper.style.margin = '0';

    // Grow YES
    if (yesBtnScale < MAX_YES_SCALE) {
        yesBtnScale += 0.12;
        yesBtn.style.transform = `scale(${yesBtnScale})`;
    }

    // Shrink NO (after 5s)
    if (Date.now() - interactionStartTime > 5000 && noBtnScale > MIN_NO_SCALE) {
        noBtnScale -= 0.06;
        noBtn.style.transform = `scale(${noBtnScale})`;
    }
}

// ============================================
// SUCCESS
// ============================================
yesBtn.addEventListener('click', () => {
    questionScreen.classList.add('hidden');
    successScene.classList.add('show');
    successMessage.textContent = `Thank you, ${nickname}! 💕`;
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    const img = new Image();
    img.src = CELEBRATION_GIF_URL;
    img.onload = () => {
        gifContainer.innerHTML = '';
        img.className = 'celebration-gif';
        gifContainer.appendChild(img);
    };

    if (EMAILJS_CONFIG.enabled) {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
            from_name: nickname,
            timestamp: new Date().toLocaleString()
        });
    }
});
