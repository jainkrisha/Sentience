import React from 'react';
import { db } from '../../../utils/db';
import { preparation_planner } from '../../../utils/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PlannerPage() {
  const user = await currentUser();
  if (!user) redirect('/');
  const userEmail = user.primaryEmailAddress.emailAddress;

  const planners = await db.select().from(preparation_planner).where(eq(preparation_planner.userEmail, userEmail));

  if (planners.length === 0 || !planners[0].plannerJson) {
    return (
      <div className="p-10">
        <h2 className="text-2xl font-bold">No Planner Found</h2>
        <p className="mt-4">Please upload your CV to generate a planner.</p>
        <Link href="/dashboard/cv-upload">
          <Button className="mt-4">Upload CV</Button>
        </Link>
      </div>
    );
  }

  const planner = JSON.parse(planners[0].plannerJson);

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Your Preparation Planner</h2>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-primary">Readiness Baseline: {planners[0].readinessBaseline}%</h3>
      </div>
      
      <div className="space-y-6">
        {Object.entries(planner).map(([key, value]) => (
          <div key={key} className="bg-gray-50 border p-4 rounded-lg">
            <h4 className="font-bold text-lg capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
            {typeof value === 'string' ? (
              <p>{value}</p>
            ) : Array.isArray(value) ? (
              <ul className="list-disc pl-5">
                {value.map((item, idx) => (
                  <li key={idx}>
                    {typeof item === 'object' ? JSON.stringify(item) : item}
                  </li>
                ))}
              </ul>
            ) : (
              <pre className="text-sm overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Link href="/dashboard/roadmap">
          <Button>View Improvement Roadmap</Button>
        </Link>
      </div>
    </div>
  );
}
