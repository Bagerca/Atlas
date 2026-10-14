document.addEventListener("DOMContentLoaded", () => {
    console.log("[App] Инициализация интерфейса Atlas...");

    window.Store.init();
    
    window.HeaderView.init();
    window.CatalogView.init(); 
    window.ModalComponent.init();
    window.IconsView.init(); // Инициализация нового View

    const headerContainer = document.getElementById('app-header');
    const mainContainer = document.getElementById('app-main');

    let lastRouteHash = null;
    let lastAdminState = null;

    window.Store.subscribe((state) => {
        const currentRouteHash = state.route.path + JSON.stringify(state.route.params);
        
        if (lastRouteHash !== currentRouteHash || lastAdminState !== state.isAdmin) {
            headerContainer.innerHTML = window.HeaderView.render(state);
            lastRouteHash = currentRouteHash;
            lastAdminState = state.isAdmin;
        }

        // Центральный роутинг экранов
        if (state.route.path === '/tierlist') {
            mainContainer.innerHTML = window.TierlistView.render(state);
        } else if (state.route.path === '/item') {
            mainContainer.innerHTML = window.ItemView.render(state);
        } else if (state.route.path === '/icons') {
            mainContainer.innerHTML = window.IconsView.render(state);
        } else {
            mainContainer.innerHTML = window.CatalogView.render(state);
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