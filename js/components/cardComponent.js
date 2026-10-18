window.CardComponent = (() => {
    const render = (item, isAdmin) => {
        const { escapeHtml, getStatusVisuals } = window.Helpers;

        let progressBadge = '';
        if (item.meta && (item.meta.currentProgress || item.meta.totalProgress)) {
            const current = item.meta.currentProgress || '?';
            const total = item.meta.totalProgress || '?';
            progressBadge = `
                <div class="card-progress-badge" title="Прогресс">
                    ${window.Icons.chart}
                    <span>${current} / ${total}</span>
                </div>`;
        }

        // Фильтруем статусы: убираем иконки "Жизненного цикла" (галочки, часики), оставляем только Форматы и Экстра
        const lifecycleTypes = ['in_progress', 'endless', 'completed', 'planned', 'dropped'];
        const displayStatuses = (item.statuses || []).filter(st => !lifecycleTypes.includes(st));

        const statusesHtml = displayStatuses.map(st => {
            const visual = getStatusVisuals(st, item.type);
            if (!visual) return '';
            return `
                <div class="status-icon ${visual.colorClass}" title="${visual.title}">
                    ${visual.svg}
                </div>
            `;
        }).join('');

        const reviewIcon = (item.review && item.review.trim() !== '') 
            ? `<div class="status-icon color-warning" title="Есть заметка/рецензия">${window.Icons.document}</div>` 
            : '';

        return `
        <a href="#/item?id=${item.id}" class="card card-hidden">
            <div class="card-poster-wrapper skeleton-bg">
                <img 
                    src="${escapeHtml(item.poster)}" 
                    alt="${escapeHtml(item.title)}" 
                    class="card-poster" 
                    loading="lazy" 
                    decoding="async" 
                    onload="this.parentElement.classList.remove('skeleton-bg')"
                    onerror="this.style.display='none'; this.parentElement.classList.remove('skeleton-bg');"
                >
                
                <div class="card-score tier-${item.tier}">
                    ${item.tier ? item.tier : (item.score ? item.score + '/10' : '-')}
                </div>
                
                ${progressBadge}

                ${isAdmin ? `
                    <div class="card-admin-actions">
                        <button class="btn-icon edit-btn" data-id="${item.id}" title="Редактировать">${window.Icons.edit}</button>
                        <button class="btn-icon danger delete-btn" data-id="${item.id}" title="Удалить">${window.Icons.trash}</button>
                    </div>
                ` : ''}
            </div>
            <div class="card-info">
                <h3 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>

                <div class="card-icons-row">
                    ${statusesHtml}
                    <div style="flex: 1;"></div>
                    ${reviewIcon}
                </div>
            </div>
        </a>
        `;
    };

    return { render };
})();