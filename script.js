const MY_PHONE = '+79281068699';
const MY_TELEGRAM = 'https://t.me/maikl_great';
const MY_INSTAGRAM = 'https://www.instagram.com/maikl_great';
const MY_CHANNEL = 'https://t.me/Abnormal_masseur';
const METRIKA_ID = 106284317;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Сайт загружен!');

    // Плавный скролл
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Обработка кнопки "Начать разбор"
    const analysisButton = document.getElementById('analysisButton');
    if (analysisButton) {
        analysisButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof ym !== 'undefined') ym(METRIKA_ID, 'reachGoal', 'analysis_start');

            // Создаём модальное окно
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <i class="fas fa-telegram"></i>
                    <h2>Скоро здесь будет опросник!</h2>
                    <p>А пока напиши мне в Telegram — я сам всё расскажу.</p>
                    <a href="${MY_TELEGRAM}" target="_blank" class="btn btn-primary" style="text-decoration: none;">Написать в Telegram</a>
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Закрытие окна
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        });
    }
});
