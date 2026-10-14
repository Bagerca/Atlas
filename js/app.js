document.addEventListener("DOMContentLoaded", () => {
    console.log("[App] Инициализация интерфейса Atlas...");

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
    
    // Кэш скролла для каждой страницы (по пути, например: '/' или '/item')
    const scrollCache = {};

    // ОПТИМИЗАЦИЯ СКОРОСТИ: Записываем скролл в реальном времени.
    // Это решает баг со сбросом позиции, так как при клике на ссылку браузер
    // мгновенно меняет хэш и скидывает scrollY в 0 до того, как сработает подписка.
    let scrollTimeout = false;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = true;
            setTimeout(() => {
                // Запоминаем скролл только если нет активного модального окна
                if (lastRoutePath && !document.body.classList.contains('no-scroll')) {
                    scrollCache[lastRoutePath] = window.scrollY;
                }
                scrollTimeout = false;
            }, 50);
        }
    }, { passive: true });

    window.Store.subscribe((state) => {
        const currentRouteHash = state.route.path + JSON.stringify(state.route.params);
        const currentRoutePath = state.route.path;
        const isModalOpen = !!state.route.params.modal;

        // 1. Блокировка скролла фона (с компенсацией ширины скроллбара против дерганья экрана)
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

        // 2. Центральный роутинг экранов и восстановление скролла
        if (lastRouteHash !== currentRouteHash || lastAdminState !== state.isAdmin) {
            
            headerContainer.innerHTML = window.HeaderView.render(state);

            if (currentRoutePath === '/tierlist') {
                mainContainer.innerHTML = window.TierlistView.render(state);
            } else if (currentRoutePath === '/item') {
                mainContainer.innerHTML = window.ItemView.render(state);
            } else if (currentRoutePath === '/icons') {
                mainContainer.innerHTML = window.IconsView.render(state);
            } else {
                mainContainer.innerHTML = window.CatalogView.render(state);
            }

            // Восстановление позиции скролла
            // Используем requestAnimationFrame и setTimeout, чтобы DOM 100% успел отрисоваться
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollCache[currentRoutePath] || 0,
                        left: 0,
                        behavior: 'auto' // Мгновенный прыжок без анимации
                    });
                }, 10);
            });

            lastRouteHash = currentRouteHash;
            lastRoutePath = currentRoutePath;
            lastAdminState = state.isAdmin;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            const currentState = window.Store.getState().isAdmin;
            window.Store.setState({ isAdmin: !currentState });
            console.log(`[App] Режим администратора: ${!currentState}`);
        }
    });

    window.Router.init();
});