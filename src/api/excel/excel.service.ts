import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExcelService {
  convertExcelToJson(filePath: string): any {
    const fullPath = path.resolve(filePath);
    const fileBuffer = fs.readFileSync(fullPath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const result = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });

    return result;
  }

  convertAllExcelFilesInDirectory(directoryPath: string): any {
    return this.convertExcelToJson(path.resolve(directoryPath));
  }
}
