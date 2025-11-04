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
      depHead,
      status,
      studyForms,
      department,
      studyDirection,
      faculty,
      competencies,
      competenceIndicators,
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
      depHead, 
      department,
      faculty,
      curriculum,
      studyDirection
    });

    // Страница 3 - Основное содержание
    pdf.addPage();
    this.addContentPage(pdf, { 
      program, 
      curriculumDisciplines, 
      curriculum, 
      competencies,
      competenceIndicators,
      getCompetenceName,
      getIndicatorsForCompetence
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
    pdf.text(`${dis?.name || 'Название дисциплины'}`, pageWidth / 2 + 10, 90, { align: 'left' });

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
    const { teacher, depHead, department, faculty, curriculum, studyDirection } = data;
    const margin = 20;
    let yPosition = 40;

    pdf.setFontSize(12);

    // Заголовок
    pdf.text('Рабочая программа составлена:', margin, yPosition);
    yPosition += 20;

    // Кафедра
    pdf.text('на кафедре', margin, yPosition);
    pdf.text(department?.name || 'Неизвестно', margin + 65, yPosition);
    yPosition += 10;

    // Факультет
    pdf.text('факультета', margin, yPosition);
    pdf.text(faculty?.name || 'Неизвестно', margin + 65, yPosition); // Можно добавить поле факультета в кафедру
    yPosition += 10;

    // Направление
    pdf.text('в соответствии с учебным\nпланом по направлению\nподготовки (специальности)', margin, yPosition);
    const directionName = studyDirection ? `${studyDirection.code} - ${studyDirection.name}` : 'Изучение магических видов опасных и неопасных категорий';
    pdf.text(directionName, margin + 65, yPosition);
    yPosition += 20;

    pdf.text('профиль\n(программа / специализация)', margin, yPosition);
    const curriculumName = curriculum.name;
    pdf.text(curriculumName, margin + 65, yPosition);
    yPosition += 30;

    // Составитель
    pdf.text('Составитель рабочей программы:', margin, yPosition);
    yPosition += 10;

    // Должность и подпись
    pdf.text('старший преподаватель', margin, yPosition);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text(teacher?.fio || '', margin + 90, yPosition);
    pdf.text('____________________', margin + 90, yPosition);
    yPosition += 15;

    pdf.text('Рабочая программа рассмотрена на заседании кафедры:', margin, yPosition);
    yPosition += 10;
    pdf.text('заведующий кафедрой', margin, yPosition);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text(depHead?.fio || '', margin + 90, yPosition);
    pdf.text('____________________', margin + 90, yPosition);
    yPosition += 30;

    pdf.text('СОГЛАСОВАНО', margin, yPosition);
    yPosition += 10;
    pdf.setFontSize(8);
    pdf.text('Руководитель ОПОП', margin, yPosition);
    pdf.setFontSize(12);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text('____________________', margin + 90, yPosition);
    yPosition += 10;
    pdf.setFontSize(8);
    pdf.text('Заведующий выпускающей\nкафедрой', margin, yPosition);
    pdf.setFontSize(12);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text('____________________', margin + 90, yPosition);
    yPosition += 10;
    pdf.setFontSize(8);
    pdf.text('Директор библиотеки', margin, yPosition);
    pdf.setFontSize(12);
    pdf.text('____________________', margin + 45, yPosition);
    pdf.text('____________________', margin + 90, yPosition);
  }

  /**
   * Страница 3 - Основное содержание
   */
  static addContentPage(pdf, data) {
    const { 
      program, 
      curriculumDisciplines, 
      curriculum, 
      competencies,
      competenceIndicators,
      getCompetenceName,
      getIndicatorsForCompetence
    } = data;
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

    // таблица 1
    pdf.text('Таблица 1', margin, yPosition);
    yPosition += 5;
    pdf.text('Бюджет времени с учетом формы обучения, семестра и видов занятий', margin, yPosition);
    yPosition += 10;

    // таблица объема времени
    if (curriculumDisciplines) {
      yPosition = this.addVolumeTableDetailed(pdf, data, margin, yPosition);
    }

    pdf.setFontSize(12);
    // 2 язык преподавания
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.text('2 ЯЗЫК ПРЕПОДАВАНИЯ', margin, yPosition);
    yPosition += 10;
    pdf.text(`Изучение дисциплины (модуля) осуществляется на языке: ${program?.languages || 'русский'}`, margin, yPosition);
    yPosition += 10;

    // 3 цели и задачи
    pdf.text('3 ЦЕЛИ И ЗАДАЧИ ДИСЦИПЛИНЫ (МОДУЛЯ)', margin, yPosition);
    yPosition += 10;
    
    if (program?.goals) {
      pdf.text(program.goals, margin, yPosition, { maxWidth: 170 });
      yPosition += (program.goals.length / 63) * 5 + 10;
    }

    yPosition = this.checkPage(yPosition, pdf, program.tasks.length);

    if (program?.tasks) {
      pdf.text(program.tasks, margin, yPosition, { maxWidth: 170 });
      yPosition += (program.tasks.length / 63) * 5 + 10;
    }

    // 4. Планируемые результаты

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

    // Таблица компетенций
    console.log(data)
    yPosition = this.addCompetenciesTable(pdf, data, margin, yPosition);

    pdf.setFontSize(12);
    // 5

    yPosition = this.checkPage(yPosition, pdf, 170);
    pdf.text('5 МЕСТО ДИСЦИПЛИНЫ (МОДУЛЯ) В СТРУКТУРЕ ОБРАЗОВАТЕЛЬНОЙ ПРОГРАММЫ', margin, yPosition);
    yPosition += 5;
    pdf.text('Дисциплина (модуль) относится к части, формируемой участниками образовательных\nотношений блока Б 1 образовательной программы.', margin, yPosition);
    yPosition += 15;

    yPosition = this.checkPage(yPosition, pdf, program.thematicPlan + 170);

    pdf.text('6 СОДЕРЖАНИЕ ДИСЦИПЛИНЫ (МОДУЛЯ), СТРУКТУРИРОВАННОЕ ПО ТЕМАМ (РАЗДЕЛАМ)\n С УКАЗАНИЕМ ОТВЕДЕННОГО НА НИХ КОЛИЧЕСТВА АКАДЕМИЧЕСКИХ ЧАСОВ\n И ВИДОВ УЧЕБНЫХ ЗАНЯТИЙ', margin, yPosition);
    yPosition += 15;
    pdf.text('6.1 Тематический план изучения дисциплины (модуля)', margin, yPosition);
    yPosition += 5;
    pdf.text(program.thematicPlan, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.thematicPlan.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.theoreticalCourse.length);
    console.log(yPosition)

    pdf.text('6.2. Теоретический курс', margin, yPosition);
    yPosition += 5;
    pdf.text(program.theoreticalCourse, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.theoreticalCourse.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.practicalWork.length);

    pdf.text('6.3. Практические (семинарские) занятия', margin, yPosition);
    yPosition += 5;
    pdf.text(program.practicalWork, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.practicalWork.length / 63) * 5 + 5;

    pdf.text('6.4. Лабораторный практикум', margin, yPosition);
    yPosition += 5;
    pdf.text(program.laboratoryWorkshop, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.laboratoryWorkshop.length /63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.laboratoryWorkshop.length);

    pdf.text('6.5 Курсовой проект (работа), реферат, расчетно-графические работы', margin, yPosition);
    yPosition += 5;
    pdf.text(program.courseProject, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.courseProject.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.independentWork.length);

    pdf.text('6.6 Самостоятельная работа обучающихся', margin, yPosition);
    yPosition += 5;
    pdf.text(program.independentWork, margin, yPosition, { maxWidth: 170 });
    yPosition += (program.independentWork.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.assessmentTools.length + 200);
    console.log(yPosition)
    console.log( program.assessmentTools.length + 200)

    console.log(yPosition)
    pdf.text('7 ПЕРЕЧЕНЬ ОЦЕНОЧНЫХ СРЕДСТВ (ОЦЕНОЧНЫХ МАТЕРИАЛОВ) ДЛЯ\n ПРОВЕДЕНИЯ ТЕКУЩЕГО КОНТРОЛЯ И ПРОМЕЖУТОЧНОЙ АТТЕСТАЦИИ\n ОБУЧАЮЩИХСЯ ПО ДИСЦИПЛИНЕ (МОДУЛЮ)', margin, yPosition);
    yPosition += 15;
    pdf.text(program?.assessmentTools, margin, yPosition, { maxWidth: 170 })
    yPosition += (program.assessmentTools.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.educationalTechnology.length);

    pdf.text('8 ПЕРЕЧЕНЬ УЧЕБНОЙ ЛИТЕРАТУРЫ, НЕОБХОДИМОЙ ДЛЯ ОСВОЕНИЯ\n ДИСЦИПЛИНЫ (МОДУЛЯ)', margin, yPosition);
    yPosition += 10;
    pdf.text(program?.educationalTechnology, margin, yPosition, { maxWidth: 170 })
    yPosition += (program.educationalTechnology.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.references_t.length);

    pdf.text('9. ПЕРЕЧЕНЬ ИНФОРМАЦИОННЫХ РЕСУРСОВ', margin, yPosition);
    yPosition += 5;
    pdf.text(program?.references_t, margin, yPosition, { maxWidth: 170 })
    yPosition += (program.references_t.length / 63) * 5 + 5;

    yPosition = this.checkPage(yPosition, pdf, program.logistics.length + 230);

    pdf.text('10 ОПИСАНИЕ МАТЕРИАЛЬНО-ТЕХНИЧЕСКОЙ БАЗЫ И ПЕРЕЧЕНЬ ИНФОРМАЦИОННЫХ\n ТЕХНОЛОГИЙ, ИСПОЛЬЗУЕМЫХ ПРИ ОСУЩЕСТВЛЕНИИ ОБРАЗОВАТЕЛЬНОГО\n ПРОЦЕССА ПО ДИСЦИПЛИНЕ (МОДУЛЮ), ВКЛЮЧАЯ ПЕРЕЧЕНЬ ПРОГРАММНОГО\n ОБЕСПЕЧЕНИЯ И ИНФОРМАЦИОННЫХ СПРАВОЧНЫХ СИСТЕМ ', margin, yPosition);
    yPosition += 20;
    pdf.text(program?.logistics, margin, yPosition, { maxWidth: 170 })
    yPosition += (program.logistics.length / 63) * 5 + 5;
  }

  // добавить страницу или нет
  static checkPage(yPosition, pdf, len) {
    if (yPosition + (len / 20) > 280) {
      pdf.addPage();
      return 15;
    }
    return yPosition
  }

// таблица объема времени //
static addVolumeTableDetailed(pdf, data, margin, yPosition) {
  const { curriculumDisciplines, curriculum } = data;
  
  if (!Array.isArray(curriculumDisciplines) || curriculumDisciplines.length === 0) {
    pdf.text('Нет данных об учебных дисциплинах', margin, yPosition);
    return yPosition + 10;
  }

  const headers = [
    'Форма обучения',
    'Семестр',
    'Итого, часов',
    'Контактная работа обучающихся с преподавателем (по\nвидам учебных занятий), всего часов:',
    '- занятия лекционного типа (лекции и иные учебные\nзанятия, предусматривающие преимущественную\nпередачу учебной информации педагогическими\nработниками), часов',
    '- занятия семинарского/ практического типа (семинары,\nпрактические занятия, практикумы, коллоквиумы и иные\nаналогичные занятия), часов', 
    '- лабораторные занятия (включая работу обучающихся\nна реальных или виртуальных объектах\nпрофессиональной сферы), часов',
    'Самостоятельная работа обучающихся, часов',
    '- групповые и индивидуальные консультации\nобучающихся с преподавателями',
    '- проработка теоретического курса',
    '- курсовая работа (проект) ',
    '- расчетно-графическая работа',
    '- реферат',
    '- подготовка к занятиям семинарского/практического\nтипа',
    '- подготовка к выполнению и защите лабораторных\nработ',
    '- взаимодействие в электронной\nинформационно-образовательной среде вуза',
    'Промежуточная аттестация обучающихся, включая\nподготовку (Экзамен, Зачет, Зачет с оценкой, КП, КР)',
    'ЗЕТ',
    'Форма контроля'
  ];

  let startY = yPosition;
  
  // Заголовок таблицы
  pdf.text('ОБЪЕМ ДИСЦИПЛИНЫ ПО ФОРМАМ ОБУЧЕНИЯ', margin, startY);
  startY += 15;

  // Ширина столбцов
  const headerColWidth = 80;
  const dataColWidth = 30;
  const dataStartX = margin + headerColWidth;

  // Вертикальные заголовки
  let currentY = startY;
  pdf.setFontSize(8);
  headers.forEach(header => {
    pdf.text(header, margin, currentY);
    if (header.length <= 40) {
      currentY += 8;
    } else {
    currentY += (header.length / 50) * 5 + 2;
    }
  });

  // Данные для каждой дисциплины
  curriculumDisciplines.forEach((cd, disciplineIndex) => {
    const disciplineData = [
      cd.studyForm?.toString() || 'Очная',
      cd.semesterNumber?.toString() || '1',
      cd.totalHours?.toString() || '0',
      cd.totalContactHours?.toString() || '0',
      cd.lectureHours?.toString() || '0',
      cd.practiceHours?.toString() || '0', 
      cd.labHours?.toString() || '0',
      cd.totalSelfStudyHours?.toString() || '0',
      cd.consultationHours?.toString() || '0',
      cd.theoryStudyHours?.toString() || '0',
      cd.courseProjectHours?.toString() || '0',
      cd.rgrHours?.toString() || '0',
      cd.essayHours?.toString() || '0',
      cd.practicePreparationHours?.toString() || '0',
      cd.labPreparationHours?.toString() || '0',
      cd.eLearningHours?.toString() || '0',
      cd.intermediateAssessmentHours?.toString() || '0',
      cd.credits?.toString() || '0',
      cd.assessmentForm?.toString() || 'Не указана'
    ];

    const currentDisciplineX = dataStartX + (disciplineIndex * dataColWidth);

    // Данные дисциплины
    let dataY = startY;
    disciplineData.forEach((data, index) => {
      pdf.text(data.toString(), currentDisciplineX, dataY);
      if (headers[index].length <= 40) {
        dataY += 8;
      } else {
        dataY += (headers[index].length / 50) * 5 + 2;
      }
      //dataY += 8;
    });
  });

  pdf.setFontSize(12);
  return startY + (headers.length * 8) + 10;
}

  //  таблица компетенций //
  static addCompetenciesTable(pdf, data, margin, yPosition) {
  const {
      competencies,
      competenceIndicators,
      getCompetenceName,
      getIndicatorsForCompetence
    } = data;

    const headers = [
      'Код компетенции',
      'Описание компетенции', 
      'Код индикатора',
      'Описание индикатора'
    ];

    const colWidths = [25, 50, 25, 70];
    // заголовки
    pdf.setFontSize(8);
    let xPosition = margin;
    headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition, { maxWidth: colWidths[index] });
        xPosition += colWidths[index];
    });
    yPosition += 8;

    //нет компетенций
    if (!competencies || competencies.length === 0) {
        pdf.text('Компетенции не указаны', margin, yPosition);
        return yPosition + 8;
    }

    // проходим по всем компетенциям и индикаторам
    competencies.forEach(competence => {
        const indicators = getIndicatorsForCompetence(competence.id);
        
        // если нет индикаторов
        if (!indicators || indicators.length === 0) {
            let xPosition = margin;
            
            pdf.text(competence.code || '', xPosition, yPosition, { maxWidth: colWidths[0] });
            xPosition += colWidths[0];
            
            pdf.text(competence.description || '', xPosition, yPosition, { maxWidth: colWidths[1] });
            xPosition += colWidths[1];
            
            pdf.text('-', xPosition, yPosition, { maxWidth: colWidths[2] });
            xPosition += colWidths[2];
            pdf.text('Нет индикаторов', xPosition, yPosition, { maxWidth: colWidths[3] });
            
            yPosition += 8;
        } else {
            // для индикаторов
            indicators.forEach((indicator, index) => {
                let xPosition = margin;
                
                if (index === 0) {
                    pdf.text(competence.code || '', xPosition, yPosition, { maxWidth: colWidths[0] });
                    xPosition += colWidths[0];
                    
                    const descriptionLines = pdf.splitTextToSize(competence.description || '', colWidths[1]);
                    pdf.text(descriptionLines[0], xPosition, yPosition, { maxWidth: colWidths[1] });
                    xPosition += colWidths[1];
                } else {
                    //оставляем пустые ячейки для компетенции
                    xPosition += colWidths[0] + colWidths[1];
                }
                
                pdf.text(indicator.code || '', xPosition, yPosition, { maxWidth: colWidths[2] });
                xPosition += colWidths[2];
                
                pdf.text(indicator.description || '', xPosition, yPosition, { maxWidth: colWidths[3] });
                
                yPosition += 8;
                
                // проверяем пределы страницы
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = 30;
                    
                    // повторяем заголовки на новой странице
                    xPosition = margin;
                    headers.forEach((header, idx) => {
                        pdf.text(header, xPosition, yPosition, { maxWidth: colWidths[idx] });
                        xPosition += colWidths[idx];
                    });
                    yPosition += 8;
                }
            });
        }
        
        //отступ между компетенциями
        yPosition += 2;
    });

    return yPosition;
  }

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