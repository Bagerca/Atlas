window.ItemView = (() => {
    const typeTranslations = {
        'games': 'Игра',
        'features': 'Полнометражное кино',
        'series': 'Сериал / Аниме',
        'literature': 'Литература'
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU');
    };

    const render = (state) => {
        const { items, route, isAdmin, lastCatalogRoute } = state;
        const itemId = route.params.id;
        const item = items.find(i => i.id === itemId);

        if (!item) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">${window.Icons.emptyBox}</div>
                    <h2>Запись не найдена</h2>
                    <p>Возможно, она была удалена.</p>
                    <a href="${lastCatalogRoute || '#/'}" class="btn btn-primary" style="margin-top: 20px;">Вернуться назад</a>
                </div>
            `;
        }

        const { escapeHtml, getStatusVisuals } = window.Helpers;

        // Дашборд: Оценка
        let scoreCard = '';
        if (item.score) {
            scoreCard = `
                <div class="stat-card">
                    <div class="stat-icon">${window.Icons.star}</div>
                    <div class="stat-info">
                        <span class="stat-label">Оценка</span>
                        <span class="stat-value">${item.score} <span style="font-size: 1rem; color: var(--text-muted);">/ 10</span></span>
                    </div>
                </div>
            `;
        }

        // Дашборд: Прогресс (с полосой)
        let progressCard = '';
        if (item.meta && (item.meta.currentProgress || item.meta.totalProgress)) {
            const current = item.meta.currentProgress || 0;
            const total = item.meta.totalProgress || 0;
            const label = item.type === 'literature' ? 'Прочитано глав' : 'Просмотрено серий';
            
            let percent = 0;
            if (total > 0 && current > 0) {
                percent = Math.min(Math.round((current / total) * 100), 100);
            } else if (current > 0 && !total) {
                percent = 100;
            }

            progressCard = `
                <div class="stat-card stat-card-progress">
                    <div class="progress-header">
                        <div class="stat-info">
                            <span class="stat-label">${label}</span>
                            <span class="stat-value">${current} ${total ? `<span style="font-size: 1rem; color: var(--text-muted);">/ ${total}</span>` : ''}</span>
                        </div>
                        ${total ? `<span class="stat-value" style="font-size: 1.2rem;">${percent}%</span>` : ''}
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${total ? percent : 100}%;"></div>
                    </div>
                </div>
            `;
        }

        // Статусы (Теги)
        const statusesHtml = (item.statuses || []).map(st => {
            const visual = getStatusVisuals(st, item.type);
            if (!visual) return '';
            return `
                <div class="status-badge-detailed ${visual.colorClass}">
                    ${visual.svg}
                    <span>${escapeHtml(visual.title)}</span>
                </div>
            `;
        }).join('');

        // Форматирование обзора
        const reviewHtml = item.review && item.review.trim() !== ''
            ? item.review.split('\n').filter(p => p.trim()).map(p => `<p>${escapeHtml(p)}</p>`).join('')
            : '<p class="color-muted" style="font-style: italic;">Описание или отзыв отсутствуют...</p>';

        // Иконка стрелочки назад
        const backIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;

        return `
            <div class="item-page">
                
                <!-- ПЛАВАЮЩИЙ ТУЛБАР СЛЕВА (Фиксированный) -->
                <div class="item-floating-nav">
                    <a href="${lastCatalogRoute || '#/'}" class="btn-icon" title="Вернуться назад">
                        ${backIcon}
                    </a>
                    ${isAdmin ? `
                        <button class="btn-icon edit-btn" data-id="${item.id}" title="Редактировать запись">
                            ${window.Icons.edit}
                        </button>
                        <button class="btn-icon danger delete-btn" data-id="${item.id}" title="Удалить запись">
                            ${window.Icons.trash}
                        </button>
                    ` : ''}
                </div>

                <!-- ОСНОВНАЯ КАРТОЧКА (Постер + Инфа) -->
                <div class="item-container">
                    <div class="item-poster-wrap">
                        <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'">
                    </div>

                    <div class="item-details">
                        <div class="item-top-meta">
                            <span class="item-type-pill">${typeTranslations[item.type] || 'Неизвестно'}</span>
                            ${item.completedAt ? `
                                <div class="item-date-info">
                                    ${window.Icons.calendar} Завершено: ${formatDate(item.completedAt)}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="item-title-row">
                            <h1 class="item-title">${escapeHtml(item.title)}</h1>
                            ${item.tier ? `<div class="item-tier-badge tier-${item.tier}">${item.tier}</div>` : ''}
                        </div>

                        ${(scoreCard || progressCard) ? `
                            <div class="item-dashboard">
                                ${scoreCard}
                                ${progressCard}
                            </div>
                        ` : ''}

                        ${statusesHtml ? `
                            <div class="item-tags-section">
                                <div class="item-section-title">Теги и статусы</div>
                                <div class="item-status-list">
                                    ${statusesHtml}
                                </div>
                            </div>
                        ` : ''}

                        <div class="item-review-section">
                            <div class="item-section-title">Заметки и обзор</div>
                            <div class="item-review-box">
                                ${reviewHtml}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    };

    return { render };
})();