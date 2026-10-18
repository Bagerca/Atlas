window.HeaderView = (() => {
    const render = (state) => {
        const { route, isAdmin, groupByCollections } = state;
        const currentType = route.params.type || 'all';
        
        const isTierlist = route.path === '/tierlist';
        const isIconsPage = route.path === '/icons';
        const isAssignerPage = route.path === '/assigner';
        const isCatalogPage = route.path === '/' || (!isTierlist && !isIconsPage && !isAssignerPage && route.path !== '/item');

        return `
            <div class="brand">
                <a href="#/">
                    <span class="brand-name">ATLAS</span><span class="brand-dot">.</span>
                    <span class="brand-author-wrap">
                        <span class="brand-separator">//</span>
                        <span class="brand-author">BAGERca</span>
                    </span>
                </a>
            </div>
            
            <nav class="nav-links">
                <a href="#/" class="${currentType === 'all' && isCatalogPage ? 'active' : ''}">Все</a>
                <a href="#/?type=games" class="${currentType === 'games' && isCatalogPage ? 'active' : ''}">Игры</a>
                <a href="#/?type=features" class="${currentType === 'features' && isCatalogPage ? 'active' : ''}">Полнометражки</a>
                <a href="#/?type=series" class="${currentType === 'series' && isCatalogPage ? 'active' : ''}">Сериалы</a>
                <a href="#/?type=literature" class="${currentType === 'literature' && isCatalogPage ? 'active' : ''}">Литература</a>
                <a href="#/tierlist" class="${isTierlist ? 'active' : ''}">Тир-листы</a>
            </nav>

            <div class="header-controls">
                
                ${window.SearchComponent.render(state)}
                ${window.SortComponent.render(state)}

                ${isCatalogPage ? `
                    <button class="btn-icon ${groupByCollections ? 'active' : ''}" id="toggle-subgroups-btn" title="${groupByCollections ? 'Подкатегории: Включены (кликните, чтобы отключить)' : 'Подкатегории: Выключены (кликните, чтобы включить)'}">
                        ${window.Icons.layers || '📚'}
                    </button>
                ` : ''}
                
                ${isAdmin ? `
                    <div class="admin-badge">
                        ${window.Icons.unlock || '🔓'} Админ
                    </div>
                    
                    <a href="#/assigner" class="btn-icon ${isAssignerPage ? 'active' : ''}" title="Помогатор статусов">
                        ${window.Icons.layers || '📚'}
                    </a>

                    <a href="#/icons" class="btn-icon ${isIconsPage ? 'active' : ''}" title="Библиотека иконок">
                        ${window.Icons.grid || '🔠'}
                    </a>

                    <button class="btn-icon" id="add-btn" title="Добавить запись">
                        ${window.Icons.plus || '➕'}
                    </button>
                    <button class="btn-icon" id="export-btn" title="Экспорт базы (catalog.js)">
                        ${window.Icons.download || '💾'}
                    </button>
                ` : `
                    <div class="admin-badge" style="color: var(--text-secondary); background: none;" title="Ctrl+Shift+A для входа">
                        ${window.Icons.lock || '🔒'}
                    </div>
                `}
            </div>
        `;
    };

    const init = () => {
        window.SearchComponent.init();
        window.SortComponent.init();

        const header = document.getElementById('app-header');
        
        header.addEventListener('click', (e) => {
            if (e.target.closest('#export-btn')) {
                window.Store.exportData();
                return;
            }
            if (e.target.closest('#add-btn')) {
                window.Router.setQueryParams({ modal: 'add' });
                return;
            }
            const subgroupsBtn = e.target.closest('#toggle-subgroups-btn');
            if (subgroupsBtn) {
                const currentStatus = window.Store.getState().groupByCollections;
                console.log(`[HeaderView] Переключение режима подкатегорий: ${!currentStatus}`);
                window.Store.setState({ groupByCollections: !currentStatus });
                return;
            }
        });
    };

    return { render, init };
})();