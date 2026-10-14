window.Store = (() => {
    let state = {
        items: [],
        isAdmin: false,
        route: { path: '/', params: {} },
        searchQuery: '',
        lastCatalogRoute: '#/', 
        // Добавлен дефолтный конфиг сортировки
        sortConfig: { by: 'title', dir: 'asc' }
    };

    const listeners = [];

    const init = () => {
        try {
            const localData = localStorage.getItem('atlas_data');
            if (localData) {
                state.items = JSON.parse(localData).items;
                console.log("[Store] Данные загружены из LocalStorage");
            } else if (window.__ATLAS_INITIAL_DATA__) {
                state.items = window.__ATLAS_INITIAL_DATA__.items;
                console.log("[Store] Данные загружены из манифеста");
            }
        } catch (error) {
            console.error("[Store] Ошибка загрузки данных:", error);
            state.items = [];
        }
    };

    const getState = () => state;

    const setState = (updates) => {
        state = { ...state, ...updates };
        
        if (updates.items) {
            localStorage.setItem('atlas_data', JSON.stringify({ items: state.items }));
        }

        listeners.forEach(listener => listener(state));
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        listener(state); 
    };

    const exportData = () => {
        const dataStr = `window.__ATLAS_INITIAL_DATA__ = ${JSON.stringify({
            metadata: { lastUpdated: new Date().toISOString(), version: "1.5" },
            items: state.items
        }, null, 4)};`;
        
        const blob = new Blob([dataStr], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalog.js';
        a.click();
        URL.revokeObjectURL(url);
    };

    return { init, getState, setState, subscribe, exportData };
})();