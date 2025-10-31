import jsPDF from 'jspdf';
import { TimesNewRoman } from './font';

export class PDFGenerator {
  
  /**
   * Генерация структурированного PDF для рабочей программы
   */
  static generateWorkProgramPDF(programData) {
    const {
      program,
      curriculumDisciplines,
      curriculum,
      dis,
      teacher,
      status,
      studyForms,
      department,
      studyDirection,
      faculty,
      competencies,
      competenceIndicators,
      getStudyFormName,
      formatDate,
      getCompetenceName,
      getIndicatorsForCompetence
    } = programData;

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addFileToVFS('TimesNewRoman-normal.ttf', TimesNewRoman.normal);
    pdf.addFont('TimesNewRoman-normal.ttf', 'TimesNewRoman', 'normal');
    pdf.setFont('TimesNewRoman');

    // Страница 1 - Титульник
    this.addTitlePage(pdf, { dis, curriculum });

    // Страница 2 - Составители
    pdf.addPage();
    this.addAuthorsPage(pdf, { 
      teacher, 
      department, // Передаем кафедру
      studyDirection // Передаем направление
    });

    // Страница 3 - Основное содержание
    pdf.addPage();
    this.addContentPage(pdf, { 
      program, 
      curriculumDisciplines, 
      curriculum, 
      getStudyFormName 
    });

    return pdf;
  }

  /**
   * Страница 1 - Титульник
   */
  static addTitlePage(pdf, data) {
    const { dis, curriculum } = data;
    const pageWidth = 210;
    
    // Название университета
    pdf.setFontSize(12);
    pdf.text('Министерство магии Великобритании', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('федеральное государственное образовательное учреждение высшего образования', pageWidth / 2, 30, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('Школа Чародейства и Волшебства Хогвартс', pageWidth / 2, 40, { align: 'center' });

    // Рабочая программа
    pdf.setFontSize(16);
    pdf.text('РАБОЧАЯ ПРОГРАММА', pageWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text('дисциплины (модуля)', 50, 90, { align: 'left' });
    
    // Название дисциплины
    pdf.setFontSize(12);
    pdf.text(`«${dis?.name || 'Название дисциплины'}»`, pageWidth / 2 + 10, 90, { align: 'left' });

    // Уровень образования
    pdf.setFontSize(12);
    pdf.text('Уровень образования', 50, 100, { align: 'left' });
    pdf.text('высшее образование - бакалавриат', 105, 100, { align: 'left' });

    // Квалификация
    pdf.text('Квалификация', 50, 110, { align: 'left' });
    pdf.text('бакалавр', 105, 110, { align: 'left' });

    // Город и год
    pdf.text('г. Лондон, 2025', pageWidth / 2, 250, { align: 'center' });
  }

  /**
   * Страница 2 - Составители
   */
  static addAuthorsPage(pdf, data) {
    const { teacher, department, studyDirection } = data;
    const margin = 20;
    let yPosition = 40;

    pdf.setFontSize(12);

    // Заголовок
    pdf.text('Рабочая программа составлена:', margin, yPosition);
    yPosition += 20;

    // Кафедра
    pdf.text('на кафедре', margin, yPosition);
    pdf.text(department?.name || 'Неизвестно', margin + 25, yPosition);
    yPosition += 10;

    // Факультет
    pdf.text('факультета', margin, yPosition);
    pdf.text('Гриффиндор', margin + 25, yPosition); // Можно добавить поле факультета в кафедру
    yPosition += 10;

    // Направление
    pdf.text('Направление', margin, yPosition);
    const directionName = studyDirection ? `${studyDirection.code} - ${studyDirection.name}` : 'Изучение магических видов опасных и неопасных категорий';
    pdf.text(directionName, margin + 25, yPosition);
    yPosition += 20;

    // Составитель
    pdf.text('Составитель рабочей программы:', margin, yPosition);
    yPosition += 10;

    // Должность и подпись
    pdf.text('старший преподаватель', margin, yPosition);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text(teacher?.fio || 'ФИО преподавателя', margin + 90, yPosition);
  }

  /**
   * Страница 3 - Основное содержание
   */
  static addContentPage(pdf, data) {
    const { program, curriculumDisciplines, curriculum, getStudyFormName } = data;
    const margin = 20;
    let yPosition = 30;

    pdf.setFontSize(12);

    // 1. Объем дисциплины
    pdf.text('1 ОБЪЕМ ДИСЦИПЛИНЫ (МОДУЛЯ) В ЗАЧЕТНЫХ ЕДИНИЦАХ С УКАЗАНИЕМ', margin, yPosition);
    yPosition += 5;
    pdf.text('АКАДЕМИЧЕСКИХ ЧАСОВ, ВЫДЕЛЕННЫХ НА КОНТАКТНУЮ РАБОТУ ОБУЧАЮЩИХСЯ', margin, yPosition);
    yPosition += 5;
    pdf.text('С ПРЕПОДАВАТЕЛЕМ (ПО ВИДАМ УЧЕБНЫХ ЗАНЯТИЙ) И НА САМОСТОЯТЕЛЬНУЮ', margin, yPosition);
    yPosition += 5;
    pdf.text('РАБОТУ ОБУЧАЮЩИХСЯ', margin, yPosition);
    yPosition += 10;

    // Таблица 1
    pdf.text('Таблица 1', margin, yPosition);
    yPosition += 5;
    pdf.text('Бюджет времени с учетом формы обучения, семестра и видов занятий', margin, yPosition);
    yPosition += 10;

    // Таблица объема времени
    if (curriculumDisciplines) {
      this.addVolumeTableDetailed(pdf, data, margin, yPosition);
      yPosition += 50;
    }

    pdf.setFontSize(12);
    // 2. Язык преподавания
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.text('2 ЯЗЫК ПРЕПОДАВАНИЯ', margin, yPosition);
    yPosition += 10;
    pdf.text(`Изучение дисциплины (модуля) осуществляется на языке: ${program?.languages || 'русский'}`, margin, yPosition);
    yPosition += 20;

    // 3. Цели и задачи
    pdf.text('3 ЦЕЛИ И ЗАДАЧИ ДИСЦИПЛИНЫ (МОДУЛЯ)', margin, yPosition);
    yPosition += 10;
    
    if (program?.goals) {
      pdf.text(`Целью освоения дисциплины (модуля) является ${program.goals}`, margin, yPosition, { maxWidth: 170 });
      yPosition += 15;
    }

    if (program?.tasks) {
      pdf.text(`Задачами являются: ${program.tasks}`, margin, yPosition, { maxWidth: 170 });
      yPosition += 15;
    }

    // 4. Планируемые результаты
    if (yPosition > 180) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.text('4 ПЕРЕЧЕНЬ ПЛАНИРУЕМЫХ РЕЗУЛЬТАТОВ ОБУЧЕНИЯ ПО ДИСЦИПЛИНЕ (МОДУЛЮ),', margin, yPosition);
    yPosition += 5;
    pdf.text('СООТНЕСЕННЫХ С ИНДИКАТОРАМИ ДОСТИЖЕНИЯ КОМПЕТЕНЦИЙ', margin, yPosition);
    yPosition += 10;

    pdf.text('Таблица 2', margin, yPosition);
    yPosition += 5;
    pdf.text('Планируемые результаты обучения по дисциплине (модулю), с указанием', margin, yPosition);
    yPosition += 5;
    pdf.text('индикатора достижения компетенций', margin, yPosition);
    yPosition += 10;

    // Таблица компетенций (заглушка - нужно добавить данные компетенций)
    this.addCompetenciesTable(pdf, margin, yPosition);
    yPosition += 30;

    pdf.setFontSize(12);
    // 5
    pdf.text('5 МЕСТО ДИСЦИПЛИНЫ (МОДУЛЯ) В СТРУКТУРЕ ОБРАЗОВАТЕЛЬНОЙ ПРОГРАММЫ', margin, yPosition);
    yPosition += 5;
    pdf.text('Дисциплина (модуль) относится к части, формируемой участниками образовательных\nотношений блока Б 1 образовательной программы.', margin, yPosition);
    yPosition += 15;

    pdf.text('6 СОДЕРЖАНИЕ ДИСЦИПЛИНЫ (МОДУЛЯ), СТРУКТУРИРОВАННОЕ ПО ТЕМАМ (РАЗДЕЛАМ)\n С УКАЗАНИЕМ ОТВЕДЕННОГО НА НИХ КОЛИЧЕСТВА АКАДЕМИЧЕСКИХ ЧАСОВ\n И ВИДОВ УЧЕБНЫХ ЗАНЯТИЙ', margin, yPosition);
    yPosition += 15;
    pdf.text('6.1 Тематический план изучения дисциплины (модуля)', margin, yPosition);
    yPosition += 10;
    pdf.text('6.2. Теоритический курс', margin, yPosition);
    yPosition += 5;
    pdf.text('6.3. Практические (семинарские) занятия', margin, yPosition);
    // yPosition += 5;
    // pdf.text('6.4. Лабораторный практикум', margin, yPosition);
    // yPosition += 5;

    // pdf.text('6.5 Курсовой проект (работа), реферат, расчетно-графические работы', margin, yPosition);
    // yPosition += 5;
    // pdf.text('6.6 Самостоятельная работа обучающихся', margin, yPosition);
    // yPosition += 5;
    
    pdf.text('7 ПЕРЕЧЕНЬ ОЦЕНОЧНЫХ СРЕДСТВ (ОЦЕНОЧНЫХ МАТЕРИАЛОВ) ДЛЯ ПРОВЕДЕНИЯ ТЕКУЩЕГО КОНТРОЛЯ И ПРОМЕЖУТОЧНОЙ АТТЕСТАЦИИ ОБУЧАЮЩИХСЯ ПО ДИСЦИПЛИНЕ (МОДУЛЮ)', margin, yPosition);
    yPosition += 5;
    pdf.text(program?.languages, margin, yPosition)
    pdf.text('8 ПЕРЕЧЕНЬ УЧЕБНОЙ ЛИТЕРАТУРЫ, НЕОБХОДИМОЙ ДЛЯ ОСВОЕНИЯ ДИСЦИПЛИНЫ (МОДУЛЯ)', margin, yPosition);
    yPosition += 5;
    // pdf.text(program?.grading_system, margin, yPosition)
    // yPosition += 5;
    // pdf.text('9 ПЕРЕЧЕНЬ УЧЕБНО-МЕТОДИЧЕСКОГО ОБЕСПЕЧЕНИЯ ДЛЯ КОНТАКТНОЙ И САМОСТОЯТЕЛЬНОЙ РАБОТЫ ОБУЧАЮЩИХСЯ ПО ДИСЦИПЛИНЕ (МОДУЛЮ)', margin, yPosition);
    // yPosition += 5;
    // pdf.text(program?.educational_technology, margin, yPosition)
    // yPosition += 5;
    // pdf.text('10. ПЕРЕЧЕНЬ ИНФОРМАЦИОННЫХ РЕСУРСОВ', margin, yPosition);
    // yPosition += 5;
    // pdf.text(program?.logistics, margin, yPosition)
    // yPosition += 5;
    // pdf.text('11 ОПИСАНИЕ МАТЕРИАЛЬНО-ТЕХНИЧЕСКОЙ БАЗЫ И ПЕРЕЧЕНЬ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ, ИСПОЛЬЗУЕМЫХ ПРИ ОСУЩЕСТВЛЕНИИ ОБРАЗОВАТЕЛЬНОГО ПРОЦЕССА ПО ДИСЦИПЛИНЕ (МОДУЛЮ), ВКЛЮЧАЯ ПЕРЕЧЕНЬ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ И ИНФОРМАЦИОННЫХ СПРАВОЧНЫХ СИСТЕМ ', margin, yPosition);
    // yPosition += 5;
    // pdf.text(program?.references_t, margin, yPosition)
    // yPosition += 5;
  }

  /**
   * Детальная таблица объема времени
   */
  static addVolumeTableDetailed(pdf, data, margin, yPosition) {
    const { curriculumDisciplines, curriculum, getStudyFormName } = data;
    
    const headers = [
      'Форма обучения',
      'Семестр',
      'Всего часов',
      'Контактная работа',
      'Лекции',
      'Практика',
      'Лаб. работы',
      'Самост. работа',
      'Аттестация',
      'ЗЕТ'
    ];

    const colWidths = [25, 15, 15, 20, 15, 15, 15, 20, 20, 15];
    let xPosition = margin;

    // Заголовки таблицы
    pdf.setFontSize(8);
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition, { maxWidth: colWidths[index] });
      xPosition += colWidths[index];
    });
    yPosition += 8;

    // Данные таблицы
    xPosition = margin;
    const rowData = [
      getStudyFormName(curriculum?.studyFormId) || 'Очная',
      curriculumDisciplines.semesterNumber?.toString() || '1',
      curriculumDisciplines.totalHours?.toString() || '0',
      curriculumDisciplines.totalContactHours?.toString() || '0',
      curriculumDisciplines.lectureHours?.toString() || '0',
      curriculumDisciplines.practiceHours?.toString() || '0',
      curriculumDisciplines.labHours?.toString() || '0',
      curriculumDisciplines.totalSelfStudyHours?.toString() || '0',
      curriculumDisciplines.intermediateAssessmentHours?.toString() || '0',
      curriculumDisciplines.credits?.toString() || '0'
    ];

    rowData.forEach((cell, index) => {
      pdf.text(cell, xPosition, yPosition, { maxWidth: colWidths[index] });
      xPosition += colWidths[index];
    });
  }

  /**
   * Таблица компетенций (заглушка - нужно добавить реальные данные)
   */
  static addCompetenciesTable(pdf, margin, yPosition) {
    const headers = [
      'Код компетенции',
      'Описание компетенции', 
      'Код индикатора',
      'Описание индикатора'
    ];

    const colWidths = [25, 50, 25, 70];
    let xPosition = margin;

    // Заголовки
    pdf.setFontSize(8);
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition, { maxWidth: colWidths[index] });
      xPosition += colWidths[index];
    });
    yPosition += 8;

    // Пример данных (нужно заменить на реальные)
    const competencies = [
      ['УК-1', 'Способен осуществлять поиск и анализ информации', 'УК-1.1', 'Владеет методами поиска информации'],
      ['УК-2', 'Способен работать в команде', 'УК-2.1', 'Умеет распределять роли в команде']
    ];

    competencies.forEach(competency => {
      xPosition = margin;
      competency.forEach((cell, index) => {
        pdf.text(cell, xPosition, yPosition, { maxWidth: colWidths[index] });
        xPosition += colWidths[index];
      });
      yPosition += 8;
    });
  }

  /**
   * Генерация и сохранение PDF
   */
  static saveWorkProgramPDF(programData, fileName = null) {
    try {
      const pdf = this.generateWorkProgramPDF(programData);
      
      if (!fileName) {
        const disciplineName = programData.dis?.name || 'unknown';
        fileName = `work_program_${disciplineName}_${new Date().toISOString().split('T')[0]}.pdf`;
      }

      pdf.save(fileName);
      return true;
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      throw new Error('Не удалось создать PDF файл');
    }
  }
}