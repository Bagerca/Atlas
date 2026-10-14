window.CatalogView = (() => {
    const render = (state) => {
        const { items, route, isAdmin, sortConfig } = state;
        const currentType = route.params.type || 'all';
        
        let filteredItems = items.filter(item => {
            return currentType === 'all' || item.type === currentType;
        });

        if (filteredItems.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">${window.Icons.emptyBox}</div>
                    <h2>Ничего не найдено</h2>
                    <p>Здесь пока пусто. Попробуйте изменить фильтры или добавьте новую запись.</p>
                </div>
            `;
        }

        const grouped = {};
        filteredItems.forEach(item => {
            const colls = (item.collections && item.collections.length > 0) ? item.collections : ['Без категории'];
            colls.forEach(c => {
                if (!grouped[c]) grouped[c] = [];
                grouped[c].push(item);
            });
        });

        // Сортировка названия коллекций по алфавиту
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            if (a === 'Без категории') return 1;
            if (b === 'Без категории') return -1;
            return a.localeCompare(b);
        });

        // Применение алгоритма сортировки ВНУТРИ коллекций
        sortedCategories.forEach(category => {
            grouped[category].sort((a, b) => {
                let valA, valB;
                
                if (sortConfig.by === 'title') {
                    valA = a.title.toLowerCase();
                    valB = b.title.toLowerCase();
                } else if (sortConfig.by === 'date') {
                    valA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                    valB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                } else if (sortConfig.by === 'score') {
                    valA = a.score || 0;
                    valB = b.score || 0;
                }

                if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
                
                // Вторичная сортировка по алфавиту, если значения равны
                return a.title.localeCompare(b.title);
            });
        });

        return sortedCategories.map(category => `
            <section class="collection-group">
                <h2 class="collection-title">
                    ${window.Helpers.escapeHtml(category)} <span>${grouped[category].length}</span>
                </h2>
                <div class="grid">
                    ${grouped[category].map(item => window.CardComponent.render(item, isAdmin)).join('')}
                </div>
            </section>
        `).join('');
    };

    const init = () => {
        const main = document.getElementById('app-main');
        
        main.addEventListener('click', (e) => {
            // Обработка кнопки удаления
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                e.preventDefault(); 
                
                const id = deleteBtn.dataset.id;
                if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                    const newItems = window.Store.getState().items.filter(i => i.id !== id);
                    window.Store.setState({ items: newItems });
                    if (window.location.hash.includes(`id=${id}`)) {
                        window.location.hash = '#/';
                    }
                }
                return;
            }

            // Обработка кнопки редактирования
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                e.preventDefault(); 
                
                const id = editBtn.dataset.id;
                window.Router.setQueryParams({ modal: 'edit', id: id });
                return;
            }
        });
    };

    return { render, init };
})();