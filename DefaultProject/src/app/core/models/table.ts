export interface TableColumn {
  def: string;     // Nama kolom (identitas)
  header: string;  // Label yang muncul di header
  field?: string;  // Nama property di data (opsional jika pakai template)
}