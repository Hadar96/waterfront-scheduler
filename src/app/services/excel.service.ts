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

  async exportColoredScheduleWithExcelJSOLD(): Promise<void> {
    const staffList = appStore.getSnapshot().lifeguards;
    const periods = appStore.getSnapshot().currentDayType.periods;
    const activities = appStore.getSnapshot().activities;

    const getColorForActivity = (name: string): string => {
      return activities.find((a) => a.name === name)?.color ?? '#FFFFFF';
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    // Header row
    const headerRow = ['', ...staffList.map((s) => s.name)];
    worksheet.addRow(headerRow);

    // Style header
    const header = worksheet.getRow(1);
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

    // Data rows
    for (const period of periods) {
      const rowData = [
        `${period.name}\n(${period.start}-${period.end})`,
        ...staffList.map((lg) => {
          const s = lg.schedule[period.name];
          if (!s) return '';
          return s.activity + (s.pm ? '#PM' : '');
          // return s?.pm ? `${s.activity[0]}M` : '.';
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

        if (colNumber === 1) return; // don't color period names

        const isPM = cell.value?.toString().includes('#PM') ?? false;
        const activity =
          (cell.value?.toString() as string).replace('#PM', '') ?? '';
        if (!activity.trim()) return;

        const hexColor = getColorForActivity(activity)
          .replace('#', '')
          .toUpperCase();
        const argb = `FF${hexColor}`; // Ensure alpha channel

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb },
        };
        cell.value = isPM ? activity[0] + 'M' : '';
      });
    }

    // Auto width for all columns
    worksheet.columns.forEach((col: any) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell: any) => {
        const val = cell.value?.toString() ?? '';
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = maxLength + 2;
    });

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date();
    const ddmm = `${date.getDate().toString().padStart(2, '0')}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
    const fileName = `wf-schedule_${ddmm}.xlsx`;

    saveAs(new Blob([buffer]), fileName);
  }

  /*
  exportTableToExcel(tableId: string): void {
    const table = document.getElementById(tableId);
    if (!table) return;

    const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

    const workbook: XLSX.WorkBook = {
      Sheets: { Sheet1: worksheet },
      SheetNames: ['Sheet1'],
    };

    const today = new Date();
    const ddmm = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
    const fileName = 'wf-schedule_' + ddmm;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  exportToColoredSchedule() {
    const sheetData: any[][] = this.prepareData();

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Apply background colors based on activity
    for (let r = 1; r < sheetData.length; r++) {
      for (let c = 1; c < sheetData[r].length; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const activity = sheetData[r][c];
        const color = this.getColorForActivity(activity);

        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: color },
          },
        };
      }
    }

    // Add style to header
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
        };
      }
    }

    const wb: XLSX.WorkBook = {
      Sheets: { Sheet1: ws },
      SheetNames: ['Sheet1'],
    };

    // Write with styles
    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    this.saveAsExcelFile(excelBuffer);
  }

  private prepareData(): any[][] {
    const staffList = appStore.getSnapshot().lifeguards;
    const periods = appStore.getSnapshot().currentDayType.periods;
    const sheetData: any[][] = [];

    // First row: header
    const headerRow = ['', ...staffList.map((s) => s.name)];
    sheetData.push(headerRow);

    // Next rows: period rows
    for (let i = 0; i < periods.length; i++) {
      const periodName = periods[i].name;
      const row = [
        periodName + '\n(' + periods[i].start + '-' + periods[i].end + ')',
      ];

      for (let j = 0; j < staffList.length; j++) {
        row.push(staffList[j].schedule[periodName]?.activity ?? '');
      }

      sheetData.push(row);
    }

    return sheetData;
  }

  private getColorForActivity(actName: string): string {
    for (const activity of appStore.getSnapshot().activities) {
      if (activity.name === actName)
        return activity.color.replace('#', '').toUpperCase();
    }

    return 'FFFFFF00';
  }

  private saveAsExcelFile(buffer: any): void {
    const today = new Date();
    const ddmm = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
    const fileName = 'wf-schedule_' + ddmm;

    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
    */
}
