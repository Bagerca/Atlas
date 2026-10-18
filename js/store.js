window.Store = (() => {
    let state = {
        items: [],
        isAdmin: false,
        route: { path: '/', params: {} },
        searchQuery: '',
        lastCatalogRoute: '#/', 
        sortConfig: { by: 'title', dir: 'asc' },
        groupByCollections: true
    };

    const listeners = [];

    const init = () => {
        try {
            const localData = localStorage.getItem('atlas_data');
            if (localData) {
                state.items = JSON.parse(localData).items;
                console.log("[Store] Данные каталога загружены из LocalStorage");
            } else if (window.__ATLAS_INITIAL_DATA__) {
                state.items = window.__ATLAS_INITIAL_DATA__.items;
                console.log("[Store] Данные каталога загружены из манифеста");
            }

            const savedGroupBy = localStorage.getItem('atlas_group_by_collections');
            if (savedGroupBy !== null) {
                state.groupByCollections = savedGroupBy === 'true';
                console.log(`[Store] Настройка группировки подкатегорий: ${state.groupByCollections}`);
            }
        } catch (error) {
            console.error("[Store] Ошибка инициализации хранилища:", error);
            state.items = [];
        }
    };

    const getState = () => state;

    const setState = (updates) => {
        state = { ...state, ...updates };
        
        try {
            if (updates.items) {
                localStorage.setItem('atlas_data', JSON.stringify({ items: state.items }));
            }
            if (updates.groupByCollections !== undefined) {
                localStorage.setItem('atlas_group_by_collections', updates.groupByCollections.toString());
            }
        } catch (storageError) {
            console.error("[Store] Ошибка сохранения состояния в LocalStorage:", storageError);
        }

        listeners.forEach(listener => {
            try {
                listener(state);
            } catch (err) {
                console.error("[Store] Ошибка в подписчике Store:", err);
            }
        });
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        listener(state); 
    };

    const exportData = () => {
        try {
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
            console.log("[Store] База данных успешно экспортирована");
        } catch (exportError) {
            console.error("[Store] Ошибка экспорта данных:", exportError);
        }
    };

    return { init, getState, setState, subscribe, exportData };
})();