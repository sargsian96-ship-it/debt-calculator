// Твои контакты
const MY_PHONE = '+79281068699';
const MY_TELEGRAM = 'https://t.me/maikl_great';
const MY_INSTAGRAM = 'https://www.instagram.com/maikl_great?igsh=MWRrdXFsbTZkYno2cQ%3D%3D&utm_source=qr';
const MY_CHANNEL = 'https://t.me/Abnormal_masseur';

// Яндекс.Метрика ID
const METRIKA_ID = 106284317;

// Состояние ответов
let answers = {
    q1: 'Шея',
    q2: 'Несколько дней',
    q3: 'Офис'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Аномальный разбор загружен!');

    // Навигация по вопросам
    document.getElementById('nextToQ2')?.addEventListener('click', goToQuestion2);
    document.getElementById('backToQ1')?.addEventListener('click', goToQuestion1);
    document.getElementById('nextToQ3')?.addEventListener('click', goToQuestion3);
    document.getElementById('backToQ2')?.addEventListener('click', goToQuestion2);
    document.getElementById('getResultBtn')?.addEventListener('click', showResult);
    document.getElementById('resetBtn')?.addEventListener('click', resetForm);

    // Отслеживание выбора вариантов
    document.querySelectorAll('input[name="q1"]').forEach(radio => {
        radio.addEventListener('change', (e) => answers.q1 = e.target.value);
    });
    document.querySelectorAll('input[name="q2"]').forEach(radio => {
        radio.addEventListener('change', (e) => answers.q2 = e.target.value);
    });
    document.querySelectorAll('input[name="q3"]').forEach(radio => {
        radio.addEventListener('change', (e) => answers.q3 = e.target.value);
    });
});

// Функции навигации
function goToQuestion2() {
    document.getElementById('question1').style.display = 'none';
    document.getElementById('question2').style.display = 'block';
    // Метрика
    if (typeof ym !== 'undefined') ym(METRIKA_ID, 'reachGoal', 'step_2');
}

function goToQuestion1() {
    document.getElementById('question2').style.display = 'none';
    document.getElementById('question1').style.display = 'block';
}

function goToQuestion3() {
    document.getElementById('question2').style.display = 'none';
    document.getElementById('question3').style.display = 'block';
    // Метрика
    if (typeof ym !== 'undefined') ym(METRIKA_ID, 'reachGoal', 'step_3');
}

function goToQuestion2() {
    document.getElementById('question3').style.display = 'none';
    document.getElementById('question2').style.display = 'block';
}

// Показать результат
function showResult() {
    // Обновляем answers из выбранных радио-кнопок
    const q1Selected = document.querySelector('input[name="q1"]:checked');
    const q2Selected = document.querySelector('input[name="q2"]:checked');
    const q3Selected = document.querySelector('input[name="q3"]:checked');

    if (q1Selected) answers.q1 = q1Selected.value;
    if (q2Selected) answers.q2 = q2Selected.value;
    if (q3Selected) answers.q3 = q3Selected.value;

    // Генерируем текст диагноза
    const diagnosis = generateDiagnosis(answers);
    document.getElementById('diagnosisText').textContent = diagnosis;

    // Показываем результат, скрываем вопросы
    document.getElementById('questionBlock').style.display = 'none';
    document.getElementById('resultBlock').style.display = 'block';

    // Метрика
    if (typeof ym !== 'undefined') ym(METRIKA_ID, 'reachGoal', 'get_result');

    // Плавный скролл к результату
    document.getElementById('resultBlock').scrollIntoView({ behavior: 'smooth' });
}

// Генерация диагноза на основе ответов
function generateDiagnosis(answers) {
    const { q1, q2, q3 } = answers;

    let diagnosis = '';

    if (q1.includes('Шея') || q1.includes('Плечи')) {
        diagnosis = 'Похоже на спазм трапециевидной мышцы. ';
    } else if (q1.includes('Поясница')) {
        diagnosis = 'Похоже на перенапряжение поясничного отдела. ';
    } else if (q1.includes('Лопатки')) {
        diagnosis = 'Похоже на зажатость грудного отдела. ';
    } else {
        diagnosis = 'Похоже на общее мышечное перенапряжение. ';
    }

    if (q2.includes('недель')) {
        diagnosis += 'Это может быть уже не просто усталость, а формирующаяся проблема. ';
    } else if (q2.includes('месяц') || q2.includes('Годами')) {
        diagnosis += 'Такая хроническая боль требует глубокой проработки. ';
    }

    if (q3.includes('Офис') || q3.includes('компьютер')) {
        diagnosis += 'Твоя сидячая работа — главная причина дискомфорта. Нужно регулярно разминаться.';
    } else if (q3.includes('физический')) {
        diagnosis += 'Из-за физических нагрузок мышцы постоянно перенапряжены. Им нужен качественный расслабляющий массаж.';
    } else if (q3.includes('рулём')) {
        diagnosis += 'Долгое сидение за рулём создаёт статическое напряжение. Важно снимать его специальными упражнениями.';
    } else {
        diagnosis += 'Смешанный график требует особого внимания к спине.';
    }

    return diagnosis;
}

// Сброс формы
function resetForm() {
    // Сбрасываем радио-кнопки на первый вариант
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.defaultChecked) radio.checked = true;
    });

    // Сбрасываем answers
    answers = {
        q1: 'Шея',
        q2: 'Несколько дней',
        q3: 'Офис'
    };

    // Показываем первый вопрос
    document.getElementById('question1').style.display = 'block';
    document.getElementById('question2').style.display = 'none';
    document.getElementById('question3').style.display = 'none';
    document.getElementById('resultBlock').style.display = 'none';
    document.getElementById('questionBlock').style.display = 'block';

    // Метрика
    if (typeof ym !== 'undefined') ym(METRIKA_ID, 'reachGoal', 'reset');

    // Плавный скролл к началу
    document.querySelector('.section-header').scrollIntoView({ behavior: 'smooth' });
}
