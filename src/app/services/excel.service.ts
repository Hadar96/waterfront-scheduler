import { Injectable } from '@angular/core';
// @ts-ignore
import ExcelJS from 'exceljs/dist/exceljs.bare';
import { saveAs } from 'file-saver';
import { appStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  async exportColoredScheduleWithExcelJS(): Promise<void> {
    const staffList = appStore.getSnapshot().lifeguards;
    const periods = appStore.getSnapshot().currentDayType.periods;
    const activities = appStore.getSnapshot().activities;

    const getColorForActivity = (name: string): string => {
      return activities.find((a) => a.name === name)?.color ?? '#FFFFFF';
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    // Row 1: Date and Legend
    const today = new Date();
    const dateStr = today.toDateString();
    worksheet.getCell('A1').value = `${dateStr}`;
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    let legendStartCol = 5; // Column E
    for (const [i, activity] of activities.entries()) {
      const startCol = legendStartCol + i * 2;
      const endCol = startCol + 1;

      const cell = worksheet.getCell(1, startCol); // Row 1, Column startCol
      worksheet.mergeCells(1, startCol, 1, endCol); // Merge across two columns

      cell.value = activity.name;
      const hexColor = activity.color.replace('#', '').toUpperCase();
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${hexColor}` },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    // Row 3: Header row for table
    const headerRow = ['', ...staffList.map((s) => s.name)];
    worksheet.addRow([], undefined); // Row 2 empty
    worksheet.addRow(headerRow);

    const header = worksheet.getRow(3);
    header.eachCell((cell: any) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDDDDDD' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Starting from row 4
    for (const [i, period] of periods.entries()) {
      const rowData = [
        `${period.name}\n(${period.start}-${period.end})`,
        ...staffList.map((lg) => {
          const s = lg.schedule[period.name];
          if (!s) return '';
          return s.activity + (s.pm ? '#PM' : '');
        }),
      ];
      const row = worksheet.addRow(rowData);
      row.height = 30;

      row.eachCell((cell: any, colNumber: any) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };

        if (colNumber === 1) return;

        const isPM = cell.value?.toString().includes('#PM') ?? false;
        const activity =
          (cell.value?.toString() as string).replace('#PM', '') ?? '';
        if (!activity.trim()) return;

        const hexColor = getColorForActivity(activity)
          .replace('#', '')
          .toUpperCase();
        const argb = `FF${hexColor}`;

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb },
        };
        cell.value = isPM ? activity[0] + 'M' : '';
      });
    }

    worksheet.columns.forEach((col: any) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell: any) => {
        const val = cell.value?.toString() ?? '';
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const ddmm = `${today.getDate().toString().padStart(2, '0')}${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
    const fileName = `wf-schedule_${ddmm}.xlsx`;

    saveAs(new Blob([buffer]), fileName);
  }

  private getColorForActivity(actName: string): string {
    return '';
  }

  private saveAsExcelFile(buffer: any): void {}
}
