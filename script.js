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

    // Обработка кнопки "Бесплатный разбор"
    const analysisBtn = document.querySelector('.free-analysis .btn-primary');
    if (analysisBtn) {
        analysisBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'analysis_start');
            }
            console.log('🔍 Начат бесплатный разбор');
            
            // Здесь можно открыть модальное окно с опросником
            alert('Скоро здесь появится опросник! А пока напиши мне в Telegram @maikl_great — я сам всё расскажу.');
            window.open(MY_TELEGRAM, '_blank');
        });
    }
});
