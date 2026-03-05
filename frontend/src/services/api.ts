const BASE_URL = 'http://localhost:4000/api';

export const api = {
  projects: {
    list: () => fetch(`${BASE_URL}/projects`).then(r => r.json()),
    get: (id: string) => fetch(`${BASE_URL}/projects/${id}`).then(r => {
      if (!r.ok) throw new Error('Project not found');
      return r.json();
    }),

    create: (data: { name: string; description?: string }) => 
      fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    devices: (id: string) => fetch(`${BASE_URL}/projects/${id}/devices`).then(r => r.json()),
    createDevice: (projectId: string, data: { name: string; type: string }) =>
      fetch(`${BASE_URL}/projects/${projectId}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    dashboards: (id: string) => fetch(`${BASE_URL}/projects/${id}/dashboards`).then(r => r.json()),
    createDashboard: (projectId: string, data: { name: string; type: string; config: any }) =>
      fetch(`${BASE_URL}/projects/${projectId}/dashboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
  },

  devices: {
    createDatastream: (deviceId: string, data: any) =>
      fetch(`${BASE_URL}/devices/${deviceId}/datastreams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
  }
};
