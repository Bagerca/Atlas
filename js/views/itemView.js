window.ItemView = (() => {
    const render = (state) => {
        const { items, isAdmin, route } = state;
        const itemId = route.params.id;
        const item = items.find(i => i.id === itemId);

        if (!item) {
            return `
                <div class="empty-state" style="margin-top: 100px;">
                    <div class="empty-state-icon">${window.Icons.emptyBox}</div>
                    <h2>Запись не найдена</h2>
                    <p>Возможно, она была удалена или ссылка неверна.</p>
                    <a href="#/" class="btn btn-primary" style="margin-top: 20px;">Вернуться в каталог</a>
                </div>
            `;
        }

        const { escapeHtml, getStatusVisuals, getTypeLabel } = window.Helpers;
        
        // Форматирование мета-данных
        const typeLabel = getTypeLabel(item.type);
        const completedText = item.completedAt ? `Завершено: ${new Date(item.completedAt).toLocaleDateString()}` : 'Нет даты завершения';

        const statusesHtml = (item.statuses || []).map(st => {
            const visual = getStatusVisuals(st, item.type);
            if (!visual) return '';
            return `
                <div class="status-badge-detailed ${visual.colorClass}">
                    ${visual.svg} ${window.Helpers.escapeHtml(visual.title)}
                </div>
            `;
        }).join('');

        // Блок прогресса (для сериалов и книг)
        let progressHtml = '';
        if (item.meta && (item.meta.currentProgress !== null || item.meta.totalProgress !== null)) {
            const current = item.meta.currentProgress || 0;
            const total = item.meta.totalProgress || 0;
            const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
            
            progressHtml = `
                <div class="stat-card stat-card-progress">
                    <div class="progress-header">
                        <span class="stat-label">Прогресс</span>
                        <span class="stat-value" style="font-size: 1.2rem;">${current} / ${total || '?'}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }

        let tierHtml = '';
        if (item.tier) {
            tierHtml = `<div class="item-tier-badge tier-${item.tier}">${item.tier}</div>`;
        }

        return `
            <div class="item-page">
                <!-- Плавающее левое меню -->
                <div class="item-floating-nav">
                    <button class="btn-icon" id="back-btn" title="Назад">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    ${isAdmin ? `
                        <button class="btn-icon" onclick="window.Router.setQueryParams({modal: 'edit', id: '${item.id}'})" title="Редактировать">
                            ${window.Icons.edit}
                        </button>
                    ` : ''}
                </div>

                <div class="item-container">
                    <div class="item-poster-wrap">
                        <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'">
                    </div>

                    <div class="item-details">
                        <div class="item-top-meta">
                            <span class="item-type-pill">${escapeHtml(typeLabel)}</span>
                            <div class="item-date-info">
                                ${window.Icons.calendar} ${escapeHtml(completedText)}
                            </div>
                        </div>

                        <div class="item-title-row">
                            <h1 class="item-title">${escapeHtml(item.title)}</h1>
                            ${tierHtml}
                        </div>

                        <div class="item-dashboard">
                            <div class="stat-card">
                                <div class="stat-icon">${window.Icons.star}</div>
                                <div class="stat-info">
                                    <span class="stat-label">Оценка</span>
                                    <span class="stat-value">${item.score ? item.score + ' / 10' : '-'}</span>
                                </div>
                            </div>
                            ${progressHtml}
                        </div>

                        ${statusesHtml ? `
                            <div class="item-section-title">Статусы</div>
                            <div class="item-status-list">
                                ${statusesHtml}
                            </div>
                        ` : ''}

                        ${item.collections && item.collections.length > 0 ? `
                            <div class="item-section-title" style="margin-top: 10px;">Коллекции</div>
                            <div class="item-status-list" style="gap: 6px;">
                                ${item.collections.map(c => `
                                    <span style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 4px 12px; border-radius: var(--radius-xl); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">${escapeHtml(c)}</span>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${item.review ? `
                            <div class="item-review-box">
                                ${escapeHtml(item.review).replace(/\n/g, '<br>')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const onMount = () => {
        // Анимации при монтировании обрабатываются в css (fadeIn)
    };

    const init = () => {};

    return { render, init, onMount };
})();