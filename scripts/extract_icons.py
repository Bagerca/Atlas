import os
import re

# Определяем абсолютный путь к папке, где лежит сам этот скрипт (scripts/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Поднимаемся на уровень выше к корню проекта
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

# Формируем точные пути до нужных папок
JS_FILE = os.path.join(PROJECT_ROOT, 'js', 'utils', 'icons.js')
OUT_DIR = os.path.join(PROJECT_ROOT, 'assets', 'icons')

# Создаем папку assets/icons, если ее нет
os.makedirs(OUT_DIR, exist_ok=True)

try:
    with open(JS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Регулярное выражение для поиска ключей и SVG в обратных кавычках
    pattern = re.compile(r'(\w+):\s*`([^`]+)`')
    matches = pattern.findall(content)

    for name, svg in matches:
        path = os.path.join(OUT_DIR, f"{name}.svg")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(svg.strip())
            
    print(f"✅ Успешно извлечено {len(matches)} иконок в папку: \n{OUT_DIR}")
    
except FileNotFoundError:
    print(f"❌ Ошибка: Файл не найден по пути:\n{JS_FILE}")