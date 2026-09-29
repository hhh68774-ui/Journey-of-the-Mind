#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to parse the official 1,124 LRC books inventory from /tmp/books_part1.tsv and /tmp/books_part2.tsv
and output a comprehensive, structured TypeScript file at src/services/lrcBooksData.ts
"""

import json
import re

COVER_IMAGES = {
    'physics': [
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    ],
    'chemistry': [
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&w=600&q=80',
    ],
    'biology': [
        'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
    ],
    'space': [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    ],
    'math': [
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    ],
    'earth': [
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    ],
    'technology': [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ],
    'general': [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    ]
}

def clean_val(v):
    if not v or v == '0' or v == 'د.م':
        return ''
    return v.strip()

def determine_location(dewey, title):
    dewey_clean = dewey.replace(',', '.')
    try:
        val = float(re.findall(r'\d+(?:\.\d+)?', dewey_clean)[0])
    except:
        val = 500.0

    if 530 <= val < 540:
        return 'قسم الفيزياء والعلوم الطبيعية - الرف 2 (أ)'
    elif 540 <= val < 550:
        return 'قسم الكيمياء والمواد - الرف 3 (ب)'
    elif 570 <= val < 600:
        return 'قسم علوم الحياة والأحياء والكائنات - الرف 1 (ج)'
    elif 610 <= val < 620:
        return 'قسم العلوم الطبية وجسم الإنسان - الرف 4 (أ)'
    elif 510 <= val < 520:
        return 'قسم الرياضيات والإحصاء - الرف 5 (ب)'
    elif 520 <= val < 530:
        return 'قسم علوم الفلك والفضاء - الرف 6 (أ)'
    elif 550 <= val < 570:
        return 'قسم علوم الأرض والجيولوجيا والطقس - الرف 3 (ج)'
    elif 620 <= val < 630:
        return 'قسم التكنولوجيا والابتكارات والآلات - الرف 7 (أ)'
    elif val >= 630:
        return 'قسم العلوم التطبيقية والمهارات العملية - الرف 8 (ب)'
    else:
        return 'قسم العلوم العامة والموسوعات العلمية - الرف 1 (أ)'

def pick_cover(dewey, title, idx):
    t_lower = title.lower()
    dewey_clean = dewey.replace(',', '.')
    try:
        val = float(re.findall(r'\d+(?:\.\d+)?', dewey_clean)[0])
    except:
        val = 500.0

    if any(k in t_lower for k in ['فيزياء', 'ضوء', 'صوت', 'كهرباء', 'طاقة', 'حركة', 'كتلة', 'ضغط', 'حرارة', 'تلسكوب']) or (530 <= val < 540):
        pool = COVER_IMAGES['physics']
    elif any(k in t_lower for k in ['كيمياء', 'ذرة', 'عناصر', 'مركبات', 'تفاعل', 'هيدروجين', 'هيليوم']) or (540 <= val < 550):
        pool = COVER_IMAGES['chemistry']
    elif any(k in t_lower for k in ['خلية', 'نبات', 'حيوان', 'أحياء', 'وراثة', 'جين', 'طيور', 'أسماك', 'حشرات']) or (570 <= val < 600):
        pool = COVER_IMAGES['biology']
    elif any(k in t_lower for k in ['إنسان', 'جسم', 'دم', 'قلب', 'تنفس', 'عظام', 'عضلات', 'صحة', 'طب', 'طبيب', 'حواس']) or (610 <= val < 620):
        pool = COVER_IMAGES['biology']
    elif any(k in t_lower for k in ['فلك', 'فضاء', 'قمر', 'شمس', 'نجوم', 'مجرة', 'كوكب', 'كون', 'أرض']) or (520 <= val < 530):
        pool = COVER_IMAGES['space']
    elif any(k in t_lower for k in ['رياضيات', 'حساب', 'جبر', 'تفاضل', 'تكامل', 'أرقام', 'إحصاء']) or (510 <= val < 520):
        pool = COVER_IMAGES['math']
    elif any(k in t_lower for k in ['روبوت', 'آلة', 'كمبيوتر', 'إلكترونيات', 'تكنولوجيا', 'اختراع']):
        pool = COVER_IMAGES['technology']
    elif any(k in t_lower for k in ['أرض', 'صخور', 'معادن', 'براكين', 'زلازل', 'محيطات', 'طقس', 'ماء', 'سحب']) or (550 <= val < 570):
        pool = COVER_IMAGES['earth']
    else:
        pool = COVER_IMAGES['general']

    return pool[idx % len(pool)]

def main():
    lines = []
    for path in ['tmp/books_part1.tsv', 'tmp/books_part2.tsv', '/tmp/books_part1.tsv', '/tmp/books_part2.tsv']:
        import os
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    lines.append(line)

    print(f"Total raw lines loaded: {len(lines)}")

    books = []
    seen_ids = set()

    for idx, line in enumerate(lines, 1):
        parts = line.split('\t')
        if len(parts) < 5:
            continue

        raw_index = parts[0].strip()
        general_no = parts[1].strip() if len(parts) > 1 else f"{idx:06d}"
        dewey_no = parts[2].strip() if len(parts) > 2 else "500"
        call_no = parts[3].strip() if len(parts) > 3 else ""
        raw_title = parts[4].strip()
        topics = clean_val(parts[5]) if len(parts) > 5 else ""
        author = clean_val(parts[6]) if len(parts) > 6 else ""
        year = clean_val(parts[7]) if len(parts) > 7 else ""
        publisher = clean_val(parts[8]) if len(parts) > 8 else ""

        # Normalize title
        title = re.sub(r'^[اأ]ال', 'ال', raw_title)
        title = re.sub(r'[\s_]+', ' ', title).strip()
        if not title:
            continue

        # Clean author string if it has years or publishers inside
        if author and ' - ' in author:
            author_parts = author.split(' - ')
            author = author_parts[0].strip()

        book_id = f"lrc-b-{general_no}"
        if book_id in seen_ids:
            book_id = f"lrc-b-{general_no}-{idx}"
        seen_ids.add(book_id)

        location = determine_location(dewey_no, title)
        cover_image = pick_cover(dewey_no, title, idx)

        # Classification string formatted nicely
        class_str = f"{dewey_no} {call_no}".strip() if call_no else dewey_no

        # Construct meaningful description
        desc_parts = [f"كتاب موثق بمركز مصادر التعلم بمدرسة المنارة للبنات (الرقم العام: {general_no})."]
        if topics:
            desc_parts.append(f"الموضوعات: {topics}.")
        if author:
            desc_parts.append(f"تأليف: {author}.")
        desc = " ".join(desc_parts)

        book_obj = {
            "id": book_id,
            "title": title,
            "author": author or "نخبة من المؤلفين والباحثين",
            "classificationNumber": class_str,
            "serialNumber": general_no,
            "location": location,
            "description": desc,
            "coverImage": cover_image,
            "publisher": publisher or "مركز مصادر التعلم",
            "publishYear": year or "غير محدد"
        }
        books.append(book_obj)

    print(f"Successfully processed {len(books)} books.")

    # Write TypeScript file
    out_file = 'src/services/lrcBooksData.ts'
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write("/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\n")
        f.write("import { Book } from '../types';\n\n")
        f.write(f"// السجل الرسمي الشامل لكتب مركز مصادر التعلم بمدرسة المنارة للبنات ({len(books)} كتاباً)\n")
        f.write("export const lrcOfficialBooks: Book[] = ")
        json.dump(books, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Wrote {out_file} successfully.")

if __name__ == '__main__':
    main()
