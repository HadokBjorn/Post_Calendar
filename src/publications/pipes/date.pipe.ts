import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    if (!value) return undefined;

    const stringToDate = new Date(value);
    if (isNaN(stringToDate.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }

    return stringToDate;
  }
}
