window.SortComponent = (() => {
    const render = (state) => {
        const config = state.sortConfig || { by: 'title', dir: 'asc' };

        return `
            <div style="position: relative;">
                <button class="btn-icon" id="sort-toggle-btn" title="Сортировка">
                    ${window.Icons.sliders || '🎛'}
                </button>
                
                <div class="sort-popover" id="sort-popover">
                    <div class="sort-group">
                        <button class="sort-btn param-btn ${config.by === 'title' ? 'active' : ''}" data-by="title" title="По алфавиту">${window.Icons.text || 'T'}</button>
                        <button class="sort-btn param-btn ${config.by === 'date' ? 'active' : ''}" data-by="date" title="По дате завершения">${window.Icons.calendar || '📅'}</button>
                        <button class="sort-btn param-btn ${config.by === 'score' ? 'active' : ''}" data-by="score" title="По оценке">${window.Icons.star || '⭐'}</button>
                    </div>
                    <div class="sort-group">
                        <button class="sort-btn dir-btn ${config.dir === 'desc' ? 'active' : ''}" data-dir="desc">
                            ${window.Icons.arrowDown || '↓'} Убывание
                        </button>
                        <button class="sort-btn dir-btn ${config.dir === 'asc' ? 'active' : ''}" data-dir="asc">
                            ${window.Icons.arrowUp || '↑'} Возрастание
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    const init = () => {
        const header = document.getElementById('app-header');

        header.addEventListener('click', (e) => {
            // Открытие/закрытие Popover'а
            const sortToggle = e.target.closest('#sort-toggle-btn');
            if (sortToggle) {
                sortToggle.classList.toggle('active');
                document.getElementById('sort-popover').classList.toggle('active');
                return;
            }

            // Выбор параметра сортировки (Текст, Дата, Оценка)
            const paramBtn = e.target.closest('.param-btn');
            if (paramBtn) {
                const newBy = paramBtn.dataset.by;
                const currentConfig = window.Store.getState().sortConfig;
                window.Store.setState({ sortConfig: { ...currentConfig, by: newBy } });
                
                document.querySelectorAll('.param-btn').forEach(btn => btn.classList.remove('active'));
                paramBtn.classList.add('active');
                return;
            }

            // Выбор направления сортировки
            const dirBtn = e.target.closest('.dir-btn');
            if (dirBtn) {
                const newDir = dirBtn.dataset.dir;
                const currentConfig = window.Store.getState().sortConfig;
                window.Store.setState({ sortConfig: { ...currentConfig, dir: newDir } });
                
                document.querySelectorAll('.dir-btn').forEach(btn => btn.classList.remove('active'));
                dirBtn.classList.add('active');
                return;
            }
        });

        // Закрытие поповера при клике вне его зоны
        document.addEventListener('click', (e) => {
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