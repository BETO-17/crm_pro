import React from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Database,
  Cloud,
  Upload,
  Table2,
  Sliders,
  Users,
  Server,
  HardDrive,
  GitMerge,
  Activity,
} from 'lucide-react';

export interface CourseFeatureItem {
  title: string;
  desc: string;
  iconType: 'upload' | 'table' | 'compare' | 'users' | 'server' | 'storage' | 'pipeline' | 'activity';
}

export interface CourseCardData {
  id: string;
  key: 'bigData' | 'microsoftAzure';
  code: string;
  title: string;
  route: string;
  summary: string;
  category: string;
  badge: string;
  description: string;
  featureItems: CourseFeatureItem[];
  theme: 'navy' | 'slate';
  status: 'approved' | 'pending' | 'locked';
}

interface CourseGiftCardProps {
  data: CourseCardData;
  onEnter: (card: CourseCardData) => void;
  onRequest: (card: CourseCardData) => void;
}

export default function CourseGiftCard({
  data,
  onEnter,
  onRequest,
}: CourseGiftCardProps) {
  const renderHeaderIcon = () => {
    if (data.key === 'bigData') {
      return <Database size={22} />;
    }
    return <Cloud size={22} />;
  };

  const renderFeatureIcon = (iconType: CourseFeatureItem['iconType']) => {
    switch (iconType) {
      case 'upload':
        return <Upload size={16} />;
      case 'table':
        return <Table2 size={16} />;
      case 'compare':
        return <Sliders size={16} />;
      case 'users':
        return <Users size={16} />;
      case 'server':
        return <Server size={16} />;
      case 'storage':
        return <HardDrive size={16} />;
      case 'pipeline':
        return <GitMerge size={16} />;
      case 'activity':
      default:
        return <Activity size={16} />;
    }
  };

  const renderStatusBadge = () => {
    switch (data.status) {
      case 'approved':
        return (
          <span className="gift-status-badge gift-status-approved">
            <CheckCircle2 size={12} /> Habilitado
          </span>
        );
      case 'pending':
        return (
          <span className="gift-status-badge gift-status-pending">
            <Clock size={12} /> En Revisión
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="gift-status-badge gift-status-locked">
            <Lock size={12} /> Bloqueado
          </span>
        );
    }
  };

  return (
    <div className={`gift-card gift-card-${data.theme}`}>
      {/* Header with Pattern */}
      <div className={`gift-card-header header-${data.theme}`}>
        <div className="gift-card-top-row">
          <div className="gift-card-icon-box">{renderHeaderIcon()}</div>
          <div className="gift-card-header-meta">
            <span className="gift-card-code">{data.code}</span>
            {renderStatusBadge()}
          </div>
        </div>

        <div className="gift-card-title-group">
          <h3 className="gift-card-title">{data.title}</h3>
          <span className="gift-card-route">{data.route}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="gift-card-body">
        <p className="gift-card-summary">{data.summary}</p>

        <div className="gift-card-features-list">
          {data.featureItems.map((item, idx) => (
            <div key={idx} className="gift-feature-row">
              <div className={`gift-feature-icon-badge badge-${data.theme}`}>
                {renderFeatureIcon(item.iconType)}
              </div>
              <div className="gift-feature-text-block">
                <span className="gift-feature-title">{item.title}</span>
                <span className="gift-feature-desc">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="gift-card-action-box">
          {data.status === 'approved' && (
            <button
              className="btn-gift-action btn-gift-approved"
              onClick={() => onEnter(data)}
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight size={15} />
            </button>
          )}

          {data.status === 'pending' && (
            <button className="btn-gift-action btn-gift-pending" disabled>
              <Clock size={14} />
              <span>Solicitud enviada al Administrador</span>
            </button>
          )}

          {data.status === 'locked' && (
            <button
              className="btn-gift-action btn-gift-locked"
              onClick={() => onRequest(data)}
            >
              <Lock size={14} />
              <span>Solicitar Aprobación al Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
