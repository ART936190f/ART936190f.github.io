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


// ===============================================
// === АНІМАЦІЯ ЛИСТІВКИ (КАРТИНКА 5) ===
// ===============================================
const postcardSvg = document.getElementById('postcard-svg');

if (postcardSvg) {
    // Створюємо елемент <animate> для анімації руху X
    const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    
    animateElement.setAttribute('attributeName', 'x'); // Анімуємо позицію X SVG-елемента
    animateElement.setAttribute('from', '0');         // Починаємо з 0
    animateElement.setAttribute('to', '20');          // Рухаємо вправо на 20px
    animateElement.setAttribute('dur', '3s');         // Тривалість 3 секунди
    animateElement.setAttribute('repeatCount', 'indefinite'); // Повторюємо нескінченно
    animateElement.setAttribute('fill', 'freeze');
    animateElement.setAttribute('calcMode', 'alternate'); // Рухаємо туди-сюди

    // Додаємо анімацію до SVG
    postcardSvg.appendChild(animateElement);
}

