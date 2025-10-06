.love-ll {
    position: relative; /* Дозволяє позиціонувати сердечка відносно цього контейнера */
    display: inline-block; /* Щоб контейнер займав лише необхідний простір */
}

.love-mt {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Дозволяє клікам проходити крізь цей шар */
    overflow: hidden; /* Обрізає сердечка, які виходять за межі */
}

.heart {
    position: absolute;
    color: red; /* Червоний колір для сердець */
    font-size: 2em; /* Розмір сердець */
    opacity: 0; /* Починаємо з невидимих сердець */
    animation: fadeAndMove 2s forwards; /* Анімація зникнення та руху вгору */
}

@keyframes fadeAndMove {
    0% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px); /* Рух вгору */
    }
}
