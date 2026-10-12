/**
 * Mapa de correspondencia oficial entre servicios de AWS de CloudOps
 * y los identificadores de iconos de FossFLOW / Isoflow (colecciones 'aws' e 'isoflow').
 */

export interface IconMapping {
  serviceId: string;
  codeName: string;
  iconId: string;
  category: string;
}

export const FOSSFLOW_ICON_MAP: Record<string, string> = {
  // Por ID interno del catálogo
  'srv-ec2': 'aws-ec2',
  'srv-s3': 'aws-simple-storage-service',
  'srv-rds': 'aws-rds',
  'srv-iam': 'aws-identity-and-access-management',
  'srv-vpc': 'aws-networking-content-delivery',
  'srv-route53': 'aws-route-53',
  'srv-cloudfront': 'aws-cloudfront',
  'srv-lambda': 'aws-lambda',
  'srv-cloudwatch': 'aws-cloudwatch',
  'srv-alb': 'aws-elastic-load-balancing',
  'srv-sqs': 'aws-simple-queue-service',
  'srv-sns': 'aws-simple-notification-service',
  'srv-dynamodb': 'aws-dynamodb',
  'srv-waf': 'aws-waf',

  // Por nombre de código visible (codeName)
  'EC2': 'aws-ec2',
  'S3': 'aws-simple-storage-service',
  'RDS': 'aws-rds',
  'IAM': 'aws-identity-and-access-management',
  'VPC': 'aws-networking-content-delivery',
  'Route 53': 'aws-route-53',
  'CloudFront': 'aws-cloudfront',
  'Lambda': 'aws-lambda',
  'CloudWatch': 'aws-cloudwatch',
  'ALB': 'aws-elastic-load-balancing',
  'Elastic Load Balancing': 'aws-elastic-load-balancing',
  'SQS': 'aws-simple-queue-service',
  'SNS': 'aws-simple-notification-service',
  'DynamoDB': 'aws-dynamodb',
  'WAF': 'aws-waf',
};

/**
 * Mapeo inverso: ID de icono de FossFLOW -> codeName del servicio en CloudOps
 */
export const FOSSFLOW_REVERSE_ICON_MAP: Record<string, string> = {
  'aws-ec2': 'EC2',
  'aws-simple-storage-service': 'S3',
  'aws-simple-storage-service-glacier': 'S3',
  'aws-rds': 'RDS',
  'aws-identity-and-access-management': 'IAM',
  'aws-networking-content-delivery': 'VPC',
  'aws-route-53': 'Route 53',
  'aws-cloudfront': 'CloudFront',
  'aws-lambda': 'Lambda',
  'aws-cloudwatch': 'CloudWatch',
  'aws-elastic-load-balancing': 'ALB',
  'aws-simple-queue-service': 'SQS',
  'aws-simple-notification-service': 'SNS',
  'aws-dynamodb': 'DynamoDB',
  'aws-waf': 'WAF',
  'aws-shield': 'WAF',
  'server': 'EC2',
  'storage': 'S3',
  'loadbalancer': 'ALB',
  'dns': 'Route 53',
};

/**
 * Obtiene el ID del icono para un servicio (con fallback genérico 'server' o 'cloud')
 */
export function getFossflowIcon(serviceKey: string): string {
  return FOSSFLOW_ICON_MAP[serviceKey] || 'server';
}

/**
 * Identifica qué servicio de AWS representa un elemento importado de FossFLOW.
 * Revisa primero el iconId y luego el nombre/etiqueta del nodo.
 */
export function detectServiceFromFossflowItem(iconId?: string, name?: string): string | null {
  if (iconId && FOSSFLOW_REVERSE_ICON_MAP[iconId]) {
    return FOSSFLOW_REVERSE_ICON_MAP[iconId];
  }

  if (name) {
    const clean = name.trim().toLowerCase();
    if (clean.includes('route 53') || clean.includes('route53') || clean.includes('dns')) return 'Route 53';
    if (clean.includes('cloudfront') || clean.includes('cdn')) return 'CloudFront';
    if (clean.includes('load balancer') || clean.includes('alb') || clean.includes('elb')) return 'ALB';
    if (clean.includes('ec2') || clean.includes('virtual server') || clean.includes('compute')) return 'EC2';
    if (clean.includes('rds') || clean.includes('relational') || clean.includes('postgres') || clean.includes('mysql')) return 'RDS';
    if (clean.includes('s3') || clean.includes('bucket') || clean.includes('storage')) return 'S3';
    if (clean.includes('lambda') || clean.includes('serverless')) return 'Lambda';
    if (clean.includes('dynamodb') || clean.includes('dynamo') || clean.includes('nosql')) return 'DynamoDB';
    if (clean.includes('cloudwatch') || clean.includes('monitoreo')) return 'CloudWatch';
    if (clean.includes('iam') || clean.includes('identity')) return 'IAM';
    if (clean.includes('vpc') || clean.includes('virtual private cloud')) return 'VPC';
    if (clean.includes('sqs') || clean.includes('queue')) return 'SQS';
    if (clean.includes('sns') || clean.includes('notification')) return 'SNS';
    if (clean.includes('waf') || clean.includes('firewall') || clean.includes('shield')) return 'WAF';
  }

  return null;
}
