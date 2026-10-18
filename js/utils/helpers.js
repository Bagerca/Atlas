window.Helpers = {
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe.toString().replace(/[&<"'>]/g, (match) => {
            const dict = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return dict[match];
        });
    },

    getTypeLabel: (type) => {
        const labels = {
            'games': 'Игры',
            'series': 'Аниме / Сериалы',
            'features': 'Полнометражки',
            'literature': 'Литература'
        };
        return labels[type] || 'Медиа';
    },

    getLifecycleStatus: (statuses) => {
        if (!statuses || !Array.isArray(statuses) || statuses.length === 0) return 'unassigned';
        if (statuses.includes('in_progress')) return 'in_progress';
        if (statuses.includes('endless')) return 'endless'; // Новое
        if (statuses.includes('completed')) return 'completed';
        if (statuses.includes('planned')) return 'planned';
        if (statuses.includes('dropped')) return 'dropped';
        return 'unassigned';
    },

    setLifecycleStatus: (statuses, newStatus) => {
        const lifecycleTypes = ['in_progress', 'endless', 'completed', 'planned', 'dropped'];
        const filtered = (statuses || []).filter(s => !lifecycleTypes.includes(s));
        if (newStatus) {
            filtered.push(newStatus);
        }
        return filtered;
    },

    getLifecycleDetails: (status) => {
        const dict = {
            'in_progress': { label: 'В процессе', icon: window.Icons.clock, colorClass: 'color-info' },
            'endless': { label: 'Сессионные', icon: window.Icons.infinity || '♾️', colorClass: 'color-warning' },
            'completed': { label: 'Завершено', icon: window.Icons.checkCircle, colorClass: 'color-success' },
            'planned': { label: 'В планах', icon: window.Icons.bookmark, colorClass: 'color-muted' },
            'dropped': { label: 'Брошено', icon: window.Icons.xCircle, colorClass: 'color-danger' },
            'unassigned': { label: 'Без статуса', icon: window.Icons.grid, colorClass: 'color-primary' }
        };
        return dict[status] || dict['unassigned'];
    },

    // Конвертация ключей в визуальные иконки для карточки (Ось 2 и 3 + старые статусы прогресса)
    getStatusVisuals: (status, type) => {
        switch (status) {
            // ФОРМАТЫ
            case 'played_self':
                let icon = window.Icons.tv;
                let title = 'Смотрел сам';
                if (type === 'games') { icon = window.Icons.gamepad; title = 'Играл сам'; }
                if (type === 'literature') { icon = window.Icons.book; title = 'Читал сам'; }
                return { svg: icon, colorClass: 'color-primary', title: title };
            
            case 'watched_youtube':
                return { svg: window.Icons.youtube, colorClass: 'color-youtube', title: 'Смотрел прохождение' };
            
            case 'listened_audio':
                return { svg: window.Icons.headphones || '🎧', colorClass: 'color-primary', title: 'Слушал аудиокнигу' };
            
            case 'watched_reaction':
                return { svg: window.Icons.users, colorClass: 'color-primary', title: 'Смотрел на реакции' };

            // ЭКСТРА
            case 'platinum':
                return { svg: window.Icons.trophy || '🏆', colorClass: 'color-warning', title: 'Платина / 100%' };

            case 'watched_reaction_extra':
                return { svg: window.Icons.users, colorClass: 'color-primary', title: 'Смотрел доп. реакцию' };

            // ПРОГРЕСС (На случай если они нужны на карточке)
            case 'completed':
                return { svg: window.Icons.checkCircle, colorClass: 'color-success', title: 'Завершено' };
            
            case 'in_progress':
                return { svg: window.Icons.clock, colorClass: 'color-info', title: 'В процессе' };
            
            case 'endless':
                return { svg: window.Icons.infinity || '♾️', colorClass: 'color-warning', title: 'Сессионка' };
            
            case 'dropped':
                return { svg: window.Icons.xCircle, colorClass: 'color-danger', title: 'Брошено' };
            
            case 'planned':
                return { svg: window.Icons.bookmark, colorClass: 'color-muted', title: 'В планах' };
            
            default:
                return null;
        }
    }
};