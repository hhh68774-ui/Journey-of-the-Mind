#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate intelligent Lesson-Book relations between Cambridge lessons and the 1,124 LRC books
Output to src/services/lrcRelationsData.ts
"""

import json
import re

def main():
    # Load lrcOfficialBooks
    with open('src/services/lrcBooksData.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # extract json array
    match = re.search(r'export const lrcOfficialBooks: Book\[\] = (\[.*\]);', content, re.DOTALL)
    if not match:
        print("Could not parse lrcOfficialBooks")
        return

    books = json.loads(match.group(1))
    print(f"Loaded {len(books)} official books")

    # Read initialLessons from seedData.ts
    with open('src/services/seedData.ts', 'r', encoding='utf-8') as f:
        seed_content = f.read()

    # Let's extract lesson ids and keywords/titles with regex
    lesson_matches = re.findall(
        r"id:\s*'([^']+)',\s*gradeId:\s*'([^']+)',\s*(?:subject:\s*'([^']+)',\s*)?(?:semester:\s*'([^']+)',\s*)?unit:\s*'([^']+)',\s*(?:lessonNumber:\s*'([^']+)',\s*)?title:\s*'([^']+)'",
        seed_content
    )

    print(f"Found {len(lesson_matches)} lessons in seedData.ts")

    relations = []
    rel_id_counter = 1
    seen_pairs = set()

    def add_rel(lesson_id, book, note):
        nonlocal rel_id_counter
        pair = (lesson_id, book['id'])
        if pair in seen_pairs:
            return
        seen_pairs.add(pair)
        relations.append({
            'id': f"rel-lrc-{rel_id_counter:04d}",
            'lessonId': lesson_id,
            'bookId': book['id'],
            'relevanceNote': note
        })
        rel_id_counter += 1

    # Topic matchers for Physics
    topic_keywords = {
        'قياس': ['قياس', 'الوحدات والقياس', 'كيف نقيس', 'القوى والقياسات', 'الساعة', 'الوقت', 'المكان والزمان'],
        'طول': ['الوحدات والقياس', 'كيف نقيس', 'الرياضيات'],
        'زمن': ['الساعة', 'الوقت', 'المكان والزمان', 'موسوعة الاعجاز العلمي في الحديث النبوي الشريف ج3-الزمن'],
        'سرعة': ['الحركة', 'القوة والحركة', 'طاقة الحركة والوضع', 'قوانين الحركة', 'تجارب علمية مبسطة( الحركة )', 'الفيزياء الممتعة'],
        'تسارع': ['الحركة', 'القوة والحركة', 'قوانين الحركة', 'طاقة الحركة والوضع', 'الفيزياء'],
        'حركة': ['القوة والحركة', 'قوانين الحركة', 'طاقة الحركة والوضع', 'تجارب علمية مبسطة( الحركة )', 'الفيزياء المسلية'],
        'كتلة': ['الاتزان ومركز الكتلة', 'الجاذبية والمغناطيسية', 'الميكانيكا والجوامد', 'أساسيات الفيزياء'],
        'وزن': ['الاتزان ومركز الكتلة', 'الجاذبية والمغناطيسية', 'الميكانيكا'],
        'كثافة': ['المواد', 'حالات المادة', 'الميكانيكا والجوامد', 'الفيزياء المسلية'],
        'حرارة': ['الحرارة', 'الحرارة والمناخ', 'تكنولوجيا الحرارة', 'تجاربي العلمية الميسرة : الحرارة والطاقة', 'الديناميكا الحرارية', 'قوانين الديناميكا الحراريه', 'الضغط(1)', 'الضغط(2)'],
        'تمدد': ['الحرارة', 'المواد', 'حالات المادة'],
        'طاقة': ['الطاقة', 'الطاقة البديلة', 'مصادر الطاقة الجديدة', 'معاً للحفاظ على : الطاقة', 'الطاقة والكهرباء', 'الكهرباء والطاقة'],
        'توصيل': ['الحرارة', 'الطاقة', 'تجاربي العلمية الميسرة : الحرارة والطاقة'],
        'حمل': ['الحرارة', 'تجاربي العلمية الميسرة : الحرارة والطاقة'],
        'إشعاع': ['التلوث الناتج عن الإشعاع النووي', 'فيزياء الضوء والصوت', 'الفيزياء النووية'],
        'ضوء': ['الضوء', 'الضوء والصوت', 'الضوء في تجارب', 'اكتشف الخداع البصري', 'التلسكوب الكاسر', 'التلسكوب العاكس', 'فيزياء الضوء والصوت', 'الرؤية'],
        'انعكاس': ['الضوء', 'الضوء والصوت', 'الضوء في تجارب', 'اكتشف الخداع البصري', 'التلسكوب العاكس'],
        'انكسار': ['الضوء', 'الضوء في تجارب', 'التلسكوب الكاسر', 'فيزياء الضوء والصوت'],
        'عدسات': ['الضوء', 'التلسكوب الكاسر', 'المرقب (التلسكوب)', 'اكتشف الخداع البصري'],
        'كهرباء': ['الكهرباء', 'الكهرباء والطاقة', 'المبادئ الأساسية للكهرباء', 'الكهرباء الساكنة', 'الكهرباء والمغناطيسة', 'أساسيات الكهرباء', 'تجارب علمية مبسطة : الكهرباء', 'في بيتي كهربائي', 'سلسلة الالكترون 6 ( المقاومة الكهربية'],
        'مقاومة': ['سلسلة الالكترون 6 ( المقاومة الكهربية', 'الكهرباء', 'المبادئ الأساسية للكهرباء', 'الكهرباء والطاقة'],
        'مغناطيس': ['المغناطيسية', 'الجاذبية والمغناطيسية', 'المغنطيسية والكهرباء', 'مصنع العلوم : المغنطيسية والمغناطيس', 'الكهرباء والمغناطيسة'],
        'خلية': ['الخلايا', 'الخلية و الDNA', 'علم الاحياء ( الخلية )', 'علم الخلية', 'موسوعة بيئتنا: البيئة والكائنات الحية(وظيفة الخلايا'],
        'هضم': ['الجهاز الهضمي في الإنسان', 'الكتاب الطبي في أمراض الجهاز الهضمي', 'كل شي عن الجهاز الهضمي', 'الهضم وامتصاص الغذاء', 'التغذية الصحيحة'],
        'تنفس': ['الجهاز التنفسي', 'الجهاز التنفسي والجلد', 'الكتاب الطبي ( امراض الجهاز التنفسي )'],
        'قلب': ['القلب والدم', 'الكتاب الطبي ( امراض الدم )'],
        'دم': ['القلب والدم', 'الكتاب الطبي ( امراض الدم )', 'ضغط الدم المرتفع'],
        'عظام': ['العظام', 'الهيكل العظمي والعضلات', 'موسوعة الهياكل العظمية', 'كل شيئ عن العضلات والعظام'],
        'عضلات': ['الهيكل العظمي والعضلات', 'كل شيئ عن العضلات والعظام'],
        'مناعة': ['الجهاز المناعي', 'الجهاز المناعي بين الرياضة والصحة'],
        'نبات': ['حياة النبات', 'النباتات', 'أطلس النبات', 'الأطلس النباتي', 'أساسيات علم النبات العام', 'موسوعة النبات'],
        'حيوان': ['عالم الحيوان', 'أطلس الحيوان', 'موسوعة الحيوانات', 'كيف تعيش الحيوانات', 'صغار الحيوانات'],
        'كيمياء': ['الكيمياء', 'الكيمياء العامة', 'الكيمياء البسيطة', 'أساسيات الكيمياء', 'تجارب علمية مسلية في الكيمياء', 'الكيمياء تبدأ هنا', 'الكيمياء في حياتنا', 'الكيمياء للأطفال الفضوليين', 'مبادئ الكيمياء العامة'],
        'ذرة': ['الذرة والقنبلة الذرية', 'مكنونات عالم الذرة', 'من الذرة إلى المجرة', 'سلسلة الالكترون 4( البلورات )'],
        'تفاعل': ['الكيمياء والتفاعلات المثيرة', 'الحركية الكيميائية وميكانيكية التفاعلات', 'مكتبة الطالب العلمية في الكيمياء:التفاعلات الكيميائية'],
        'هيدروجين': ['الهيدروجين طاقة المستقبل'],
        'هيليوم': ['الهيليوم خفة واستقرار'],
    }

    # Match each lesson with books
    for l_item in lesson_matches:
        l_id, l_grade, l_subj, l_sem, l_unit, l_num, l_title = l_item
        lesson_text = f"{l_unit} {l_title} {l_subj}".lower()

        # Find relevant books
        matched_for_lesson = 0
        for b in books:
            b_title = b['title'].lower()
            b_desc = b['description'].lower()

            for key, book_titles in topic_keywords.items():
                if key in lesson_text:
                    for target in book_titles:
                        if target.lower() in b_title:
                            add_rel(l_id, b, f"كتاب مرجعي بمركز مصادر التعلم يثري فهم درس {l_title} وموضوع {key}")
                            matched_for_lesson += 1
                            break

            if matched_for_lesson >= 6:
                break

        # Fallback general physics/science book if fewer than 2 matched
        if matched_for_lesson < 2:
            if 'فيزياء' in lesson_text or l_subj == 'فيزياء':
                for b in books:
                    if any(t in b['title'] for t in ['الفيزياء المسلية', 'الفيزياء الممتعة', 'أساسيات الفيزياء', 'استمتع مع الفيزياء', 'الفيزياء للأطفال الفضوليين']):
                        add_rel(l_id, b, f"مرجع فيزيائي معتمد في مركز مصادر التعلم لموضوع {l_title}")
                        matched_for_lesson += 1
                        if matched_for_lesson >= 3:
                            break
            elif 'أحياء' in lesson_text or l_subj == 'أحياء':
                for b in books:
                    if any(t in b['title'] for t in ['علم الأحياء', 'أطلس جسم الإنسان', 'داخل جسم الإنسان:الحواس', 'الموسوعة الشاملة لجسم الانسان']):
                        add_rel(l_id, b, f"مرجع بيولوجي بمركز مصادر التعلم لموضوع {l_title}")
                        matched_for_lesson += 1
                        if matched_for_lesson >= 3:
                            break
            elif 'كيمياء' in lesson_text or l_subj == 'كيمياء':
                for b in books:
                    if any(t in b['title'] for t in ['الكيمياء العامة', 'الكيمياء تبدأ هنا', 'الكيمياء للأطفال الفضوليين', 'الكيمياء الممتعة']):
                        add_rel(l_id, b, f"مرجع كيميائي موثق بمصادر التعلم لدرس {l_title}")
                        matched_for_lesson += 1
                        if matched_for_lesson >= 3:
                            break

    print(f"Generated {len(relations)} lesson-book relations connecting with LRC books!")

    out_file = 'src/services/lrcRelationsData.ts'
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write("/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\n")
        f.write("import { LessonBookRelation } from '../types';\n\n")
        f.write(f"// شبكة العلاقات الأكاديمية بين دروس العلوم والفيزياء والأحياء والكيمياء وكتب مصادر التعلم ({len(relations)} علاقة)\n")
        f.write("export const lrcOfficialRelations: LessonBookRelation[] = ")
        json.dump(relations, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Wrote {out_file} successfully.")

if __name__ == '__main__':
    main()
