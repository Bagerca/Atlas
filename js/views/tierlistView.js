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

    const onMount = () => {
        const state = window.Store.getState();
        if (!state.isAdmin) return;

        const draggables = document.querySelectorAll('.tier-item-card');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        let draggedItem = null;
        let placeholder = document.createElement('div');
        placeholder.classList.add('tier-placeholder');

        // Умная 2D логика вычисления позиции, не мешающая скроллу
        const getDragAfterElement = (container, x, y) => {
            const draggableElements = [...container.querySelectorAll('.tier-item-card:not(.dragging)')];

            return draggableElements.find(child => {
                const box = child.getBoundingClientRect();
                const isSameRow = y >= box.top && y <= box.bottom;
                
                if (isSameRow) {
                    return x < box.left + box.width / 2;
                }
                if (y < box.top) return true;
                
                return false;
            });
        };

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
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
            
            draggable.addEventListener('click', (e) => {
                if (draggable.classList.contains('dragging')) e.preventDefault();
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); 
                
                const row = zone.closest('.tier-row') || zone.closest('.tier-pool');
                if (row) row.classList.add('drag-over');

                const itemsContainer = zone.classList.contains('tier-items') ? zone : zone.querySelector('.tier-items');
                const afterElement = getDragAfterElement(itemsContainer, e.clientX, e.clientY);
                
                // Избегаем бесконечных перерисовок DOM, двигаем фантом только если позиция реально изменилась
                if (placeholder.parentNode !== itemsContainer || placeholder.nextElementSibling !== afterElement) {
                    if (afterElement == null) {
                        itemsContainer.appendChild(placeholder);
                    } else {
                        itemsContainer.insertBefore(placeholder, afterElement);
                    }
                }
            });

            zone.addEventListener('dragleave', (e) => {
                const row = zone.closest('.tier-row') || zone.closest('.tier-pool');
                if (row && !row.contains(e.relatedTarget)) {
                    row.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!draggedItem) return;

                const itemId = draggedItem.dataset.id;
                const targetZone = zone.closest('[data-tier]');
                if (!targetZone) return;

                let newTier = targetZone.dataset.tier;
                if (newTier === 'unassigned') newTier = ''; 

                // 1. Ищем, ПЕРЕД какой карточкой мы сбросили элемент
                let nextNode = placeholder.nextElementSibling;
                // Игнорируем саму себя, если сбросили рядом с исходным местом
                while (nextNode && nextNode.classList.contains('dragging')) {
                    nextNode = nextNode.nextElementSibling;
                }
                const nextItemId = nextNode ? nextNode.dataset.id : null;

                const currentItems = [...window.Store.getState().items];
                
                // 2. ВЫРЕЗАЕМ карточку со старого места
                const draggedIdx = currentItems.findIndex(i => i.id === itemId);
                if (draggedIdx === -1) return;
                
                const [draggedObj] = currentItems.splice(draggedIdx, 1);
                draggedObj.tier = newTier;

                // 3. ВСТАВЛЯЕМ на новое место (настоящий swap в массиве базы данных)
                if (nextItemId) {
                    const nextIdx = currentItems.findIndex(i => i.id === nextItemId);
                    if (nextIdx !== -1) {
                        currentItems.splice(nextIdx, 0, draggedObj);
                    } else {
                        currentItems.push(draggedObj);
                    }
                } else {
                    currentItems.push(draggedObj);
                }

                // Сохраняем и бесшовно обновляем экран
                window.Store.setState({ items: currentItems });
            });
        });
    };

    return { render, onMount };
})();