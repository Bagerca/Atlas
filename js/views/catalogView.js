window.CatalogView = (() => {
    const render = (state) => {
        const { items, route, searchQuery, isAdmin } = state;
        const currentType = route.params.type || 'all';
        
        let filteredItems = items.filter(item => {
            const matchType = currentType === 'all' || item.type === currentType;
            const matchSearch = item.title.toLowerCase().includes(searchQuery);
            return matchType && matchSearch;
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

        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            if (a === 'Без категории') return 1;
            if (b === 'Без категории') return -1;
            return a.localeCompare(b);
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
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                    const newItems = window.Store.getState().items.filter(i => i.id !== id);
                    window.Store.setState({ items: newItems });
                }
            }

            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const id = editBtn.dataset.id;
                // Deep Linking: Открываем модалку через URL
                window.Router.setQueryParams({ modal: 'edit', id: id });
            }
        });
    };

    return { render, init };
})();