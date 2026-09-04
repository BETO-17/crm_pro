import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Trash2,
  Database,
  CheckCircle,
  X,
  Home,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

type FileStatus = 'ready' | 'validating' | 'error';

interface QueueFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: FileStatus;
  icon: 'csv' | 'xlsx';
}

const initialFiles: QueueFile[] = [
  { id: '1', name: 'ventas_q3_retail.csv', size: '12.4 MB', type: 'CSV Document', status: 'ready', icon: 'csv' },
  { id: '2', name: 'inventario_historico.xlsx', size: '45.1 MB', type: 'Excel Spreadsheet', status: 'validating', icon: 'xlsx' },
  { id: '3', name: 'clientes_db_corrupt.csv', size: '2.1 MB', type: 'CSV Document', status: 'error', icon: 'csv' },
];

const sectors = ['Retail', 'Tecnología', 'Logística', 'Finanzas', 'Salud', 'E-Commerce'];

export default function CargaDatos() {
  const [files, setFiles] = useState<QueueFile[]>(initialFiles);
  const [sector, setSector] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addFile = (name: string, sizeMB: number) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const isCSV = ext === 'csv';
    const newFile: QueueFile = {
      id: Date.now().toString(),
      name,
      size: `${sizeMB.toFixed(1)} MB`,
      type: isCSV ? 'CSV Document' : 'Excel Spreadsheet',
      status: 'validating',
      icon: isCSV ? 'csv' : 'xlsx',
    };
    setFiles((prev) => [...prev, newFile]);
    showToast(`"${name}" añadido a la cola`);

    // Simulate validation
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id
            ? { ...f, status: Math.random() > 0.3 ? 'ready' : 'error' }
            : f
        )
      );
    }, 2000 + Math.random() * 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      addFile(file.name, file.size / (1024 * 1024));
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((file) => {
      addFile(file.name, file.size / (1024 * 1024));
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSimulatedUpload = () => {
    const names = [
      'metricas_ventas_2024.csv',
      'stock_regional_norte.xlsx',
      'precios_competencia.csv',
      'forecast_q4.xlsx',
    ];
    const name = names[files.length % names.length];
    addFile(name, 5 + Math.random() * 40);
  };

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast(`"${file?.name}" removido`, 'info');
  };

  const handleSave = () => {
    const readyFiles = files.filter((f) => f.status === 'ready');
    if (readyFiles.length === 0) {
      showToast('No hay archivos listos para guardar', 'error');
      return;
    }
    if (!sector) {
      showToast('Selecciona un sector de destino', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFiles((prev) => prev.filter((f) => f.status !== 'ready'));
      showToast(`${readyFiles.length} archivo(s) guardados en base de datos ✓`);
    }, 1500);
  };

  const readyCount = files.filter((f) => f.status === 'ready').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <CheckCircle size={16} aria-hidden="true" />
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Home size={14} /> <a href="#"><span>Espacio de Trabajo</span></a>
        <ChevronRight size={12} />
        <span className="breadcrumb-current">Carga de Datos</span>
      </div>

      <h1 className="page-title">Centro de Carga de Datos - Analista</h1>
      <p className="page-subtitle" style={{ maxWidth: 600, lineHeight: 1.5 }}>
        Importe conjuntos de datos validados para su posterior análisis. Seleccione el sector correspondiente
        y arrastre los archivos en formato CSV o XLSX.
      </p>

      {/* Stats */}
      <div className="stats-row" style={{ marginTop: 16 }}>
        <div className="stat-chip">
          <span className="stat-chip-number">{files.length}</span>
          <span className="stat-chip-label">En cola</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number" style={{ color: '#22c55e' }}>{readyCount}</span>
          <span className="stat-chip-label">Listos</span>
        </div>
        {errorCount > 0 && (
          <div className="stat-chip">
            <span className="stat-chip-number" style={{ color: '#ef4444' }}>{errorCount}</span>
            <span className="stat-chip-label">Con errores</span>
          </div>
        )}
      </div>

      <div className="upload-card">
        {/* Sector Selector */}
        <div className="sector-selector">
          <label>Sector de Destino</label>
          <select className="form-select" value={sector} onChange={(e) => setSector(e.target.value)} style={{ maxWidth: 400 }}>
            <option value="">Seleccione un sector...</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Dropzone */}
        <div
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivos"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="dropzone-icon">
            <Upload size={24} />
          </div>
          <div className="dropzone-text">
            {dragOver ? '¡Suelta los archivos aquí!' : 'Arrastre los archivos aquí'}
          </div>
          <div className="dropzone-sub">o haga clic para seleccionar desde su equipo</div>
          <div className="dropzone-badges">
            <span className="dropzone-badge">.CSV</span>
            <span className="dropzone-badge">.XLSX</span>
          </div>
          <div className="dropzone-limit">Tamaño máximo: 500MB por archivo</div>
        </div>

        {/* Simulate button */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button className="btn-filter" onClick={handleSimulatedUpload} style={{ display: 'inline-flex' }}>
            <Upload size={14} /> Simular carga de archivo
          </button>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="file-queue">
            <h3 className="file-queue-title">Archivos en cola</h3>
            <table className="file-queue-table">
              <thead>
                <tr>
                  <th>Nombre de Archivo</th>
                  <th>Tamaño</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div className="file-name-cell">
                        {file.icon === 'csv' ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                        {file.name}
                      </div>
                    </td>
                    <td>{file.size}</td>
                    <td>{file.type}</td>
                    <td>
                      <span className={`file-status file-status-${file.status}`}>
                        {file.status === 'ready' && '● Listo'}
                        {file.status === 'validating' && '● Validando...'}
                        {file.status === 'error' && (
                          <><AlertCircle size={12} /> Error de Formato</>
                        )}
                      </span>
                    </td>
                    <td>
                      <button
                        className="file-delete-btn"
                        onClick={() => removeFile(file.id)}
                        aria-label={`Eliminar ${file.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions">
          <button className="btn-cancel" onClick={() => { setFiles([]); showToast('Cola limpiada', 'info'); }}>
            Cancelar
          </button>
          <button
            className={`btn-save-db ${saving ? 'btn-saving' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            <Database size={14} />
            {saving ? 'Guardando...' : 'Guardar en Base de Datos'}
          </button>
        </div>
      </div>
    </>
  );
}
