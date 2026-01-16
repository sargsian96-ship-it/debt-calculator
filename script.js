// Конфигурация Яндекс.Метрики
const METRIKA_ID = 106284317;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор долгов загружен! Яндекс.Метрика ID:', METRIKA_ID);
    
    // Элементы формы
    const addDebtBtn = document.getElementById('addDebtBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const debtTableBody = document.getElementById('debtTableBody');
    const emptyState = document.getElementById('emptyState');
    const phoneLink = document.getElementById('phoneLink');
    const telegramLink = document.getElementById('telegramLink');
    
    // Поля формы
    const creditorInput = document.getElementById('creditor');
    const amountInput = document.getElementById('amount');
    const monthlyInput = document.getElementById('monthly');
    const rateInput = document.getElementById('rate');
    const monthsInput = document.getElementById('months');
    
    // Массив долгов
    let debts = [];
    
    // ===== 1. ФУНКЦИЯ ДОБАВЛЕНИЯ ДОЛГА =====
    addDebtBtn.addEventListener('click', function() {
        console.log('Кнопка "Добавить долг" нажата');
        
        // Получаем значения из формы
        const creditor = creditorInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        const monthly = parseFloat(monthlyInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const months = parseFloat(monthsInput.value) || 0;
        
        console.log('Получены значения:', { creditor, amount, monthly, rate, months });
        
        // Проверяем заполненность полей
        if (!creditor) {
            alert('Введите название кредитора (например: Сбербанк, кредитная карта)');
            creditorInput.focus();
            return;
        }
        
        if (amount <= 0) {
            alert('Введите сумму долга (больше 0)');
            amountInput.focus();
            return;
        }
        
        if (monthly <= 0) {
            alert('Введите ежемесячный платеж (больше 0)');
            monthlyInput.focus();
            return;
        }
        
        // Создаем объект долга
        const newDebt = {
            id: Date.now(), // уникальный ID
            creditor: creditor,
            amount: amount,
            monthly: monthly,
            rate: rate,
            months: months,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        console.log('Создан новый долг:', newDebt);
        
        // Добавляем в массив
        debts.push(newDebt);
        console.log('Всего долгов в массиве:', debts.length);
        
        // ✅ ОТПРАВКА СОБЫТИЯ В ЯНДЕКС.МЕТРИКУ
        if (typeof ym !== 'undefined') {
            ym(METRIKA_ID, 'reachGoal', 'calculator_add_debt');
            console.log('✅ Метрика: отправлено событие calculator_add_debt');
        }
        
        // Обновляем таблицу
        updateDebtTable();
        
        // Обновляем итоги
        updateTotals();
        
        // Очищаем форму
        clearForm();
        
        // Показываем сообщение
        showMessage('✅ Долг добавлен!', 'success');
    });
    
    // ===== 2. ФУНКЦИЯ ОБНОВЛЕНИЯ ТАБЛИЦЫ =====
    function updateDebtTable() {
        console.log('Обновление таблицы...');
        
        // Очищаем таблицу
        debtTableBody.innerHTML = '';
        
        // Если нет долгов, показываем сообщение
        if (debts.length === 0) {
            emptyState.style.display = 'block';
            console.log('Нет долгов для отображения');
            return;
        }
        
        // Скрываем сообщение "нет долгов"
        emptyState.style.display = 'none';
        
        // Добавляем каждый долг в таблицу
        debts.forEach(function(debt, index) {
            const row = document.createElement('tr');
            
            // Рассчитываем общую выплату
            const totalPayment = debt.monthly * debt.months;
            const overpayment = totalPayment - debt.amount;
            
            row.innerHTML = `
                <td>
                    <strong>${debt.creditor}</strong>
                    <div style="font-size: 12px; color: #666;">Добавлен: ${debt.date}</div>
                </td>
                <td><strong>${formatMoney(debt.amount)}</strong></td>
                <td>${formatMoney(debt.monthly)}</td>
                <td>${debt.rate}%</td>
                <td>${debt.months} мес.</td>
                <td>
                    <button onclick="deleteDebt(${debt.id})" 
                            style="background: #fed7d7; color: #c53030; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                        ❌ Удалить
                    </button>
                </td>
            `;
            
            debtTableBody.appendChild(row);
        });
        
        console.log('Таблица обновлена, добавлено строк:', debts.length);
    }
    
    // ===== 3. ФУНКЦИЯ УДАЛЕНИЯ ДОЛГА =====
    window.deleteDebt = function(id) {
        console.log('Удаление долга с ID:', id);
        
        if (!confirm('Удалить этот долг?')) return;
        
        // Фильтруем массив, оставляем все кроме удаляемого
        debts = debts.filter(function(debt) {
            return debt.id !== id;
        });
        
        updateDebtTable();
        updateTotals();
        showMessage('🗑️ Долг удален', 'info');
    };
    
    // ===== 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ИТОГОВ =====
    function updateTotals() {
        console.log('Обновление итогов...');
        
        let totalAmount = 0;
        let totalMonthly = 0;
        
        debts.forEach(function(debt) {
            totalAmount += debt.amount;
            totalMonthly += debt.monthly;
        });
        
        // Обновляем элементы на странице (если они есть)
        const totalDebtEl = document.getElementById('totalDebt');
        const totalMonthlyEl = document.getElementById('totalMonthly');
        
        if (totalDebtEl) totalDebtEl.textContent = formatMoney(totalAmount);
        if (totalMonthlyEl) totalMonthlyEl.textContent = formatMoney(totalMonthly);
        
        console.log('Итоги: сумма =', totalAmount, 'ежемесячно =', totalMonthly);
    }
    
    // ===== 5. ФУНКЦИЯ РАСЧЕТА =====
    calculateBtn.addEventListener('click', function() {
        console.log('Расчет выгоды...');
        
        if (debts.length === 0) {
            alert('Сначала добавьте хотя бы один долг');
            return;
        }
        
        calculateResults();
    });
    
    function calculateResults() {
        let totalDebt = 0;
        let totalMonthly = 0;
        let totalOverpayment = 0;
        
        debts.forEach(function(debt) {
            totalDebt += debt.amount;
            totalMonthly += debt.monthly;
            
            const totalPayment = debt.monthly * debt.months;
            totalOverpayment += (totalPayment - debt.amount);
        });
        
        // Потенциальная экономия (40% от переплаты)
        const potentialSavings = Math.round(totalOverpayment * 0.4);
        
        // Обновляем элементы результатов
        const resultTotalDebtEl = document.getElementById('resultTotalDebt');
        const resultMonthlyEl = document.getElementById('resultMonthly');
        const resultOverpaymentEl = document.getElementById('resultOverpayment');
        const resultSavingsEl = document.getElementById('resultSavings');
        
        if (resultTotalDebtEl) resultTotalDebtEl.textContent = formatMoney(totalDebt);
        if (resultMonthlyEl) resultMonthlyEl.textContent = formatMoney(totalMonthly);
        if (resultOverpaymentEl) resultOverpaymentEl.textContent = formatMoney(totalOverpayment);
        if (resultSavingsEl) resultSavingsEl.textContent = formatMoney(potentialSavings);
        
        // ✅ ОТПРАВКА СОБЫТИЯ В ЯНДЕКС.МЕТРИКУ
        if (typeof ym !== 'undefined') {
            ym(METRIKA_ID, 'reachGoal', 'calculator_calculate');
            console.log('✅ Метрика: отправлено событие calculator_calculate');
        }
        
        // ===== ПОКАЗЫВАЕМ ПРИЗЫВ К ДЕЙСТВИЮ =====
        showCTA(totalMonthly, totalOverpayment);
        
        // Прокручиваем к результатам
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        console.log('Результаты расчета:', {
            totalDebt,
            totalMonthly,
            totalOverpayment,
            potentialSavings
        });
        
        showMessage('📊 Расчет завершен!', 'success');
    }
    
    // ===== 6. ФУНКЦИЯ ПОКАЗА ПРИЗЫВА К ДЕЙСТВИЮ =====
    function showCTA(totalMonthly, totalOverpayment) {
        const ctaSection = document.getElementById('ctaSection');
        const ctaOverpaymentEl = document.getElementById('ctaOverpayment');
        
        // Обновляем цифру в CTA
        if (ctaOverpaymentEl) {
            ctaOverpaymentEl.textContent = formatMoney(totalMonthly);
        }
        
        // Показываем CTA блок
        ctaSection.style.display = 'block';
        
        // Прокручиваем к CTA
        setTimeout(() => {
            ctaSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 500);
        
        console.log('CTA показан с суммой:', totalMonthly);
    }
    
    // ===== 7. ФУНКЦИЯ ПОКАЗА ОТЧЕТА =====
    window.showReport = function() {
        console.log('Показ отчета...');
        
        if (debts.length === 0) {
            alert('Нет данных для отчета. Сначала добавьте долги и сделайте расчет.');
            return;
        }
        
        // Рассчитываем, если еще не рассчитано
        if (document.getElementById('resultSavings').textContent === '0 ₽') {
            calculateResults();
        }
        
        // Генерируем содержимое отчета
        generateReportContent();
        
        // Показываем блок отчета
        document.getElementById('reportSection').style.display = 'block';
        
        // ✅ ОТПРАВКА СОБЫТИЯ В ЯНДЕКС.МЕТРИКУ
        if (typeof ym !== 'undefined') {
            ym(METRIKA_ID, 'reachGoal', 'report_show');
            console.log('✅ Метрика: отправлено событие report_show');
        }
        
        // Прокручиваем к отчету
        document.getElementById('reportSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        showMessage('📄 Отчет сгенерирован!', 'success');
    };
    
    // ===== 8. ФУНКЦИЯ СКРЫТИЯ ОТЧЕТА =====
    window.hideReport = function() {
        document.getElementById('reportSection').style.display = 'none';
    };
    
    // ===== 9. ФУНКЦИЯ ГЕНЕРАЦИИ ОТЧЕТА =====
    function generateReportContent() {
        const reportContent = document.getElementById('reportContent');
        
        // Рассчитываем итоги
        let totalDebt = 0;
        let totalMonthly = 0;
        let totalOverpayment = 0;
        
        debts.forEach(debt => {
            totalDebt += debt.amount;
            totalMonthly += debt.monthly;
            const totalPayment = debt.monthly * debt.months;
            totalOverpayment += (totalPayment - debt.amount);
        });
        
        const potentialSavings = Math.round(totalOverpayment * 0.4);
        const avgRate = debts.reduce((sum, debt) => sum + debt.rate, 0) / debts.length;
        
        // Формируем HTML отчета
        let html = `
            <div class="report-meta">
                <div class="report-row">
                    <span class="report-label">Дата отчета:</span>
                    <span class="report-value">${new Date().toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Количество долгов:</span>
                    <span class="report-value">${debts.length}</span>
                </div>
            </div>
            
            <h3 style="margin: 25px 0 15px 0; color: #2d3748;">📋 Детализация долгов</h3>
        `;
        
        // Добавляем каждый долг
        debts.forEach((debt, index) => {
            const totalPayment = debt.monthly * debt.months;
            const debtOverpayment = totalPayment - debt.amount;
            
            html += `
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-weight: 700; color: #2d3748; margin-bottom: 10px;">
                        ${index + 1}. ${debt.creditor}
                    </div>
                    <div class="report-row">
                        <span class="report-label">Сумма долга:</span>
                        <span class="report-value">${formatMoney(debt.amount)}</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Ежемесячный платеж:</span>
                        <span class="report-value">${formatMoney(debt.monthly)}</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Ставка:</span>
                        <span class="report-value">${debt.rate}% годовых</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Остаток срока:</span>
                        <span class="report-value">${debt.months} месяцев</span>
                    </div>
                    <div class="report-row">
                        <span class="report-label">Общая переплата:</span>
                        <span class="report-value">${formatMoney(debtOverpayment)}</span>
                    </div>
                </div>
            `;
        });
        
        // Итоги
        html += `
            <div class="report-total">
                <h3 style="margin-top: 0; color: #22543d;">💰 Итоговые показатели</h3>
                <div class="report-row">
                    <span class="report-label">Общая сумма долгов:</span>
                    <span class="report-value">${formatMoney(totalDebt)}</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Совокупный ежемесячный платеж:</span>
                    <span class="report-value">${formatMoney(totalMonthly)}</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Средняя процентная ставка:</span>
                    <span class="report-value">${avgRate.toFixed(1)}%</span>
                </div>
                <div class="report-row">
                    <span class="report-label">Общая переплата:</span>
                    <span class="report-value">${formatMoney(totalOverpayment)}</span>
                </div>
                <div class="report-row" style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <span class="report-label" style="font-size: 1.1rem; color: #22543d;">Возможное списание при банкротстве:</span>
                    <span class="report-value" style="font-size: 1.3rem; color: #38a169;">${formatMoney(potentialSavings)}</span>
                </div>
            </div>
            
            <div class="report-note">
                <p><strong>Важно:</strong> Это предварительный расчет на основе введенных данных. 
                Точный размер списания определяется судом в рамках процедуры банкротства физического лица.</p>
                <p>Для детального анализа вашей ситуации и расчета реальной выгоды обратитесь к юристу.</p>
            </div>
            
            <div class="phone-cta">
                <h4>📞 Свяжитесь с нами</h4>
                <p style="color: #4a5568;">Получите бесплатную консультацию по списанию долгов</p>
                <div class="phone-number">
                    <a href="tel:+79281068699" class="report-phone-link">+7 (928) 106-86-99</a>
                </div>
                <div class="phone-buttons">
                    <a href="tel:+79281068699" class="btn-call report-phone-link">
                        <i class="fas fa-phone"></i> Позвонить сейчас
                    </a>
                    <a href="https://t.me/ArcadConsult_bot" class="btn-telegram report-telegram-link">
                        <i class="fab fa-telegram"></i> Telegram
                    </a>
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem; color: #718096;">
                    Работаем с 9:00 до 21:00, без выходных
                </p>
            </div>
        `;
        
        reportContent.innerHTML = html;
        
        // Назначаем обработчики для ссылок в отчете
        setTimeout(() => {
            document.querySelectorAll('.report-phone-link').forEach(link => {
                link.addEventListener('click', trackPhoneClick);
            });
            document.querySelectorAll('.report-telegram-link').forEach(link => {
                link.addEventListener('click', trackTelegramClick);
            });
        }, 100);
    }
    
    // ===== 10. ТРЕКИНГ КЛИКОВ ПО ТЕЛЕФОНУ =====
    function trackPhoneClick(e) {
        console.log('Клик по телефону');
        
        // ✅ ОТПРАВКА СОБЫТИЯ В ЯНДЕКС.МЕТРИКУ
        if (typeof ym !== 'undefined') {
            ym(METRIKA_ID, 'reachGoal', 'conversion_phone_click');
            console.log('✅ Метрика: отправлено событие conversion_phone_click');
        }
        
        // Даем время на отправку события
        setTimeout(() => {
            // Обычный переход по ссылке
        }, 300);
    }
    
    // ===== 11. ТРЕКИНГ КЛИКОВ ПО TELEGRAM =====
    function trackTelegramClick(e) {
        console.log('Клик по Telegram');
        
        // ✅ ОТПРАВКА СОБЫТИЯ В ЯНДЕКС.МЕТРИКУ
        if (typeof ym !== 'undefined') {
            ym(METRIKA_ID, 'reachGoal', 'conversion_telegram_click');
            console.log('✅ Метрика: отправлено событие conversion_telegram_click');
        }
        
        // Открываем в новой вкладке
        e.preventDefault();
        setTimeout(() => {
            window.open(e.target.href || e.target.parentElement.href, '_blank');
        }, 300);
    }
    
    // ===== 12. НАСТРОЙКА ТРЕКИНГА КОНВЕРСИЙ =====
    function setupConversionTracking() {
        // Клики на телефон в основном интерфейсе
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', trackPhoneClick);
        });
        
        // Клики на Telegram в основном интерфейсе
        document.querySelectorAll('a[href*="t.me"]').forEach(link => {
            link.addEventListener('click', trackTelegramClick);
        });
        
        console.log('Трекинг конверсий настроен');
    }
    
    // ===== 13. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    function clearForm() {
        creditorInput.value = '';
        amountInput.value = '';
        monthlyInput.value = '';
        rateInput.value = '';
        monthsInput.value = '';
        creditorInput.focus();
    }
    
    function formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
    }
    
    function showMessage(text, type) {
        // Создаем элемент сообщения
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#38a169' : '#4299e1'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(message);
        
        // Удаляем через 3 секунды
        setTimeout(function() {
            if (message.parentNode) {
                message.style.animation = 'fadeOut 0.3s';
                setTimeout(function() {
                    if (message.parentNode) {
                        document.body.removeChild(message);
                    }
                }, 300);
            }
        }, 3000);
        
        // Добавляем стили для анимации
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ===== 14. ИНИЦИАЛИЗАЦИЯ =====
    console.log('Инициализация завершена');
    console.log('Яндекс.Метрика ID:', METRIKA_ID);
    console.log('Готов к работе! Добавляйте долги.');
    
    // Настраиваем трекинг конверсий
    setupConversionTracking();
});
