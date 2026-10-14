window.HeaderView = (() => {
    const render = (state) => {
        const { route, isAdmin, searchQuery } = state;
        const currentType = route.params.type || 'all';
        const isTierlist = route.path === '/tierlist';

        return `
            <div class="brand">
                <a href="#/">ATLAS<span>.</span></a>
            </div>
            
            <nav class="nav-links">
                <a href="#/" class="${currentType === 'all' && !isTierlist ? 'active' : ''}">Все</a>
                <a href="#/?type=games" class="${currentType === 'games' ? 'active' : ''}">Игры</a>
                <a href="#/?type=features" class="${currentType === 'features' ? 'active' : ''}">Полнометражки</a>
                <a href="#/?type=series" class="${currentType === 'series' ? 'active' : ''}">Сериалы</a>
                <a href="#/?type=literature" class="${currentType === 'literature' ? 'active' : ''}">Литература</a>
                <a href="#/tierlist" class="${isTierlist ? 'active' : ''}">Тир-листы</a>
            </nav>

            <div class="header-controls">
                <div class="search-box">
                    ${window.Icons.search}
                    <input type="text" id="search-input" placeholder="Поиск по названию..." value="${window.Helpers.escapeHtml(searchQuery)}" autocomplete="off">
                </div>
                
                ${isAdmin ? `
                    <div class="admin-badge">
                        ${window.Icons.unlock} Админ
                    </div>
                    <button class="btn-icon" id="add-btn" title="Добавить запись">
                        ${window.Icons.plus}
                    </button>
                    <button class="btn-icon" id="export-btn" title="Экспорт базы (catalog.js)">
                        ${window.Icons.download}
                    </button>
                ` : `
                    <div class="admin-badge" style="color: var(--text-secondary); background: none;" title="Ctrl+Shift+A для входа">
                        ${window.Icons.lock}
                    </div>
                `}
            </div>
        `;
    };

    const init = () => {
        const header = document.getElementById('app-header');
        
        let searchTimeout;
        header.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                const val = e.target.value;
                // Мгновенное обновление UI для плавности
                window.Store.setState({ searchQuery: val.toLowerCase() });
                
                // Debounce синхронизация с URL (чтобы не спамить историю)
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    window.Router.setQueryParams({ q: val || null }, true);
                }, 500);
            }
        });

        header.addEventListener('click', (e) => {
            if (e.target.closest('#export-btn')) {
                window.Store.exportData();
            }
            if (e.target.closest('#add-btn')) {
                // Deep Linking: Открытие окна через URL
                window.Router.setQueryParams({ modal: 'add' });
            }
        });
    };

    return { render, init };
})();