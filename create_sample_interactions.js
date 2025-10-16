const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createInteractions() {
  try {
    console.log('Creating sample interactions...');

    // Discovery call with GreenTech
    await pool.query(`
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, private_notes,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `, [
      'call',
      'Discovery Call - Solar Panel Efficiency Solutions',
      'Initial discovery call with GreenTech Innovations to understand their current solar panel optimization challenges. Discussed their need for better efficiency monitoring and predictive maintenance. Sarah mentioned they are currently losing 15% efficiency due to manual monitoring gaps. Very interested in our AI-powered solutions.',
      '2025-10-10 14:30:00',
      '61d19c1c-49aa-4313-b93e-968dcdd444ff',
      '455e92b5-d8db-4157-b780-0da2eb73f5cc',
      45,
      'outbound',
      'phone',
      'positive',
      'very_positive',
      4,
      'Strong technical interest from CTO. Mentioned €2M budget for 2025. Follow up with technical demo next week.',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      new Date(),
      new Date()
    ]);

    // Sales meeting with DataFlow Analytics
    await pool.query(`
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, location, private_notes,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
    `, [
      'meeting',
      'Technical Demo - AI Analytics Platform',
      'Comprehensive technical demo of our AI-powered analytics platform for DataFlow Analytics team. Dr. Priya Patel was very impressed with our machine learning capabilities and ethical AI framework. Discussed integration with their existing systems and scalability requirements.',
      '2025-10-12 10:00:00',
      'd4695c01-3f03-4ae4-a4b7-94412d8be17c',
      '287882ff-e530-49a2-b03f-ff9649cb2856',
      90,
      'outbound',
      'video_call',
      'very_positive',
      'positive',
      5,
      'Virtual Meeting Room',
      'Dr. Patel mentioned they have $5M budget for AI initiatives in 2025. Strong technical fit. Next step: prepare formal proposal.',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      new Date(),
      new Date()
    ]);

    // Follow-up email with Nordic Manufacturing
    await pool.query(`
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, private_notes,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `, [
      'email',
      'Follow-up: Industry 4.0 Solution Proposal',
      'Sent detailed proposal for Industry 4.0 manufacturing solutions including IoT sensor integration, predictive maintenance algorithms, and quality control automation. Erik responded positively and scheduled internal review meeting.',
      '2025-10-13 09:15:00',
      'da434404-62f1-4178-b976-6b769724e784',
      'd047716d-76cc-4893-b437-fc6ac9b7c68d',
      15,
      'outbound',
      'email',
      'positive',
      'neutral',
      3,
      'Internal review scheduled for next Tuesday. Erik mentioned they are evaluating 3 vendors. Our solution fits well with their Siemens infrastructure.',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      new Date(),
      new Date()
    ]);

    // Networking event interaction
    await pool.query(`
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, location, private_notes,
        created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
    `, [
      'event',
      'TechCrunch Singapore Startup Summit - Networking',
      'Met with TechnoCore Startups Accelerator team at TechCrunch Singapore. Discussed our CRM solution for portfolio companies. They showed interest in bulk licensing for their 50+ startup portfolio.',
      '2025-10-11 16:30:00',
      'eda2994a-be99-4f6e-95cf-4d14f9fd55f8',
      null,
      30,
      'outbound',
      'in_person',
      'positive',
      'positive',
      3,
      'Marina Bay Sands Convention Center, Singapore',
      'Potential bulk deal for 50+ startups. Follow up with proposal for accelerator package pricing.',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4',
      new Date(),
      new Date()
    ]);

    console.log('✅ Successfully created sample interactions');

  } catch (error) {
    console.error('❌ Error creating interactions:', error);
  } finally {
    await pool.end();
  }
}

createInteractions();