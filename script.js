// Контакты
const MY_PHONE = '+79281068699';
const MY_TELEGRAM = 'https://t.me/maikl_great';
const MY_INSTAGRAM = 'https://www.instagram.com/maikl_great';
const MY_CHANNEL = 'https://t.me/Abnormal_masseur';

// Яндекс.Метрика
const METRIKA_ID = 106284317;

// Глобальные переменные для ответов
let answers = {
    q1: '',
    q2: '',
    q3: ''
};

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

    // Обработка кнопки "Начать разбор"
    const analysisButton = document.getElementById('analysisButton');
    if (analysisButton) {
        analysisButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (typeof ym !== 'undefined') {
                ym(METRIKA_ID, 'reachGoal', 'analysis_start');
            }
            
            // Сброс ответов при открытии
            answers = { q1: '', q2: '', q3: '' };
            
            // Создаем модальное окно с опросником
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="quiz-container">
                        <div class="quiz-header">
                            <h2>Аномальный разбор</h2>
                            <p>Ответь на 3 вопроса, чтобы я понял твою проблему</p>
                        </div>
                        
                        <div class="quiz-progress">
                            <div class="progress-bar" id="progressBar" style="width: 33%"></div>
                        </div>
                        
                        <!-- Вопрос 1 -->
                        <div id="question1" class="question">
                            <h3>Где ты чувствуешь дискомфорт?</h3>
                            <div class="options-grid">
                                <button class="option-btn" onclick="window.selectOption('q1', 'Шея')"><i class="fas fa-user-md"></i> Шея (трудно повернуть)</button>
                                <button class="option-btn" onclick="window.selectOption('q1', 'Плечи')"><i class="fas fa-user-nurse"></i> Плечи и воротниковая зона</button>
                                <button class="option-btn" onclick="window.selectOption('q1', 'Поясница')"><i class="fas fa-spine"></i> Поясница (ноет)</button>
                                <button class="option-btn" onclick="window.selectOption('q1', 'Лопатки')"><i class="fas fa-ribbon"></i> Между лопатками</button>
                                <button class="option-btn" onclick="window.selectOption('q1', 'Усталость')"><i class="fas fa-smile"></i> Общая усталость</button>
                            </div>
                            <div class="quiz-nav">
                                <button class="btn-next" onclick="window.nextQuestion(2)">Дальше <i class="fas fa-arrow-right"></i></button>
                            </div>
                        </div>
                        
                        <!-- Вопрос 2 -->
                        <div id="question2" class="question hidden">
                            <h3>Как давно это беспокоит?</h3>
                            <div class="options-grid">
                                <button class="option-btn" onclick="window.selectOption('q2', 'Дни')"><i class="fas fa-calendar-day"></i> Несколько дней</button>
                                <button class="option-btn" onclick="window.selectOption('q2', 'Недели')"><i class="fas fa-calendar-week"></i> Несколько недель</button>
                                <button class="option-btn" onclick="window.selectOption('q2', 'Месяцы')"><i class="fas fa-calendar-alt"></i> Несколько месяцев</button>
                                <button class="option-btn" onclick="window.selectOption('q2', 'Годы')"><i class="fas fa-hourglass-half"></i> Годами</button>
                            </div>
                            <div class="quiz-nav">
                                <button class="btn-prev" onclick="window.prevQuestion(1)"><i class="fas fa-arrow-left"></i> Назад</button>
                                <button class="btn-next" onclick="window.nextQuestion(3)">Дальше <i class="fas fa-arrow-right"></i></button>
                            </div>
                        </div>
                        
                        <!-- Вопрос 3 -->
                        <div id="question3" class="question hidden">
                            <h3>Чем ты занимаешься большую часть дня?</h3>
                            <div class="options-grid">
                                <button class="option-btn" onclick="window.selectOption('q3', 'Офис')"><i class="fas fa-laptop"></i> Сижу за компьютером</button>
                                <button class="option-btn" onclick="window.selectOption('q3', 'Физический')"><i class="fas fa-hammer"></i> Физический труд</button>
                                <button class="option-btn" onclick="window.selectOption('q3', 'Водитель')"><i class="fas fa-car"></i> За рулём</button>
                                <button class="option-btn" onclick="window.selectOption('q3', 'Смешанный')"><i class="fas fa-random"></i> Комбинирую</button>
                            </div>
                            <div class="quiz-nav">
                                <button class="btn-prev" onclick="window.prevQuestion(2)"><i class="fas fa-arrow-left"></i> Назад</button>
                                <button class="btn-next" onclick="window.showContactForm()">Далее <i class="fas fa-arrow-right"></i></button>
                            </div>
                        </div>
                        
                        <!-- Форма контактов -->
                        <div id="contactForm" class="contact-form hidden">
                            <h3 style="margin-bottom: 20px;">Оставь контакты для результата</h3>
                            <div class="form-group">
                                <label>Ваше имя</label>
                                <input type="text" id="userName" placeholder="Например: Александр">
                            </div>
                            <div class="form-group">
                                <label>Номер телефона</label>
                                <input type="tel" id="userPhone" placeholder="+7 (___) ___-__-__">
                            </div>
                            <button class="btn-submit" onclick="window.submitQuiz()">
                                <i class="fas fa-paper-plane"></i> Получить разбор
                            </button>
                            <p style="text-align: center; margin-top: 15px; font-size: 0.9rem; color: #94a3b8;">
                                <i class="fas fa-lock"></i> Конфиденциально
                            </p>
                        </div>
                        
                        <!-- Результат -->
                        <div id="quizResult" class="quiz-result hidden">
                            <i class="fas fa-check-circle"></i>
                            <h3>Спасибо!</h3>
                            <p>Скоро я свяжусь с тобой и дам персональные упражнения</p>
                            <button class="btn-submit" onclick="window.closeModal()">Закрыть</button>
                        </div>
                    </div>
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
});

// Функции для опросника (делаем их глобальными)
window.selectOption = function(question, value) {
    answers[question] = value;
    
    // Визуальное выделение
    const buttons = event.currentTarget.parentElement.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
};

window.nextQuestion = function(num) {
    // Проверка, выбран ли ответ
    const currentQuestion = num - 1;
    const qKey = 'q' + currentQuestion;
    
    if (!answers[qKey]) {
        alert('Пожалуйста, выберите вариант');
        return;
    }
    
    document.getElementById('question' + (num-1)).classList.add('hidden');
    document.getElementById('question' + num).classList.remove('hidden');
    
    // Обновляем прогресс
    const progress = (num / 3) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
};

window.prevQuestion = function(num) {
    document.getElementById('question' + (num+1)).classList.add('hidden');
    document.getElementById('question' + num).classList.remove('hidden');
    
    // Обновляем прогресс
    const progress = (num / 3) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
};

window.showContactForm = function() {
    // Проверка ответа на 3-й вопрос
    if (!answers.q3) {
        alert('Пожалуйста, выберите вариант');
        return;
    }
    
    document.getElementById('question3').classList.add('hidden');
    document.getElementById('contactForm').classList.remove('hidden');
    document.getElementById('progressBar').style.width = '100%';
};

window.submitQuiz = function() {
    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    
    if (!name) {
        alert('Введите ваше имя');
        return;
    }
    
    if (!phone) {
        alert('Введите номер телефона');
        return;
    }
    
    // Здесь можно отправить данные в Telegram или сохранить
    console.log('Ответы:', answers);
    console.log('Имя:', name);
    console.log('Телефон:', phone);
    
    // Показываем результат
    document.getElementById('contactForm').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    
    // Отправка в Telegram (можно добавить позже)
    // sendToTelegram(name, phone, answers);
};

window.closeModal = function() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
};
