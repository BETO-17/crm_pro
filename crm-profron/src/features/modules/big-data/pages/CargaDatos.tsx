import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
} from 'lucide-react';

type FileStatus = 'ready' | 'validating' | 'error';

interface QueueFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: FileStatus;
  icon: 'csv' | 'xlsx';
  fileObj?: File;
}

export interface PersistentDataset {
  id: string;
  name: string;
  tableName: string;
  rows: number;
  columnsCount?: number;
  sector: string;
  uploadedAt: string;
}

const defaultDatasets: PersistentDataset[] = [
  {
    id: 'ds-1',
    name: 'ventas_tecnologia_limpio.csv',
    tableName: 'dataset_ventas_tecnologia_limpio',
    rows: 1813,
    columnsCount: 8,
    sector: 'Tecnología',
    uploadedAt: 'Reciente',
  },
  {
    id: 'ds-2',
    name: 'ventas_tienda_tech_4000.csv',
    tableName: 'dataset_ventas_tienda_tech_4000',
    rows: 4000,
    columnsCount: 10,
    sector: 'Retail',
    uploadedAt: 'Reciente',
  },
  {
    id: 'ds-3',
    name: 'fetch_california_housing.csv',
    tableName: 'dataset_fetch_california_housing',
    rows: 20640,
    columnsCount: 9,
    sector: 'General',
    uploadedAt: 'Reciente',
  },
];

const sectors = ['Retail', 'Tecnología', 'Logística', 'Finanzas', 'Salud', 'E-Commerce'];

export default function CargaDatos() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<QueueFile[]>([]);
  const [sector, setSector] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistent uploaded datasets
  const [savedDatasets, setSavedDatasets] = useState<PersistentDataset[]>(() => {
    try {
      const stored = localStorage.getItem('analyst_saved_datasets');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return defaultDatasets;
  });

  useEffect(() => {
    try {
      localStorage.setItem('analyst_saved_datasets', JSON.stringify(savedDatasets));
    } catch {
      // ignore
    }
  }, [savedDatasets]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addFile = (name: string, sizeMB: number, fileObj?: File) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const isCSV = ext === 'csv';
    const newFile: QueueFile = {
      id: Date.now().toString(),
      name,
      size: `${sizeMB.toFixed(1)} MB`,
      type: isCSV ? 'CSV Document' : 'Excel Spreadsheet',
      status: 'ready',
      icon: isCSV ? 'csv' : 'xlsx',
      fileObj,
    };
    setFiles((prev) => [...prev, newFile]);
    showToast(`"${name}" añadido a la cola`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      addFile(file.name, file.size / (1024 * 1024), file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((file) => {
      addFile(file.name, file.size / (1024 * 1024), file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast(`"${file?.name}" removido`, 'info');
  };

  const handleSave = async () => {
    const readyFiles = files.filter((f) => f.status === 'ready' && f.fileObj);
    if (readyFiles.length === 0) {
      showToast('No hay archivos reales listos para guardar', 'error');
      return;
    }
    const finalSector = sector || 'General';
    setSaving(true);
    
    try {
      const newlySaved: PersistentDataset[] = [];

      for (const file of readyFiles) {
        const formData = new FormData();
        formData.append('file', file.fileObj as Blob);
        formData.append('sector', finalSector);
        
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/v1/datasets/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Error en carga');
        }
        
        const data = await response.json();
        // Guardamos la última tabla subida para preseleccionarla en la vista de observación
        localStorage.setItem('lastUploadedTable', data.table_name);

        newlySaved.push({
          id: `ds-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          tableName: data.table_name,
          rows: data.rows || 0,
          columnsCount: data.columns ? data.columns.length : 0,
          sector: finalSector,
          uploadedAt: 'Hace un momento',
        });
      }
      
      // Actualizamos los datasets guardados de forma persistente
      setSavedDatasets((prev) => {
        const filtered = prev.filter((p) => !newlySaved.some((n) => n.tableName === p.tableName));
        return [...newlySaved, ...filtered];
      });

      setFiles((prev) => prev.filter((f) => !readyFiles.includes(f)));
      showToast(`${readyFiles.length} archivo(s) procesados y guardados en base de datos ✓`);
    } catch (error) {
      showToast('Ocurrió un error al subir los archivos', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGoToObservation = (tableName: string) => {
    localStorage.setItem('lastUploadedTable', tableName);
    navigate('/modules/big-data/observacion');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedDatasets((prev) => prev.filter((d) => d.id !== id));
    showToast('Dataset removido de la vista', 'info');
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
          <span className="stat-chip-label">Listos para subir</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-number" style={{ color: '#3b82f6' }}>{savedDatasets.length}</span>
          <span className="stat-chip-label">En Base de Datos</span>
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
            disabled={saving || readyCount === 0}
          >
            <Database size={14} />
            {saving ? 'Guardando en Base de Datos...' : 'Guardar en Base de Datos'}
          </button>
        </div>
      </div>

      {/* Persistent Uploaded Datasets Cards */}
      <div className="persisted-datasets-section">
        <div className="persisted-datasets-header">
          <div>
            <h2 className="persisted-datasets-title">Datasets Subidos y Persistentes</h2>
            <p className="persisted-datasets-sub">Archivos CSV procesados y persistidos en la base de datos Supabase.</p>
          </div>
          <span className="obs-info-badge">{savedDatasets.length} Registrados</span>
        </div>

        <div className="persisted-datasets-grid">
          {savedDatasets.map((ds) => (
            <div key={ds.id} className="persisted-dataset-card">
              <div className="persisted-dataset-card-top">
                <div className="persisted-dataset-icon">
                  <FileText size={18} />
                </div>
                <span className="persisted-dataset-badge">
                  <CheckCircle size={12} style={{ marginRight: 4 }} /> En Base de Datos
                </span>
              </div>
              <h3 className="persisted-dataset-name" title={ds.name}>{ds.name}</h3>
              <div className="persisted-dataset-table-tag">
                <code>{ds.tableName}</code>
              </div>
              <div className="persisted-dataset-meta">
                <span className="persisted-dataset-meta-item">
                  <strong>{ds.rows.toLocaleString()}</strong> filas
                </span>
                {ds.columnsCount ? (
                  <span className="persisted-dataset-meta-item">
                    <strong>{ds.columnsCount}</strong> columnas
                  </span>
                ) : null}
                <span className="persisted-dataset-meta-tag">{ds.sector}</span>
              </div>
              <div className="persisted-dataset-footer">
                <button
                  className="btn-persisted-explore"
                  onClick={() => handleGoToObservation(ds.tableName)}
                  title="Abrir en Observación de Datos"
                >
                  Observar Datos <ArrowRight size={13} />
                </button>
                <button
                  className="btn-persisted-delete"
                  onClick={() => handleDeleteSaved(ds.id)}
                  title="Quitar de la lista"
                  aria-label="Quitar de la lista"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
