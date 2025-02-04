// dynamic-crud.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dynamic-crud',
  templateUrl: './dynamic-crud.component.html',
  styleUrls: ['./dynamic-crud.component.css']
})
export class DynamicCrudComponent implements OnInit {
  config: any = {};
  dataSource = new MatTableDataSource<any>();
  filters: any = {};
  filteredItems: any[] = [];
  isModalOpen = false;
  selectedItem: any = {};

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig() {
    this.http.get('/assets/data.json').subscribe((data: any) => {
      this.config = data;
      this.loadItems();
    });
  }

  loadItems() {
    this.http.get('http://localhost:3000/items').subscribe((data: any) => {
      this.dataSource.data = data;
      this.filteredItems = data;
    });
  }

  applyFilters() {
    this.filteredItems = this.dataSource.data.filter((item: any) => {
      return Object.keys(this.filters).every(key => 
        item[key]?.toString().toLowerCase().includes(this.filters[key]?.toString().toLowerCase())
      );
    });
  }

  resetFilters() {
    this.filters = {};
    this.applyFilters();
  }

  addItem() {
    this.selectedItem = {};
    this.isModalOpen = true;
  }

  editItem(item: any) {
    this.selectedItem = { ...item };
    this.isModalOpen = true;
  }

  deleteItem(id: number) {
    this.http.delete(`http://localhost:3000/items/${id}`).subscribe(() => {
      this.snackBar.open('Item eliminado', 'Cerrar', { duration: 2000 });
      this.loadItems();
    });
  }

  saveItem() {
    if (this.selectedItem.id) {
      this.http.put(`http://localhost:3000/items/${this.selectedItem.id}`, this.selectedItem)
        .subscribe(() => {
          this.snackBar.open('Item actualizado', 'Cerrar', { duration: 2000 });
          this.loadItems();
          this.isModalOpen = false;
        });
    } else {
      this.http.post('http://localhost:3000/items', this.selectedItem)
        .subscribe(() => {
          this.snackBar.open('Item creado', 'Cerrar', { duration: 2000 });
          this.loadItems();
          this.isModalOpen = false;
        });
    }
  }

  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post('http://localhost:3000/upload', formData).subscribe((response: any) => {
        this.selectedItem[key] = response.filePath;
      });
    }
  }

  cancelEdit() {
    this.isModalOpen = false;
  }
}
