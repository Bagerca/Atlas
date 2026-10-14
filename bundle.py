import os

def build_context():
    # Файл, куда будет сохранен весь код
    output_filename = 'atlas_context.txt'
    
    # Расширения файлов, которые мы хотим собрать
    allowed_extensions = {'.html', '.css', '.js', '.json'}
    
    # Папки, которые скрипт будет игнорировать
    exclude_dirs = {'.git', 'assets', '__pycache__', 'node_modules'}
    
    # Имя самого этого скрипта, чтобы он не добавил себя в сборку
    script_name = os.path.basename(__file__)

    print(f"Начинаю сборку проекта Atlas в {output_filename}...")

    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # Пишем заголовок
        outfile.write("=" * 60 + "\n")
        outfile.write("ATLAS PROJECT CONTEXT (PURE FRONTEND)\n")
        outfile.write("=" * 60 + "\n\n")

        # Обходим все директории
        for root, dirs, files in os.walk('.'):
            # Модифицируем список dirs in-place, чтобы os.walk не заходил в исключенные папки
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Пропускаем сам скрипт сборщика и итоговый текстовик
                if file == script_name or file == output_filename:
                    continue
                
                ext = os.path.splitext(file)[1].lower()
                
                if ext in allowed_extensions:
                    # Нормализуем путь (меняем \ на / для красоты, если это Windows)
                    filepath = os.path.join(root, file).replace('\\', '/')
                    
                    try:
                        with open(filepath, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Пишем разделитель и путь к файлу
                            outfile.write(f"\n{'=' * 60}\n")
                            outfile.write(f"FILE: {filepath}\n")
                            outfile.write(f"{'=' * 60}\n\n")
                            # Пишем сам код
                            outfile.write(content + "\n")
                            
                            print(f"Добавлен: {filepath}")
                    except Exception as e:
                        print(f"Ошибка чтения {filepath}: {e}")

    print(f"\nУспешно! Все файлы собраны в {output_filename}.")
    print("Теперь ты можешь прикрепить этот файл или скопировать его текст в чат.")

if __name__ == "__main__":
    build_context()