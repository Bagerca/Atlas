window.CatalogView = (() => {
    const render = (state) => {
        const { items, route, isAdmin, sortConfig, searchQuery, groupByCollections } = state;
        const currentType = route.params.type || 'all';
        
        let filteredItems = items.filter(item => {
            const matchesType = currentType === 'all' || item.type === currentType;
            const matchesSearch = searchQuery ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
            return matchesType && matchesSearch;
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

        if (sortConfig.by === 'title') {
            const groupedByStatus = {
                'in_progress': {},
                'endless': {},
                'completed': {},
                'planned': {},
                'dropped': {},
                'unassigned': {}
            };

            filteredItems.forEach(item => {
                const lifecycle = window.Helpers.getLifecycleStatus(item.statuses);
                const colls = (item.collections && item.collections.length > 0) ? item.collections : ['Без категории'];
                
                colls.forEach(c => {
                    if (!groupedByStatus[lifecycle][c]) groupedByStatus[lifecycle][c] = [];
                    groupedByStatus[lifecycle][c].push(item);
                });
            });

            const statusOrder = ['in_progress', 'endless', 'completed', 'planned', 'dropped', 'unassigned'];
            let html = '';

            statusOrder.forEach(statusKey => {
                const collectionsObj = groupedByStatus[statusKey];
                const categories = Object.keys(collectionsObj);
                
                if (categories.length === 0) return; 

                const statusDetails = window.Helpers.getLifecycleDetails(statusKey);
                
                const uniqueItemsMap = new Map();
                categories.forEach(cat => {
                    collectionsObj[cat].forEach(i => {
                        if (!uniqueItemsMap.has(i.id)) {
                            uniqueItemsMap.set(i.id, i);
                        }
                    });
                });
                
                html += `
                    <div class="global-status-section" data-status="${statusKey}">
                        <div class="global-status-header ${statusDetails.colorClass}">
                            <div class="global-status-icon">${statusDetails.icon}</div>
                            <h2>${statusDetails.label} <span>${uniqueItemsMap.size}</span></h2>
                        </div>
                `;

                if (!groupByCollections) {
                    const flatItems = Array.from(uniqueItemsMap.values());
                    flatItems.sort((a, b) => {
                        let valA = (a.title || '').toLowerCase();
                        let valB = (b.title || '').toLowerCase();
                        let compareResult = valA.localeCompare(valB);
                        if (sortConfig.dir === 'desc') compareResult *= -1;
                        return compareResult;
                    });

                    html += `
                        <div class="grid status-flat-grid">
                            ${flatItems.map(item => window.CardComponent.render(item, isAdmin)).join('')}
                        </div>
                    `;
                } else {
                    const sortedCategories = categories.sort((a, b) => {
                        if (a === 'Без категории') return 1;
                        if (b === 'Без категории') return -1;
                        return a.localeCompare(b);
                    });

                    sortedCategories.forEach(category => {
                        collectionsObj[category].sort((a, b) => {
                            let valA = (a.title || '').toLowerCase();
                            let valB = (b.title || '').toLowerCase();
                            let compareResult = valA.localeCompare(valB);
                            if (sortConfig.dir === 'desc') compareResult *= -1;
                            return compareResult;
                        });

                        html += `
                            <section class="collection-group">
                                <h3 class="collection-title">
                                    ${window.Helpers.escapeHtml(category)} <span>${collectionsObj[category].length}</span>
                                </h3>
                                <div class="grid">
                                    ${collectionsObj[category].map(item => window.CardComponent.render(item, isAdmin)).join('')}
                                </div>
                            </section>
                        `;
                    });
                }

                html += `</div>`; 
            });

            return html;
        } 
        else {
            filteredItems.sort((a, b) => {
                let valA, valB;
                
                if (sortConfig.by === 'date') {
                    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                    valA = isNaN(dateA) ? 0 : dateA;
                    valB = isNaN(dateB) ? 0 : dateB;
                } else if (sortConfig.by === 'score') {
                    valA = a.score || 0;
                    valB = b.score || 0;
                }

                let compareResult = 0;
                if (valA < valB) compareResult = -1;
                else if (valA > valB) compareResult = 1;
                
                if (sortConfig.dir === 'desc') compareResult *= -1;

                if (compareResult === 0) {
                    return (a.title || '').localeCompare(b.title || '');
                }
                
                return compareResult;
            });

            return `
                <section class="collection-group flat-grid">
                    <div class="grid">
                        ${filteredItems.map(item => window.CardComponent.render(item, isAdmin)).join('')}
                    </div>
                </section>
            `;
        }
    };

    const onMount = () => {
        const cards = document.querySelectorAll('.card-hidden');
        if (cards.length === 0) return;

        let delayIndex = 0;
        let resetTimer = null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    card.style.animationDelay = `${delayIndex * 40}ms`;
                    card.classList.remove('card-hidden');
                    card.classList.add('card-visible');
                    
                    observer.unobserve(card);
                    delayIndex++;

                    clearTimeout(resetTimer);
                    resetTimer = setTimeout(() => { delayIndex = 0; }, 100);
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });

        cards.forEach(card => observer.observe(card));
    };

    const init = () => {
        const main = document.getElementById('app-main');
        
        main.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                e.preventDefault(); 
                e.stopPropagation();
                
                const id = deleteBtn.dataset.id;
                if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                    const newItems = window.Store.getState().items.filter(i => i.id !== id);
                    window.Store.setState({ items: newItems });
                    if (window.Router.parseUrl().params.id === id) {
                        window.location.hash = '#/';
                    }
                }
                return;
            }

            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                e.preventDefault(); 
                e.stopPropagation();
                
                const id = editBtn.dataset.id;
                window.Router.setQueryParams({ modal: 'edit', id: id });
                return;
            }
        });
    };

    return { render, init, onMount };
})();