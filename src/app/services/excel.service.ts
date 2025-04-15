import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
// import * as ExcelJS from 'exceljs';
// @ts-ignore
import ExcelJS from 'exceljs/dist/exceljs.bare';
import { saveAs } from 'file-saver';
import { appStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  async exportColoredScheduleWithExcelJS() {
    const staffList = appStore.getSnapshot().lifeguards;
    const periods = appStore.getSnapshot().currentDayType.periods;
    const activities = appStore.getSnapshot().activities;

    const getColorForActivity = (name: string) => {
      return activities.find((a) => a.name === name)?.color ?? '#FFFFFF';
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    // Header row
    const headerRow = ['', ...staffList.map((s) => s.name)];
    worksheet.addRow(headerRow);

    // Data rows
    for (const period of periods) {
      const rowData = [
        `${period.name}\n(${period.start}-${period.end})`,
        ...staffList.map((s) => s.schedule[period.name]?.activity ?? ''),
      ];
      const row = worksheet.addRow(rowData);

      // Apply background color
      row.eachCell((cell: any, colNumber: any) => {
        if (colNumber === 1) return; // skip period name

        const activity = cell.value as string;
        const hexColor = getColorForActivity(activity)
          .replace('#', '')
          .toUpperCase();
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: hexColor },
        };
      });
    }

    // Style header
    worksheet.getRow(1).eachCell((cell: any) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    // Export to file
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
