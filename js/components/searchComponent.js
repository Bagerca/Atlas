window.SearchComponent = (() => {
    let debounceTimer = null; // Таймер для предотвращения DOM Thrashing

    const render = (state) => {
        return `
            <div class="search-wrapper" id="search-wrapper">
                <div class="search-box">
                    ${window.Icons.search || '🔍'}
                    <input type="text" id="search-input" placeholder="Поиск по базе..." autocomplete="off">
                </div>
                <div class="search-dropdown" id="search-dropdown"></div>
            </div>
        `;
    };

    const init = () => {
        const header = document.getElementById('app-header');
        
        // Обработка ввода (Фильтрация и показ дропдауна)
        header.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                const val = e.target.value.toLowerCase().trim();
                const dropdown = document.getElementById('search-dropdown');
                
                // 1. МГНОВЕННОЕ ОБНОВЛЕНИЕ ДРОПДАУНА (Берем данные из текущего стейта, не перерисовывая каталог)
                if (!val) {
                    dropdown.innerHTML = '';
                    dropdown.classList.remove('active');
                } else {
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
                    } else {
                        dropdown.innerHTML = `
                            <div class="search-dropdown-item">
                                <span style="color: var(--text-muted); font-size: 0.85rem;">Ничего не найдено</span>
                            </div>
                        `;
                    }
                    
                    dropdown.classList.add('active');
                }

                // 2. ОТЛОЖЕННОЕ ОБНОВЛЕНИЕ КАТАЛОГА (Debounce 300ms)
                // Сбрасываем старый таймер, если пользователь продолжает печатать
                clearTimeout(debounceTimer);
                
                debounceTimer = setTimeout(() => {
                    // Обновляем фильтр каталога через Store (вызовет тяжелый ререндер 1 раз)
                    window.Store.setState({ searchQuery: val });
                }, 300);
            }
        });

        // Обработка клика по элементу выпадающего списка
        header.addEventListener('click', (e) => {
            const searchItem = e.target.closest('.search-dropdown-item');
            if (searchItem && searchItem.dataset.id) {
                window.location.hash = `#/item?id=${searchItem.dataset.id}`;
                document.getElementById('search-input').value = '';
                document.getElementById('search-dropdown').classList.remove('active');
            }
        });

        // Закрытие списка при клике вне компонента
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                const dropdown = document.getElementById('search-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    };

    return { render, init };
})();