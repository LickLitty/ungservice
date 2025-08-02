// DOM elements
const greeting = document.getElementById('greeting');
const changeColorBtn = document.getElementById('changeColorBtn');
const clickCount = document.getElementById('clickCount');

// Variables
let clickCounter = 0;
const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hello Snork! Website loaded successfully!');
    
    // Add some initial animation
    greeting.style.opacity = '0';
    greeting.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        greeting.style.transition = 'all 0.8s ease';
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateY(0)';
    }, 300);
});

// Change color functionality
changeColorBtn.addEventListener('click', function() {
    clickCounter++;
    clickCount.textContent = clickCounter;
    
    // Change greeting color
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    greeting.style.color = randomColor;
    
    // Add click animation
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
    
    // Add some fun text changes
    const messages = [
        'Hello Snork!',
        'Hi there Snork!',
        'Greetings Snork!',
        'Welcome Snork!',
        'Hey Snork!'
    ];
    
    if (clickCounter % 5 === 0) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        greeting.textContent = randomMessage;
        
        // Add a little bounce animation
        greeting.style.transform = 'scale(1.1)';
        setTimeout(() => {
            greeting.style.transform = 'scale(1)';
        }, 200);
    }
});

// Add some hover effects
greeting.addEventListener('mouseenter', function() {
    this.style.textShadow = '3px 3px 6px rgba(0, 0, 0, 0.5)';
});

greeting.addEventListener('mouseleave', function() {
    this.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
});

// Add keyboard support
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        changeColorBtn.click();
    }
});

// Add some fun console messages
console.log('🎉 Welcome to your MVP website!');
console.log('💡 Try pressing the spacebar to change colors!'); 