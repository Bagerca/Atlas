window.TierlistView = (() => {
    const tiers = ['S', 'A', 'B', 'C', 'D'];

    const render = (state) => {
        const { items, route, searchQuery } = state;
        const filterType = route.params.filter || 'all'; // Фильтр внутри тир-листа
        
        let targetItems = items.filter(i => i.tier && tiers.includes(i.tier));

        if (filterType !== 'all') {
            targetItems = targetItems.filter(i => i.type === filterType);
        }
        if (searchQuery) {
            targetItems = targetItems.filter(i => i.title.toLowerCase().includes(searchQuery));
        }

        const grouped = { S: [], A: [], B: [], C: [], D: [] };
        targetItems.forEach(item => grouped[item.tier].push(item));

        return `
            <div style="margin-bottom: var(--spacing-lg); display: flex; gap: 10px;">
                <a href="#/tierlist?filter=all" class="btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}">Все</a>
                <a href="#/tierlist?filter=games" class="btn ${filterType === 'games' ? 'btn-primary' : 'btn-secondary'}">Игры</a>
                <a href="#/tierlist?filter=series" class="btn ${filterType === 'series' ? 'btn-primary' : 'btn-secondary'}">Аниме/Сериалы</a>
            </div>

            <div class="tier-board">
                ${tiers.map(tier => `
                    <div class="tier-row">
                        <div class="tier-label tier-${tier}">${tier}</div>
                        <div class="tier-items">
                            ${grouped[tier].map(item => `
                                <div class="tier-item-card">
                                    <img src="${window.Helpers.escapeHtml(item.poster)}" alt="${window.Helpers.escapeHtml(item.title)}" onerror="this.style.display='none'">
                                    <div class="tier-item-tooltip">${window.Helpers.escapeHtml(item.title)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    return { render };
})();