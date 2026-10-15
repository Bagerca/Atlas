window.HeaderView = (() => {
    const render = (state) => {
        const { route, isAdmin } = state;
        const currentType = route.params.type || 'all';
        const isTierlist = route.path === '/tierlist';
        const isIconsPage = route.path === '/icons';

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
                <a href="#/" class="${currentType === 'all' && !isTierlist && !isIconsPage ? 'active' : ''}">Все</a>
                <a href="#/?type=games" class="${currentType === 'games' ? 'active' : ''}">Игры</a>
                <a href="#/?type=features" class="${currentType === 'features' ? 'active' : ''}">Полнометражки</a>
                <a href="#/?type=series" class="${currentType === 'series' ? 'active' : ''}">Сериалы</a>
                <a href="#/?type=literature" class="${currentType === 'literature' ? 'active' : ''}">Литература</a>
                <a href="#/tierlist" class="${isTierlist ? 'active' : ''}">Тир-листы</a>
            </nav>

            <div class="header-controls">
                
                <!-- Внедряем Компонент Поиска -->
                ${window.SearchComponent.render(state)}

                <!-- Внедряем Компонент Сортировки -->
                ${window.SortComponent.render(state)}
                
                ${isAdmin ? `
                    <div class="admin-badge">
                        ${window.Icons.unlock || '🔓'} Админ
                    </div>
                    
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
            }
            if (e.target.closest('#add-btn')) {
                window.Router.setQueryParams({ modal: 'add' });
            }
        });
    };

    return { render, init };
})();