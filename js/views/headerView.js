window.HeaderView = (() => {
    const render = (state) => {
        const { route, isAdmin, sortConfig } = state;
        const currentType = route.params.type || 'all';
        const isTierlist = route.path === '/tierlist';
        const isIconsPage = route.path === '/icons';

        return `
            <div class="brand">
                <a href="#/">ATLAS<span>.</span></a>
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
                
                <div class="search-wrapper" id="search-wrapper">
                    <div class="search-box">
                        ${window.Icons.search || '🔍'}
                        <input type="text" id="search-input" placeholder="Поиск по базе..." autocomplete="off">
                    </div>
                    <div class="search-dropdown" id="search-dropdown"></div>
                </div>

                <div style="position: relative;">
                    <button class="btn-icon" id="sort-toggle-btn" title="Сортировка">
                        ${window.Icons.sliders || '🎛'}
                    </button>
                    
                    <div class="sort-popover" id="sort-popover">
                        <div class="sort-group">
                            <button class="sort-btn param-btn ${sortConfig.by === 'title' ? 'active' : ''}" data-by="title" title="По алфавиту">${window.Icons.text || 'T'}</button>
                            <button class="sort-btn param-btn ${sortConfig.by === 'date' ? 'active' : ''}" data-by="date" title="По дате завершения">${window.Icons.calendar || '📅'}</button>
                            <button class="sort-btn param-btn ${sortConfig.by === 'score' ? 'active' : ''}" data-by="score" title="По оценке">${window.Icons.star || '⭐'}</button>
                        </div>
                        <div class="sort-group">
                            <button class="sort-btn dir-btn ${sortConfig.dir === 'desc' ? 'active' : ''}" data-dir="desc">
                                ${window.Icons.arrowDown || '↓'} Убывание
                            </button>
                            <button class="sort-btn dir-btn ${sortConfig.dir === 'asc' ? 'active' : ''}" data-dir="asc">
                                ${window.Icons.arrowUp || '↑'} Возрастание
                            </button>
                        </div>
                    </div>
                </div>
                
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
        const header = document.getElementById('app-header');
        
        // --- ЛОГИКА АВТОКОМПЛИТА ПОИСКА ---
        header.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                const val = e.target.value.toLowerCase().trim();
                const dropdown = document.getElementById('search-dropdown');
                
                if (!val) {
                    dropdown.innerHTML = '';
                    dropdown.classList.remove('active');
                    return;
                }

                const state = window.Store.getState();
                const matches = state.items
                    .filter(i => i.title.toLowerCase().includes(val))
                    .slice(0, 5); // Топ 5 совпадений

                if (matches.length > 0) {
                    dropdown.innerHTML = matches.map(item => `
                        <div class="search-dropdown-item" data-id="${item.id}">
                            <img src="${window.Helpers.escapeHtml(item.poster)}" class="search-dropdown-poster" onerror="this.style.display='none'">
                            <div class="search-dropdown-info">
                                <span class="search-dropdown-title">${window.Helpers.escapeHtml(item.title)}</span>
                                <span class="search-dropdown-type">${item.type}</span>
                            </div>
                        </div>
                    `).join('');
                    dropdown.classList.add('active');
                } else {
                    dropdown.innerHTML = `<div class="search-dropdown-item"><span style="color: var(--text-muted); font-size: 0.85rem;">Ничего не найдено</span></div>`;
                    dropdown.classList.add('active');
                }
            }
        });

        // --- ЛОГИКА КЛИКОВ (Сортировка, дропдаун, кнопки) ---
        header.addEventListener('click', (e) => {
            // Клик по элементу поиска
            const searchItem = e.target.closest('.search-dropdown-item');
            if (searchItem && searchItem.dataset.id) {
                window.location.hash = `#/item?id=${searchItem.dataset.id}`;
                document.getElementById('search-input').value = '';
                document.getElementById('search-dropdown').classList.remove('active');
                return;
            }

            // Открытие/закрытие Popover'а сортировки
            const sortToggle = e.target.closest('#sort-toggle-btn');
            const sortPopover = document.getElementById('sort-popover');
            if (sortToggle) {
                sortToggle.classList.toggle('active');
                sortPopover.classList.toggle('active');
                return;
            }

            // Выбор параметра сортировки (Текст, Дата, Оценка)
            const paramBtn = e.target.closest('.param-btn');
            if (paramBtn) {
                const newBy = paramBtn.dataset.by;
                const currentConfig = window.Store.getState().sortConfig;
                window.Store.setState({ sortConfig: { ...currentConfig, by: newBy } });
                
                // Обновляем UI без ререндера хедера, чтобы не сбивать фокус/поповер
                document.querySelectorAll('.param-btn').forEach(btn => btn.classList.remove('active'));
                paramBtn.classList.add('active');
                return;
            }

            // Выбор направления (Убывание, Возрастание)
            const dirBtn = e.target.closest('.dir-btn');
            if (dirBtn) {
                const newDir = dirBtn.dataset.dir;
                const currentConfig = window.Store.getState().sortConfig;
                window.Store.setState({ sortConfig: { ...currentConfig, dir: newDir } });
                
                document.querySelectorAll('.dir-btn').forEach(btn => btn.classList.remove('active'));
                dirBtn.classList.add('active');
                return;
            }

            // Кнопки админки
            if (e.target.closest('#export-btn')) window.Store.exportData();
            if (e.target.closest('#add-btn')) window.Router.setQueryParams({ modal: 'add' });
        });

        // Закрытие выпадающих списков при клике вне их зоны
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                const dropdown = document.getElementById('search-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
            if (!e.target.closest('#sort-toggle-btn') && !e.target.closest('#sort-popover')) {
                const popover = document.getElementById('sort-popover');
                const toggle = document.getElementById('sort-toggle-btn');
                if (popover) popover.classList.remove('active');
                if (toggle) toggle.classList.remove('active');
            }
        });
    };

    return { render, init };
})();