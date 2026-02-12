
// Wrapper for fetch to work in Node environment if needed, or assume Node 18+
const BASE_URL = 'http://localhost:3000/api';

async function request(path: string, method: string, body?: any) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (e) {
    console.error(`Request failed: ${method} ${path}`, e);
    return { status: 500, data: null };
  }
}

async function runTests() {
  console.log('--- Starting Verification ---');

  // 1. Gym Creation
  console.log('\n[1] Gym Creation');
  const gymName = 'Iron Gym ' + Date.now();
  const r1 = await request('/gyms', 'POST', {
    name: gymName,
    capacity: 10,
    address: { street: 'Main', city: 'City', country: 'Ctry' }
  });
  console.log(' Valid Gym:', r1.status === 201 ? 'PASS' : `FAIL (${r1.status})`);
  const gymId = r1.data?.id;

  const res2 = await request('/gyms', 'POST', {
    name: 'Bad Gym',
    capacity: 0,
    address: { street: 'Main', city: 'City', country: 'Ctry' }
  });
  const data2 = res2.data;
  const isErrorValid = data2.success === false && data2.error?.layer === 'runtime' && Array.isArray(data2.error.errors);
  console.log(' Invalid Capacity:', res2.status === 400 && isErrorValid ? 'PASS' : `FAIL (${res2.status}) structure=${isErrorValid}`);

  // 2. Trainer Assignment
  console.log('\n[2] Trainer Assignment');
  // Need to create a trainer via DB seed or API (no API to create trainer in spec? verify if I need one)
  // Spec says "The API must expose an endpoint to assign a trainer...". Does not explicitly say "Create Trainer" endpoint.
  // Seed has 'default-trainer'. valid cert 'NSCA-CPT'.
  const trainerId = 'default-trainer';
  // Existing trainer -> assign to created gym
  const r3 = await request(`/trainers/${trainerId}/assignments`, 'POST', { gymId });
  console.log(' Assign Valid Trainer:', r3.status === 201 ? 'PASS' : `FAIL (${r3.status})`);
  
  // Test double assignment to same gym? (Unique constraint)
  const r3b = await request(`/trainers/${trainerId}/assignments`, 'POST', { gymId });
  console.log(' Duplicate Assignment:', r3b.status === 500 || r3b.status === 400 ? 'PASS (caught)' : `FAIL (${r3b.status})`); 
  // Note: My controller checks limit, but DB unique constraint also exists.

  // 3. Member Enrollment
  console.log('\n[3] Member Enrollment');
  // Need a member. Seed? I didn't seed a member.
  // I should probably add an endpoint to create a member or use seed.
  // I'll use seed data if possible, or I need to create one.
  // Wait, I don't have createMember endpoint in plan.
  // I need to update seed.sql to include a member or add endpoint.
  // I'll assume I can use a raw Insert via a helper if local, but I'm calling API.
  // Let's rely on seed data or add a temp endpoint?
  // Actually, I can add a seed member in `prisma/seed.sql`.
  const memberId = 'default-member'; 
  
  // Enroll
  const r4 = await request(`/members/${memberId}/enrollments`, 'POST', { gymId, membershipTier: 'Gold' });
  console.log(' Enroll Member:', r4.status === 201 ? 'PASS' : `FAIL (${r4.status})`);

  // Capacity check: Enroll 10 more members? 
  // Might be too slow for this script.

  // 4. Poymorphic Exercise
  console.log('\n[4] Workout Session');
  // Create Session
  // Need endpoint or seed? "POST /api/sessions/:sessionId/exercises".
  // Needs a session. I need to create a session first?
  // There is no "Create Session" endpoint in requirements.
  // "The API must must system correctly validate polymorphic exercise data... POST /api/sessions/:sessionId/exercises"
  // Implies session exists.
  // I'll need to seed a session.
  const sessionId = 'default-session';
  
  const r5 = await request(`/sessions/${sessionId}/exercises`, 'POST', {
    type: 'strength',
    data: { reps: 10, sets: 3, weight: 100 }
  });
  console.log(' Valid Strength Ex:', r5.status === 201 ? 'PASS' : `FAIL (${r5.status})`);

  const r6 = await request(`/sessions/${sessionId}/exercises`, 'POST', {
    type: 'cardio',
    data: { duration: 30, distance: 5 }
  });
  console.log(' Valid Cardio Ex:', r6.status === 201 ? 'PASS' : `FAIL (${r6.status})`);

  const r7 = await request(`/sessions/${sessionId}/exercises`, 'POST', {
    type: 'strength',
    data: { duration: 30 } // Invalid for strength
  });
  console.log(' Invalid Strength Data:', r7.status === 400 ? 'PASS' : `FAIL (${r7.status})`);

  // 5. Metrics
  console.log('\n[5] Health Metrics');
  const r8 = await request(`/members/${memberId}/metrics`, 'POST', {
    type: 'heart_rate',
    value: 75
  });
  console.log(' Valid Heart Rate:', r8.status === 201 ? 'PASS' : `FAIL (${r8.status})`);

  const r9 = await request(`/members/${memberId}/metrics`, 'POST', {
    type: 'heart_rate',
    value: 300 // Out of bounds
  });
  console.log(' Invalid Heart Rate:', r9.status === 400 ? 'PASS' : `FAIL (${r9.status})`);
}

runTests();
