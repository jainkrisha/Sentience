const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
let dbUrl = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/NEXT_PUBLIC_DRIZZLE_DB_URL=(.*)/);
  if (match) {
    dbUrl = match[1].trim();
  }
}

if (!dbUrl) {
  console.error('Could not find NEXT_PUBLIC_DRIZZLE_DB_URL in .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function createTables() {
  console.log('Creating cv_uploads...');
  await sql`
    CREATE TABLE IF NOT EXISTS "cv_uploads" (
      "id" serial PRIMARY KEY NOT NULL,
      "userEmail" varchar(255) NOT NULL,
      "cvText" text NOT NULL,
      "extractedSkills" text,
      "extractedProjects" text,
      "targetRoles" text,
      "createdAt" timestamp DEFAULT now()
    );
  `;

  console.log('Creating preparation_planner...');
  await sql`
    CREATE TABLE IF NOT EXISTS "preparation_planner" (
      "id" serial PRIMARY KEY NOT NULL,
      "userEmail" varchar(255) NOT NULL,
      "plannerJson" text,
      "readinessBaseline" integer,
      "active" boolean DEFAULT true,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );
  `;

  console.log('Creating improvement_roadmap...');
  await sql`
    CREATE TABLE IF NOT EXISTS "improvement_roadmap" (
      "id" serial PRIMARY KEY NOT NULL,
      "userEmail" varchar(255) NOT NULL,
      "topic" varchar(255) NOT NULL,
      "category" varchar(255),
      "description" text,
      "priority" varchar(50),
      "companyTag" varchar(255),
      "sourceInterviewId" varchar(255),
      "status" varchar(50) DEFAULT 'active',
      "lastSeenScore" integer,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );
  `;

  console.log('Creating target_companies...');
  await sql`
    CREATE TABLE IF NOT EXISTS "target_companies" (
      "id" serial PRIMARY KEY NOT NULL,
      "userEmail" varchar(255) NOT NULL,
      "companyName" varchar(255) NOT NULL,
      "roleName" varchar(255),
      "priorityLevel" varchar(50),
      "active" boolean DEFAULT true,
      "createdAt" timestamp DEFAULT now()
    );
  `;

  console.log("Tables created successfully!");
}

createTables().catch(console.error);
