window.TierlistView = (() => {
    const tiers = ['S', 'A', 'B', 'C', 'D'];

    const render = (state) => {
        const { items, route, searchQuery, isAdmin } = state;
        const filterType = route.params.filter || 'all'; 
        
        let targetItems = items.filter(i => {
            const matchesType = filterType === 'all' || i.type === filterType;
            const matchesSearch = searchQuery ? i.title.toLowerCase().includes(searchQuery) : true;
            return matchesType && matchesSearch;
        });

        // Группируем по тирам. unassigned - для элементов без тира
        const grouped = { S: [], A: [], B: [], C: [], D: [], unassigned: [] };
        
        targetItems.forEach(item => {
            if (item.tier && tiers.includes(item.tier)) {
                grouped[item.tier].push(item);
            } else {
                grouped.unassigned.push(item);
            }
        });

        return `
            <div style="margin-bottom: var(--spacing-lg); display: flex; flex-wrap: wrap; gap: 10px;">
                <a href="#/tierlist?filter=all" class="btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}">Все</a>
                <a href="#/tierlist?filter=games" class="btn ${filterType === 'games' ? 'btn-primary' : 'btn-secondary'}">Игры</a>
                <a href="#/tierlist?filter=features" class="btn ${filterType === 'features' ? 'btn-primary' : 'btn-secondary'}">Полнометражки</a>
                <a href="#/tierlist?filter=series" class="btn ${filterType === 'series' ? 'btn-primary' : 'btn-secondary'}">Аниме/Сериалы</a>
                <a href="#/tierlist?filter=literature" class="btn ${filterType === 'literature' ? 'btn-primary' : 'btn-secondary'}">Литература</a>
            </div>

            <div class="tier-board">
                ${tiers.map(tier => `
                    <div class="tier-row" data-tier="${tier}">
                        <div class="tier-label tier-${tier}">${tier}</div>
                        <div class="tier-items drop-zone">
                            ${grouped[tier].map(item => `
                                <a href="#/item?id=${item.id}" class="tier-item-card" data-id="${item.id}" draggable="${isAdmin}">
                                    <img src="${window.Helpers.escapeHtml(item.poster)}" alt="${window.Helpers.escapeHtml(item.title)}" onerror="this.style.display='none'">
                                    <div class="tier-item-tooltip">${window.Helpers.escapeHtml(item.title)}</div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Пул нераспределенных (Только для Админа) -->
            ${isAdmin ? `
                <div class="tier-pool drop-zone" data-tier="unassigned">
                    <div class="tier-pool-title">
                        ${window.Icons.grid || ''} Нераспределенные произведения (${grouped.unassigned.length})
                    </div>
                    <div class="tier-items" style="min-height: 80px;">
                        ${grouped.unassigned.map(item => `
                            <a href="#/item?id=${item.id}" class="tier-item-card" data-id="${item.id}" draggable="true">
                                <img src="${window.Helpers.escapeHtml(item.poster)}" alt="${window.Helpers.escapeHtml(item.title)}" onerror="this.style.display='none'">
                                <div class="tier-item-tooltip">${window.Helpers.escapeHtml(item.title)}</div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    };

    // Логика перетаскивания инициализируется после вставки HTML
    const onMount = () => {
        const state = window.Store.getState();
        if (!state.isAdmin) return; // Обычным юзерам Drag&Drop не нужен

        const draggables = document.querySelectorAll('.tier-item-card');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        let draggedItem = null;
        let placeholder = document.createElement('div');
        placeholder.classList.add('tier-placeholder');

        // Вычисляет, после какого элемента вставлять placeholder
        const getDragAfterElement = (container, x) => {
            // Ищем все карточки в зоне, кроме той, что сейчас тащим, и кроме плейсхолдера
            const draggableElements = [...container.querySelectorAll('.tier-item-card:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2; // Смотрим по X (горизонтальная сетка)
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        };

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                // Предотвращаем дефолтное перетаскивание ссылок (url) в браузере
                e.dataTransfer.setData('text/plain', draggable.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                
                draggedItem = draggable;
                setTimeout(() => draggable.classList.add('dragging'), 0);
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                if (placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
                
                document.querySelectorAll('.drag-over').forEach(zone => {
                    zone.classList.remove('drag-over');
                });
                draggedItem = null;
            });
            
            // Блокируем переход по ссылке, если мы её тащим
            draggable.addEventListener('click', (e) => {
                if (draggable.classList.contains('dragging')) {
                    e.preventDefault();
                }
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // Разрешаем drop
                
                // Добавляем класс для подсветки активной зоны
                const row = zone.closest('.tier-row') || zone.closest('.tier-pool');
                if (row) row.classList.add('drag-over');

                const afterElement = getDragAfterElement(zone, e.clientX);
                
                // Находим реальный контейнер карточек (для пула это вложенный div.tier-items)
                const itemsContainer = zone.classList.contains('tier-items') ? zone : zone.querySelector('.tier-items');

                if (afterElement == null) {
                    itemsContainer.appendChild(placeholder);
                } else {
                    itemsContainer.insertBefore(placeholder, afterElement);
                }
            });

            zone.addEventListener('dragleave', (e) => {
                // Убираем подсветку зоны
                const row = zone.closest('.tier-row') || zone.closest('.tier-pool');
                if (row && !row.contains(e.relatedTarget)) {
                    row.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!draggedItem) return;

                const itemId = draggedItem.dataset.id;
                // Ищем data-tier либо у самой зоны, либо у родительской строки
                const targetZone = zone.closest('[data-tier]');
                if (!targetZone) return;

                let newTier = targetZone.dataset.tier;
                if (newTier === 'unassigned') newTier = ''; // Сбрасываем тир

                // Обновляем данные в Store (Сохранится в localStorage и перерисует UI)
                const currentItems = window.Store.getState().items;
                const updatedItems = currentItems.map(item => {
                    if (item.id === itemId) {
                        return { ...item, tier: newTier };
                    }
                    return item;
                });

                window.Store.setState({ items: updatedItems });
            });
        });
    };

    return { render, onMount };
})();