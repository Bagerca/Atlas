import os
import glob

# Определяем абсолютный путь к папке, где лежит сам скрипт
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

# Точные пути
IN_DIR = os.path.join(PROJECT_ROOT, 'assets', 'icons')
JS_FILE = os.path.join(PROJECT_ROOT, 'js', 'utils', 'icons.js')

if not os.path.exists(IN_DIR):
    print(f"❌ Ошибка: Папка с иконками не существует:\n{IN_DIR}")
    exit(1)

# Ищем все .svg файлы в папке
svg_files = glob.glob(os.path.join(IN_DIR, '*.svg'))
icons_dict = []

if not svg_files:
    print(f"⚠️ Внимание: В папке {IN_DIR} нет ни одного .svg файла.")
    exit(0)

for file in svg_files:
    # Имя файла без расширения становится ключом объекта
    name = os.path.splitext(os.path.basename(file))[0]
    with open(file, 'r', encoding='utf-8') as f:
        svg_content = f.read().strip()
    
    # Формируем строку JS: key: `<svg...>`,
    icons_dict.append(f'    {name}: `{svg_content}`')

# Оборачиваем в JS-объект
js_content = "window.Icons = {\n" + ",\n".join(icons_dict) + "\n};\n"

# На всякий случай создаем папку для JS-файла, если ее вдруг нет
os.makedirs(os.path.dirname(JS_FILE), exist_ok=True)

with open(JS_FILE, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"✅ Успешно скомпилировано {len(svg_files)} иконок в файл: \n{JS_FILE}")