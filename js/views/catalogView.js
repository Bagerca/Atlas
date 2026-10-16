window.CatalogView = (() => {
    const render = (state) => {
        const { items, route, isAdmin, sortConfig, searchQuery } = state;
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

        // ЛОГИКА 1: Сортировка по алфавиту (Группировка по коллекциям сохраняется)
        if (sortConfig.by === 'title') {
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

            sortedCategories.forEach(category => {
                grouped[category].sort((a, b) => {
                    let valA = (a.title || '').toLowerCase();
                    let valB = (b.title || '').toLowerCase();
                    let compareResult = valA.localeCompare(valB);
                    if (sortConfig.dir === 'desc') compareResult *= -1;
                    return compareResult;
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
        } 
        
        // ЛОГИКА 2: Сортировка по Оценке или Дате (Отключаем категории, выводим Flat Grid)
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

                // Вторичная сортировка по алфавиту, если основное значение одинаковое
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

    // Вызывается из app.js сразу ПОСЛЕ вставки HTML в DOM
    const onMount = () => {
        const cards = document.querySelectorAll('.card-hidden');
        if (cards.length === 0) return;

        // Внешнее состояние для "волновой" анимации
        let delayIndex = 0;
        let resetTimer = null;

        // Настраиваем умный Observer, который не ломается при быстром скролле
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    card.style.animationDelay = `${delayIndex * 40}ms`;
                    card.classList.remove('card-hidden');
                    card.classList.add('card-visible');
                    
                    observer.unobserve(card);
                    delayIndex++;

                    // Сбрасываем индекс анимации только когда батч-прокрутка остановилась
                    clearTimeout(resetTimer);
                    resetTimer = setTimeout(() => {
                        delayIndex = 0;
                    }, 100);
                }
            });
        }, { 
            rootMargin: '100px', // Начинаем грузить заранее
            threshold: 0.1
        });

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