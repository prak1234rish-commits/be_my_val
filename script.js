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
let hasEscaped = false;

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
// THE NO EVASION (THE ACTUAL WORKING VERSION)
// ============================================
document.addEventListener('mousemove', (e) => {
    if (questionScreen.classList.contains('hidden')) return;

    const noRect = noButtonWrapper.getBoundingClientRect();
    const bx = noRect.left + noRect.width / 2;
    const by = noRect.top + noRect.height / 2;

    const dist = Math.sqrt(Math.pow(e.clientX - bx, 2) + Math.pow(e.clientY - by, 2));

    if (dist < 100) {
        moveButton(e.clientX, e.clientY);
    }
});

function moveButton(mouseX, mouseY) {
    if (!interactionStartTime) interactionStartTime = Date.now();

    // JAILBREAK: Move to body to fix the "off-screen" transform bug
    if (!hasEscaped) {
        document.body.appendChild(noButtonWrapper);
        noButtonWrapper.style.position = 'fixed';
        noButtonWrapper.style.zIndex = '10000';
        noButtonWrapper.style.transition = 'none'; // Instant jumps only
        hasEscaped = true;
    }

    const bw = noButtonWrapper.offsetWidth;
    const bh = noButtonWrapper.offsetHeight;
    const yesRect = yesBtn.getBoundingClientRect();

    let newX, newY;
    let safe = false;

    for (let i = 0; i < 50; i++) {
        // Stay within viewport with 50px safety margin
        newX = Math.random() * (window.innerWidth - bw - 100) + 50;
        newY = Math.random() * (window.innerHeight - bh - 100) + 50;

        const distToMouse = Math.sqrt(Math.pow(newX + bw/2 - mouseX, 2) + Math.pow(newY + bh/2 - mouseY, 2));
        const overlapsYes = (
            newX < yesRect.right + 60 &&
            newX + bw > yesRect.left - 60 &&
            newY < yesRect.bottom + 60 &&
            newY + bh > yesRect.top - 60
        );

        if (distToMouse > 200 && !overlapsYes) {
            safe = true;
            break;
        }
    }

    noButtonWrapper.style.left = `${newX}px`;
    noButtonWrapper.style.top = `${newY}px`;
    noButtonWrapper.style.margin = '0';

    // Grow YES
    if (yesBtnScale < 1.7) {
        yesBtnScale += 0.12;
        yesBtn.style.transform = `scale(${yesBtnScale})`;
    }

    // Shrink NO
    if (Date.now() - interactionStartTime > 5000 && noBtnScale > 0.5) {
        noBtnScale -= 0.05;
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
