window.Helpers = {
    // Защита от XSS-инъекций
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe.toString().replace(/[&<"'>]/g, (match) => {
            const dict = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return dict[match];
        });
    },

    // Текстовые статусы для Модалки (Чекбоксы)
    getStatusDict: (type) => {
        if (type === 'games') {
            return {
                'played_self': 'Играл(а) сам(а)',
                'watched_youtube': 'Смотрел(а) на YouTube',
                'watched_reaction': 'Смотрел(а) реакцию',
                'completed': 'Пройдена',
                'in_progress': 'В процессе',
                'dropped': 'Брошена',
                'planned': 'В планах'
            };
        }
        if (type === 'literature') {
            return {
                'played_self': 'Читал(а) сам(а)',
                'watched_youtube': 'Слушал(а) аудиокнигу',
                'watched_reaction': 'Читал(а) с кем-то',
                'completed': 'Прочитана',
                'in_progress': 'В процессе',
                'dropped': 'Брошена',
                'planned': 'В планах'
            };
        }
        return {
            'played_self': 'Смотрел(а) сам(а)',
            'watched_youtube': 'Смотрел(а) на YouTube',
            'watched_reaction': 'Смотрел(а) реакцию',
            'completed': 'Просмотрено',
            'in_progress': 'В процессе',
            'dropped': 'Брошено',
            'planned': 'В планах'
        };
    },

    // Визуальные иконки статусов для Карточки
    getStatusVisuals: (status, type) => {
        // Базовые тексты (если тип не передан)
        let labels = window.Helpers.getStatusDict(type);
        
        switch (status) {
            // Взаимодействие
            case 'played_self':
                let icon = window.Icons.tv;
                if (type === 'games') icon = window.Icons.gamepad;
                if (type === 'literature') icon = window.Icons.book;
                return { svg: icon, colorClass: 'color-primary', title: labels['played_self'] };
            
            case 'watched_youtube':
                return { svg: window.Icons.youtube, colorClass: 'color-youtube', title: labels['watched_youtube'] };
            
            case 'watched_reaction':
                return { svg: window.Icons.users, colorClass: 'color-primary', title: labels['watched_reaction'] };
            
            // Прогресс
            case 'completed':
                return { svg: window.Icons.checkCircle, colorClass: 'color-success', title: labels['completed'] };
            
            case 'in_progress':
                return { svg: window.Icons.clock, colorClass: 'color-info', title: labels['in_progress'] };
            
            case 'dropped':
                return { svg: window.Icons.xCircle, colorClass: 'color-danger', title: labels['dropped'] };
            
            case 'planned':
                return { svg: window.Icons.bookmark, colorClass: 'color-muted', title: labels['planned'] };
            
            default:
                return null;
        }
    }
};