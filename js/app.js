document.addEventListener("DOMContentLoaded", () => {
    console.log("[App] Инициализация высокопроизводительного интерфейса Atlas...");

    window.Store.init();
    window.HeaderView.init();
    window.CatalogView.init(); 
    window.ModalComponent.init();
    window.IconsView.init();

    const headerContainer = document.getElementById('app-header');
    const mainContainer = document.getElementById('app-main');

    let lastRouteHash = null;
    let lastRoutePath = null;
    let lastAdminState = null;
    let lastSortConfig = null;
    let lastSearchQuery = null;
    
    const scrollCache = {};
    let isScrolling = false;
    let blockScrollCache = false; // Блокиратор для защиты кэша от системных сбросов скролла

    // 1. Блокируем ложные скроллы при навигации "Назад/Вперед" в браузере
    window.addEventListener('popstate', () => {
        blockScrollCache = true;
    });

    // 2. Глобальный перехватчик кликов. 
    // Спасает скролл ДО того, как браузер прыгнет по ссылке и сбросит scrollY в 0.
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            if (lastRouteHash && !document.body.classList.contains('no-scroll')) {
                scrollCache[lastRouteHash] = window.scrollY;
            }
            blockScrollCache = true; // Запрещаем писать в кэш, пока идет смена экрана
        }
        
        // Обработка Умной кнопки "Назад" из карточки произведения
        const backBtn = e.target.closest('#back-btn');
        if (backBtn) {
            e.preventDefault();
            blockScrollCache = true; // Защита кэша
            
            // Используем нативный history API, чтобы не засорять стек переходов
            // window.history.length > 2 гарантирует, что мы не вылетим за пределы сайта
            if (window.history.length > 2) {
                window.history.back();
            } else {
                // Если истории нет (открыли сразу по ссылке), переходим по сохраненному руту
                window.location.hash = window.Store.getState().lastCatalogRoute || '#/';
            }
        }
    }, { capture: true }); // capture: true - перехватываем клик самыми первыми!

    // ОПТИМИЗАЦИЯ СКОРОСТИ: Заменили setTimeout на requestAnimationFrame
    window.addEventListener('scroll', () => {
        if (!isScrolling && !blockScrollCache) {
            window.requestAnimationFrame(() => {
                if (lastRouteHash && !document.body.classList.contains('no-scroll') && !blockScrollCache) {
                    // Используем lastRouteHash, чтобы скролл запоминался раздельно для разных вкладок
                    scrollCache[lastRouteHash] = window.scrollY;
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    window.Store.subscribe((state) => {
        const currentRouteHash = state.route.path + JSON.stringify(state.route.params);
        const currentRoutePath = state.route.path;
        const isModalOpen = !!state.route.params.modal;
        const currentSortConfig = JSON.stringify(state.sortConfig);
        const currentSearchQuery = state.searchQuery;

        if (isModalOpen) {
            if (!document.body.classList.contains('no-scroll')) {
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollBarWidth}px`;
                document.body.classList.add('no-scroll');
            }
        } else {
            document.body.style.paddingRight = '';
            document.body.classList.remove('no-scroll');
        }

        const routeChanged = lastRouteHash !== currentRouteHash;
        const adminChanged = lastAdminState !== state.isAdmin;
        const sortChanged = lastSortConfig !== currentSortConfig;
        const searchChanged = lastSearchQuery !== currentSearchQuery;

        if (routeChanged || adminChanged) {
            headerContainer.innerHTML = window.HeaderView.render(state);
        }

        if (routeChanged || adminChanged || sortChanged || searchChanged) {
            
            let activeComponent = null;

            if (currentRoutePath === '/tierlist') {
                mainContainer.innerHTML = window.TierlistView.render(state);
                activeComponent = window.TierlistView;
            } else if (currentRoutePath === '/item') {
                mainContainer.innerHTML = window.ItemView.render(state);
                activeComponent = window.ItemView;
            } else if (currentRoutePath === '/icons') {
                mainContainer.innerHTML = window.IconsView.render(state);
                activeComponent = window.IconsView;
            } else {
                mainContainer.innerHTML = window.CatalogView.render(state);
                activeComponent = window.CatalogView;
            }

            // Вызываем жизненный цикл onMount и восстанавливаем скролл в следующем кадре (Paint Finish)
            requestAnimationFrame(() => {
                if (activeComponent && activeComponent.onMount) {
                    activeComponent.onMount();
                }

                setTimeout(() => {
                    const scrollPosition = (!routeChanged && (sortChanged || searchChanged)) 
                        ? 0 
                        : (scrollCache[currentRouteHash] || 0);
                        
                    window.scrollTo({
                        top: scrollPosition,
                        left: 0,
                        behavior: 'auto'
                    });
                    
                    // Снимаем блокировку записи скролла после успешного рендера и прокрутки
                    setTimeout(() => blockScrollCache = false, 50);
                    
                }, 10);
            });

            lastRouteHash = currentRouteHash;
            lastRoutePath = currentRoutePath;
            lastAdminState = state.isAdmin;
            lastSortConfig = currentSortConfig;
            lastSearchQuery = currentSearchQuery;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            const currentState = window.Store.getState().isAdmin;
            window.Store.setState({ isAdmin: !currentState });
        }
        
        if (e.key === 'Escape') {
            const state = window.Store.getState();
            if (state.route.params.modal) {
                window.ModalComponent.close();
            }
            const sortPopover = document.getElementById('sort-popover');
            if (sortPopover && sortPopover.classList.contains('active')) {
                sortPopover.classList.remove('active');
                document.getElementById('sort-toggle-btn').classList.remove('active');
            }
        }
    });

    window.Router.init();
});