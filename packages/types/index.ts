export type ProjectRole = 'admin' | 'editor' | 'viewer';

export interface Project {
  id: string;
  name: string;
  description?: string;
  devices: Device[];
  webDashboards: Dashboard[];
  mobileDashboards: Dashboard[];
  flows: Flow[];
  users: ProjectUser[];
}

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
}

export interface Device {
  id: string;
  projectId: string;
  name: string;
  type: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'error';
  datastreams: Datastream[];
}

export interface Datastream {
  id: string;
  deviceId: string;
  key: string;
  type: 'number' | 'boolean' | 'string';
  mode: 'telemetry' | 'command' | 'hybrid';
}

export type DashboardType = 'web' | 'mobile_app';

export interface Dashboard {
  id: string;
  projectId: string;
  name: string;
  type: DashboardType;
  theme: DashboardTheme;
  pages: DashboardPage[];
  isPublic?: boolean;
  publicToken?: string;
}

export interface DashboardTheme {
  mode: 'light' | 'dark';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  customCss?: string;
}

export interface DashboardPage {
  id: string;
  title: string;
  layout: 'grid' | 'stack';
  widgets: WidgetInstance[];
}

export interface WidgetInstance {
  id: string;
  type: string;
  title?: string;
  datastreamId?: string;
  config: Record<string, any>;
  position: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    order?: number;
  };
}

export interface Flow {
  id: string;
  projectId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}
