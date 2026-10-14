window.Helpers = {
    // Защита от XSS-инъекций при выводе пользовательского ввода
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe.toString().replace(/[&<"'>]/g, (match) => {
            const dict = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return dict[match];
        });
    },

    // Контекстно-зависимые статусы для разных типов медиа
    getStatusDict: (type) => {
        const base = {
            'completed': 'Пройдено/Просмотрено',
            'in_progress': 'В процессе',
            'dropped': 'Брошено',
            'planned': 'В планах'
        };

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
    }
};