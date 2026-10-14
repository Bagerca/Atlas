window.IconsView = (() => {
    // Словарь категорий: ключи - названия категорий, значения - массивы имен иконок
    const categoryMap = {
        'Навигация и Хедер': ['search', 'lock', 'unlock', 'plus', 'download'],
        'Управление и UI': ['edit', 'trash', 'close'],
        'Типы медиа': ['gamepad', 'book', 'tv', 'youtube', 'users'],
        'Статусы прохождения': ['checkCircle', 'xCircle', 'clock', 'bookmark'],
        'Мета-данные (Карточки)': ['chart', 'calendar', 'document', 'star'],
        'Иллюстрации': ['emptyBox']
    };

    const renderCategory = (title, keys) => {
        const gridHtml = keys.map(key => `
            <div class="icon-card" data-key="${key}" title="Нажми, чтобы скопировать window.Icons.${key}">
                <div class="icon-svg-wrapper">
                    ${window.Icons[key]}
                </div>
                <div class="icon-name">${key}</div>
            </div>
        `).join('');

        return `
            <section class="icons-category">
                <h2 class="icons-category-title">
                    ${title} <span>${keys.length}</span>
                </h2>
                <div class="icons-grid">
                    ${gridHtml}
                </div>
            </section>
        `;
    };

    const render = (state) => {
        if (!state.isAdmin) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">${window.Icons.lock || '🔒'}</div>
                    <h2>Доступ запрещен</h2>
                    <p>Эта страница доступна только администратору.</p>
                </div>
            `;
        }

        const allKeys = Object.keys(window.Icons);
        const usedKeys = new Set();
        let contentHtml = '';

        // 1. Рендерим известные категории
        for (const [catName, keys] of Object.entries(categoryMap)) {
            // Берем только те иконки, которые реально существуют в window.Icons
            const availableKeys = keys.filter(k => window.Icons[k]);
            
            if (availableKeys.length > 0) {
                availableKeys.forEach(k => usedKeys.add(k));
                contentHtml += renderCategory(catName, availableKeys);
            }
        }

        // 2. Ищем иконки, которые не попали ни в одну категорию
        const uncategorizedKeys = allKeys.filter(k => !usedKeys.has(k));
        
        // 3. Рендерим "Остальные", если есть новые иконки из скрипта
        if (uncategorizedKeys.length > 0) {
            contentHtml += renderCategory('Новые / Без категории', uncategorizedKeys);
        }

        return `
            <div class="admin-page-header">
                <h1>Библиотека иконок</h1>
                <p>Всего загружено: <strong>${allKeys.length}</strong>. Кликните на карточку, чтобы скопировать вызов JS-переменной.</p>
            </div>
            
            <div id="icons-gallery">
                ${contentHtml}
            </div>
            
            <div id="copy-toast" class="toast">Скопировано!</div>
        `;
    };

    const init = () => {
        const main = document.getElementById('app-main');
        
        main.addEventListener('click', (e) => {
            const card = e.target.closest('.icon-card');
            if (card) {
                const key = card.dataset.key;
                const copyText = `window.Icons.${key}`;
                
                navigator.clipboard.writeText(copyText).then(() => {
                    const toast = document.getElementById('copy-toast');
                    if (toast) {
                        toast.innerText = `Скопировано: ${copyText}`;
                        toast.classList.add('show');
                        setTimeout(() => {
                            toast.classList.remove('show');
                        }, 2000);
                    }
                });
            }
        });
    };

    return { render, init };
})();