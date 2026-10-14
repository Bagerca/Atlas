window.CardComponent = (() => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU');
    };

    const render = (item, isAdmin) => {
        const { escapeHtml, getStatusDict } = window.Helpers;
        const statusDict = getStatusDict(item.type);

        let progressText = '';
        if (item.meta && (item.meta.currentProgress || item.meta.totalProgress)) {
            const current = item.meta.currentProgress || '?';
            const total = item.meta.totalProgress || '?';
            const label = item.type === 'literature' ? 'Главы/Стр:' : 'Серии:';
            progressText = `<span>📊 ${label} ${current} / ${total}</span>`;
        }

        const dateText = item.completedAt ? `<span>📅 Пройдено: ${formatDate(item.completedAt)}</span>` : '';
        
        // Индикатор наличия рецензии
        const reviewBadge = item.review && item.review.trim() !== '' 
            ? `<span title="Есть рецензия">${window.Icons.document}</span>` 
            : '';

        return `
        <article class="card">
            <div class="card-poster-wrapper">
                <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}" class="card-poster" onerror="this.style.display='none'">
                <div class="card-score tier-${item.tier}">
                    ${item.tier ? item.tier : (item.score ? item.score + '/10' : '-')}
                </div>
                ${isAdmin ? `
                    <div class="card-admin-actions">
                        <button class="btn-icon edit-btn" data-id="${item.id}" title="Редактировать">${window.Icons.edit}</button>
                        <button class="btn-icon danger delete-btn" data-id="${item.id}" title="Удалить">${window.Icons.trash}</button>
                    </div>
                ` : ''}
            </div>
            <div class="card-info">
                <h3 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
                
                ${(dateText || progressText || reviewBadge) ? `
                    <div class="card-meta-info">
                        ${progressText}
                        ${dateText}
                        ${reviewBadge}
                    </div>
                ` : ''}

                <div class="card-statuses">
                    ${(item.statuses || []).map(st => `<span class="status-badge">${escapeHtml(statusDict[st] || st)}</span>`).join('')}
                </div>
            </div>
        </article>
        `;
    };

    return { render };
})();