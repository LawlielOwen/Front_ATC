import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UploadModalComponent  implements OnInit {
  @Input() label = 'Subir Archivo';
 uploadMode: boolean = true;
  archivoActual: File | undefined = undefined;
  isDragging = false;
  @Output() fileSelected = new EventEmitter<File | undefined>();
  constructor() { }

  ngOnInit() {}
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    const file = files?.[0];
    file && (this.archivoActual = file);
    file && this.fileSelected.emit(file);
  }
  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    file && (this.archivoActual = file);
    file && this.fileSelected.emit(file);
  }
   eliminarArchivo() {
    this.archivoActual = undefined;
    this.fileSelected.emit(undefined);
  }
}
