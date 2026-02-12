// Get elements
const envelopeWrapper = document.getElementById('envelopeWrapper');
const cardContainer = document.getElementById('cardContainer');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttonsContainer = document.getElementById('buttonsContainer');
const successMessage = document.getElementById('successMessage');

// State variables
let noClickCount = 0;
let interactionStartTime = null;
let yesBtnScale = 1;
let noBtnScale = 1;
const MIN_NO_SCALE = 0.4;
const MAX_YES_SCALE = 3;
const SHRINK_START_TIME = 5000; // 5 seconds

// Envelope opening animation
envelopeWrapper.addEventListener('click', () => {
    envelopeWrapper.classList.add('opening');
    
    setTimeout(() => {
        envelopeWrapper.style.opacity = '0';
        envelopeWrapper.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            envelopeWrapper.classList.add('hidden');
            cardContainer.classList.add('show');
        }, 600);
    }, 800);
});

// Calculate safe position for "No" button (avoiding overlap with "Yes")
function getRandomPosition() {
    const container = buttonsContainer;
    const containerRect = container.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    
    // Calculate safe boundaries accounting for current button sizes
    const padding = 20;
    const yesCenterX = yesRect.left + yesRect.width / 2 - containerRect.left;
    const yesCenterY = yesRect.top + yesRect.height / 2 - containerRect.top;
    const yesRadius = Math.max(yesRect.width, yesRect.height) / 2 + padding;
    
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Try to find a position that doesn't overlap with "Yes" button
    do {
        newX = Math.random() * (containerWidth - noRect.width);
        newY = Math.random() * (containerHeight - noRect.height);
        
        const noCenterX = newX + noRect.width / 2;
        const noCenterY = newY + noRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(noCenterX - yesCenterX, 2) + 
            Math.pow(noCenterY - yesCenterY, 2)
        );
        
        attempts++;
        
        // If we find a safe position or tried too many times, use it
        if (distance > yesRadius || attempts >= maxAttempts) {
            break;
        }
    } while (true);
    
    return { x: newX, y: newY };
}

// Handle "No" button hover/click
function handleNoInteraction(e) {
    e.preventDefault();
    
    // Start timer on first interaction
    if (interactionStartTime === null) {
        interactionStartTime = Date.now();
    }
    
    noClickCount++;
    
    // Scale up "Yes" button (with max limit)
    yesBtnScale = Math.min(1 + (noClickCount * 0.2), MAX_YES_SCALE);
    yesBtn.style.transform = `scale(${yesBtnScale})`;
    
    // Check if 5 seconds have passed to start shrinking "No"
    const elapsedTime = Date.now() - interactionStartTime;
    if (elapsedTime > SHRINK_START_TIME) {
        noBtnScale = Math.max(noBtnScale - 0.15, MIN_NO_SCALE);
        noBtn.style.transform = `scale(${noBtnScale})`;
    }
    
    // Move "No" button to random position
    const newPos = getRandomPosition();
    noBtn.style.left = `${newPos.x}px`;
    noBtn.style.top = `${newPos.y}px`;
    
    // Add a little shake animation to "No" button
    noBtn.style.animation = 'none';
    setTimeout(() => {
        noBtn.style.animation = '';
    }, 10);
}

// Add event listeners for "No" button (both desktop and mobile)
noBtn.addEventListener('mouseenter', handleNoInteraction);
noBtn.addEventListener('click', handleNoInteraction);
noBtn.addEventListener('touchstart', handleNoInteraction);

// Handle "Yes" button click
yesBtn.addEventListener('click', () => {
    buttonsContainer.classList.add('hidden');
    successMessage.classList.add('show');
    
    // Add confetti effect (using emoji)
    createConfetti();
});

// Create confetti effect
function createConfetti() {
    const confettiCount = 50;
    const colors = ['💕', '💖', '💗', '💘', '💝', '❤️', '🌸', '🌺', '🎀'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.textContent = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = Math.random() * 20 + 15 + 'px';
        confetti.style.opacity = Math.random();
        confetti.style.zIndex = '1000';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        // Animate confetti falling
        const duration = Math.random() * 3 + 2;
        const angle = Math.random() * 360;
        
        confetti.animate([
            {
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translateY(100vh) rotate(${angle}deg)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// Initialize "No" button position
window.addEventListener('load', () => {
    // Set initial position for "No" button
    setTimeout(() => {
        const initialPos = getRandomPosition();
        noBtn.style.left = `${initialPos.x}px`;
        noBtn.style.top = `${initialPos.y}px`;
    }, 100);
});
