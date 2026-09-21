import { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Bell,
  Plus,
  ArrowRight,
  Clock,
  PlayCircle,
  Users as UsersIcon,
  Star,
  Building2,
  Calculator,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  X,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import './CursosAdmin.css';

export interface Course {
  id: string;
  title: string;
  category: string;
  sectionTag: string;
  level: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  description: string;
  tags: string[];
  hours: number;
  lessons: number;
  students: number;
  rating: number;
  gradient: string;
  tagColor?: string;
  iconType: 'building' | 'calculator' | 'boxes' | 'cart' | 'users' | 'chart';
  instructor?: {
    name: string;
    role: string;
    avatar: string;
  };
  syllabus?: {
    title: string;
    duration: string;
    lessonsCount: number;
  }[];
}

const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Fundamentos de ERP',
    category: 'Gestión Empresarial',
    sectionTag: 'GESTIÓN EMPRESARIAL INTEGRAL',
    level: 'PRINCIPIANTE',
    description:
      'Aprende los conceptos fundamentales de un sistema ERP, desde la integración de módulos hasta la optimización de flujos de trabajo operativos.',
    tags: ['ERP', 'Gestión', 'Procesos'],
    hours: 8,
    lessons: 24,
    students: 1280,
    rating: 4.8,
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    tagColor: '#0284c7',
    iconType: 'building',
    instructor: {
      name: 'Ing. Carlos Mendoza',
      role: 'Especialista en Sistemas ERP & Supply Chain',
      avatar: 'CM',
    },
    syllabus: [
      { title: 'Introducción a la arquitectura de un ERP moderno', duration: '2h 15m', lessonsCount: 6 },
      { title: 'Integración entre departamentos y flujos de datos', duration: '3h 00m', lessonsCount: 10 },
      { title: 'Parámetros de configuración y casos prácticos', duration: '2h 45m', lessonsCount: 8 },
    ],
  },
  {
    id: 'course-2',
    title: 'Contabilidad Avanzada',
    category: 'Finanzas',
    sectionTag: 'FINANZAS Y REPORTES',
    level: 'AVANZADO',
    description:
      'Domina los principios contables avanzados, conciliación de cuentas, y generación de estados financieros e informes tributarios.',
    tags: ['Contabilidad', 'Finanzas', 'Reportes'],
    hours: 12,
    lessons: 36,
    students: 840,
    rating: 4.9,
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    tagColor: '#059669',
    iconType: 'calculator',
    instructor: {
      name: 'Mg. Laura Paredes',
      role: 'Auditora Financiera & Contadora Senior',
      avatar: 'LP',
    },
    syllabus: [
      { title: 'Estructura del Plan Contable General Empresarial', duration: '3h 30m', lessonsCount: 10 },
      { title: 'Conciliaciones bancarias y asientos de ajuste', duration: '4h 15m', lessonsCount: 14 },
      { title: 'Estados de Resultados, Flujo de Efectivo y Balance General', duration: '4h 15m', lessonsCount: 12 },
    ],
  },
  {
    id: 'course-3',
    title: 'Gestión de Inventario',
    category: 'Logística',
    sectionTag: 'LOGÍSTICA Y ALMACENES',
    level: 'INTERMEDIO',
    description:
      'Controla entradas, salidas, valoración de existencias y optimiza el flujo de inventario con las mejores metodologías de almacenamiento.',
    tags: ['Inventario', 'Logística', 'Almacén'],
    hours: 6,
    lessons: 18,
    students: 1560,
    rating: 4.7,
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    tagColor: '#d97706',
    iconType: 'boxes',
    instructor: {
      name: 'Lic. Roberto Gómez',
      role: 'Director de Operaciones Logísticas',
      avatar: 'RG',
    },
    syllabus: [
      { title: 'Métodos de Valoración (PEPS, UEPS, Promedio Ponderado)', duration: '2h 00m', lessonsCount: 6 },
      { title: 'Trazabilidad de lotes, series y fechas de vencimiento', duration: '2h 00m', lessonsCount: 6 },
      { title: 'Puntos de reorden y stocks de seguridad automatizados', duration: '2h 00m', lessonsCount: 6 },
    ],
  },
  {
    id: 'course-4',
    title: 'Ventas y ERP',
    category: 'Ventas',
    sectionTag: 'RELACIONES CON CLIENTES',
    level: 'INTERMEDIO',
    description:
      'Gestiona el embudo de ventas, automatiza seguimientos, y construye relaciones duraderas con leads y clientes corporativos.',
    tags: ['Ventas', 'ERP', 'Clientes'],
    hours: 10,
    lessons: 30,
    students: 2100,
    rating: 4.8,
    gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
    tagColor: '#e11d48',
    iconType: 'cart',
    instructor: {
      name: 'Patricia Silva',
      role: 'Líder de Estrategia Comercial & ERP',
      avatar: 'PS',
    },
    syllabus: [
      { title: 'Configuración del Pipeline de Ventas y Etapas', duration: '3h 00m', lessonsCount: 9 },
      { title: 'Automatización de tareas, correos y cotizaciones', duration: '4h 00m', lessonsCount: 12 },
      { title: 'Métricas de conversión y analítica de ventas', duration: '3h 00m', lessonsCount: 9 },
    ],
  },
  {
    id: 'course-5',
    title: 'Recursos Humanos',
    category: 'Recursos Humanos',
    sectionTag: 'GESTIÓN DE TALENTO',
    level: 'PRINCIPIANTE',
    description:
      'Administra nóminas, controla asistencia, evalúa desempeño y gestiona el ciclo completo del talento humano en la organización.',
    tags: ['RRHH', 'Nómina', 'Talento'],
    hours: 7,
    lessons: 22,
    students: 980,
    rating: 4.6,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    tagColor: '#7c3aed',
    iconType: 'users',
    instructor: {
      name: 'Dra. Andrea Morales',
      role: 'Consultora de Gestión Humana y Cultura',
      avatar: 'AM',
    },
    syllabus: [
      { title: 'Estructura de puestos y legajo digital de colaboradores', duration: '2h 15m', lessonsCount: 7 },
      { title: 'Control de asistencia, vacaciones y permisos', duration: '2h 30m', lessonsCount: 8 },
      { title: 'Cálculo de planillas, aportes y deducciones', duration: '2h 15m', lessonsCount: 7 },
    ],
  },
  {
    id: 'course-6',
    title: 'Inteligencia de Datos',
    category: 'Analítica',
    sectionTag: 'ANALYTICS Y REPORTES',
    level: 'AVANZADO',
    description:
      'Transforma datos en decisiones con dashboards interactivos, KPIs personalizados y reportes predictivos de alto impacto.',
    tags: ['BI', 'Analytics', 'Dashboards'],
    hours: 14,
    lessons: 42,
    students: 720,
    rating: 5.0,
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    tagColor: '#0284c7',
    iconType: 'chart',
    instructor: {
      name: 'Ing. Fernando Castillo',
      role: 'Lead Data Scientist & BI Architect',
      avatar: 'FC',
    },
    syllabus: [
      { title: 'Modelado multidimensional de datos y ETL', duration: '4h 30m', lessonsCount: 14 },
      { title: 'Diseño de tableros ejecutivos interactivos', duration: '5h 00m', lessonsCount: 16 },
      { title: 'Análisis de cohortes, previsión de demanda y forecasting', duration: '4h 30m', lessonsCount: 12 },
    ],
  },
];

export default function CursosAdmin() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Course Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Gestión Empresarial');
  const [newSectionTag, setNewSectionTag] = useState('');
  const [newLevel, setNewLevel] = useState<'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'>('PRINCIPIANTE');
  const [newDesc, setNewDesc] = useState('');
  const [newHours, setNewHours] = useState('8');
  const [newLessons, setNewLessons] = useState('20');
  const [newTags, setNewTags] = useState('ERP, Formación');

  // Categories list
  const categories = useMemo(() => {
    return ['Todos', 'Gestión Empresarial', 'Finanzas', 'Logística', 'Ventas', 'Recursos Humanos', 'Analítica'];
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'Todos' || c.category === selectedCategory;
      const matchLevel = selectedLevel === 'ALL' || c.level === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  // Overall Stats
  const totalStudents = useMemo(() => courses.reduce((acc, c) => acc + c.students, 0), [courses]);
  const totalHours = useMemo(() => courses.reduce((acc, c) => acc + c.hours, 0), [courses]);

  // Render course icon
  const renderIcon = (type: Course['iconType']) => {
    switch (type) {
      case 'building':
        return <Building2 size={20} />;
      case 'calculator':
        return <Calculator size={20} />;
      case 'boxes':
        return <Boxes size={20} />;
      case 'cart':
        return <ShoppingCart size={20} />;
      case 'users':
        return <Users size={20} />;
      case 'chart':
        return <BarChart3 size={20} />;
      default:
        return <GraduationCap size={20} />;
    }
  };

  // Handle create new course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const gradientsByCat: Record<string, { gradient: string; tagColor: string; iconType: Course['iconType'] }> = {
      'Gestión Empresarial': { gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', tagColor: '#0284c7', iconType: 'building' },
      Finanzas: { gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', tagColor: '#059669', iconType: 'calculator' },
      Logística: { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', tagColor: '#d97706', iconType: 'boxes' },
      Ventas: { gradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', tagColor: '#e11d48', iconType: 'cart' },
      'Recursos Humanos': { gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', tagColor: '#7c3aed', iconType: 'users' },
      Analítica: { gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', tagColor: '#0284c7', iconType: 'chart' },
    };

    const config = gradientsByCat[newCategory] || gradientsByCat['Gestión Empresarial'];

    const newCourseObj: Course = {
      id: `course-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      sectionTag: newSectionTag.trim() || `${newCategory.toUpperCase()} ESPECIALIZADO`,
      level: newLevel,
      description: newDesc.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      hours: parseInt(newHours) || 8,
      lessons: parseInt(newLessons) || 20,
      students: 0,
      rating: 5.0,
      gradient: config.gradient,
      tagColor: config.tagColor,
      iconType: config.iconType,
      instructor: {
        name: 'Equipo ERPMetrics 360',
        role: 'Facilitador Académico',
        avatar: 'EM',
      },
      syllabus: [
        { title: 'Módulo 1: Fundamentos y conceptos clave', duration: '2h 00m', lessonsCount: 6 },
        { title: 'Módulo 2: Casos prácticos y aplicación en el ERP', duration: '3h 00m', lessonsCount: 8 },
      ],
    };

    setCourses([newCourseObj, ...courses]);
    setShowCreateModal(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewSectionTag('');
    setNewTags('ERP, Formación');
  };

  return (
    <div className="cursos-container">
      {/* ---- Page Header ---- */}
      <div className="cursos-header-wrapper">
        <div className="cursos-title-group">
          <h1 className="cursos-page-title">Cursos</h1>
          <p className="cursos-page-subtitle">Gestión de capacitación y formación</p>
        </div>

        <div className="cursos-header-actions">
          <div className="cursos-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              className="cursos-search-input"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar cursos"
            />
          </div>

          <button className="cursos-header-icon-btn" aria-label="Notificaciones" title="Notificaciones">
            <Bell size={17} />
            <span className="cursos-notification-badge" />
          </button>

          <div className="cursos-user-badge">
            <div className="cursos-user-avatar">
              <UsersIcon size={16} />
            </div>
            <div className="cursos-user-info">
              <span className="cursos-user-name">Admin User</span>
              <span className="cursos-user-role">Administrador</span>
            </div>
          </div>

          <button className="cursos-btn-create" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* ---- Hero Banner Card ---- */}
      <div className="cursos-hero-banner">
        <div className="cursos-hero-left">
          <div className="cursos-hero-icon-box">
            <GraduationCap size={28} />
          </div>
          <div className="cursos-hero-text">
            <h2 className="cursos-hero-title">Módulo de Cursos</h2>
            <p className="cursos-hero-desc">
              Explora nuestra colección de cursos formativos. Selecciona un curso para ver su detalle,
              programa de contenidos o asignarlo a los colaboradores.
            </p>
          </div>
        </div>

        <div className="cursos-hero-stats">
          <div className="cursos-stat-pill">
            <span className="cursos-stat-val">{courses.length}</span>
            <span className="cursos-stat-lbl">Cursos</span>
          </div>
          <div className="cursos-stat-pill">
            <span className="cursos-stat-val">{totalStudents.toLocaleString()}</span>
            <span className="cursos-stat-lbl">Alumnos</span>
          </div>
          <div className="cursos-stat-pill">
            <span className="cursos-stat-val">{totalHours}h</span>
            <span className="cursos-stat-lbl">Contenido</span>
          </div>
        </div>
      </div>

      {/* ---- Filters Bar ---- */}
      <div className="cursos-filters-bar">
        <div className="cursos-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cursos-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="cursos-level-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            aria-label="Filtrar por nivel"
          >
            <option value="ALL">Todos los niveles</option>
            <option value="PRINCIPIANTE">Principiante</option>
            <option value="INTERMEDIO">Intermedio</option>
            <option value="AVANZADO">Avanzado</option>
          </select>
        </div>
      </div>

      {/* ---- Courses Grid ---- */}
      <div className="cursos-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => setSelectedCourse(course)}
              style={{ cursor: 'pointer' }}
            >
              {/* Header Colored Section */}
              <div className="course-card-header" style={{ background: course.gradient }}>
                <div className="course-header-top">
                  <div className="course-icon-badge">{renderIcon(course.iconType)}</div>
                  <span className="course-level-pill">{course.level}</span>
                </div>

                <div className="course-header-meta">
                  <div className="course-category-label">{course.category}</div>
                  <h3 className="course-main-title">{course.title}</h3>
                </div>

                {/* Scalloped Wavy Border Divider */}
                <div className="course-scallop-divider">
                  <svg
                    viewBox="0 0 1200 24"
                    preserveAspectRatio="none"
                    className="course-scallop-svg"
                  >
                    <path
                      d="M0,0 C20,16 40,16 60,0 C80,16 100,16 120,0 C140,16 160,16 180,0 C200,16 220,16 240,0 C260,16 280,16 300,0 C320,16 340,16 360,0 C380,16 400,16 420,0 C440,16 460,16 480,0 C500,16 520,16 540,0 C560,16 580,16 600,0 C620,16 640,16 660,0 C680,16 700,16 720,0 C740,16 760,16 780,0 C800,16 820,16 840,0 C860,16 880,16 900,0 C920,16 940,16 960,0 C980,16 1000,16 1020,0 C1040,16 1060,16 1080,0 C1100,16 1120,16 1140,0 C1160,16 1180,16 1200,0 L1200,24 L0,24 Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Body Section */}
              <div className="course-card-body">
                <div className="course-body-top">
                  <span className="course-section-tag" style={{ color: course.tagColor || '#0284c7' }}>
                    {course.sectionTag}
                  </span>

                  <p className="course-description-text">{course.description}</p>

                  <div className="course-tags-row">
                    {course.tags.map((tag, idx) => (
                      <span key={idx} className="course-tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Metadata Stats */}
                  <div className="course-meta-stats-row">
                    <span className="course-stat-item">
                      <Clock size={13} />
                      {course.hours} horas
                    </span>
                    <span className="course-stat-item">
                      <PlayCircle size={13} />
                      {course.lessons} lecciones
                    </span>
                    <span className="course-stat-item">
                      <UsersIcon size={13} />
                      {course.students}
                    </span>
                    <span className="course-rating-item">
                      <Star size={13} className="course-star-icon" />
                      {course.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Action Footer */}
                  <div className="course-card-footer">
                    <button className="course-btn-ver" type="button">
                      Ver curso
                    </button>
                    <div className="course-arrow-circle">
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="cursos-empty-state">
            <div className="cursos-empty-icon">
              <Search size={24} />
            </div>
            <h3 className="cursos-empty-title">No se encontraron cursos</h3>
            <p className="cursos-empty-desc">
              Intenta ajustar tus términos de búsqueda o selecciona otra categoría o nivel.
            </p>
            <button
              className="cursos-pill-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedLevel('ALL');
              }}
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* ---- Course Detail Modal ---- */}
      {selectedCourse && (
        <div className="curso-modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="curso-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="curso-modal-header" style={{ background: selectedCourse.gradient }}>
              <button
                className="curso-modal-close-btn"
                onClick={() => setSelectedCourse(null)}
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span className="course-level-pill">{selectedCourse.level}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                  {selectedCourse.category}
                </span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: -0.5 }}>
                {selectedCourse.title}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>
                {selectedCourse.sectionTag}
              </p>
            </div>

            <div className="curso-modal-body">
              <div>
                <h4 className="curso-modal-section-title">
                  <BookOpen size={16} color="#0284c7" />
                  Descripción del Curso
                </h4>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {selectedCourse.description}
                </p>
              </div>

              {/* Instructor */}
              {selectedCourse.instructor && (
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {selectedCourse.instructor.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {selectedCourse.instructor.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {selectedCourse.instructor.role}
                    </div>
                  </div>
                </div>
              )}

              {/* Key Features / Competencies */}
              <div>
                <h4 className="curso-modal-section-title">
                  <Award size={16} color="#059669" />
                  Competencias que Desarrollarás
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Dominio práctico de módulos del ERP</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Resolución de casos empresariales</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Generación y análisis de reportes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Certificación oficial ERPMetrics 360</span>
                  </div>
                </div>
              </div>

              {/* Syllabus */}
              {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
                <div>
                  <h4 className="curso-modal-section-title">
                    <Sparkles size={16} color="#7c3aed" />
                    Programa de Contenidos ({selectedCourse.syllabus.length} módulos)
                  </h4>
                  <div className="curso-syllabus-list">
                    {selectedCourse.syllabus.map((item, index) => (
                      <div key={index} className="curso-syllabus-item">
                        <div className="curso-syllabus-num">{index + 1}</div>
                        <div className="curso-syllabus-info">
                          <span className="curso-syllabus-title">{item.title}</span>
                          <span className="curso-syllabus-sub">
                            {item.duration} • {item.lessonsCount} lecciones interactivas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="curso-modal-footer">
              <button className="curso-btn-secondary" onClick={() => setSelectedCourse(null)}>
                Cerrar
              </button>
              <button
                className="curso-btn-primary"
                onClick={() => {
                  alert(`Has iniciado la asignación del curso: "${selectedCourse.title}"`);
                  setSelectedCourse(null);
                }}
              >
                Asignar Curso a Usuarios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Create Course Modal ---- */}
      {showCreateModal && (
        <div className="curso-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="curso-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="curso-modal-header" style={{ background: 'linear-gradient(135deg, #0b132b, #1c2541)' }}>
              <button
                className="curso-modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Crear Nuevo Curso
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                Añade un nuevo curso al catálogo formativo de la organización.
              </p>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div className="curso-modal-body">
                <div className="form-group">
                  <label className="form-label">Título del Curso</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Análisis Financiero con Power BI"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Gestión Empresarial">Gestión Empresarial</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Logística">Logística</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Analítica">Analítica</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nivel de Dificultad</label>
                    <select
                      className="form-input"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                    >
                      <option value="PRINCIPIANTE">Principiante</option>
                      <option value="INTERMEDIO">Intermedio</option>
                      <option value="AVANZADO">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Etiqueta Destacada / Sub-sección</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: FINANZAS Y BUSINESS INTELLIGENCE"
                    value={newSectionTag}
                    onChange={(e) => setNewSectionTag(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe los objetivos y aprendizajes del curso..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Horas</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lecciones</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newLessons}
                      onChange={(e) => setNewLessons(e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Etiquetas (separadas por coma)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="ERP, BI, Finanzas"
                    />
                  </div>
                </div>
              </div>

              <div className="curso-modal-footer">
                <button
                  type="button"
                  className="curso-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="curso-btn-primary">
                  Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
