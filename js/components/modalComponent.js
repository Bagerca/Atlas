window.ModalComponent = (() => {
    let currentItem = null;

    // Рендер чипсов для трех осей статусов
    const renderStatusAxes = (type, currentStatuses = []) => {
        // Ось 1: Жизненный цикл (Только один выбор - Radio)
        const lifecycleOptions = [
            { val: 'planned', label: 'В планах', icon: window.Icons.bookmark },
            { val: 'in_progress', label: 'В процессе', icon: window.Icons.clock },
            { val: 'endless', label: 'Сессионка', icon: window.Icons.infinity || '♾️' },
            { val: 'completed', label: 'Завершено', icon: window.Icons.checkCircle },
            { val: 'dropped', label: 'Брошено', icon: window.Icons.xCircle }
        ];

        // Ось 2: Формат (Множественный выбор - Checkbox)
        let formatOptions = [];
        if (type === 'games') {
            formatOptions = [
                { val: 'played_self', label: 'Играл сам', icon: window.Icons.gamepad },
                { val: 'watched_youtube', label: 'Смотрел на YouTube', icon: window.Icons.youtube }
            ];
        } else if (type === 'literature') {
            formatOptions = [
                { val: 'played_self', label: 'Читал текст', icon: window.Icons.book },
                { val: 'listened_audio', label: 'Слушал аудиокнигу', icon: window.Icons.headphones || '🎧' }
            ];
        } else { // series, features
            formatOptions = [
                { val: 'played_self', label: 'Смотрел сам', icon: window.Icons.tv },
                { val: 'watched_reaction', label: 'Смотрел реакцию', icon: window.Icons.users }
            ];
        }

        // Ось 3: Экстра (Множественный выбор - Checkbox, Золотой цвет)
        let extraOptions = [];
        if (type === 'games') {
            extraOptions.push({ val: 'platinum', label: 'Платина / 100%', icon: window.Icons.trophy || '🏆' });
        } else if (type === 'series' || type === 'features') {
            extraOptions.push({ val: 'watched_reaction_extra', label: 'Доп. реакция', icon: window.Icons.users });
        }

        // Универсальный генератор
        const generateChips = (options, name, typeInput, customClass = 'primary') => {
            if (options.length === 0) return '';
            return `
                <div class="status-chip-group ${customClass}">
                    ${options.map(opt => `
                        <label>
                            <input type="${typeInput}" name="${name}" value="${opt.val}" ${currentStatuses.includes(opt.val) ? 'checked' : ''}>
                            <div class="status-chip-label">
                                ${opt.icon} ${opt.label}
                            </div>
                        </label>
                    `).join('')}
                </div>
            `;
        };

        return `
            <div class="form-section-title" style="margin-top: 0;">Этап прохождения</div>
            ${generateChips(lifecycleOptions, 'status_lifecycle', 'radio', 'primary')}
            
            <div class="form-section-title">Формат погружения</div>
            ${generateChips(formatOptions, 'status_format', 'checkbox', 'primary')}
            
            ${extraOptions.length > 0 ? `
                <div class="form-section-title">Экстра / Ачивки</div>
                ${generateChips(extraOptions, 'status_extra', 'checkbox', 'extra')}
            ` : ''}
        `;
    };

    const render = (item) => {
        const isEdit = !!item;
        currentItem = item || {};

        const title = currentItem.title || '';
        const type = currentItem.type || 'games';
        const score = currentItem.score || '';
        const tier = currentItem.tier || '';
        const poster = currentItem.poster || '';
        const review = currentItem.review || '';
        const collections = currentItem.collections ? currentItem.collections.join(', ') : '';
        const completedAt = currentItem.completedAt || '';
        
        const currentProgress = currentItem.meta?.currentProgress || '';
        const totalProgress = currentItem.meta?.totalProgress || '';
        
        let statuses = currentItem.statuses || [];
        const showProgress = type === 'series' || type === 'literature';

        return `
            <div class="modal-overlay active" id="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>${isEdit ? 'Редактировать запись' : 'Добавить в Atlas'}</h2>
                        <button type="button" class="btn-icon" id="close-modal" title="Закрыть">
                            ${window.Icons.close}
                        </button>
                    </div>
                    
                    <form id="atlas-form" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                        <div class="modal-split-layout">
                            
                            <!-- ЛЕВАЯ КОЛОНКА -->
                            <div class="modal-form-side">
                                
                                <div class="form-section-title">Основная информация</div>
                                <div class="form-group full-width">
                                    <label class="form-label">Название</label>
                                    <input type="text" class="form-control" name="title" value="${window.Helpers.escapeHtml(title)}" required>
                                </div>

                                <div class="form-grid">
                                    <div class="form-group">
                                        <label class="form-label">Тип медиа</label>
                                        <select class="form-control" name="type" id="type-select">
                                            <option value="games" ${type === 'games' ? 'selected' : ''}>Игры</option>
                                            <option value="features" ${type === 'features' ? 'selected' : ''}>Полнометражки</option>
                                            <option value="series" ${type === 'series' ? 'selected' : ''}>Сериалы / Аниме</option>
                                            <option value="literature" ${type === 'literature' ? 'selected' : ''}>Литература</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Коллекции (через запятую)</label>
                                        <input type="text" class="form-control" name="collections" value="${window.Helpers.escapeHtml(collections)}" placeholder="Сёнен, Манга...">
                                    </div>
                                </div>

                                <div class="form-section-title">Метрики и Прогресс</div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label class="form-label">Оценка (1-10)</label>
                                        <input type="number" class="form-control" name="score" min="1" max="10" value="${score}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Tier-лист</label>
                                        <select class="form-control" name="tier">
                                            <option value="">Без тира</option>
                                            <option value="S" ${tier === 'S' ? 'selected' : ''}>S - Шедевр</option>
                                            <option value="A" ${tier === 'A' ? 'selected' : ''}>A - Отлично</option>
                                            <option value="B" ${tier === 'B' ? 'selected' : ''}>B - Хорошо</option>
                                            <option value="C" ${tier === 'C' ? 'selected' : ''}>C - Средне</option>
                                            <option value="D" ${tier === 'D' ? 'selected' : ''}>D - Плохо</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-grid" id="progress-fields" style="display: ${showProgress ? 'grid' : 'none'};">
                                    <div class="form-group">
                                        <label class="form-label">Текущий прогресс</label>
                                        <input type="number" class="form-control" name="currentProgress" value="${currentProgress}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Всего (Главы/Серии)</label>
                                        <input type="number" class="form-control" name="totalProgress" value="${totalProgress}">
                                    </div>
                                </div>

                                <div class="form-group full-width" style="margin-bottom: 0;">
                                    <label class="form-label">Дата завершения</label>
                                    <input type="date" class="form-control" name="completedAt" value="${completedAt}">
                                </div>

                                <!-- БЛОК СТАТУСОВ -->
                                <div id="modal-status-axes" style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--glass-border);">
                                    ${renderStatusAxes(type, statuses)}
                                </div>

                                <div class="form-section-title">Текст</div>
                                <div class="form-group full-width" style="margin-bottom: 0;">
                                    <label class="form-label">Отзыв / Заметка</label>
                                    <textarea class="form-control" name="review" placeholder="Ваши впечатления...">${window.Helpers.escapeHtml(review)}</textarea>
                                </div>
                            </div>

                            <!-- ПРАВАЯ КОЛОНКА -->
                            <div class="modal-poster-side">
                                <div class="poster-preview-card">
                                    ${window.Icons.emptyBox}
                                    <img id="poster-preview-img" src="${window.Helpers.escapeHtml(poster)}" onerror="this.style.display='none'" onload="this.style.display='block'">
                                </div>
                                <div class="form-group full-width" style="width: 100%; margin-bottom: 0;">
                                    <label class="form-label text-center">URL Постера</label>
                                    <input type="text" class="form-control" name="poster" id="poster-input" value="${window.Helpers.escapeHtml(poster)}" placeholder="assets/image.jpg">
                                </div>
                                <div class="item-id-badge">
                                    ID: ${currentItem?.id || 'NEW'}
                                </div>
                            </div>

                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-modal">Отмена</button>
                            <button type="submit" class="btn btn-primary">Сохранить запись</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    };

    const close = () => {
        const currentPath = window.Router.parseUrl().path;
        if (currentPath === '/item') {
            window.Router.setQueryParams({ modal: null }); 
        } else {
            window.Router.setQueryParams({ modal: null, id: null });
        }
    };

    const init = () => {
        const modalContainer = document.getElementById('app-modal');

        window.Store.subscribe((state) => {
            const { modal, id } = state.route.params;
            if (modal === 'add') {
                modalContainer.innerHTML = render(null);
                bindDynamicEvents();
            } else if (modal === 'edit' && id) {
                const item = state.items.find(i => i.id === id);
                if (item) {
                    modalContainer.innerHTML = render(item);
                    bindDynamicEvents();
                } else {
                    close();
                }
            } else {
                modalContainer.innerHTML = '';
                currentItem = null;
            }
        });

        modalContainer.addEventListener('click', (e) => {
            if (e.target.closest('#close-modal') || e.target.closest('#cancel-modal') || e.target.id === 'modal-overlay') {
                close();
            }
        });

        modalContainer.addEventListener('submit', (e) => {
            if (e.target.id === 'atlas-form') {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                // Сборка массива статусов из новых осей
                const newStatuses = [];
                
                // 1. Этап прохождения (Radio)
                const lf = formData.get('status_lifecycle');
                if (lf) newStatuses.push(lf);
                
                // 2. Форматы (Checkbox)
                const formats = formData.getAll('status_format');
                formats.forEach(fmt => newStatuses.push(fmt));
                
                // 3. Экстра (Checkbox)
                const extras = formData.getAll('status_extra');
                extras.forEach(ex => newStatuses.push(ex));

                const collectionsStr = formData.get('collections');
                const parsedCollections = collectionsStr ? collectionsStr.split(',').map(c => c.trim()).filter(c => c.length > 0) : [];

                const currentP = formData.get('currentProgress');
                const totalP = formData.get('totalProgress');
                let metaData = {};
                if (currentP || totalP) {
                    metaData = {
                        currentProgress: currentP ? Number(currentP) : null,
                        totalProgress: totalP ? Number(totalP) : null
                    };
                }

                const newItem = {
                    id: currentItem?.id || Date.now().toString(),
                    title: formData.get('title'),
                    type: formData.get('type'),
                    statuses: newStatuses,
                    score: Number(formData.get('score')) || null,
                    tier: formData.get('tier') || null,
                    poster: formData.get('poster'),
                    completedAt: formData.get('completedAt') || null,
                    review: formData.get('review')
                };

                if (parsedCollections.length > 0) newItem.collections = parsedCollections;
                if (Object.keys(metaData).length > 0) newItem.meta = metaData;

                const currentItems = window.Store.getState().items;
                const newItemsList = currentItem?.id 
                    ? currentItems.map(i => i.id === currentItem.id ? newItem : i)
                    : [newItem, ...currentItems];

                window.Store.setState({ items: newItemsList });
                close();
            }
        });
    };

    const bindDynamicEvents = () => {
        const typeSelect = document.getElementById('type-select');
        const progressFields = document.getElementById('progress-fields');
        const statusAxes = document.getElementById('modal-status-axes');
        const posterInput = document.getElementById('poster-input');
        const posterImg = document.getElementById('poster-preview-img');
        
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                const newType = e.target.value;
                statusAxes.innerHTML = renderStatusAxes(newType, []);
                
                if (newType === 'series' || newType === 'literature') {
                    progressFields.style.display = 'grid';
                } else {
                    progressFields.style.display = 'none';
                    document.querySelector('input[name="currentProgress"]').value = '';
                    document.querySelector('input[name="totalProgress"]').value = '';
                }
            });
        }

        if (posterInput && posterImg) {
            posterInput.addEventListener('input', (e) => {
                posterImg.src = e.target.value;
                posterImg.style.display = e.target.value ? 'block' : 'none';
            });
        }
    };

    return { init };
})();