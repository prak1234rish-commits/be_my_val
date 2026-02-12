// ============================================
// EMAIL NOTIFICATION CONFIGURATION
// ============================================
const EMAILJS_CONFIG = {
    enabled: true,
    serviceId: 'service_jscol8t',
    templateId: 'template_4z6don2',
    publicKey: 'f1Jytx3IU_81XPHZZ'
};

const CELEBRATION_GIF_URL = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW1rdHlsYmJ1YWwxN2tsdWJlY3MxZzJlYmducjczc3g4bzh6YzZkZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bAAnsIJUqwBKoqasx2/giphy.gif';

// ============================================
// STATE VARIABLES
// ============================================
let nickname = '';
let sessionId = generateSessionId();
let interactionStartTime = null;
let evasionCount = 0;
let yesBtnScale = 1;
let noBtnScale = 1;

const MAX_YES_SCALE = 1.8;
const MIN_NO_SCALE = 0.5;
const SHRINK_THRESHOLD = 5000; // 5 seconds

// ============================================
// DOM ELEMENTS
// ============================================
const envelopeContainer = document.getElementById('envelopeContainer');
const cardScene = document.getElementById('cardScene');
const nicknameScreen = document.getElementById('nicknameScreen');
const nicknameInput = document.getElementById('nicknameInput');
const continueBtn = document.getElementById('continueBtn');
const questionScreen = document.getElementById('questionScreen');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const noButtonWrapper = noBtn.closest('.button-wrapper');
const interactionHint = document.getElementById('interactionHint');
const successScene = document.getElementById('successScene');
const successMessage = document.getElementById('successMessage');
const gifContainer = document.getElementById('gifContainer');

// ============================================
// ENVELOPE & NICKNAME (Kept your working flow)
// ============================================
envelopeContainer.addEventListener('click', () => {
    envelopeContainer.classList.add('opening');
    triggerVibration(50);
    setTimeout(() => {
        envelopeContainer.style.opacity = '0';
        setTimeout(() => {
            envelopeContainer.classList.add('hidden');
            cardScene.classList.add('show');
            nicknameInput.focus();
        }, 600);
    }, 1000);
});

continueBtn.addEventListener('click', handleContinue);
nicknameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleContinue(); });

function handleContinue() {
    const inputValue = nicknameInput.value.trim();
    if (inputValue === '') {
        nicknameInput.style.borderColor = '#E63946';
        return;
    }
    nickname = inputValue;
    nicknameScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
}

// ============================================
// "ICONIC" SMART EVASION LOGIC
// ============================================
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    checkEvasion();
});

function checkEvasion() {
    if (questionScreen.classList.contains('hidden')) return;

    const noRect = noButtonWrapper.getBoundingClientRect();
    const btnCenterX = noRect.left + noRect.width / 2;
    const btnCenterY = noRect.top + noRect.height / 2;

    // Distance calculation
    const distance = Math.sqrt(Math.pow(mouseX - btnCenterX, 2) + Math.pow(mouseY - btnCenterY, 2));

    // TRIGGER EVASION if mouse gets closer than 100px
    if (distance < 100) {
        moveNoButton();
    }
}

function moveNoButton() {
    if (interactionStartTime === null) interactionStartTime = Date.now();
    
    evasionCount++;
    const padding = 50;
    const yesRect = yesBtn.getBoundingClientRect();
    
    let newX, newY;
    let isSafe = false;
    let attempts = 0;

    // The "Smart Zone" Search
    while (!isSafe && attempts < 20) {
        attempts++;
        // Generate random coords within viewport
        newX = Math.random() * (window.innerWidth - noRectWidth() - padding * 2) + padding;
        newY = Math.random() * (window.innerHeight - noRectHeight() - padding * 2) + padding;

        // Check if coordinate is far enough from mouse
        const distToMouse = Math.sqrt(Math.pow(newX - mouseX, 2) + Math.pow(newY - mouseY, 2));
        
        // Check if coordinate overlaps with the YES button (with safety margin)
        const overlapsYes = (
            newX < yesRect.right + 80 &&
            newX + noRectWidth() > yesRect.left - 80 &&
            newY < yesRect.bottom + 80 &&
            newY + noRectHeight() > yesRect.top - 80
        );

        if (distToMouse > 200 && !overlapsYes) {
            isSafe = true;
        }
    }

    // Apply the position
    noButtonWrapper.style.position = 'fixed';
    noButtonWrapper.style.left = `${newX}px`;
    noButtonWrapper.style.top = `${newY}px`;
    noButtonWrapper.style.margin = '0'; // Remove default flex gaps

    // Scaling Logic
    if (yesBtnScale < MAX_YES_SCALE) {
        yesBtnScale += 0.1;
        yesBtn.style.transform = `scale(${yesBtnScale})`;
    }

    const timePassed = Date.now() - interactionStartTime;
    if (timePassed > SHRINK_THRESHOLD && noBtnScale > MIN_NO_SCALE) {
        noBtnScale -= 0.05;
        noBtn.style.transform = `scale(${noBtnScale})`;
        interactionHint.textContent = 'It\'s getting smaller... give up? 😂';
    } else {
        interactionHint.textContent = 'So close! Try again! 😏';
    }

    triggerVibration(20);
}

// Helpers for bounds
function noRectWidth() { return noButtonWrapper.offsetWidth; }
function noRectHeight() { return noButtonWrapper.offsetHeight; }

// ============================================
// SUCCESS FLOW (Confetti + EmailJS)
// ============================================
yesBtn.addEventListener('click', async () => {
    questionScreen.classList.add('hidden');
    successScene.classList.remove('hidden');
    successMessage.textContent = `Thank you, ${nickname}! 💕`;
    
    launchConfetti();
    await loadCelebrationGif();
    if (EMAILJS_CONFIG.enabled) sendNotification();
});

// Confetti, Gif Loading, and EmailJS functions remain the same as your previous working version
// ... [Keep the rest of your original EmailJS, Confetti, and loadCelebrationGif functions here] ...

function generateSessionId() { return 'session_' + Date.now(); }
function triggerVibration(p) { if ('vibrate' in navigator) navigator.vibrate(p); }

async function loadCelebrationGif() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            gifContainer.innerHTML = '';
            img.classList.add('celebration-gif');
            gifContainer.appendChild(img);
            resolve();
        };
        img.src = CELEBRATION_GIF_URL;
    });
}

function launchConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E63946', '#D4AF37', '#ff6b9d']
    });
}

function sendNotification() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        from_name: nickname,
        timestamp: new Date().toLocaleString(),
        session_id: sessionId
    });
}
