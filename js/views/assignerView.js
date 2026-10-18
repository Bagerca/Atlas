window.AssignerView = (() => {
    // Раздельные списки пропущенных для каждого режима
    let skippedIds = {
        lifecycle: new Set(),
        format: new Set(),
        extra: new Set()
    };

    // Драфт для режимов с множественным выбором (Форматы, Экстра)
    let currentDraft = new Set();

    const FORMAT_STATUSES = ['played_self', 'watched_youtube', 'listened_audio', 'watched_reaction'];
    const EXTRA_STATUSES = ['platinum', 'watched_reaction_extra'];

    const getFormatOptions = (type) => {
        if (type === 'games') return [
            { val: 'played_self', label: 'Играл сам', icon: window.Icons.gamepad },
            { val: 'watched_youtube', label: 'YouTube', icon: window.Icons.youtube }
        ];
        if (type === 'literature') return [
            { val: 'played_self', label: 'Читал', icon: window.Icons.book },
            { val: 'listened_audio', label: 'Слушал', icon: window.Icons.headphones || '🎧' }
        ];
        return [
            { val: 'played_self', label: 'Смотрел', icon: window.Icons.tv },
            { val: 'watched_reaction', label: 'Реакции', icon: window.Icons.users }
        ];
    };

    const getExtraOptions = (type) => {
        if (type === 'games') return [
            { val: 'platinum', label: 'Платина', icon: window.Icons.trophy || '🏆' }
        ];
        if (type === 'series' || type === 'features') return [
            { val: 'watched_reaction_extra', label: 'Доп. Реакция', icon: window.Icons.users }
        ];
        return [];
    };

    const render = (state) => {
        if (!state.isAdmin) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">${window.Icons.lock}</div>
                    <h2>Доступ запрещен</h2>
                    <p>Помогатор доступен только администратору.</p>
                </div>
            `;
        }

        const currentType = state.route.params.type || 'all';
        const currentMode = state.route.params.mode || 'lifecycle';

        const unassignedItems = state.items.filter(i => {
            const matchesType = currentType === 'all' || i.type === currentType;
            if (!matchesType) return false;
            if (skippedIds[currentMode].has(i.id)) return false;

            const lifecycle = window.Helpers.getLifecycleStatus(i.statuses);

            if (currentMode === 'lifecycle') {
                return lifecycle === 'unassigned';
            } 
            
            if (currentMode === 'format') {
                if (lifecycle === 'unassigned') return false;
                const hasFormat = i.statuses.some(st => FORMAT_STATUSES.includes(st));
                return !hasFormat;
            }

            if (currentMode === 'extra') {
                if (lifecycle === 'unassigned') return false;
                const hasExtra = i.statuses.some(st => EXTRA_STATUSES.includes(st));
                return !hasExtra;
            }

            return false;
        });

        // Навигация (Типы + Режимы)
        const tabsHtml = `
            <div style="margin-bottom: var(--spacing-sm); display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                <a href="#/assigner?type=all&mode=${currentMode}" class="btn ${currentType === 'all' ? 'btn-primary' : 'btn-secondary'}">Все подряд</a>
                <a href="#/assigner?type=games&mode=${currentMode}" class="btn ${currentType === 'games' ? 'btn-primary' : 'btn-secondary'}">Игры</a>
                <a href="#/assigner?type=features&mode=${currentMode}" class="btn ${currentType === 'features' ? 'btn-primary' : 'btn-secondary'}">Полнометражки</a>
                <a href="#/assigner?type=series&mode=${currentMode}" class="btn ${currentType === 'series' ? 'btn-primary' : 'btn-secondary'}">Сериалы</a>
                <a href="#/assigner?type=literature&mode=${currentMode}" class="btn ${currentType === 'literature' ? 'btn-primary' : 'btn-secondary'}">Литература</a>
            </div>
            <div style="margin-bottom: var(--spacing-xl); display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                <a href="#/assigner?type=${currentType}&mode=lifecycle" class="btn ${currentMode === 'lifecycle' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.85rem;">${window.Icons.clock} Этап</a>
                <a href="#/assigner?type=${currentType}&mode=format" class="btn ${currentMode === 'format' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.85rem;">${window.Icons.tv} Формат</a>
                <a href="#/assigner?type=${currentType}&mode=extra" class="btn ${currentMode === 'extra' ? 'btn-primary' : 'btn-secondary'}" style="font-size: 0.85rem;">${window.Icons.trophy || '🏆'} Экстра</a>
            </div>
        `;

        if (unassignedItems.length === 0) {
            const totalSkipped = skippedIds[currentMode].size;
            let emptyMsg = `В категории «${currentType}» для режима «${currentMode}» всё распределено!`;
            let resetBtn = '';
            
            if (totalSkipped > 0) {
                emptyMsg = `Всё распределено, кроме пропущенных карточек (${totalSkipped} шт.).`;
                resetBtn = `<button class="btn btn-primary" id="assigner-reset-skips" style="margin-top: 20px;">Вернуться к пропущенным</button>`;
            }

            return tabsHtml + `
                <div class="empty-state">
                    <div class="empty-state-icon" style="color: var(--success-color);">${window.Icons.checkCircle}</div>
                    <h2>Всё готово</h2>
                    <p>${emptyMsg}</p>
                    ${resetBtn}
                </div>
            `;
        }

        const item = unassignedItems[0];
        const typeLabel = window.Helpers.getTypeLabel(item.type);

        // Генерация контролов в зависимости от режима
        let controlsHtml = '';
        if (currentMode === 'lifecycle') {
            controlsHtml = `
                <button class="assigner-btn in_progress lifecycle-btn" data-status="in_progress" title="В процессе">
                    ${window.Icons.clock} <span class="assigner-btn-label">В процессе</span>
                </button>
                <button class="assigner-btn endless lifecycle-btn" data-status="endless" title="Сессионка">
                    ${window.Icons.infinity || '♾️'} <span class="assigner-btn-label">Сессионка</span>
                </button>
                <button class="assigner-btn completed lifecycle-btn" data-status="completed" title="Завершено">
                    ${window.Icons.checkCircle} <span class="assigner-btn-label">Завершено</span>
                </button>
                <button class="assigner-btn planned lifecycle-btn" data-status="planned" title="В планах">
                    ${window.Icons.bookmark} <span class="assigner-btn-label">В планах</span>
                </button>
                <button class="assigner-btn dropped lifecycle-btn" data-status="dropped" title="Брошено">
                    ${window.Icons.xCircle} <span class="assigner-btn-label">Брошено</span>
                </button>
                
                <div class="assigner-actions-divider"></div>
                <button class="assigner-btn skip" id="assigner-skip-btn" title="Пропустить">
                    ${window.Icons.arrowDown}
                </button>
            `;
        } else {
            const options = currentMode === 'format' ? getFormatOptions(item.type) : getExtraOptions(item.type);
            
            if (options.length === 0) {
                controlsHtml = `
                    <div style="color: var(--text-muted); font-weight: 800; font-size: 0.9rem; text-align: center; max-width: 200px;">
                        Для типа «${typeLabel}» нет опций в этом режиме.
                    </div>
                    <div class="assigner-actions-divider"></div>
                    <button class="assigner-btn skip" id="assigner-skip-btn" title="Пропустить">
                        ${window.Icons.arrowDown}
                    </button>
                `;
            } else {
                const buttonsHtml = options.map(opt => {
                    const isSelected = currentDraft.has(opt.val) ? 'selected' : '';
                    return `
                        <button class="assigner-btn toggle-btn ${isSelected}" data-status="${opt.val}" title="${opt.label}">
                            ${opt.icon} <span class="assigner-btn-label">${opt.label}</span>
                        </button>
                    `;
                }).join('');

                controlsHtml = `
                    ${buttonsHtml}
                    <div class="assigner-actions-divider"></div>
                    <button class="assigner-btn apply apply-draft-btn" title="Сохранить и дальше">
                        ${window.Icons.checkCircle}
                    </button>
                    <button class="assigner-btn skip" id="assigner-skip-btn" title="Пропустить">
                        ${window.Icons.arrowDown}
                    </button>
                `;
            }
        }

        return tabsHtml + `
            <div class="assigner-wrapper">
                <div class="assigner-stats">Осталось: ${unassignedItems.length}</div>
                
                <div class="assigner-card">
                    <img src="${window.Helpers.escapeHtml(item.poster)}" onerror="this.style.display='none'">
                    <div class="assigner-card-info">
                        <span class="item-type-pill" style="border-color: rgba(255,255,255,0.2);">${typeLabel}</span>
                        <h2 class="assigner-card-title">${window.Helpers.escapeHtml(item.title)}</h2>
                    </div>
                </div>
                
                <div class="assigner-controls" data-id="${item.id}">
                    ${controlsHtml}
                </div>
            </div>
        `;
    };

    const init = () => {
        const main = document.getElementById('app-main');
        
        main.addEventListener('click', (e) => {
            if (!window.Store.getState().route.path.startsWith('/assigner')) return;
            const currentMode = window.Store.getState().route.params.mode || 'lifecycle';

            // Сброс пропущенных
            if (e.target.closest('#assigner-reset-skips')) {
                skippedIds[currentMode].clear();
                main.innerHTML = window.AssignerView.render(window.Store.getState());
                return;
            }

            // Обычный пропуск (Скип)
            const skipBtn = e.target.closest('#assigner-skip-btn');
            if (skipBtn) {
                const id = skipBtn.closest('.assigner-controls').dataset.id;
                skippedIds[currentMode].add(id);
                currentDraft.clear();
                main.innerHTML = window.AssignerView.render(window.Store.getState());
                return;
            }

            // 1. Режим: Жизненный цикл (Мгновенное применение)
            const lifecycleBtn = e.target.closest('.lifecycle-btn');
            if (lifecycleBtn && currentMode === 'lifecycle') {
                const id = lifecycleBtn.closest('.assigner-controls').dataset.id;
                const newStatus = lifecycleBtn.dataset.status;
                
                const currentItems = window.Store.getState().items;
                const updatedItems = currentItems.map(i => {
                    if (i.id === id) {
                        return { 
                            ...i, 
                            statuses: window.Helpers.setLifecycleStatus(i.statuses, newStatus) 
                        };
                    }
                    return i;
                });
                
                window.Store.setState({ items: updatedItems });
                return;
            }

            // 2. Режимы с Тогглами (Формат / Экстра)
            const toggleBtn = e.target.closest('.toggle-btn');
            if (toggleBtn) {
                const status = toggleBtn.dataset.status;
                if (currentDraft.has(status)) {
                    currentDraft.delete(status);
                    toggleBtn.classList.remove('selected');
                } else {
                    currentDraft.add(status);
                    toggleBtn.classList.add('selected');
                }
                return;
            }

            // Применение выбранных Тогглов (Галочка)
            const applyBtn = e.target.closest('.apply-draft-btn');
            if (applyBtn) {
                const id = applyBtn.closest('.assigner-controls').dataset.id;
                
                // Если ничего не выбрали, но нажали применить — приравниваем к пропуску (чтобы не застрять)
                if (currentDraft.size === 0) {
                    skippedIds[currentMode].add(id);
                    main.innerHTML = window.AssignerView.render(window.Store.getState());
                    return;
                }

                const currentItems = window.Store.getState().items;
                const updatedItems = currentItems.map(i => {
                    if (i.id === id) {
                        const newStatuses = [...(i.statuses || [])];
                        currentDraft.forEach(st => {
                            if (!newStatuses.includes(st)) newStatuses.push(st);
                        });
                        return { ...i, statuses: newStatuses };
                    }
                    return i;
                });
                
                currentDraft.clear();
                window.Store.setState({ items: updatedItems });
                return;
            }
        });

        // Очистка драфта при переключении табов режимов
        window.addEventListener('hashchange', () => {
            if (window.Store.getState().route.path.startsWith('/assigner')) {
                currentDraft.clear();
            }
        });
    };

    return { render, init };
})();