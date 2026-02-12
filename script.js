// ============================================
// EMAIL NOTIFICATION CONFIGURATION
// ============================================
// TO ENABLE EMAIL NOTIFICATIONS:
// 1. Go to https://www.emailjs.com and create a free account
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template with variables: {{from_name}}, {{timestamp}}, {{session_id}}
// 4. Replace the values below with your actual IDs from EmailJS dashboard
const EMAILJS_CONFIG = {
    enabled: true,
    serviceId: 'service_jscol8t',
    templateId: 'template_4z6don2',
    publicKey: 'f1Jytx3IU_81XPHZZ'
};

// ============================================
// CELEBRATION GIF CONFIGURATION
// ============================================
// Replace this URL with your own hosted GIF for reliability
// Options: Upload to Imgur, ImgBB, or add to your GitHub repository
const CELEBRATION_GIF_URL = 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif';

// ============================================
// STATE VARIABLES
// ============================================
let nickname = '';
let sessionId = generateSessionId();
let interactionStartTime = null;
let evasionCount = 0;
let yesBtnScale = 1;
let noBtnScale = 1;

// Constants
const REPULSION_DISTANCE = 100; // Distance in pixels to trigger repulsion
const YES_SCALE_INCREMENT = 0.1; // 10% growth per evasion
const NO_SCALE_DECREMENT = 0.05; // 5% shrink per evasion after 5 seconds
const MAX_YES_SCALE = 1.8;
const MIN_NO_SCALE = 0.5;
const SHRINK_THRESHOLD = 5000; // 5 seconds in milliseconds

// ============================================
// DOM ELEMENTS
// ============================================
const envelopeContainer = document.getElementById('envelopeContainer');
const envelope = document.getElementById('envelope');
const cardScene = document.getElementById('cardScene');
const nicknameScreen = document.getElementById('nicknameScreen');
const nicknameInput = document.getElementById('nicknameInput');
const continueBtn = document.getElementById('continueBtn');
const questionScreen = document.getElementById('questionScreen');
const buttonsContainer = document.getElementById('buttonsContainer');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const interactionHint = document.getElementById('interactionHint');
const successScene = document.getElementById('successScene');
const successMessage = document.getElementById('successMessage');
const gifContainer = document.getElementById('gifContainer');

// ============================================
// PARALLAX BACKGROUND EFFECT
// ============================================
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    document.querySelectorAll('.parallax-layer').forEach((layer, index) => {
        const speed = (index + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        layer.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ============================================
// ENVELOPE OPENING
// ============================================
envelopeContainer.addEventListener('click', () => {
    envelopeContainer.classList.add('opening');
    
    // Vibrate on mobile
    triggerVibration(50);
    
    setTimeout(() => {
        envelopeContainer.style.transition = 'all 0.6s ease';
        envelopeContainer.style.opacity = '0';
        envelopeContainer.style.transform = 'scale(0.8) translateY(-50px)';
        
        setTimeout(() => {
            envelopeContainer.classList.add('hidden');
            cardScene.classList.add('show');
            nicknameInput.focus();
        }, 600);
    }, 1000);
});

// ============================================
// NICKNAME HANDLING
// ============================================
continueBtn.addEventListener('click', handleContinue);
nicknameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleContinue();
    }
});

function handleContinue() {
    const inputValue = nicknameInput.value.trim();
    
    if (inputValue === '') {
        nicknameInput.style.borderColor = 'var(--deep-rose)';
        nicknameInput.placeholder = 'Please enter a nickname';
        triggerVibration([50, 50, 50]);
        return;
    }
    
    nickname = inputValue;
    sessionId = generateSessionId();
    
    // Transition to question screen
    nicknameScreen.style.animation = 'fadeOut 0.4s ease';
    setTimeout(() => {
        nicknameScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');
        initializeNoButtonPosition();
    }, 400);
}

// ============================================
// "NO" BUTTON REPULSION LOGIC
// ============================================
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    handleRepulsion();
});

// Touch support for mobile
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        handleRepulsion();
    }
});

function handleRepulsion() {
    if (questionScreen.classList.contains('hidden')) return;
    
    const noBtnRect = noBtn.getBoundingClientRect();
    const noBtnCenterX = noBtnRect.left + noBtnRect.width / 2;
    const noBtnCenterY = noBtnRect.top + noBtnRect.height / 2;
    
    // Calculate distance between mouse and button center
    const distance = Math.sqrt(
        Math.pow(mouseX - noBtnCenterX, 2) + 
        Math.pow(mouseY - noBtnCenterY, 2)
    );
    
    // If mouse is within repulsion distance, move button away
    if (distance < REPULSION_DISTANCE) {
        evasionCount++;
        
        // Start timer on first evasion
        if (interactionStartTime === null) {
            interactionStartTime = Date.now();
            interactionHint.textContent = 'Getting harder, isn\'t it? 😏';
        }
        
        // Calculate repulsion vector (away from mouse)
        const vectorX = noBtnCenterX - mouseX;
        const vectorY = noBtnCenterY - mouseY;
        const vectorLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        const normalizedX = vectorX / vectorLength;
        const normalizedY = vectorY / vectorLength;
        
        // Move button in opposite direction
        const moveDistance = REPULSION_DISTANCE;
        let newX = noBtnCenterX + normalizedX * moveDistance;
        let newY = noBtnCenterY + normalizedY * moveDistance;
        
        // Constrain to viewport with padding
        const padding = 50;
        const maxX = window.innerWidth - noBtnRect.width / 2 - padding;
        const maxY = window.innerHeight - noBtnRect.height / 2 - padding;
        
        newX = Math.max(padding + noBtnRect.width / 2, Math.min(newX, maxX));
        newY = Math.max(padding + noBtnRect.height / 2, Math.min(newY, maxY));
        
        // Check if new position overlaps with Yes button
        const yesBtnRect = yesBtn.getBoundingClientRect();
        const yesCenterX = yesBtnRect.left + yesBtnRect.width / 2;
        const yesCenterY = yesBtnRect.top + yesBtnRect.height / 2;
        
        const distanceToYes = Math.sqrt(
            Math.pow(newX - yesCenterX, 2) + 
            Math.pow(newY - yesCenterY, 2)
        );
        
        // If too close to Yes button, move in a different direction
        if (distanceToYes < (yesBtnRect.width / 2 + noBtnRect.width / 2 + 30)) {
            // Try perpendicular direction
            newX = noBtnCenterX + normalizedY * moveDistance;
            newY = noBtnCenterY - normalizedX * moveDistance;
            
            // Constrain again
            newX = Math.max(padding + noBtnRect.width / 2, Math.min(newX, maxX));
            newY = Math.max(padding + noBtnRect.height / 2, Math.min(newY, maxY));
        }
        
        // Apply position
        noBtn.style.left = `${newX - noBtnRect.width / 2}px`;
        noBtn.style.top = `${newY - noBtnRect.height / 2}px`;
        
        // Scale Yes button (grow)
        yesBtnScale = Math.min(yesBtnScale + YES_SCALE_INCREMENT, MAX_YES_SCALE);
        yesBtn.style.transform = `scale(${yesBtnScale})`;
        
        // After 5 seconds, start shrinking No button
        const elapsedTime = Date.now() - interactionStartTime;
        if (elapsedTime > SHRINK_THRESHOLD) {
            noBtnScale = Math.max(noBtnScale - NO_SCALE_DECREMENT, MIN_NO_SCALE);
            noBtn.style.transform = `scale(${noBtnScale})`;
            
            if (noBtnScale <= MIN_NO_SCALE + 0.1) {
                interactionHint.textContent = 'Just give up already! 😂';
            }
        }
        
        // Haptic feedback on mobile
        triggerVibration(20);
    }
}

// Initialize No button position
function initializeNoButtonPosition() {
    setTimeout(() => {
        const containerRect = buttonsContainer.getBoundingClientRect();
        const yesBtnRect = yesBtn.getBoundingClientRect();
        
        // Position No button to the right of Yes
        const initialX = yesBtnRect.right + 30 - containerRect.left;
        const initialY = (containerRect.height - noBtn.offsetHeight) / 2;
        
        noBtn.style.left = `${initialX}px`;
        noBtn.style.top = `${initialY}px`;
    }, 100);
}

// ============================================
// "YES" BUTTON - SUCCESS FLOW
// ============================================
yesBtn.addEventListener('click', async () => {
    // Hide question screen
    questionScreen.style.animation = 'fadeOut 0.4s ease';
    
    setTimeout(async () => {
        questionScreen.classList.add('hidden');
        cardScene.classList.remove('show');
        
        setTimeout(async () => {
            // Show success screen
            successScene.classList.add('show');
            successMessage.textContent = `Thank you, ${nickname}! 💕`;
            
            // Trigger confetti
            launchConfetti();
            
            // Vibrate on mobile
            triggerVibration([100, 50, 100, 50, 200]);
            
            // Load celebration GIF
            await loadCelebrationGif();
            
            // Send notification email
            if (EMAILJS_CONFIG.enabled) {
                sendNotification();
            }
        }, 300);
    }, 400);
});

// ============================================
// CELEBRATION GIF LOADING
// ============================================
async function loadCelebrationGif() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            gifContainer.innerHTML = '';
            img.classList.add('celebration-gif');
            gifContainer.appendChild(img);
            resolve();
        };
        
        img.onerror = () => {
            gifContainer.innerHTML = '<p style="color: #999;">✨ Celebration! ✨</p>';
            reject();
        };
        
        img.src = CELEBRATION_GIF_URL;
    });
}

// ============================================
// CONFETTI EFFECT
// ============================================
function launchConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999,
        colors: ['#E63946', '#D4AF37', '#FFFDF5', '#ff6b9d', '#ffd4e5']
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// ============================================
// EMAIL NOTIFICATION
// ============================================
function sendNotification() {
    if (!EMAILJS_CONFIG.enabled) return;
    
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    const templateParams = {
        from_name: nickname,
        timestamp: new Date().toLocaleString(),
        session_id: sessionId
    };
    
    emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
    ).then(
        (response) => {
            console.log('Notification sent!', response.status, response.text);
        },
        (error) => {
            console.log('Failed to send notification:', error);
        }
    );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function triggerVibration(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Add fadeOut animation to CSS dynamically if needed
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
