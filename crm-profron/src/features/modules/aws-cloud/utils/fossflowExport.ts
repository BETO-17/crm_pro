import type { AwsProposal, AwsServiceItem } from '../types/awsTypes';
import { getFossflowIcon } from '../data/fossflowIconMap';

export interface FossflowItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface FossflowViewItem {
  id: string;
  tile: {
    x: number;
    y: number;
  };
  labelHeight?: number;
}

export interface FossflowAnchor {
  id: string;
  ref: {
    item: string;
  };
}

export interface FossflowConnector {
  id: string;
  color: string;
  description?: string;
  width: number;
  style: 'SOLID' | 'DOTTED' | 'DASHED';
  showArrow: boolean;
  anchors: [FossflowAnchor, FossflowAnchor];
}

export interface FossflowTextBox {
  id: string;
  tile: {
    x: number;
    y: number;
  };
  content: string;
  fontSize: number;
  orientation: 'X' | 'Y';
}

export interface FossflowDiagram {
  title: string;
  icons: unknown[];
  colors: Array<{ id: string; value: string }>;
  items: FossflowItem[];
  views: Array<{
    id: string;
    name: string;
    items: FossflowViewItem[];
    connectors: FossflowConnector[];
    rectangles: unknown[];
    textBoxes: FossflowTextBox[];
  }>;
  fitToScreen: boolean;
}

/**
 * Normaliza una cadena de texto a formato kebab-case para el nombre del archivo.
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'propuesta';
}

/**
 * Construye el objeto JSON con el esquema exacto de FossFLOW / Isoflow
 * a partir de la propuesta y la lista de servicios.
 */
export function buildFossflowDiagram(
  proposal: AwsProposal,
  catalogServices: AwsServiceItem[] = []
): FossflowDiagram {
  const rawList = proposal.selectedServices || proposal.services || [];
  const proposalServiceNames = new Set(rawList);

  const hasService = (nameOrCode: string) => {
    return (
      proposalServiceNames.has(nameOrCode) ||
      Array.from(proposalServiceNames).some(
        (s) => s.toLowerCase() === nameOrCode.toLowerCase()
      )
    );
  };

  const getServiceDesc = (name: string): string => {
    const found = catalogServices.find(
      (s) => s.codeName.toLowerCase() === name.toLowerCase() || s.id === name
    );
    return found?.description || `Servicio AWS ${name} configurado en la arquitectura.`;
  };

  const items: FossflowItem[] = [];
  const viewItems: FossflowViewItem[] = [];
  const connectors: FossflowConnector[] = [];

  // Paleta de colores estándar FossFLOW
  const colors = [
    { id: 'c_blue', value: '#a5b8f3' },
    { id: 'c_green', value: '#bbfabb' },
    { id: 'c_orange', value: '#f5c196' },
    { id: 'c_red', value: '#f5a5a5' },
    { id: 'c_gray', value: '#dddddd' },
  ];

  // 1. Nodo de entrada obligatorio: Usuarios/Internet
  items.push({
    id: 'node_users',
    name: 'Usuarios / Internet',
    description: 'Tráfico externo de usuarios y clientes hacia la plataforma Cloud.',
    icon: 'user',
  });
  viewItems.push({
    id: 'node_users',
    tile: { x: 0, y: 0 },
    labelHeight: 80,
  });

  // 2. Flujo Principal de izquierda a derecha:
  // Route 53 -> CloudFront -> ALB -> EC2 -> RDS
  const mainFlowOrder = [
    { key: 'Route 53', id: 'node_route53', name: 'Amazon Route 53' },
    { key: 'CloudFront', id: 'node_cloudfront', name: 'Amazon CloudFront' },
    { key: 'ALB', id: 'node_alb', name: 'Elastic Load Balancing' },
    { key: 'EC2', id: 'node_ec2', name: 'Amazon EC2' },
    { key: 'RDS', id: 'node_rds', name: 'Amazon RDS' },
  ];

  let currentX = 6;
  let lastMainNodeId = 'node_users';

  for (const step of mainFlowOrder) {
    if (hasService(step.key)) {
      items.push({
        id: step.id,
        name: step.name,
        description: getServiceDesc(step.key),
        icon: getFossflowIcon(step.key),
      });

      viewItems.push({
        id: step.id,
        tile: { x: currentX, y: 0 },
        labelHeight: 80,
      });

      // Conectar con el nodo anterior del flujo
      connectors.push({
        id: `conn_${lastMainNodeId}_${step.id}`,
        color: 'c_blue',
        description: 'Tráfico de red',
        width: 10,
        style: 'SOLID',
        showArrow: true,
        anchors: [
          { id: `a_${lastMainNodeId}`, ref: { item: lastMainNodeId } },
          { id: `a_${step.id}`, ref: { item: step.id } },
        ],
      });

      lastMainNodeId = step.id;
      currentX += 6;
    }
  }

  // 3. Fila de Almacenamiento y Serverless (S3, Lambda, DynamoDB) en fila separada (y: 6)
  let storageX = 6;
  const hasS3 = hasService('S3');
  const hasLambda = hasService('Lambda');
  const hasDynamo = hasService('DynamoDB');
  const hasCloudFront = hasService('CloudFront');
  const hasEC2 = hasService('EC2');

  if (hasS3) {
    const s3Id = 'node_s3';
    items.push({
      id: s3Id,
      name: 'Amazon S3',
      description: getServiceDesc('S3'),
      icon: getFossflowIcon('S3'),
    });

    viewItems.push({
      id: s3Id,
      tile: { x: storageX, y: 6 },
      labelHeight: 80,
    });

    // Conectar a CloudFront si existe, si no a EC2, si no a Users
    const s3Target = hasCloudFront ? 'node_cloudfront' : hasEC2 ? 'node_ec2' : 'node_users';
    connectors.push({
      id: `conn_${s3Target}_s3`,
      color: 'c_green',
      description: 'Objetos / Assets',
      width: 10,
      style: 'SOLID',
      showArrow: true,
      anchors: [
        { id: `a_${s3Target}`, ref: { item: s3Target } },
        { id: 'a_s3', ref: { item: s3Id } },
      ],
    });
    storageX += 6;
  }

  if (hasLambda) {
    const lambdaId = 'node_lambda';
    items.push({
      id: lambdaId,
      name: 'AWS Lambda',
      description: getServiceDesc('Lambda'),
      icon: getFossflowIcon('Lambda'),
    });

    viewItems.push({
      id: lambdaId,
      tile: { x: storageX, y: 6 },
      labelHeight: 80,
    });

    // Conectar Lambda a S3 o EC2
    const lambdaTarget = hasS3 ? 'node_s3' : hasEC2 ? 'node_ec2' : lastMainNodeId;
    connectors.push({
      id: `conn_${lambdaTarget}_lambda`,
      color: 'c_orange',
      description: 'Eventos / API',
      width: 10,
      style: 'DOTTED',
      showArrow: true,
      anchors: [
        { id: `a_${lambdaTarget}`, ref: { item: lambdaTarget } },
        { id: 'a_lambda', ref: { item: lambdaId } },
      ],
    });
    storageX += 6;
  }

  if (hasDynamo) {
    const dynamoId = 'node_dynamodb';
    items.push({
      id: dynamoId,
      name: 'Amazon DynamoDB',
      description: getServiceDesc('DynamoDB'),
      icon: getFossflowIcon('DynamoDB'),
    });

    viewItems.push({
      id: dynamoId,
      tile: { x: storageX, y: 6 },
      labelHeight: 80,
    });

    const dynamoTarget = hasLambda ? 'node_lambda' : hasEC2 ? 'node_ec2' : lastMainNodeId;
    connectors.push({
      id: `conn_${dynamoTarget}_dynamo`,
      color: 'c_green',
      description: 'NoSQL Queries',
      width: 10,
      style: 'SOLID',
      showArrow: true,
      anchors: [
        { id: `a_${dynamoTarget}`, ref: { item: dynamoTarget } },
        { id: 'a_dynamo', ref: { item: dynamoId } },
      ],
    });
    storageX += 6;
  }

  // 4. Servicios adicionales (SQS, SNS, WAF)
  let messagingX = 6;
  if (hasService('SQS')) {
    items.push({
      id: 'node_sqs',
      name: 'Amazon SQS',
      description: getServiceDesc('SQS'),
      icon: getFossflowIcon('SQS'),
    });
    viewItems.push({
      id: 'node_sqs',
      tile: { x: messagingX, y: -6 },
      labelHeight: 80,
    });
    messagingX += 6;
  }

  if (hasService('SNS')) {
    items.push({
      id: 'node_sns',
      name: 'Amazon SNS',
      description: getServiceDesc('SNS'),
      icon: getFossflowIcon('SNS'),
    });
    viewItems.push({
      id: 'node_sns',
      tile: { x: messagingX, y: -6 },
      labelHeight: 80,
    });
    messagingX += 6;
  }

  if (hasService('WAF')) {
    items.push({
      id: 'node_waf',
      name: 'AWS WAF',
      description: getServiceDesc('WAF'),
      icon: getFossflowIcon('WAF'),
    });
    viewItems.push({
      id: 'node_waf',
      tile: { x: 3, y: -4 },
      labelHeight: 80,
    });
  }

  // 5. Servicios transversales en fila inferior (y: 12), sin conexiones
  let transversalX = 0;
  const transversalServices = [
    { key: 'VPC', id: 'node_vpc', name: 'Amazon VPC' },
    { key: 'IAM', id: 'node_iam', name: 'AWS IAM' },
    { key: 'CloudWatch', id: 'node_cloudwatch', name: 'Amazon CloudWatch' },
  ];

  for (const trans of transversalServices) {
    if (hasService(trans.key)) {
      items.push({
        id: trans.id,
        name: trans.name,
        description: getServiceDesc(trans.key),
        icon: getFossflowIcon(trans.key),
      });

      viewItems.push({
        id: trans.id,
        tile: { x: transversalX, y: 12 },
        labelHeight: 80,
      });

      transversalX += 6;
    }
  }

  // 6. Texto informativo del diagrama
  const regionText = proposal.region ? proposal.region.split(' ')[0] : 'Global';
  const serviceCount = (proposal.selectedServices || proposal.services || []).length;
  const textBoxes: FossflowTextBox[] = [
    {
      id: 'text_header',
      tile: { x: 0, y: -4 },
      content: `Región: ${regionText} · ${serviceCount} servicios · Generado por CloudOps Dashboard`,
      fontSize: 0.6,
      orientation: 'X',
    },
  ];

  return {
    title: proposal.solutionName || 'Arquitectura AWS CloudOps',
    icons: [],
    colors,
    items,
    views: [
      {
        id: 'view_main',
        name: 'Vista Principal',
        items: viewItems,
        connectors,
        rectangles: [],
        textBoxes,
      },
    ],
    fitToScreen: true,
  };
}

/**
 * Genera el JSON formateado (2 espacios) y lanza la descarga en el navegador con el nombre:
 * cloudops-<nombre-propuesta-en-kebab-case>-<AAAA-MM-DD>.json
 */
export function downloadFossflowDiagram(
  proposal: AwsProposal,
  catalogServices: AwsServiceItem[] = []
): void {
  const diagram = buildFossflowDiagram(proposal, catalogServices);
  const jsonContent = JSON.stringify(diagram, null, 2);

  const kebabName = toKebabCase(proposal.solutionName || 'propuesta');
  const today = new Date().toISOString().split('T')[0];
  const filename = `cloudops-${kebabName}-${today}.json`;

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
