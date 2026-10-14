window.Router = (() => {
    // Чтение URL (Deep Linking)
    const parseUrl = () => {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        
        const params = {};
        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
        }
        return { path: path || '/', params };
    };

    // Запись параметров в URL без мусора в истории (Replace) или с ним
    const setQueryParams = (newParams, replace = false) => {
        const current = parseUrl();
        const search = new URLSearchParams(current.params);
        
        for (const [key, val] of Object.entries(newParams)) {
            if (val === null || val === undefined || val === '') {
                search.delete(key);
            } else {
                search.set(key, val);
            }
        }
        
        const queryStr = search.toString();
        const newHash = queryStr ? `${current.path}?${queryStr}` : current.path;
        
        if (replace) {
            window.history.replaceState(null, '', `#${newHash}`);
            handleRouteChange(); // Триггерим вручную, т.к. replaceState не вызывает hashchange
        } else {
            window.location.hash = newHash;
        }
    };

    const handleRouteChange = () => {
        const route = parseUrl();
        console.log(`[Router] Навигация: ${route.path}`, route.params);
        
        const updates = { 
            route, 
            searchQuery: route.params.q ? route.params.q.toLowerCase() : '' 
        };

        // Запоминаем контекст каталога для Умной кнопки "Назад"
        // Игнорируем URL с открытыми окнами (modal), чтобы не вернуться в форму
        if (route.path === '/' || route.path === '/tierlist') {
            if (!route.params.modal) {
                updates.lastCatalogRoute = window.location.hash || '#/';
            }
        }

        window.Store.setState(updates);
    };

    const init = () => {
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange(); // Первый рендер
    };

    return { init, parseUrl, setQueryParams };
})();