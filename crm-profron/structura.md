crm-profron/
├── public/
├── src/
│   ├── assets/                 # Imágenes, logos, iconos globales
│   ├── components/             # Componentes UI reutilizables (Botones, Inputs, Cards, Modales)
│   │   ├── ui/                 # (Shadcn/UI base)
│   │   └── layout/             # Sidebar, Header, MainLayout
│   ├── features/               # ⭐ Lógica y componentes por dominio (Feature Based)
│   │   ├── auth/               # (Login y Registro - Imagen 5)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── landing/            # (Landing Page - Imagen 4)
│   │   │   ├── components/
│   │   │   └── LandingPage.tsx
│   │   ├── admin/              # (Dashboard y Usuarios - Imagen 1)
│   │   │   ├── components/
│   │   │   ├── pages/          # GestiónUsuarios.tsx
│   │   │   └── services/
│   │   ├── analyst/            # (Análisis, Carga de datos, Observación - Imágenes 2 y 3)
│   │   │   ├── components/     # (Dropzones, Tablas de datos, Gráficas)
│   │   │   ├── pages/          # PerfilUsuario.tsx, CargaDatos.tsx, ObservacionDatos.tsx
│   │   │   └── services/       # Llamadas a API para datos, archivos, etc.
│   │   └── dashboard/          # (Vista general del panel)
│   ├── hooks/                  # Hooks globales (useAuth, useTheme, etc.)
│   ├── layouts/                # Layouts específicos (AdminLayout, AnalystLayout, PublicLayout)
│   ├── lib/                    # Utilidades (Axios instance, helpers de formato, constantes)
│   ├── routes/                 # Configuración de React Router
│   │   ├── PrivateRoutes.tsx   # Protección de rutas (Admin/Analista)
│   │   └── PublicRoutes.tsx    # Rutas de Landing/Auth
│   ├── stores/                 # Estado global (Zustand o Redux Toolkit)
│   ├── styles/                 # Tailwind/SCSS globales
│   ├── types/                  # Tipos globales de TypeScript (User, Role, Producto)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── agents.md
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts