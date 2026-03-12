// Контакты
const MY_PHONE = '+79281068699';
const MY_TELEGRAM = 'https://t.me/maikl_great';
const MY_INSTAGRAM = 'https://www.instagram.com/maikl_great';
const MY_CHANNEL = 'https://t.me/Abnormal_masseur';

// Яндекс.Метрика
const METRIKA_ID = 106284317;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Аномальный сайт загружен!');
    
    // Плавный скролл к якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Отслеживание кликов по телефону
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'phone_click');
            }
            console.log('📞 Клик по телефону');
        });
    });

    // Отслеживание кликов по Telegram
    document.querySelectorAll('a[href*="t.me"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'telegram_click');
            }
            console.log('📱 Клик по Telegram');
        });
    });

    // Отслеживание кликов по Instagram
    document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'instagram_click');
            }
            console.log('📸 Клик по Instagram');
        });
    });

    // Обработка кнопки "Начать разбор" - теперь открывает модальное окно
    const analysisButton = document.getElementById('analysisButton');
    if (analysisButton) {
        analysisButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'analysis_start');
            }
            
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <i class="fas fa-telegram"></i>
                    <h2>Скоро здесь будет опросник!</h2>
                    <p>А пока напиши мне в Telegram — я сам всё расскажу и подберу упражнения лично для тебя.</p>
                    <a href="${MY_TELEGRAM}" target="_blank" class="btn btn-primary" style="display: inline-block; margin: 10px;">
                        <i class="fab fa-telegram"></i> Написать в Telegram
                    </a>
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                        Закрыть
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Закрытие модального окна
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.remove();
            });
            
            // Закрытие по клику вне окна
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
    }

    // Добавляем иконки к диплому и медкнижке в шапку (уже есть в HTML)
    // Добавляем значок для массажа спины (уже есть в HTML)
});
