// ===========================================
// === АНІМАЦІЯ ЛОГОТИПА (КАРТИНКА 3) ===
// ===========================================
const pulsingCircle = document.getElementById('pulsing-circle');
let scale = 1;
let direction = 1;

function pulseAnimation() {
    // Збільшуємо або зменшуємо масштаб
    scale += direction * 0.01; 

    // Змінюємо напрямок, коли досягаємо меж (1.1 - максимум, 0.9 - мінімум)
    if (scale > 1.1) {
        direction = -1;
    } else if (scale < 0.9) {
        direction = 1;
    }

    // Застосовуємо трансформацію до SVG-кола
    pulsingCircle.setAttribute('transform', `scale(${scale}, ${scale})`);
    
    // Перезапускаємо анімацію
    requestAnimationFrame(pulseAnimation);
}

// Початковий запуск анімації
if (pulsingCircle) {
    // Встановлюємо початкову точку трансформації в центр кола
    pulsingCircle.setAttribute('transform-origin', '50 50');
    pulseAnimation();
}



