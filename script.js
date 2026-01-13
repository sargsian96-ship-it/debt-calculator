document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор долгов загружен');
    
    // Элементы DOM
    const addDebtBtn = document.getElementById('addDebtBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const debtTableBody = document.getElementById('debtTableBody');
    const emptyState = document.getElementById('emptyState');
    const debtTable = document.getElementById('debtTable');
    
    // Элементы для отображения сумм
    const totalDebtEl = document.getElementById('totalDebt');
    const totalMonthlyEl = document.getElementById('totalMonthly');
    const resultTotalDebtEl = document.getElementById('resultTotalDebt');
    const resultMonthlyEl = document.getElementById('resultMonthly');
    const resultOverpaymentEl = document.getElementById('resultOverpayment');
    const resultSavingsEl = document.getElementById('resultSavings');
    
    // Массив для хранения долгов
    let debts = [];
    
    // Загрузка сохраненных долгов из localStorage
    loadDebtsFromStorage();
    
    // Функция добавления долга
    addDebtBtn.addEventListener('click', function() {
        const creditor = document.getElementById('creditor').value.trim();
        const amount = parseInt(document.getElementById('amount').value) || 0;
        const monthly = parseInt(document.getElementById('monthly').value) || 0;
        const rate = parseInt(document.getElementById('rate').value) || 0;
        const months = parseInt(document.getElementById('months').value) || 0;
        
        // Валидация
        if (!creditor) {
            alert('Введите название кредитора или тип долга');
            document.getElementById('creditor').focus();
            return;
        }
        
        if (amount <= 0) {
            alert('Введите корректную сумму долга');
            document.getElementById('amount').focus();
            return;
        }
        
        if (monthly <= 0) {
            alert('Введите корректный ежемесячный платеж');
            document.getElementById('monthly').focus();
            return;
        }
        
        // Создаем объект долга
        const debt = {
            id: Date.now(), // Уникальный ID
            creditor: creditor,
            amount: amount,
            monthly: monthly,
            rate: rate,
            months: months,
            addedDate: new Date().toLocaleDateString('ru-RU')
        };
        
        // Добавляем в массив
        debts.push(debt);
        
        // Сохраняем в localStorage
        saveDebtsToStorage();
        
        // Обновляем интерфейс
        updateDebtTable();
        updateTotals();
        
        // Очищаем форму
        clearForm();
        
        // Показываем уведомление
        showNotification('Долг добавлен!', 'success');
    });
    
    // Функция расчета выгоды
    calculateBtn.addEventListener('click', function() {
        if (debts.length === 0) {
            alert('Добавьте хотя бы один долг для расчета');
            return;
        }
        
        calculateResults();
        showNotification('Расчет завершен!', 'success');
    });
    
    // Функция скачивания отчета
    downloadReportBtn.addEventListener('click', function() {
        if (debts.length === 0) {
            alert('Нет данных для отчета. Добавьте долги и сделайте расчет.');
            return;
        }
        
        // В реальном проекте здесь генерация PDF
        // Сейчас просто открываем бота
        window.open('https://t.me/ArcadConsult_bot?start=report', '_blank');
        showNotification('Открываем бота для генерации отчета...', 'info');
    });
    
    // Функция обновления таблицы долгов
    function updateDebtTable() {
        debtTableBody.innerHTML = '';
        
        if (debts.length === 0) {
            emptyState.style.display = 'block';
            debtTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        debtTable.style.display = 'table';
        
        debts.forEach(debt => {
            const row = document.createElement('tr');
            
            // Рассчитываем общую сумму выплат
            const totalPayment = debt.monthly * debt.months;
            const overpayment = totalPayment - debt.amount;
            
            row.innerHTML = `
                <td>
                    <strong>${debt.creditor}</strong>
                    <div class="debt-meta">Добавлен: ${debt.addedDate}</div>
                </td>
                <td><strong>${formatCurrency(debt.amount)}</strong></td>
                <td>${formatCurrency(debt.monthly)}</td>
                <td>${debt.rate}%</td>
                <td>${debt.months} мес.</td>
                <td>
                    <button class="delete-btn" onclick="deleteDebt(${debt.id})">
                        <i class="fas fa-trash-alt"></i> Удалить
                    </button>
                </td>
            `;
            
            debtTableBody.appendChild(row);
        });
    }
    
    // Функция удаления долга (должна быть глобальной для onclick)
    window.deleteDebt = function(id) {
        if (!confirm('Удалить этот долг?')) return;
        
        debts = debts.filter(debt => debt.id !== id);
        saveDebtsToStorage();
        updateDebtTable();
        updateTotals();
        showNotification('Долг удален', 'warning');
    };
    
    // Функция обновления итоговых сумм
    function updateTotals() {
        let totalDebt = 0;
        let totalMonthly = 0;
        
        debts.forEach(debt => {
            totalDebt += debt.amount;
            totalMonthly += debt.monthly;
        });
        
        totalDebtEl.textContent = formatCurrency(totalDebt);
        totalMonthlyEl.textContent = formatCurrency(totalMonthly);
        
        // Если есть долги, показываем кнопку расчета
        calculateBtn.disabled = debts.length === 0;
        calculateBtn.style.opacity = debts.length === 0 ? '0.7' : '1';
    }
    
    // Функция расчета результатов
    function calculateResults() {
        let totalDebt = 0;
        let totalMonthly = 0;
        let totalOverpayment = 0;
        
        debts.forEach(debt => {
            totalDebt += debt.amount;
            totalMonthly += debt.monthly;
            
            // Рассчитываем переплату по каждому долгу
            const totalPayment = debt.monthly * debt.months;
            totalOverpayment += (totalPayment - debt.amount);
        });
        
        // Рассчитываем потенциальную экономию (30-60% от переплаты)
        // Чем больше ставка и сумма, тем больше экономия
        let savingsPercentage = 0.4; // Базовая экономия 40%
        
        // Увеличиваем процент экономии для долгов с высокой ставкой
        const avgRate = debts.reduce((sum, debt) => sum + debt.rate, 0) / debts.length;
        if (avgRate > 25) savingsPercentage = 0.5;
        if (avgRate > 35) savingsPercentage = 0.6;
        
        const potentialSavings = Math.round(totalOverpayment * savingsPercentage);
        
        // Обновляем элементы результатов
        resultTotalDebtEl.textContent = formatCurrency(totalDebt);
        resultMonthlyEl.textContent = formatCurrency(totalMonthly);
        resultOverpaymentEl.textContent = formatCurrency(totalOverpayment);
        resultSavingsEl.textContent = formatCurrency(potentialSavings);
        
        // Прокручиваем к результатам
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Функция очистки формы
    function clearForm() {
        document.getElementById('creditor').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('monthly').value = '';
        document.getElementById('rate').value = '';
        document.getElementById('months').value = '';
        document.getElementById('creditor').focus();
    }
    
    // Функция форматирования валюты
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' ₽';
    }
    
    // Функция сохранения в localStorage
    function saveDebtsToStorage() {
        try {
            localStorage.setItem('debtCalculator_debts', JSON.stringify(debts));
        } catch (e) {
            console.log('Не удалось сохранить в localStorage:', e);
        }
    }
    
    // Функция загрузки из localStorage
    function loadDebtsFromStorage() {
        try {
            const saved = localStorage.getItem('debtCalculator_debts');
            if (saved) {
                debts = JSON.parse(saved);
                updateDebtTable();
                updateTotals();
            }
        } catch (e) {
            console.log('Не удалось загрузить из localStorage:', e);
        }
    }
    
    // Функция показа уведомления
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#38a169' : type === 'warning' ? '#d69e2e' : '#4299e1'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Добавляем в body
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Добавляем CSS анимации
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Автоматический расчет при изменении долгов
    let debounceTimer;
    function debounceCalculate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (debts.length > 0) {
                calculateResults();
            }
        }, 500);
    }
    
    // Обновляем расчет при изменении массива долгов
    const originalPush = Array.prototype.push;
    Array.prototype.push = function() {
        const result = originalPush.apply(this, arguments);
        debounceCalculate();
        return result;
    };
    
    // Инициализация
    updateTotals();
    console.log(`Загружено ${debts.length} долгов`);
    
    // Добавляем обработчики клавиш
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter добавляет долг
        if (e.ctrlKey && e.key === 'Enter') {
            addDebtBtn.click();
        }
        // Enter в последнем поле добавляет долг
        if (e.key === 'Enter' && e.target.id === 'months') {
            addDebtBtn.click();
        }
    });
});
