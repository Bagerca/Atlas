document.addEventListener("DOMContentLoaded", () => {
    console.log("[App] Инициализация интерфейса Atlas...");

    // 1. Инициализируем хранилище
    window.Store.init();
    
    // 2. Инициализируем компоненты и View-контроллеры
    window.HeaderView.init();
    window.CatalogView.init();
    window.ModalComponent.init();

    const headerContainer = document.getElementById('app-header');
    const mainContainer = document.getElementById('app-main');

    let lastRouteHash = null;
    let lastAdminState = null;

    // 3. Подписываемся на изменения Store (Главный рендер-цикл)
    window.Store.subscribe((state) => {
        const currentRouteHash = state.route.path + JSON.stringify(state.route.params);
        
        // Перерисовываем Header только если изменился путь, параметры (поиск) или режим админа
        if (lastRouteHash !== currentRouteHash || lastAdminState !== state.isAdmin) {
            headerContainer.innerHTML = window.HeaderView.render(state);
            lastRouteHash = currentRouteHash;
            lastAdminState = state.isAdmin;
        }

        // Рендерим нужный экран в зависимости от маршрута
        if (state.route.path === '/tierlist') {
            mainContainer.innerHTML = window.TierlistView.render(state);
        } else {
            mainContainer.innerHTML = window.CatalogView.render(state);
        }
    });

    // 4. Глобальный шорткат (Админ-режим)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
            e.preventDefault();
            const currentState = window.Store.getState().isAdmin;
            window.Store.setState({ isAdmin: !currentState });
            console.log(`[App] Режим администратора: ${!currentState}`);
        }
    });

    // 5. Запуск роутера (триггерит первый рендер)
    window.Router.init();
});