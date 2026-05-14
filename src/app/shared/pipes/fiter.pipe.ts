import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
 name: 'filter',
 standalone: true
})

export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string, fields?: string[]): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(item =>
    (fields && fields.length > 0
     ? fields.some(field =>
        String(item[field] || '').toLowerCase().includes(searchText)
        )
   : Object.values(item).some(val =>
       String(val).toLowerCase().includes(searchText)

          )

      )

    );

  }

}