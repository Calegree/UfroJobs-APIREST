import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// ==============================================================================
// 1. CONFIGURATION & METRICS
// ==============================================================================

const BASE_URL = 'http://api:3000';

// Custom metrics
const metrics = {
  errorRate: new Rate('errors'),
  totalRequests: new Counter('total_requests'),
  iterations: new Counter('iterations'),
  stressLevel: new Gauge('stress_level'),
  trends: {
    login: new Trend('login_duration'),
    register: new Trend('register_duration'),
    listCompanies: new Trend('list_companies_duration'),
    listJobs: new Trend('list_job_offers_duration'),
    application: new Trend('application_duration'),
  }
};

export const options = {
  systemTags: ['status', 'proto', 'subproto', 'type', 'name', 'group', 'check', 'error', 'error_code', 'expected_response', 'method', 'url', 'scenario', 'service'],
  // Stress test: gradually increase load until system breaks
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '2m', target: 25 },   // Ramp up to 25 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users (stress begins)
    { duration: '2m', target: 400 },  // Ramp up to 400 users (high stress)
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'], // More lenient during stress
    http_req_failed: ['rate<0.2'], // Allow up to 20% failure during stress
    errors: ['rate<0.2'],
  },
};

// ==============================================================================
// 2. HELPER UTILITIES
// ==============================================================================

function apiRequest(method, endpoint, payload, opts: any = {}) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { 'Authorization': `Bearer ${opts.token}` } : {}),
    },
  };

  const url = `${BASE_URL}${endpoint}`;
  const body = payload !== null ? JSON.stringify(payload) : null;

  let res;

  if (method === 'GET') res = http.get(url, params);
  else if (method === 'POST') res = http.post(url, body, params);
  else if (method === 'PATCH') res = http.patch(url, body, params);

  // Record Metrics
  metrics.totalRequests.add(1);
  if (opts.trend) opts.trend.add(res.timings.duration);

  // Perform Checks
  const checkName = opts.checkName || `${method} ${endpoint} success`;
  
  const checks = {
    [checkName]: (r) => {
       if (r.status < 200 || r.status >= 300) {
         console.log(`Failed ${endpoint}: ${r.status} ${r.body}`);
         return false;
       }
       return true;
    },
    ...opts.extraChecks 
  };
  
  const success = check(res, checks);
  metrics.errorRate.add(!success);

  return res;
}

function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `stress_student_${timestamp}@test.com`,
    companyEmail: `stress_company_${timestamp}@test.com`,
    password: 'TestPassword123!',
    name: `Stress Student ${timestamp}`,
    companyName: `Stress Company ${timestamp}`,
  };
}

// ==============================================================================
// 3. API ACTION FUNCTIONS
// ==============================================================================

const API = {
  auth: {
    login: (email, password, isCompany = false) => {
      const endpoint = isCompany ? '/auth/login-company' : '/auth/login';
      const res = apiRequest('POST', endpoint, { email, password }, {
        trend: metrics.trends.login,
        checkName: `${isCompany ? 'Company' : 'Student'} login successful`,
        extraChecks: { 'Token returned': (r) => r.json('access_token') !== undefined }
      });
      return res.json('access_token');
    },

    registerStudent: (data) => {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: '1234567890',
        career: 'Ingeniería en Informática',
        academicYear: '4º año',
        studentId: `EST${Date.now()}`,
        skills: ['JavaScript', 'Python', 'NestJS'],
      };
      const res = apiRequest('POST', '/auth/register', payload, {
        trend: metrics.trends.register,
        checkName: 'Student register successful'
      });
      return res.json('access_token');
    },

    registerCompany: (data) => {
      const payload = {
        name: data.companyName,
        email: data.companyEmail,
        phone: '9876543210',
        rut: `RUT${Date.now()}`,
        localization: 'Temuco, Chile',
        description: 'Tech Company for testing',
        password: data.password,
        documentKeys: ['doc1', 'doc2'],
        web: 'https://example.com',
      };
      const res = apiRequest('POST', '/auth/register-company', payload, {
        trend: metrics.trends.register,
        checkName: 'Company register successful'
      });
      return res.json('access_token');
    }
  },

  student: {
    getProfile: (token) => apiRequest('GET', '/users/me', null, { token, checkName: 'Get student profile' }),
    updateCV: (token) => apiRequest('PATCH', '/users/me/cv', { cvKey: `cv-${Date.now()}` }, { token, checkName: 'Update CV' }),
    listAll: () => apiRequest('GET', '/users/students', null, { checkName: 'List students' }),
    getById: (id) => apiRequest('GET', `/users/${id}`, null, { checkName: 'Get student by ID' }),
  },

  company: {
    getProfile: (token) => apiRequest('GET', '/companies/me', null, { token, checkName: 'Get company profile' }),
    listAll: () => apiRequest('GET', '/companies', null, { 
      trend: metrics.trends.listCompanies, 
      checkName: 'List companies',
      extraChecks: { 'List not empty': (r) => r.json().length >= 0 }
    }),
    getById: (id) => apiRequest('GET', `/companies/${id}`, null, { checkName: 'Get company by ID' }),
    update: (token, id) => apiRequest('PATCH', `/companies/${id}`, { name: `Updated ${Date.now()}` }, { token, checkName: 'Update company' }),
  },

  jobs: {
    create: (token, companyId) => {
      const payload = {
        companyId: companyId,
        title: `Software Engineer ${Date.now()}`,
        description: 'We are looking for a talented software engineer',
        requirements: ['JavaScript', 'Node.js', 'React'],
        salary: '1500000',
        location: 'Temuco, Chile',
        worktime: 'Full-time',
        modality: 'remoto',
        tags: ['software', 'engineer'],
        publication_date: new Date().toISOString(),
        status: 'activo',
      };
      const res = apiRequest('POST', '/job-offers', payload, { 
        token, 
        trend: metrics.trends.listJobs,
        checkName: 'Create job offer' 
      });
      return res.status === 201 || res.status === 200 ? res.json('id') : null;
    },
    
    testPostulation: (token) => apiRequest('POST', '/job-offers/test-postulacion', null, { 
      token, 
      checkName: 'Test postulation' 
    }),
  }
};

// ==============================================================================
// 4. MAIN STRESS TEST SCENARIO
// ==============================================================================

export default function () {
  metrics.iterations.add(1);
  const testData = generateTestData();
  
  let state = {
    studentToken: null,
    companyToken: null,
    companyId: null,
    jobId: null
  };

  // Simplified flow for stress test (fewer operations to maximize load)
  group('Authentication Flow - Stress', () => {
    try {
      state.studentToken = API.auth.registerStudent(testData);
      sleep(0.2);
    } catch (e) {
      console.log(`Student registration failed: ${e}`);
    }

    try {
      state.companyToken = API.auth.registerCompany(testData);
      sleep(0.2);
    } catch (e) {
      console.log(`Company registration failed: ${e}`);
    }
  });

  group('High-Load Operations', () => {
    if (state.studentToken) {
      try {
        API.student.getProfile(state.studentToken);
        sleep(0.1);
      } catch (e) {
        console.log(`Get student profile failed: ${e}`);
      }
    }

    if (state.companyToken) {
      try {
        const profileRes = API.company.getProfile(state.companyToken);
        if (profileRes.status === 200) {
          state.companyId = profileRes.json('id');
        }
        sleep(0.1);
      } catch (e) {
        console.log(`Get company profile failed: ${e}`);
      }
    }
  });

  group('Critical Path - Stress', () => {
    if (state.companyToken && state.companyId) {
      try {
        API.jobs.create(state.companyToken, state.companyId);
        sleep(0.1);
      } catch (e) {
        console.log(`Job creation failed: ${e}`);
      }
    }
  });

  sleep(Math.random() * 0.5); // Minimal sleep during stress test
}

export function teardown(data) {
  console.log(`\n=== Stress Test Summary ===`);
  console.log(`Total Requests: ${metrics.totalRequests.value}`);
  console.log(`Error Rate: ${((metrics.errorRate.value || 0) * 100).toFixed(2)}%`);
}
